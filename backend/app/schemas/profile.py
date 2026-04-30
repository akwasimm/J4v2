"""
Profile schemas.
"""

from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.skills import SkillResponse
from app.schemas.experience import ExperienceResponse
from app.schemas.education import EducationResponse
from app.schemas.preferences import PreferencesResponse


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    headline: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=200)
    linkedin: Optional[str] = Field(None, max_length=100)
    github: Optional[str] = Field(None, max_length=100)
    leetcode: Optional[str] = Field(None, max_length=100)
    portfolio: Optional[str] = Field(None, max_length=500)

    @validator('first_name')
    def first_name_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('First name cannot be empty')
        return v.strip() if v else v

    @validator('portfolio')
    def portfolio_url_format(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('Portfolio must be a valid URL starting with http or https')
        return v


class ProfileResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    leetcode: Optional[str] = None
    portfolio: Optional[str] = None
    avatar_url: Optional[str] = None
    avatar_uploaded_at: Optional[datetime] = None
    is_active: bool
    is_verified: bool = False
    is_new_user: bool = True
    profile_completion: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FullProfileResponse(BaseModel):
    profile: ProfileResponse
    skills: List[SkillResponse] = []
    experience: List[ExperienceResponse] = []
    education: List[EducationResponse] = []
    preferences: Optional[PreferencesResponse] = None
    resume_count: int = 0


class ProfileCompleteRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    employment_types: Optional[List[str]] = None
    remote_preference: Optional[str] = None
