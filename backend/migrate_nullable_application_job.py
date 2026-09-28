"""
Make job_applications.job_id nullable so manually-entered applications
can be stored server-side.

Context: the Applied tab was backed by localStorage mocks because a
manual application - one the user typed in for a job that is not in the
jobs table - could not be stored. job_id was nullable=False with a
foreign key to jobs.id, so the row had nowhere to point. The mock was a
symptom of the constraint, not a shortcut around it.

Rows created for a real job keep their job_id and behave exactly as
before. The only change is that a row may now have no job at all, in
which case role_title / company_name / location carry the meaning.

Run once. Safe to re-run: it checks before altering.

    docker compose exec -T backend python migrate_nullable_application_job.py --apply
"""

import sys
import os
from sqlalchemy import text
from app.core.database import engine

DRY = "--apply" not in sys.argv


def main() -> int:
    with engine.connect() as c:
        # Current nullability, read from the catalog rather than assumed.
        nullable = c.execute(text("""
            select is_nullable
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'job_applications'
              and column_name = 'job_id'
        """)).scalar()
        if nullable is None:
            print("job_applications.job_id not found - wrong database?")
            return 1

        if nullable == "YES":
            print("job_applications.job_id is already nullable - nothing to do")
            return 0

        total = c.execute(text("select count(*) from public.job_applications")).scalar()
        orphans = c.execute(text("""
            select count(*) from public.job_applications a
            where a.job_id is not null
              and not exists (select 1 from public.jobs j where j.id = a.job_id)
        """)).scalar()

        print(f"current job_id nullability : NOT NULL")
        print(f"existing application rows  : {total}")
        print(f"rows pointing at no job    : {orphans}")

        if orphans:
            print("refusing to run: some rows already point at a missing job")
            return 1

    if DRY:
        print("\nDRY RUN. Re-run with --apply to drop the NOT NULL constraint.")
        return 0

    with engine.begin() as c:
        c.execute(text(
            "alter table public.job_applications alter column job_id drop not null"
        ))
        print("dropped NOT NULL on job_applications.job_id")

    with engine.connect() as c:
        now = c.execute(text("""
            select is_nullable from information_schema.columns
            where table_schema='public' and table_name='job_applications'
              and column_name='job_id'
        """)).scalar()
        kept = c.execute(text(
            "select count(*) from public.job_applications where job_id is not null"
        )).scalar()
        print(f"verified nullability is now : {now}")
        print(f"rows still linked to a job  : {kept}/{total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
