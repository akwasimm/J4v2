"""
User settings model definitions.
Stores user preferences and connected accounts.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

def generate_uuid():
    return str(uuid.uuid4())


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, unique=True, index=True
    )
    theme = Column(String(20), default="light")
    language = Column(String(50), default="English")
    two_factor_enabled = Column(Boolean, default=False)
    email_digest_frequency = Column(String(20), default="weekly")
    job_alerts_enabled = Column(Boolean, default=True)
    application_alerts_enabled = Column(Boolean, default=True)
    message_alerts_enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="settings")

    def __repr__(self):
        return f"<UserSettings user={self.user_id}>"


class ConnectedAccount(Base):
    __tablename__ = "connected_accounts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    platform = Column(String(50), nullable=False)
    connected = Column(Boolean, default=False)
    connected_at = Column(DateTime(timezone=True), nullable=True)
    username = Column(String(100), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def __repr__(self):
        return f"<ConnectedAccount {self.platform} user={self.user_id}>"
