"""
Resume schemas.
"""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_size: int
    file_type: str
    url: Optional[str] = None
    is_default: Optional[bool] = False
    is_parsed: Optional[bool] = False
    ats_score: Optional[int] = None
    uploaded_at: datetime
    parsed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumeListResponse(BaseModel):
    resumes: list[ResumeResponse]
    total: int
    default_resume_id: Optional[str] = None
