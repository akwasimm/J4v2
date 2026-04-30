"""
Education schemas.
"""

from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime


class EducationCreate(BaseModel):
    id: Optional[str] = None
    degree: str = Field(..., min_length=1, max_length=100)
    field: Optional[str] = Field(None, max_length=200)
    school: Optional[str] = Field(None, max_length=200)
    info: Optional[str] = Field(None, max_length=255)
    source: str = "manual"

    @validator('degree')
    def degree_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Degree cannot be empty')
        return v.strip()

    @validator('source')
    def source_valid(cls, v):
        if v not in ["manual", "resume"]:
            raise ValueError('Source must be manual or resume')
        return v


class EducationUpdate(BaseModel):
    degree: Optional[str] = Field(None, min_length=1, max_length=100)
    field: Optional[str] = None
    school: Optional[str] = None
    info: Optional[str] = None


class EducationResponse(BaseModel):
    id: str
    user_id: str
    degree: str
    field: Optional[str] = None
    school: Optional[str] = None
    info: Optional[str] = None
    source: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BulkEducationUpdate(BaseModel):
    education: List[EducationCreate]
