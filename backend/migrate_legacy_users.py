"""Dry-run report for migrating public."User" -> public.users.

Read-only. Makes no changes. Run with:  python migrate_legacy_users.py --dry-run
"""
import sys
import uuid

from sqlalchemy import text
from app.core.database import engine

DRY = "--dry-run" in sys.argv

MAP = """
create temporary table legacy_user_map on commit drop as
select
    lu.id            as legacy_id,
    gen_random_uuid()::uuid as new_id,
    lower(lu.email)  as email
from public."User" lu
where not exists (select 1 from public.users u where u.email = lower(lu.email));
"""

COLS = """
select
    m.new_id,
    lu.email,
    lu."passwordHash"  as password,
    lu."isEmailVerified" as verified,
    lu."createdAt",
    lu."lastLoginAt"
from public."User" lu
join legacy_user_map m on m.legacy_id = lu.id
order by lu.id
"""

with engine.connect() as c:
    total_legacy = c.execute(text('select count(*) from public."User"')).scalar()
    total_new = c.execute(text("select count(*) from public.users")).scalar()
    upper = c.execute(
        text('select count(*) from public."User" where email <> lower(email)')
    ).scalar()

    print("=== PRE-FLIGHT ===")
    print(f"  legacy public.\"User\" rows : {total_legacy}")
    print(f"  target public.users rows  : {total_new}")
    print(f"  emails needing lower()   : {upper}")
    print(f"  mode                     : {'DRY RUN (no writes)' if DRY else 'LIVE'}")

    if DRY:
        c.execute(text(MAP))
        rows = c.execute(text(COLS)).fetchall()
        print(f"\n=== WOULD MIGRATE {len(rows)} USERS ===")
        for new_id, email, pw, ver, created, last_login in rows:
            scheme = "bcrypt" if (pw or "").startswith("$2") else "OTHER"
            flag = "" if ver else "  (unverified)"
            print(f"  {email:38} -> {new_id}{flag}")
            print(f"      pw={scheme} len={len(pw or '')} created={created}")
        c.execute(text("drop table if exists legacy_user_map"))
        print("\ntemporary mapping table dropped; database unchanged")
    else:
        # The legacy table has no name columns, and first_name is NOT NULL with
        # no default, so derive it from the local part of the email.
        c.execute(text(MAP))
        migrated = c.execute(text("""
            insert into public.users (
                id, email, hashed_password, first_name, full_name,
                is_active, is_verified, is_new_user, last_login_at,
                created_at, updated_at
            )
            select
                m.new_id,
                lu.email,
                lu."passwordHash",
                split_part(lu.email, '@', 1),
                split_part(lu.email, '@', 1),
                true,
                lu."isEmailVerified",
                true,
                lu."lastLoginAt",
                lu."createdAt",
                lu."updatedAt"
            from public."User" lu
            join legacy_user_map m on m.legacy_id = lu.id
        """)).rowcount

        after = c.execute(text("select count(*) from public.users")).scalar()
        print(f"\n=== MIGRATED {migrated} USERS ===")
        print(f"  public.users now holds {after} rows")
        for email, is_verified in c.execute(text(
            "select email, is_verified from public.users order by email"
        )):
            flag = "" if is_verified else "  (unverified)"
            print(f"  {email:38} verified={is_verified}{flag}")
        c.commit()
        print("\ncommitted. public.\"User\" left untouched as the rollback source.")
