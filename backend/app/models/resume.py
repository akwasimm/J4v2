"""
User resume model.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Integer, ForeignKey, Text, JSON
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


class UserResume(Base):
    """User resume upload model."""
    __tablename__ = "user_resumes"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(10), nullable=False)
    url = Column(String(500), nullable=True)
    is_default = Column(Boolean, default=False, nullable=True)
    is_parsed = Column(Boolean, default=False, nullable=True)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(JSON, nullable=True)
    ats_score = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    parsed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="resumes")

    def __repr__(self):
        return f"<UserResume {self.filename}>"
