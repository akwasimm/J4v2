"""Populate user_preferences and users.profile_completion from legacy Profile.

user_preferences already existed with matching columns and was empty, so
this fills it rather than adding schema. Profile.profileCompletion maps
to users.profile_completion, which already existed too.

remote_preference must be lower-cased: app/schemas/preferences.py
validates it against ["remote", "hybrid", "on-site"], and the legacy
column stores 'REMOTE' / 'HYBRID'. An unmapped value would be rejected
the next time the user saved their preferences.

Run:  python migrate_profile_preferences.py --dry-run | --live
"""
import sys

from sqlalchemy import text
from app.core.database import engine

LIVE = "--live" in sys.argv

# Reuses the same legacy-user -> uuid mapping as the earlier migrations:
# Profile.userId is an integer into the legacy "User" table, which maps
# to public.users by email.
PREFS = """
insert into public.user_preferences (
    user_id, remote_preference, target_salary_min, target_salary_max,
    preferred_locations, employment_types, created_at, updated_at
)
select
    u.id,
    lower(p."remotePreference"::text),
    p."expectedSalaryMin",
    p."expectedSalaryMax",
    case when p."preferredLocations" is null then null
         else to_jsonb(p."preferredLocations") end,
    case when p."preferredJobTypes" is null then null
         else to_jsonb(p."preferredJobTypes") end,
    p."createdAt" at time zone 'UTC',
    p."updatedAt" at time zone 'UTC'
from public."Profile" p
join public."User" lu on lu.id = p."userId"
join public.users u on u.email = lu.email
where not exists (select 1 from public.user_preferences x where x.user_id = u.id)
"""

COMPLETION = """
update public.users u
set profile_completion = p."profileCompletion",
    profile_completion_updated_at = now()
from public."Profile" p
join public."User" lu on lu.id = p."userId"
where lu.email = u.email
  and p."profileCompletion" is not null
"""

with engine.connect() as c:
    profiles = c.execute(text('select count(*) from public."Profile"')).scalar()
    prefs = c.execute(text("select count(*) from public.user_preferences")).scalar()
    print("=== PRE-FLIGHT ===")
    print(f"  Profile rows                {profiles}")
    print(f"  user_preferences rows       {prefs} (0 = clean insert)")
    print(f"  mode                        {'LIVE' if LIVE else 'DRY RUN (no writes)'}")

    if not LIVE:
        raise SystemExit("dry run. Re-run with --live.")

    n = c.execute(text(PREFS)).rowcount
    print(f"\n  user_preferences inserted  {n}")

    m = c.execute(text(COMPLETION)).rowcount
    print(f"  profile_completion updated {m}")
    c.commit()

with engine.connect() as c:
    print("\n=== RESULT ===")
    for r in c.execute(text("""
        select u.email, u.profile_completion, up.remote_preference,
               up.target_salary_min, up.target_salary_max,
               up.preferred_locations::text, up.employment_types::text
        from public.users u
        left join public.user_preferences up on up.user_id = u.id
        order by u.profile_completion desc nulls last, u.email
    """)):
        print(f"  {r[0]:30} {str(r[1]):>3}%  {str(r[2]):8} "
              f"{str(r[3]):>7}-{str(r[4]):<7} {str(r[5])[:30]:30} {str(r[6])[:24]}")

    print("\n=== sanity ===")
    bad = c.execute(text(
        "select count(*) from public.user_preferences "
        "where remote_preference is not null "
        "and remote_preference not in ('remote','hybrid','on-site')"
    )).scalar()
    print(f"  invalid remote_preference values : {bad}")
    print(f"  users with completion set        : "
          f"{c.execute(text('select count(*) from public.users where profile_completion is not null')).scalar()}/11")
    print(f"  users without preferences row    : "
          f"{c.execute(text('select count(*) from public.users u where not exists (select 1 from public.user_preferences p where p.user_id=u.id)')).scalar()}/11")
