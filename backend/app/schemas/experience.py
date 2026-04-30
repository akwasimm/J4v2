"""
Experience schemas.
"""

from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime, date


class ExperienceCreate(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=200)
    company: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=200)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current: Optional[bool] = False
    description: Optional[List[str]] = None
    source: str = "manual"

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Job title cannot be empty')
        return v.strip()

    @validator('end_date')
    def end_after_start(cls, v, values):
        if v and values.get('start_date') and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v

    @validator('current')
    def current_clears_end_date(cls, v, values):
        return v

    @validator('description')
    def description_items_not_empty(cls, v):
        if v:
            return [item.strip() for item in v if item.strip()]
        return v

    @validator('source')
    def source_valid(cls, v):
        if v not in ["manual", "resume"]:
            raise ValueError('Source must be manual or resume')
        return v


class ExperienceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current: Optional[bool] = None
    description: Optional[List[str]] = None


class ExperienceResponse(BaseModel):
    id: str
    user_id: str
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current: Optional[bool] = False
    description: Optional[List[str]] = None
    source: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BulkExperienceUpdate(BaseModel):
    experience: List[ExperienceCreate]
