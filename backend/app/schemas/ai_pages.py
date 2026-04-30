"""
Schemas for AI-powered pages.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any
from datetime import datetime

# ─── Job Match ────────────────────────────────────────────────────────────────

class JobMatchResponse(BaseModel):
    job_id: str
    user_id: str
    ai_match_score: int
    match_verdict: str
    strengths: List[str] = []
    gaps: List[str] = []
    skill_matches: Optional[Any] = None
    scoring_breakdown: Optional[Any] = None
    recommendation: Optional[str] = None
    calculated_at: datetime

    class Config:
        from_attributes = True

# ─── Skill Gap ────────────────────────────────────────────────────────────────

class SkillGapRequest(BaseModel):
    target_role: str = Field(..., min_length=2, max_length=100)

class SkillGapResponse(BaseModel):
    user_id: str
    target_role: str
    readiness_score: int
    readiness_label: str
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    skills_to_improve: List[str] = []
    personalized_learning_path: Optional[Any] = None
    gap_summary: Optional[str] = None
    analyzed_at: datetime

    class Config:
        from_attributes = True

# ─── Resume Analysis ──────────────────────────────────────────────────────────

class ResumeAnalysisResponse(BaseModel):
    id: str
    resume_id: str
    user_id: str
    ats_fit_score: int
    score_feedback: Optional[str] = None
    keywords_found: List[str] = []
    keywords_missing: List[str] = []
    pro_tip: Optional[str] = None
    enhancements: Optional[Any] = None
    has_analysis: bool
    analyzed_at: datetime

    class Config:
        from_attributes = True

# ─── AI Recommendations ───────────────────────────────────────────────────────

class RecommendationsResponse(BaseModel):
    user_id: str
    top_picks: List[Any] = []
    match_summary: Optional[Any] = None
    generated_at: datetime

# ─── Market Insights ─────────────────────────────────────────────────────────

class MarketInsightsRequest(BaseModel):
    role: Optional[str] = None
    location: Optional[str] = None

class MarketInsightsResponse(BaseModel):
    user_id: str
    role: Optional[str] = None
    location: Optional[str] = None
    data: Any
    generated_at: datetime
    expires_at: Optional[datetime] = None

# ─── Coach ────────────────────────────────────────────────────────────────────

class CoachMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None

class CoachMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class CoachSessionResponse(BaseModel):
    id: str
    session_uuid: str
    user_id: str
    title: str
    context: Optional[str] = None
    message_count: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[CoachMessageResponse] = []

    class Config:
        from_attributes = True

class CoachSessionCreate(BaseModel):
    context: Optional[str] = "general"

class CoachChatResponse(BaseModel):
    session_id: str
    session_uuid: str
    user_message: CoachMessageResponse
    assistant_message: CoachMessageResponse
