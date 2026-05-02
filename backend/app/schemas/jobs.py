from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any
from datetime import datetime

# ─── Job Schemas ─────────────────────────────────────────────────────────────

class JobResponse(BaseModel):
    id: str
    title: str
    company_name: str
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    work_model: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    min_experience_years: Optional[int] = None
    core_skills: Optional[List[str]] = None
    company_logo_url: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    is_active: bool = True
    posted_at: Optional[datetime] = None
    created_at: datetime
    match_score: Optional[int] = None  # Personalized match score (0-100)

    class Config:
        from_attributes = True

class JobSearchParams(BaseModel):
    q: Optional[str] = None
    location: Optional[str] = None
    work_model: Optional[str] = None
    job_type: Optional[str] = None
    min_exp: Optional[int] = None
    max_exp: Optional[int] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    user_id: Optional[str] = None  # For personalized match scoring
    sort_by: Optional[str] = Field(default="match_score", pattern="^(match_score|posted_at|relevance)$")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=50)

class JobSearchResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

# ─── Application Schemas ──────────────────────────────────────────────────────

VALID_APPLICATION_STATUSES = [
    "applied", "viewed", "interviewing", "offered", "closed"
]

class ApplicationCreate(BaseModel):
    job_id: str
    match_score_at_apply: Optional[int] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    status_note: Optional[str] = None
    position_index: Optional[int] = None
    column_id: Optional[str] = None
    is_closed: Optional[bool] = None

    @validator('status')
    def status_valid(cls, v):
        if v and v not in VALID_APPLICATION_STATUSES:
            raise ValueError(f'Status must be one of: {VALID_APPLICATION_STATUSES}')
        return v

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    role_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    applied_at: datetime
    status_updated_at: Optional[datetime] = None
    status_note: Optional[str] = None
    is_closed: bool = False
    position_index: int = 0
    column_id: Optional[str] = None
    match_score_at_apply: Optional[int] = None
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True

# ─── Saved Job Schemas ────────────────────────────────────────────────────────

class SaveJobRequest(BaseModel):
    job_id: str
    collection_id: Optional[str] = None
    match_score: Optional[int] = None

class SavedJobNoteUpdate(BaseModel):
    note_text: Optional[str] = None

class SavedJobResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    collection_id: Optional[str] = None
    match_score: Optional[int] = None
    has_note: bool = False
    note_text: Optional[str] = None
    saved_at: datetime
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True

# ─── Collection Schemas ───────────────────────────────────────────────────────

class CollectionCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=50)
    icon: Optional[str] = None
    icon_color: Optional[str] = None

class CollectionResponse(BaseModel):
    id: str
    user_id: str
    label: str
    icon: Optional[str] = None
    icon_color: Optional[str] = None
    is_active: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
