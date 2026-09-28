"""
Verify the canonical tables still hold the data migrated out of the legacy
tables.

Every migration in this repo was checked with a throwaway script that was
then deleted, so the evidence for those migrations lived only in a
terminal transcript. This file is the durable version of that check.

It asserts invariants rather than absolute row counts. Counts move as
people use the app; "every saved job points at a real job" does not.

    docker compose exec -T backend python verify_data.py

Exits non-zero if any check fails, so it can gate a deploy.
"""

import sys
from sqlalchemy import text
from app.core.database import engine

# Legacy tables the app no longer reads from. They stay as a rollback
# source, so the point is that canonical data survives independently.
LEGACY_USER_TABLE = '"User"'
LEGACY_PROFILE_TABLE = '"Profile"'
LEGACY_JOBS_TABLE = '"JobsCache"'


def scalar(conn, sql: str):
    return conn.execute(text(sql)).scalar()


def main() -> int:
    failures = []
    notes = []

    with engine.connect() as c:
        # --- canonical tables are populated and readable -------------------
        canonical = {
            "users": "profiles",
            "jobs": "job listings",
            "saved_jobs": "saved jobs",
            "job_applications": "applications",
            "user_skills": "skills",
            "user_experience": "experience",
            "user_education": "education",
            "user_preferences": "job preferences",
        }
        for table, label in canonical.items():
            n = scalar(c, f"select count(*) from public.{table}")
            if n == 0:
                failures.append(f"public.{table} is empty ({label} lost)")
            notes.append(f"{table:20} {n:>8,}")

        # --- referential integrity ----------------------------------------
        # These are the checks that actually catch a bad migration. The
        # legacy saved-job and application rows carry integer ids that look
        # like they point at jobs but address JobsCache.externalId instead,
        # so a naive integer copy produces orphans rather than errors.
        orphan_checks = [
            ("saved_jobs.user_id", "users"),
            ("job_applications.user_id", "users"),
            ("user_skills.user_id", "users"),
            ("user_experience.user_id", "users"),
            ("user_education.user_id", "users"),
            ("user_preferences.user_id", "users"),
            ("saved_jobs.job_id", "jobs"),
            ("job_applications.job_id", "jobs"),
        ]
        for column, target in orphan_checks:
            child, col = column.split(".")
            n = scalar(c, f"""
                select count(*) from public.{child} t
                where t.{col} is not null
                  and not exists (
                    select 1 from public.{target} p where p.id = t.{col}
                  )
            """)
            if n:
                failures.append(f"{n} orphan row(s) in {child}.{col} -> {target}")
            notes.append(f"orphans {child}.{col:9} {n:>4}")

        # --- every migrated user has a preferences row --------------------
        # user_preferences is 1:1 in practice. A user with no row will
        # silently match nothing, which looks like a search bug.
        n = scalar(c, """
            select count(*) from public.users u
            where not exists (
                select 1 from public.user_preferences p where p.user_id = u.id
            )
        """)
        if n:
            failures.append(f"{n} user(s) with no user_preferences row")
        notes.append(f"{'users w/o prefs':20} {n:>8,}")

        # --- remote_preference matches the validator ----------------------
        # app/schemas/preferences.py accepts lowercase only. The legacy
        # enum stored 'REMOTE' and 'HYBRID', so a raw copy writes values
        # the app rejects on the next save.
        bad = c.execute(text("""
            select coalesce(remote_preference, '<null>'), count(*)
            from public.user_preferences
            group by 1
            having count(*) > 0
        """)).fetchall()
        allowed = {"remote", "hybrid", "on-site"}
        for value, count in bad:
            if value != "<null>" and value not in allowed:
                failures.append(
                    f"remote_preference={value!r} x{count} is rejected by the schema"
                )
            notes.append(f"remote_preference {value:<12} {count:>4}")

        # --- migration fidelity, not just non-null -------------------------
        # Asserting profile_completion is non-zero is wrong: 8 of the 11
        # migrated accounts are empty test accounts whose real completion
        # is 0. What actually matters is that each canonical value equals
        # the legacy value it came from, so compare them directly.
        #
        # profile_completion is deliberately NOT in this list. It is not
        # migrated data, it is a cache of calculate_profile_completion(), and
        # the weights in that function have changed since the legacy snapshot
        # was written. Requiring agreement with legacy now pins the column to
        # a permanently wrong number - it is checked against the live
        # calculator further down instead.
        fidelity = [
            ("bio", '"summary"', False),
            ("headline", '"headline"', False),
        ]
        for canonical_col, legacy_col, numeric in fidelity:
            same = f"u.{canonical_col} is not distinct from p.{legacy_col}"
            n = scalar(c, f"""
                select count(*) from public.users u
                join public.{LEGACY_PROFILE_TABLE} p
                  on p."userId" = (select lu.id from public.{LEGACY_USER_TABLE} lu
                                   where lu.email = u.email)
                where not ({same})
            """)
            if n:
                failures.append(
                    f"{n} user(s) where users.{canonical_col} disagrees with "
                    f"legacy Profile.{legacy_col}"
                )
            notes.append(f"fidelity {canonical_col:20} {n:>4} mismatched")

        # --- profile_completion is a sane percentage ----------------------
        n = scalar(c, """
            select count(*) from public.users
            where profile_completion is null
               or profile_completion < 0
               or profile_completion > 100
        """)
        if n:
            failures.append(f"{n} user(s) with a null or out-of-range completion")
        notes.append(f"{'bad completion':20} {n:>8,}")

    # --- stored completion matches the current formula --------------------
    # The range check above only proves the number is a percentage. What
    # matters is that it is the percentage the app would compute right now,
    # because the AI gate and the dashboard both read this column.
    try:
        from app.core.database import SessionLocal
        from app.models.user import User
        from app.utils.profile_completion import calculate_profile_completion
        from sqlalchemy import select

        db = SessionLocal()
        try:
            drift = [
                u.email
                for u in db.execute(select(User)).scalars()
                if (u.profile_completion or 0) != calculate_profile_completion(u)
            ]
        finally:
            db.close()
        notes.append(f"{'completion drift':20} {len(drift):>8,}")
        if drift:
            failures.append(
                f"{len(drift)} user(s) whose stored profile_completion no longer "
                f"matches calculate_profile_completion() - run "
                f"migrate_recompute_profile_completion.py --apply"
            )
    except Exception as exc:  # noqa: BLE001
        failures.append(f"could not check completion against the calculator: {exc}")

        # --- legacy tables are still intact -------------------------------
        # They are the only rollback path, so their loss would be silent
        # until the moment someone needed them.
        for table, label in [
            (LEGACY_USER_TABLE, "legacy users"),
            (LEGACY_PROFILE_TABLE, "legacy profiles"),
            (LEGACY_JOBS_TABLE, "legacy jobs"),
        ]:
            try:
                n = scalar(c, f"select count(*) from public.{table}")
                notes.append(f"{label:20} {n:>8,}  (rollback source)")
            except Exception as exc:  # noqa: BLE001
                failures.append(f"legacy table public.{table} unreadable: {exc}")

    print("=" * 62)
    print("CANONICAL DATA VERIFICATION")
    print("=" * 62)
    for line in notes:
        print(f"  {line}")

    print()
    if failures:
        print(f"FAILED ({len(failures)})")
        for f in failures:
            print(f"  x {f}")
        return 1

    print("PASS - canonical tables are populated and internally consistent")
    print("Legacy tables remain as a rollback source; drop them separately.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
