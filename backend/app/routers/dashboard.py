"""
Dashboard Router - Personalized AI-powered user dashboard.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, require_groq
from app.schemas.dashboard import DashboardResponse
from app.schemas.common import SuccessResponse

router = APIRouter()


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    force_refresh: bool = Query(default=False, description="Force AI regeneration of dashboard data"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    """
    Get personalized dashboard data for the current user.

    Returns:
    - **top_picks**: 6 best matching jobs with >90% match score
    - **missing_skills**: Skills the user is missing that are in demand
    - **skills_in_demand**: Trending skills in the market
    - **market_snapshot**: Brief market overview personalized to user
    - **stats**: User's application statistics

    Data is cached for 6 hours. Use force_refresh=true to regenerate.
    """
    from app.services.dashboard_service import get_dashboard_data
    return get_dashboard_data(db, user_id, force_refresh)


@router.get("/cached", response_model=DashboardResponse)
def get_dashboard_cached(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get dashboard data from cache only - FAST, no AI calls.
    Returns cached data, incomplete profile data, or placeholder for new generation.
    """
    from app.services.dashboard_service import get_cached_dashboard_data
    return get_cached_dashboard_data(db, user_id)


@router.post("/refresh", response_model=DashboardResponse)
def refresh_dashboard(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    """
    Force refresh dashboard data with new AI generation.
    Respects daily limit: 5 AI calls per user per day.
    """
    from app.services.dashboard_service import get_dashboard_data, check_daily_ai_limit, record_ai_call
    
    # Check daily AI limit
    allowed, calls_made, calls_remaining = check_daily_ai_limit(db, user_id)
    if not allowed:
        # Return cached data with rate limit message
        from app.services.dashboard_service import get_cached_dashboard_data
        data = get_cached_dashboard_data(db, user_id)
        data["rate_limited"] = True
        data["calls_made_today"] = calls_made
        data["calls_remaining"] = 0
        data["message"] = f"Daily AI limit reached (5/5). Using cached data."
        return data
    
    # Record this AI call
    record_ai_call(db, user_id)
    
    # Generate fresh data
    result = get_dashboard_data(db, user_id, force_refresh=True)
    result["calls_made_today"] = calls_made + 1
    result["calls_remaining"] = calls_remaining - 1
    return result


