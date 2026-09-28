"""
AI Pages Router - Job Match, Skill Gap, Resume Analysis, Recommendations, Market Insights.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, require_groq
from app.schemas.ai_pages import (
    JobMatchResponse, SkillGapRequest, SkillGapResponse,
    ResumeAnalysisResponse, MarketInsightsRequest,
    MarketInsightsResponse
)
from app.schemas.common import SuccessResponse

router = APIRouter()


def require_daily_ai_quota(db: Session, user_id: str) -> tuple[bool, int, int]:
    """
    Shared daily AI quota check.

    The dashboard already enforced this; the market-insights endpoints, which
    spend a live web search plus an AI call, did not. Reuses the existing
    helper rather than introducing a second limiter.
    """
    from app.services.dashboard_service import check_daily_ai_limit
    return check_daily_ai_limit(db, user_id)


def record_ai_call(db: Session, user_id: str) -> None:
    from app.services.dashboard_service import record_ai_call as _record
    _record(db, user_id)

# ─── Job Match ─────────────────────────────────────────────────────────────────

@router.get("/match/{job_id}", response_model=JobMatchResponse)
def get_job_match(
    job_id: str,
    force: bool = Query(default=False),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    from app.services.ai_pages_service import calculate_job_match
    return calculate_job_match(db, user_id, job_id, force_recalculate=force)

# ─── Skill Gap ─────────────────────────────────────────────────────────────────

@router.post("/skill-gap", response_model=SkillGapResponse)
def analyze_skill_gap(
    data: SkillGapRequest,
    force: bool = Query(default=False),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    from app.services.ai_pages_service import analyze_skill_gap
    return analyze_skill_gap(db, user_id, data.target_role, force_recalculate=force)

@router.get("/skill-gap/history")
def get_skill_gap_history(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.ai_pages_service import get_skill_gap_history
    return get_skill_gap_history(db, user_id)

@router.get("/skill-gap/roles")
def get_popular_roles():
    from app.services.ai_pages_service import POPULAR_ROLES
    return {"roles": POPULAR_ROLES}

# ─── Resume Analysis ──────────────────────────────────────────────────────────

@router.get("/resume-analysis", response_model=ResumeAnalysisResponse)
def get_resume_analysis(
    resume_id: Optional[str] = Query(default=None),
    force: bool = Query(default=False),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    from app.services.ai_pages_service import analyze_resume
    return analyze_resume(db, user_id, resume_id, force_recalculate=force)

# ─── AI Recommendations ───────────────────────────────────────────────────────

@router.get("/recommendations")
def get_recommendations(
    force: bool = Query(default=False),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    from app.services.ai_pages_service import get_ai_recommendations
    return get_ai_recommendations(db, user_id, force_recalculate=force)

# ─── Market Insights ─────────────────────────────────────────────────────────

@router.get("/market-insights")
def get_market_insights(
    role: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    force: bool = Query(default=False),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    from app.services.ai_pages_service import get_market_insights
    # This endpoint spends a paid AI call per uncached request. The dashboard
    # already guards its AI path with check_daily_ai_limit; this one did not,
    # so a script could call it in a loop and bill without bound.
    allowed, calls_made, calls_remaining = require_daily_ai_quota(db, user_id)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Daily AI limit reached ({calls_made} calls). "
                f"Resets tomorrow."
            ),
            headers={"Retry-After": "86400"},
        )
    result = get_market_insights(db, user_id, role, location, force_recalculate=force)
    record_ai_call(db, user_id)
    return {
        "user_id": user_id,
        "role": result.role,
        "location": result.location,
        "data": result.data_json,
        "generated_at": result.generated_at,
        "expires_at": result.expires_at
    }


@router.get("/market-insights-v2")
def get_market_insights_v2(
    role: str = Query(..., description="Job role title (e.g., 'Full Stack Developer')"),
    location: str = Query(..., description="Location (e.g., 'New York, USA' or 'India')"),
    show_inr: bool = Query(default=False, description="Convert all values to Indian Rupees"),
    force: bool = Query(default=False),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Enhanced market insights with real-time web search.
    
    - Searches real job market data from the web
    - Returns salary in local currency (auto-detected from location)
    - Toggle 'show_inr' to convert all values to Rupees
    - Includes dynamic charts: salary trends, skills, companies, geo-distribution
    """
    from app.services.market_ai_service import get_real_time_market_insights, format_for_frontend

    # v2 does a live web search plus an AI call, so it is the most expensive
    # endpoint in this router. Guarded like the dashboard.
    allowed, calls_made, calls_remaining = require_daily_ai_quota(db, user_id)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Daily AI limit reached ({calls_made} calls). Resets tomorrow.",
            headers={"Retry-After": "86400"},
        )
    
    try:
        # Get real-time data from web search + AI
        insights_data = get_real_time_market_insights(
            role=role,
            location=location,
            convert_to_rupees=True  # Always get INR for toggle option
        )

        # Only a call that actually produced data is billable, so recording
        # sits after this returns and inside the try: an exception means no
        # spend happened and must not consume the user's daily allowance.
        record_ai_call(db, user_id)
        
        # Format for frontend
        formatted = format_for_frontend(insights_data, show_inr=show_inr)

        return {
            "user_id": user_id,
            "role": role,
            "location": location,
            "data": formatted,
            "generated_at": insights_data.get("_metadata", {}).get("generated_at"),
            "is_real_time": insights_data.get("_metadata", {}).get("real_time", False),
            "api_version": "v2-websearch"
        }
        
    except Exception as e:
        # Fallback to v1 if v2 fails
        from app.services.ai_pages_service import get_market_insights
        # Uses the injected session. The old next(get_db()) abandoned the
        # generator without closing it, so the pooled connection was never
        # released - enough errors here and the API runs out of connections.
        result = get_market_insights(db, user_id, role, location, force_recalculate=force)
        return {
            "user_id": user_id,
            "role": result.role,
            "location": result.location,
            "data": result.data_json,
            "generated_at": result.generated_at,
            "expires_at": result.expires_at,
            "fallback": True,
            "error": str(e)
        }


@router.get("/market-insights/currencies")
def get_supported_currencies():
    """Get list of supported currencies and conversion rates."""
    from app.services.market_ai_service import CURRENCY_RATES, LOCATION_CURRENCY
    return {
        "currencies": {
            "USD": "US Dollar",
            "GBP": "British Pound",
            "EUR": "Euro",
            "SGD": "Singapore Dollar",
            "AUD": "Australian Dollar",
            "CAD": "Canadian Dollar",
            "AED": "UAE Dirham",
            "INR": "Indian Rupee"
        },
        "conversion_rates_to_inr": CURRENCY_RATES,
        "location_currency_mapping": LOCATION_CURRENCY,
        "note": "Rates are approximate for salary estimation purposes"
    }
