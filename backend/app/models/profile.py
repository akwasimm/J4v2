"""
Profile models - UserSkill, UserExperience, UserEducation.
"""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Date, Text, ForeignKey, Enum, JSON
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


class UserSkill(Base):
    """User skill model."""
    __tablename__ = "user_skills"

    id = Column(String(50), primary_key=True)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(100), nullable=False)
    level = Column(
        Enum("Beginner", "Intermediate", "Advanced", "Expert",
             name="skill_level_enum"),
        nullable=False
    )
    source = Column(String(20), nullable=False, default="manual")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="skills")

    def __repr__(self):
        return f"<UserSkill {self.name} - {self.level}>"


class UserExperience(Base):
    """User work experience model."""
    __tablename__ = "user_experience"

    id = Column(String(50), primary_key=True)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    current = Column(Boolean, default=False, nullable=True)
    description = Column(JSON, nullable=True)
    source = Column(String(20), nullable=False, default="manual")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="experience")

    def __repr__(self):
        return f"<UserExperience {self.title} at {self.company}>"


class UserEducation(Base):
    """User education model."""
    __tablename__ = "user_education"

    id = Column(String(50), primary_key=True)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    degree = Column(String(100), nullable=False)
    field = Column(String(200), nullable=True)
    school = Column(String(200), nullable=True)
    info = Column(String(255), nullable=True)
    source = Column(String(20), nullable=False, default="manual")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="education")

    def __repr__(self):
        return f"<UserEducation {self.degree} at {self.school}>"
