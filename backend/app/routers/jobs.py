from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_optional_user
from app.schemas.jobs import (
    JobResponse,
    JobSearchResponse,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    SaveJobRequest,
    SavedJobNoteUpdate,
    SavedJobResponse,
    CollectionCreate,
    CollectionResponse
)
from app.schemas.common import SuccessResponse

router = APIRouter()

# ─── Collections ──────────────────────────────────────────────────────────────
# Note: These must come BEFORE parameterized routes like /{job_id}

@router.get("/collections/me", response_model=List[CollectionResponse])
def get_collections(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import get_collections as _get
    return _get(db, user_id)

@router.post(
    "/collections",
    response_model=CollectionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_collection(
    data: CollectionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import create_collection as _create
    return _create(db, user_id, data)

@router.delete("/collections/{collection_id}", response_model=SuccessResponse)
def delete_collection(
    collection_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import delete_collection as _delete
    _delete(db, user_id, collection_id)
    return SuccessResponse(message="Collection deleted")

# ─── Jobs ─────────────────────────────────────────────────────────────────────

@router.get("/search", response_model=JobSearchResponse)
def search_jobs(
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    work_model: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    min_exp: Optional[int] = Query(None),
    max_exp: Optional[int] = Query(None),
    salary_min: Optional[int] = Query(None),
    salary_max: Optional[int] = Query(None),
    sort_by: Optional[str] = Query(default="match_score", pattern="^(match_score|posted_at|relevance)$"),
    user_id: Optional[str] = Query(None, description="User ID for personalized match scoring"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Search jobs with optimized database-level pagination and caching.
    Returns cached results immediately if available.
    """
    from app.services.optimized_job_service import search_jobs_optimized
    from app.services.cache_warmer import get_jobs_fast_with_fallback
    from app.schemas.jobs import JobSearchParams
    
    params = JobSearchParams(
        q=q, location=location, work_model=work_model,
        job_type=job_type, min_exp=min_exp, max_exp=max_exp,
        salary_min=salary_min, salary_max=salary_max,
        sort_by=sort_by, user_id=user_id,
        page=page, page_size=page_size
    )
    
    # Use optimized search with fallback for fast response
    params_dict = params.model_dump()
    return get_jobs_fast_with_fallback(db, user_id, params_dict)

@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    from app.services.job_service import get_job_by_id
    return get_job_by_id(db, job_id)

# ─── Applications ─────────────────────────────────────────────────────────────

@router.get("/applications/me", response_model=List[ApplicationResponse])
def get_my_applications(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import get_user_applications
    return get_user_applications(db, user_id)

@router.post(
    "/applications",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED
)
def apply_to_job(
    data: ApplicationCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import apply_to_job as _apply
    return _apply(db, user_id, data)

@router.put("/applications/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    data: ApplicationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import update_application as _update
    return _update(db, user_id, application_id, data)

@router.delete("/applications/{application_id}", response_model=SuccessResponse)
def delete_application(
    application_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import delete_application as _delete
    _delete(db, user_id, application_id)
    return SuccessResponse(message="Application withdrawn")

# ─── Saved Jobs ───────────────────────────────────────────────────────────────

@router.get("/saved/me", response_model=List[SavedJobResponse])
def get_saved_jobs(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import get_saved_jobs as _get
    return _get(db, user_id)

@router.post(
    "/saved",
    response_model=SavedJobResponse,
    status_code=status.HTTP_201_CREATED
)
def save_job(
    data: SaveJobRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import save_job as _save
    return _save(db, user_id, data)

@router.delete("/saved/{job_id}", response_model=SuccessResponse)
def unsave_job(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import unsave_job as _unsave
    _unsave(db, user_id, job_id)
    return SuccessResponse(message="Job removed from saved")

@router.put("/saved/{saved_job_id}/note", response_model=SavedJobResponse)
def update_saved_job_note(
    saved_job_id: str,
    data: SavedJobNoteUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.job_service import update_saved_job_note as _update_note
    return _update_note(db, user_id, saved_job_id, data)
