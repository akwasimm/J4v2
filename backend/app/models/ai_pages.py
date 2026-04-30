"""
AI Pages model definitions.
Stores all AI-generated page data for Job Match, Skill Gap, Resume Analysis,
AI Recommendations, and Market Insights.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Integer, ForeignKey, Text, JSON, Float
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

def generate_uuid():
    return str(uuid.uuid4())


class JobMatchHistory(Base):
    __tablename__ = "job_match_history"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    job_id = Column(
        UUID(as_uuid=False),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    ai_match_score = Column(Integer, nullable=True)
    match_verdict = Column(String(200), nullable=True)
    skill_matches = Column(JSON, nullable=True)
    scoring_breakdown = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    gaps = Column(JSON, nullable=True)
    recommendation = Column(Text, nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=utcnow)
    is_quick_match = Column(Boolean, default=False)

    def __repr__(self):
        return f"<JobMatch user={self.user_id} job={self.job_id} score={self.ai_match_score}>"


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analysis"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    target_role = Column(String(100), nullable=False)
    readiness_score = Column(Integer, nullable=True)
    readiness_label = Column(String(50), nullable=True)
    matched_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    skills_to_improve = Column(JSON, nullable=True)
    personalized_learning_path = Column(JSON, nullable=True)
    gap_summary = Column(Text, nullable=True)
    analyzed_at = Column(DateTime(timezone=True), default=utcnow)

    def __repr__(self):
        return f"<SkillGap user={self.user_id} role={self.target_role} score={self.readiness_score}>"


class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    resume_id = Column(
        UUID(as_uuid=False),
        ForeignKey("user_resumes.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    ats_fit_score = Column(Integer, nullable=True)
    score_feedback = Column(Text, nullable=True)
    keywords_found = Column(JSON, nullable=True)
    keywords_missing = Column(JSON, nullable=True)
    pro_tip = Column(Text, nullable=True)
    enhancements = Column(JSON, nullable=True)
    has_analysis = Column(Boolean, default=False)
    analyzed_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def __repr__(self):
        return f"<ResumeAnalysis resume={self.resume_id} score={self.ats_fit_score}>"


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    job_id = Column(
        UUID(as_uuid=False),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=True
    )
    recommendation_type = Column(String(50), nullable=False)
    match_percentage = Column(Integer, nullable=True)
    reasons = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<AIRec user={self.user_id} type={self.recommendation_type}>"


class MarketInsightsCache(Base):
    __tablename__ = "market_insights_cache"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    role = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    data_json = Column(JSON, nullable=False)
    generated_at = Column(DateTime(timezone=True), default=utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<MarketInsights user={self.user_id} role={self.role}>"
