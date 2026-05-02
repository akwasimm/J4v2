"""
Dashboard model - Stores AI-generated personalized dashboard data for users.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, DateTime,
    Integer, ForeignKey, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

def generate_uuid():
    return str(uuid.uuid4())


class UserDashboardData(Base):
    """
    Stores AI-generated personalized dashboard content for a user.
    Cached for 6 hours before refresh required.
    """
    __tablename__ = "user_dashboard_data"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True
    )

    # Top picks - 6 best matching jobs with >90% score
    top_picks = Column(JSON, nullable=True)  # [{job_id, title, company, match_score, reasons, tags}]

    # Missing skills box
    missing_skills = Column(JSON, nullable=True)  # [{skill, importance, impact}]

    # Skills in demand section
    skills_in_demand = Column(JSON, nullable=True)  # [{skill_name, demand_score, trend, user_has}]

    # Market snapshot section
    market_snapshot = Column(JSON, nullable=True)  # {salary_data, companies_hiring, experience_distribution}

    # Stats summary
    stats_summary = Column(JSON, nullable=True)  # {applied_count, saved_count, interviews_count, profile_completion}

    # Metadata
    generated_at = Column(DateTime(timezone=True), default=utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    ai_model_used = Column(String(50), nullable=True)

    def __repr__(self):
        return f"<UserDashboardData user={self.user_id} generated={self.generated_at}>"


class UserAICallTracking(Base):
    """
    Tracks daily AI generation calls per user for rate limiting.
    Resets every day. Max 5 calls per day per user.
    """
    __tablename__ = "user_ai_call_tracking"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Date for this tracking record (YYYY-MM-DD)
    date = Column(String(10), nullable=False, index=True)
    
    # Number of AI calls made today
    call_count = Column(Integer, default=0, nullable=False)
    
    # Last call timestamp
    last_call_at = Column(DateTime(timezone=True), default=utcnow)
    
    def __repr__(self):
        return f"<UserAICallTracking user={self.user_id} date={self.date} count={self.call_count}>"
