"""
User model definition.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer,
    DateTime, Text
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


class User(Base):
    """User model for storing user account information."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    full_name = Column(String(200), nullable=True)

    # Status flags
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=True)
    is_new_user = Column(Boolean, default=True, nullable=True)
    agreed_to_terms = Column(Boolean, default=False, nullable=True)

    # Auth extras
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)

    # Profile
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)  # About me / professional summary
    location = Column(String(200), nullable=True)
    linkedin = Column(String(100), nullable=True)
    github = Column(String(100), nullable=True)
    leetcode = Column(String(100), nullable=True)
    portfolio = Column(String(500), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    avatar_uploaded_at = Column(DateTime(timezone=True), nullable=True)

    profile_completion = Column(Integer, default=0, nullable=True)
    profile_completion_updated_at = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    skills = relationship(
        "UserSkill", back_populates="user", cascade="all, delete-orphan"
    )
    experience = relationship(
        "UserExperience", back_populates="user", cascade="all, delete-orphan"
    )
    education = relationship(
        "UserEducation", back_populates="user", cascade="all, delete-orphan"
    )
    preferences = relationship(
        "UserPreference", back_populates="user",
        uselist=False, cascade="all, delete-orphan"
    )
    resumes = relationship(
        "UserResume", back_populates="user", cascade="all, delete-orphan"
    )
    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.email}>"

    def update_full_name(self):
        """Update full_name from first_name and last_name."""
        parts = filter(None, [self.first_name, self.last_name])
        self.full_name = " ".join(parts)
