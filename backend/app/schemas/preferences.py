"""
Preferences schemas.
"""

from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime

VALID_EMPLOYMENT_TYPES = ["Full-time", "Contract", "Part-time", "Internship"]
VALID_REMOTE_PREFERENCES = ["remote", "hybrid", "on-site"]
VALID_NOTICE_PERIODS = [
    "Immediate", "2 weeks", "1 month", "2 months", "3 months"
]
VALID_CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD"]


class PreferencesUpdate(BaseModel):
    employment_types: Optional[List[str]] = None
    remote_preference: Optional[str] = None
    target_salary_min: Optional[int] = Field(None, ge=0)
    target_salary_max: Optional[int] = Field(None, ge=0)
    target_salary_currency: Optional[str] = None
    preferred_locations: Optional[List[str]] = None
    open_to_relocation: Optional[bool] = None
    notice_period: Optional[str] = None
    industry_preference: Optional[List[str]] = None
    job_level_preference: Optional[str] = None
    target_role: Optional[str] = None  # User's target job role for dashboard personalization

    @validator('employment_types')
    def validate_employment_types(cls, v):
        if v:
            for t in v:
                if t not in VALID_EMPLOYMENT_TYPES:
                    raise ValueError(f'Invalid employment type: {t}')
        return v

    @validator('remote_preference')
    def validate_remote(cls, v):
        if v and v not in VALID_REMOTE_PREFERENCES:
            raise ValueError(f'Must be one of: {VALID_REMOTE_PREFERENCES}')
        return v

    @validator('target_salary_max')
    def max_greater_than_min(cls, v, values):
        if v and values.get('target_salary_min'):
            if v < values['target_salary_min']:
                raise ValueError('Max salary must be greater than min salary')
        return v

    @validator('target_salary_currency')
    def validate_currency(cls, v):
        if v and v not in VALID_CURRENCIES:
            raise ValueError(f'Must be one of: {VALID_CURRENCIES}')
        return v

    @validator('notice_period')
    def validate_notice(cls, v):
        if v and v not in VALID_NOTICE_PERIODS:
            raise ValueError(f'Must be one of: {VALID_NOTICE_PERIODS}')
        return v


class PreferencesResponse(BaseModel):
    user_id: str
    employment_types: Optional[List[str]] = None
    remote_preference: Optional[str] = None
    target_salary_min: Optional[int] = None
    target_salary_max: Optional[int] = None
    target_salary_currency: Optional[str] = "INR"
    preferred_locations: Optional[List[str]] = None
    open_to_relocation: Optional[bool] = False
    notice_period: Optional[str] = None
    industry_preference: Optional[List[str]] = None
    job_level_preference: Optional[str] = None
    target_role: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
