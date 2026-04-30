import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime,
    Integer, ForeignKey, Text, JSON, Date
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

def generate_uuid():
    return str(uuid.uuid4())


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False, index=True)
    company_name = Column(String(200), nullable=False, index=True)
    location = Column(String(200), nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    work_model = Column(String(20), nullable=True)   # remote/hybrid/onsite
    job_type = Column(String(50), nullable=True)     # Full-time/Contract/etc
    experience_level = Column(String(50), nullable=True)
    min_experience_years = Column(Integer, nullable=True)
    core_skills = Column(JSON, nullable=True)        # ["Python", "React"]
    company_logo_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    requirements = Column(JSON, nullable=True)       # array of strings
    benefits = Column(JSON, nullable=True)           # array of strings
    is_active = Column(Boolean, default=True, nullable=False)
    posted_at = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    applications = relationship("JobApplication", back_populates="job")
    saved_by = relationship("SavedJob", back_populates="job")

    def __repr__(self):
        return f"<Job {self.title} at {self.company_name}>"


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    job_id = Column(
        UUID(as_uuid=False),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    status = Column(String(50), nullable=False, default="applied")
    role_title = Column(String(200), nullable=True)
    company_name = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    applied_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    status_updated_at = Column(DateTime(timezone=True), default=utcnow)
    status_note = Column(String(200), nullable=True)
    is_closed = Column(Boolean, default=False)
    position_index = Column(Integer, default=0)
    column_id = Column(String(20), nullable=True)
    match_score_at_apply = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", backref="applications")
    job = relationship("Job", back_populates="applications")

    def __repr__(self):
        return f"<JobApplication user={self.user_id} job={self.job_id} status={self.status}>"


class SavedJobCollection(Base):
    __tablename__ = "saved_job_collections"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    label = Column(String(50), nullable=False)
    icon = Column(String(50), nullable=True)
    icon_color = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    saved_jobs = relationship("SavedJob", back_populates="collection")

    def __repr__(self):
        return f"<SavedJobCollection {self.label}>"


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    job_id = Column(
        UUID(as_uuid=False),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    collection_id = Column(
        UUID(as_uuid=False),
        ForeignKey("saved_job_collections.id", ondelete="SET NULL"),
        nullable=True
    )
    match_score = Column(Integer, nullable=True)
    has_note = Column(Boolean, default=False)
    note_text = Column(Text, nullable=True)
    saved_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    user = relationship("User", backref="saved_jobs")
    job = relationship("Job", back_populates="saved_by")
    collection = relationship("SavedJobCollection", back_populates="saved_jobs")

    def __repr__(self):
        return f"<SavedJob user={self.user_id} job={self.job_id}>"
