"""
Career Coach chat model definitions.
Stores coach sessions and messages.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Integer, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

def generate_uuid():
    return str(uuid.uuid4())


class CoachSession(Base):
    __tablename__ = "coach_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    session_uuid = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    title = Column(String(200), nullable=True, default="New Conversation")
    context = Column(String(50), nullable=True, default="general")
    message_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    messages = relationship(
        "CoachMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="CoachMessage.created_at"
    )

    def __repr__(self):
        return f"<CoachSession {self.session_uuid}>"


class CoachMessage(Base):
    __tablename__ = "coach_messages"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    session_id = Column(
        UUID(as_uuid=False),
        ForeignKey("coach_sessions.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    role = Column(String(20), nullable=False)  # user / assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    session = relationship("CoachSession", back_populates="messages")

    def __repr__(self):
        return f"<CoachMessage role={self.role} session={self.session_id}>"
