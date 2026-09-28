"""
Proves the market-insights v2 quota fix, without a Groq key.

The bug: v2 checks the daily AI limit but never incremented it, so the counter
the limit is based on never advanced and a loop could call it without bound.
No Groq key is available here, so the paid call is stubbed and the router is
driven directly. What is under test is the router's accounting, not Groq.
"""
import os
import sys

# Must be set before app.core.config is imported, or the GROQ_API_KEY validator
# rejects the settings object.
os.environ["GROQ_API_KEY"] = "test-key-not-used"
os.environ["DEBUG"] = "false"

from datetime import datetime, timezone
from unittest.mock import patch

from app.core.database import SessionLocal
from app.models.dashboard import UserAICallTracking
from app.models.user import User
from app.routers.ai_pages import get_market_insights_v2
from sqlalchemy import select

MARKET = {
    "role": "Full Stack Developer",
    "location": "India",
    "average_salary": 1200000,
    "salary_range": {"min": 800000, "max": 1800000, "currency": "INR"},
    "skills_demand": [{"skill": "React", "demand": 90}],
    "companies_hiring": [{"name": "Acme", "openings": 5}],
    "market_growth": 12.5,
    "total_openings": 4200,
    "top_locations": [{"location": "Bengaluru", "count": 900}],
    "_metadata": {"generated_at": "2026-09-28T00:00:00Z", "real_time": True},
}

TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")


def count_today(db, user_id) -> int:
    row = db.execute(
        select(UserAICallTracking).where(
            UserAICallTracking.user_id == user_id,
            UserAICallTracking.date == TODAY,
        )
    ).scalars().first()
    return row.call_count if row else 0


def call_v2(db, user_id, fail=False):
    """Drive the router. `fail=True` makes the paid upstream call raise, which
    is what the router's fallback path exists for. The patch is built here
    rather than layered on by the caller: a nested patch() with return_value
    would silently override an outer side_effect, and the "failure" case would
    silently pass as a success.
    """
    kwargs = {"side_effect": RuntimeError("simulated upstream failure")} if fail else {
        "return_value": MARKET
    }
    with patch(
        "app.services.market_ai_service.get_real_time_market_insights", **kwargs
    ), patch(
        "app.services.market_ai_service.format_for_frontend", return_value=MARKET
    ):
        return get_market_insights_v2(
            role="Full Stack Developer",
            location="India",
            show_inr=False,
            force=False,
            user_id=user_id,
            db=db,
        )


def main() -> int:
    db = SessionLocal()
    user = db.execute(select(User).order_by(User.created_at)).scalars().first()
    user_id = str(user.id)

    before = count_today(db, user_id)
    print(f"user: {user.email}")
    print(f"call_count today before: {before}")

    result = call_v2(db, user_id)
    if result.get("api_version") != "v2-websearch":
        print(f"FAIL unexpected response shape: {result}")
        return 1

    after_one = count_today(db, user_id)
    print(f"call_count today after 1 call: {after_one}")
    if after_one != before + 1:
        print(f"FAIL the call was not recorded: {before} -> {after_one}, expected {before + 1}")
        return 1

    # A failed call must NOT consume the allowance. A Groq outage or a bad role
    # would otherwise burn the user's daily limit on calls that cost nothing,
    # and the quota guard would then lock them out of a working endpoint.
    try:
        result = call_v2(db, user_id, fail=True)
        print(f"the router fell back to v1, as designed: fallback={result.get('fallback')}")
    except Exception as e:
        print(f"the router raised instead of falling back: {type(e).__name__}: {e}")
    after_failure = count_today(db, user_id)
    print(f"call_count today after a failed call: {after_failure}")
    if after_failure != after_one:
        print(f"FAIL a failed call consumed the allowance: {after_one} -> {after_failure}")
        return 1

    # A second successful call must record a second one. A counter that only
    # moves once is as useless as one that never moves.
    call_v2(db, user_id)
    after_two = count_today(db, user_id)
    print(f"call_count today after 2 calls: {after_two}")
    if after_two != before + 2:
        print(f"FAIL the second call was not recorded: {after_two}, expected {before + 2}")
        return 1

    # Leave no trace on a real account. Delete the row this proof created rather
    # than setting it back to `before`: if the row did not exist beforehand, the
    # truthful end state is no row at all.
    if before == 0:
        db.execute(
            UserAICallTracking.__table__.delete().where(
                UserAICallTracking.user_id == user_id,
                UserAICallTracking.date == TODAY,
            )
        )
    else:
        row = db.execute(
            select(UserAICallTracking).where(
                UserAICallTracking.user_id == user_id,
                UserAICallTracking.date == TODAY,
            )
        ).scalars().one()
        row.call_count = before
    db.commit()
    print(f"restored to: {count_today(db, user_id)}")

    print("PASS - v2 records every successful AI call and the counter advances")
    return 0


if __name__ == "__main__":
    sys.exit(main())
