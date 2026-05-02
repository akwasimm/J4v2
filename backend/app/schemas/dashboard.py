"""
Dashboard schemas for AI-powered personalized dashboard.
"""

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class TopPickJob(BaseModel):
    job_id: str
    title: str
    company: str
    location: str
    work_model: str
    match_score: int
    salary_range: str
    tags: List[str] = []
    match_reasons: List[str] = []


class MissingSkill(BaseModel):
    skill: str
    importance: str
    impact: str
    jobs_requiring: int


class SkillInDemand(BaseModel):
    skill_name: str
    demand_score: float
    trend_direction: str
    user_has: bool
    salary_premium: str


class MarketSnapshot(BaseModel):
    hot_roles: List[str] = []
    avg_salary_for_profile: str
    market_trend: str
    companies_actively_hiring: int
    message: Optional[str] = None


class DashboardStats(BaseModel):
    applied_count: int
    saved_count: int
    interviews_count: int
    profile_completion: int
    first_name: Optional[str] = None
    full_name: Optional[str] = None


class DashboardResponse(BaseModel):
    user_id: str
    data_source: str = "ai_generated"  # "market_trends", "ai_generated", "empty"
    profile_completion: int = 0
    top_picks: List[TopPickJob] = []
    missing_skills: List[MissingSkill] = []
    skills_in_demand: List[SkillInDemand] = []
    market_snapshot: Optional[MarketSnapshot] = None
    stats: Optional[DashboardStats] = None
    generated_at: datetime
    expires_at: Optional[datetime] = None
    is_fresh: bool = False
    is_empty: bool = False
    # Rate limiting fields
    rate_limited: bool = False
    next_update_available: Optional[str] = None
    message: Optional[str] = None

    class Config:
        from_attributes = True
