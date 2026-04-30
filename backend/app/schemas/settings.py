"""
Schemas for user settings.
"""

from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

VALID_THEMES = ["light", "dark"]
VALID_DIGEST_FREQUENCIES = ["daily", "weekly", "never"]

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    two_factor_enabled: Optional[bool] = None
    email_digest_frequency: Optional[str] = None
    job_alerts_enabled: Optional[bool] = None
    application_alerts_enabled: Optional[bool] = None
    message_alerts_enabled: Optional[bool] = None

    @validator('theme')
    def theme_valid(cls, v):
        if v and v not in VALID_THEMES:
            raise ValueError(f'Theme must be one of: {VALID_THEMES}')
        return v

    @validator('email_digest_frequency')
    def digest_valid(cls, v):
        if v and v not in VALID_DIGEST_FREQUENCIES:
            raise ValueError(f'Frequency must be one of: {VALID_DIGEST_FREQUENCIES}')
        return v

class SettingsResponse(BaseModel):
    id: str
    user_id: str
    theme: str
    language: str
    two_factor_enabled: bool
    email_digest_frequency: str
    job_alerts_enabled: bool
    application_alerts_enabled: bool
    message_alerts_enabled: bool
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def password_strength(cls, v):
        import re
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

class ConnectedAccountResponse(BaseModel):
    id: str
    user_id: str
    platform: str
    connected: bool
    connected_at: Optional[datetime] = None
    username: Optional[str] = None

    class Config:
        from_attributes = True
