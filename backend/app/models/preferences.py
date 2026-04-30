"""
User preferences model.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Integer, ForeignKey, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    """Return timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def generate_uuid():
    """Generate a UUID string."""
    return str(uuid.uuid4())


class UserPreference(Base):
    """User job preferences model."""
    __tablename__ = "user_preferences"

    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )
    employment_types = Column(JSON, nullable=True)
    remote_preference = Column(String(20), nullable=True)
    target_salary_min = Column(Integer, nullable=True)
    target_salary_max = Column(Integer, nullable=True)
    target_salary_currency = Column(String(10), nullable=True, default="INR")
    preferred_locations = Column(JSON, nullable=True)
    open_to_relocation = Column(Boolean, nullable=True, default=False)
    notice_period = Column(String(50), nullable=True)
    industry_preference = Column(JSON, nullable=True)
    job_level_preference = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="preferences")

    def __repr__(self):
        return f"<UserPreference user_id={self.user_id}>"
