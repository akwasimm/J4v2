"""
AI Pages Router - Job Match, Skill Gap, Resume Analysis, Recommendations, Market Insights.
"""

from fastapi import APIRouter, Depends, Query
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
    result = get_market_insights(db, user_id, role, location, force_recalculate=force)
    return {
        "user_id": user_id,
        "role": result.role,
        "location": result.location,
        "data": result.data_json,
        "generated_at": result.generated_at,
        "expires_at": result.expires_at
    }
