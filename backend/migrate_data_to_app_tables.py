"""Populate the app's empty snake_case tables from the legacy tables that hold data.

Every target table is empty before this runs, so all inserts are additive.
The legacy tables are read-only sources and are never modified.

Run:  python migrate_data_to_app_tables.py --dry-run | --live
"""
import sys

from sqlalchemy import text
from app.core.database import engine

LIVE = "--live" in sys.argv

# Stable per-run id maps, so jobs and their saved/application rows agree.
# The job map is keyed on externalId because SavedJob.jobId and
# JobApplication.jobId hold 'job_003' style values, not JobsCache.id.
STATS = {}

DDL = [
    # legacy user id (integer) -> migrated user id (uuid)
    """create temporary table map_user on commit drop as
       select lu.id as legacy_id, u.id as new_id
       from public."User" lu
       join public.users u on u.email = lu.email""",
    # Profile.id (integer) -> user uuid, for rows keyed by profile
    """create temporary table map_profile_user on commit drop as
       select p.id as legacy_id, uu.new_id
       from public."Profile" p
       join map_user uu on uu.legacy_id = p."userId\"""",
    # JobsCache.externalId (text) -> job uuid
    """create temporary table map_job on commit drop as
       select jc."externalId" as ext, gen_random_uuid()::uuid as new_id
       from public."JobsCache" jc
       where jc."externalId" is not null""",
]

# ---------------------------------------------------------------- jobs
JOBS = """
insert into public.jobs (
    id, title, company_name, location, salary_min, salary_max,
    work_model, job_type, experience_level, min_experience_years,
    core_skills, company_logo_url, description, is_active,
    posted_at, created_at, updated_at
)
select
    m.new_id,
    jc.title,
    jc.company,
    jc.location,
    jc."salaryMin",
    jc."salaryMax",
    case when jc."isRemote" then 'remote' else 'onsite' end,
    jc."jobType"::text,
    jc."experienceLevel"::text,
    null,
    case when jc.skills is null then null
         else to_jsonb(jc.skills) end,
    jc."companyLogo",
    jc.description,
    true,
    jc."postedAt" at time zone 'UTC',
    jc."createdAt" at time zone 'UTC',
    jc."updatedAt" at time zone 'UTC'
from public."JobsCache" jc
join map_job m on m.ext = jc."externalId"
"""

# ---------------------------------------------------------------- saved jobs
SAVED = """
insert into public.saved_jobs (id, user_id, job_id, has_note, note_text, saved_at)
select
    gen_random_uuid()::uuid,
    uu.new_id,
    m.new_id,
    case when s.notes is not null and s.notes <> '' then true else false end,
    nullif(s.notes, ''),
    s."createdAt" at time zone 'UTC'
from public."SavedJob" s
join map_user uu on uu.legacy_id = s."userId"
join map_job m on m.ext = s."jobId"
"""

# ---------------------------------------------------------------- applications
APPS = """
insert into public.job_applications (
    id, user_id, job_id, status, role_title, applied_at,
    status_updated_at, is_closed, created_at, updated_at
)
select
    gen_random_uuid()::uuid,
    uu.new_id,
    m.new_id,
    lower(a.status::text),
    null,
    a."appliedAt" at time zone 'UTC',
    a."lastUpdatedAt" at time zone 'UTC',
    case when a.status::text = 'OFFERED' then true else false end,
    a."appliedAt" at time zone 'UTC',
    a."lastUpdatedAt" at time zone 'UTC'
from public."JobApplication" a
join map_user uu on uu.legacy_id = a."userId"
join map_job m on m.ext = a."jobId"
"""

# ---------------------------------------------------------------- skills
SKILLS = """
insert into public.user_skills (id, user_id, name, level, source, created_at, updated_at)
select
    gen_random_uuid()::uuid,
    pu.new_id,
    s.name,
    -- level is a skill_level_enum with Title-case labels; legacy
    -- proficiency is upper-case. An unmapped value yields NULL and
    -- fails the NOT NULL constraint rather than being dropped quietly.
    case us.proficiency::text
        when 'BEGINNER'    then 'Beginner'
        when 'INTERMEDIATE' then 'Intermediate'
        when 'ADVANCED'    then 'Advanced'
        when 'EXPERT'      then 'Expert'
    end::skill_level_enum,
    'imported',
    us."createdAt" at time zone 'UTC',
    us."createdAt" at time zone 'UTC'
from public."UserSkill" us
join public."Skill" s on s.id = us."skillId"
join map_profile_user pu on pu.legacy_id = us."profileId"
"""

# ---------------------------------------------------------------- experience
# "current" is a reserved word in postgres and must stay quoted.
EXPERIENCE = """
insert into public.user_experience (
    id, user_id, title, company, location, start_date, end_date,
    "current", description, source, created_at, updated_at
)
select
    gen_random_uuid()::uuid,
    pu.new_id,
    we.title,
    we.company,
    we.location,
    we."startDate" at time zone 'UTC',
    we."endDate" at time zone 'UTC',
    coalesce(we."isCurrent", false),
    -- target stores description as json, legacy stores plain text
    to_jsonb(we.description),
    'imported',
    we."createdAt" at time zone 'UTC',
    we."updatedAt" at time zone 'UTC'
from public."WorkExperience" we
join map_profile_user pu on pu.legacy_id = we."profileId"
"""

# ---------------------------------------------------------------- education
# legacy has no "source" column but the target requires one.
EDUCATION = """
insert into public.user_education (
    id, user_id, degree, field, school, info, source, created_at, updated_at
)
select
    gen_random_uuid()::uuid,
    pu.new_id,
    e.degree,
    e.field,
    e.institution,
    e.grade,
    'imported',
    e."createdAt" at time zone 'UTC',
    e."createdAt" at time zone 'UTC'
from public."Education" e
join map_profile_user pu on pu.legacy_id = e."profileId"
"""

STEPS = [
    ("jobs", JOBS),
    ("saved_jobs", SAVED),
    ("job_applications", APPS),
    ("user_skills", SKILLS),
    ("user_experience", EXPERIENCE),
    ("user_education", EDUCATION),
]

TARGETS = {
    "jobs": "select count(*) from public.jobs",
    "saved_jobs": "select count(*) from public.saved_jobs",
    "job_applications": "select count(*) from public.job_applications",
    "user_skills": "select count(*) from public.user_skills",
    "user_experience": "select count(*) from public.user_experience",
    "user_education": "select count(*) from public.user_education",
}

with engine.connect() as c:
    print("=== PRE-FLIGHT ===")
    for t, sql in TARGETS.items():
        print(f"  {t:20} {c.execute(text(sql)).scalar():>8} rows (must be 0)")
    legacy_users = c.execute(text('select count(*) from public."User"')).scalar()
    legacy_jobs = c.execute(text('select count(*) from public."JobsCache"')).scalar()
    print(f"  mode                {'LIVE' if LIVE else 'DRY RUN (no writes)'}")
    print(f"  map_user            {legacy_users} legacy users")
    print(f"  map_job             {legacy_jobs} jobs")

    if not LIVE:
        raise SystemExit("dry run: target tables confirmed above. Re-run with --live to migrate.")

    for ddl in DDL:
        c.execute(text(ddl))

    print("\n=== MIGRATING ===")
    for name, sql in STEPS:
        n = c.execute(text(sql)).rowcount
        total = c.execute(text(TARGETS[name])).scalar()
        expected = n
        flag = "ok" if total == expected else "MISMATCH"
        print(f"  {name:20} inserted {n:>7}  table now {total:>7}  {flag}")
        STATS[name] = total

    c.commit()
    print("\ncommitted.")
