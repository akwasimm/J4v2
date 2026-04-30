"""
Skill schemas.
"""

from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class SkillLevel(str, Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    advanced = "Advanced"
    expert = "Expert"


class SkillCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=100)
    level: SkillLevel
    source: str = "manual"

    @validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Skill name cannot be empty')
        return v.strip()

    @validator('source')
    def source_valid(cls, v):
        if v not in ["manual", "resume"]:
            raise ValueError('Source must be manual or resume')
        return v


class SkillUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    level: Optional[SkillLevel] = None


class SkillResponse(BaseModel):
    id: str
    user_id: str
    name: str
    level: str
    source: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BulkSkillsUpdate(BaseModel):
    skills: List[SkillCreate]

    @validator('skills')
    def not_too_many(cls, v):
        if len(v) > 100:
            raise ValueError('Cannot have more than 100 skills')
        return v
