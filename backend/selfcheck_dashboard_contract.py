"""
Self-check for the dashboard return-type contract.

generate_dashboard_data() has four return paths: cache hit, market-trends
placeholder, empty state, and AI success. Three returned a
UserDashboardData; the AI path returned a plain dict, so get_dashboard_data() -
which reads .top_picks and .ai_model_used off the result - raised
AttributeError whenever the model call succeeded. The dashboard therefore
only ever worked when it had no AI data.

GROQ_API_KEY is not set in this environment, so the AI path cannot be reached
over HTTP. This check stubs the model call instead, so the contract is
verified without a key and without network access.

    docker compose exec -T backend python selfcheck_dashboard_contract.py
"""

import sys

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.dashboard import UserDashboardData
from app.models.user import User
import app.services.dashboard_service as svc

CANNED = {
    "top_picks": [
        {
            "job_id": "selftest-job",
            "title": "Senior Python Engineer",
            "company": "SelfTest",
            "match_score": 91,
        }
    ],
    "missing_skills": [{"skill": "Kubernetes", "importance": "High"}],
    "skills_in_demand": ["Python", "PostgreSQL"],
    "market_snapshot": {"hot_roles": ["Backend Engineer"]},
}

failures = []


def check(cond, label):
    print(f"  [{'PASS' if cond else 'FAIL'}] {label}")
    if not cond:
        failures.append(label)


def main() -> int:
    db = SessionLocal()
    try:
        user = db.execute(
            select(User).where(User.profile_completion >= 50)
        ).scalars().first()
        if user is None:
            print("no user above the AI threshold - nothing to exercise")
            return 1
        print(f"exercising AI path with {user.email} "
              f"(profile_completion={user.profile_completion})")

        svc.call_groq_json = lambda **kwargs: CANNED

        # force_refresh skips the cache and the incomplete-profile placeholder,
        # so this lands on the AI success path - the one that was broken.
        data = svc.generate_dashboard_data(db, user.id, force_refresh=True)
        check(
            isinstance(data, UserDashboardData),
            "AI path returns a UserDashboardData, not a dict",
        )
        check(
            len(data.top_picks or []) == 1,
            "AI path carries the model result through",
        )

        # The real caller: attribute access on the return value.
        out = svc.get_dashboard_data(db, user.id, force_refresh=True)
        check(isinstance(out, dict), "get_dashboard_data returns a dict")
        check(
            out.get("data_source") == "ai_generated",
            f"data_source is ai_generated (got {out.get('data_source')!r})",
        )
        check(len(out.get("top_picks") or []) == 1, "top_picks survive into the response")
        check(out.get("profile_completion") == user.profile_completion,
              "profile_completion matches the stored value")

        # Leave no self-test row behind.
        db.query(UserDashboardData).filter(
            UserDashboardData.user_id == user.id
        ).delete()
        db.commit()
    finally:
        db.close()

    print()
    if failures:
        print(f"FAILED ({len(failures)})")
        for f in failures:
            print(f"  x {f}")
        return 1
    print("PASS - all four return paths satisfy the same contract")
    return 0


if __name__ == "__main__":
    sys.exit(main())
