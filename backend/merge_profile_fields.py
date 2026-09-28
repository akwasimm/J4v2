"""Merge legacy Profile fields into public.users.

Profile holds real per-user data the app cannot see: names for all 11
users, plus headline, summary and social links for some. The app's
users table already has columns for these, so this copies values in
rather than adding schema.

Only fields the legacy Profile actually populated are written. Where
Profile is null the existing value is left alone, which keeps the
email-derived first_name placeholder as a fallback.

Run:  python merge_profile_fields.py --dry-run | --live
"""
import sys

from sqlalchemy import text
from app.core.database import engine

LIVE = "--live" in sys.argv

# Profile.userId is an integer id into the legacy "User" table, which
# now maps to public.users by email.
MERGE = """
update public.users u
set
    first_name  = coalesce(p."firstName",    u.first_name),
    last_name   = coalesce(p."lastName",     u.last_name),
    full_name   = coalesce(nullif(trim(both p."firstName" || ' ' || p."lastName"), ''), u.full_name),
    headline    = coalesce(p.headline,       u.headline),
    bio         = coalesce(p.summary,        u.bio),
    linkedin    = coalesce(p."linkedinUrl", u.linkedin),
    github      = coalesce(p."githubUrl",   u.github),
    portfolio   = coalesce(p."portfolioUrl", u.portfolio),
    updated_at  = now()
from public."Profile" p
join public."User" lu on lu.id = p."userId"
where lu.email = u.email
  and (
      p."firstName"    is not null or p."lastName"     is not null
   or p.headline       is not null or p.summary        is not null
   or p."linkedinUrl" is not null or p."githubUrl"     is not null
   or p."portfolioUrl" is not null
  )
"""

FIELDS = ["first_name", "last_name", "full_name", "headline",
          "bio", "linkedin", "github", "portfolio"]

with engine.connect() as c:
    profiles = c.execute(text('select count(*) from public."Profile"')).scalar()
    linked = c.execute(text("""
        select count(*) from public."Profile" p
        join public."User" lu on lu.id = p."userId"
        join public.users u on u.email = lu.email
    """)).scalar()
    print("=== PRE-FLIGHT ===")
    print(f"  Profile rows                {profiles}")
    print(f"  resolvable to a users row   {linked}")
    print(f"  mode                        {'LIVE' if LIVE else 'DRY RUN (no writes)'}")

    if not LIVE:
        print("\n  dry run. Re-run with --live to merge.")
        raise SystemExit(0)

    n = c.execute(text(MERGE)).rowcount
    c.commit()
    print(f"\n=== MERGED {n} USER PROFILES ===")

with engine.connect() as c:
    print()
    for r in c.execute(text(
        "select email, first_name, last_name, coalesce(headline,'-'), "
        "coalesce(substring(bio from 1 for 34),'-') "
        "from public.users order by email"
    )):
        print(f"  {r[0]:30} {str(r[1]):14} {str(r[2]):16} {str(r[3])[:22]:22} {str(r[4])}")

    print()
    print("=== fill rate after merge ===")
    for f in FIELDS:
        n = c.execute(text(f"select count(*) from public.users where {f} is not null")).scalar()
        print(f"  {f:14} {n:>2}/11")
