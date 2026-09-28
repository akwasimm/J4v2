"""
Recompute users.profile_completion from the canonical calculator.

Context: there is only ever one completion formula,
app/utils/profile_completion.py. The users.profile_completion column is a
cached copy of it, written by profile_service and resume_service. Those two
call sites recalculate on write, but nothing recalculates on read, so the
column is only as fresh as the last write.

The formula's weights have changed since the column was first populated, and
every row now disagrees with a fresh calculation - the three real accounts
read 92/85/78 where the current weights give 69/71/63. What users see on the
dashboard is therefore wrong, and the AI gate reads the stale number.

Nothing is at risk here: the column is a pure function of columns still
present on the same row, so this is a recompute rather than a transformation.
A backup is still worth taking, but a failed run cannot lose data.

Run once. Safe to re-run: recomputation is idempotent.

    docker compose exec -T backend python migrate_recompute_profile_completion.py --apply
"""

import sys
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.database import SessionLocal, engine
from app.models.user import User
from app.utils.profile_completion import calculate_profile_completion

DRY = "--apply" not in sys.argv
THRESHOLD = 50  # dashboard_service.PROFILE_COMPLETION_THRESHOLD - gates AI spend


def main() -> int:
    db = SessionLocal()
    try:
        users = list(db.execute(select(User)).scalars())
        if not users:
            print("no users found - wrong database?")
            return 1

        plan = []
        for u in users:
            old = u.profile_completion or 0
            new = calculate_profile_completion(u)
            if old != new:
                plan.append((u, old, new))

        print(f"users scanned            : {len(users)}")
        print(f"rows needing recompute   : {len(plan)}")
        flips = [p for p in plan if (p[1] >= THRESHOLD) != (p[2] >= THRESHOLD)]
        print(f"AI-gate decisions changed: {len(flips)}"
              + (f"  {THRESHOLD}%" if flips else ""))
        for u, old, new in flips:
            print(f"  {u.email}: {old} -> {new}")

        for u, old, new in plan:
            print(f"  {u.email:40} {old:3} -> {new:3}")

        if not plan:
            print("already consistent - nothing to do")
            return 0

        if DRY:
            print("\nDRY RUN. Re-run with --apply to write the recomputed values.")
            return 0

        now = datetime.now(timezone.utc)
        for u, old, new in plan:
            u.profile_completion = new
            u.profile_completion_updated_at = now
        db.commit()
        print(f"\nwrote {len(plan)} recomputed values")
    finally:
        db.close()

    # Re-derive from a fresh session: proving the stored value now matches the
    # formula, rather than trusting the values we just wrote.
    db = SessionLocal()
    try:
        drift = [
            u.email
            for u in db.execute(select(User)).scalars()
            if (u.profile_completion or 0) != calculate_profile_completion(u)
        ]
        print(f"verified drift after write: {len(drift)}")
        for e in drift:
            print(f"  still drifting: {e}")
        return 1 if drift else 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
