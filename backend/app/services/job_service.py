import logging
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from fastapi import HTTPException, status

from app.models.jobs import Job, JobApplication, SavedJob, SavedJobCollection
from app.schemas.jobs import (
    JobSearchParams,
    ApplicationCreate,
    ApplicationUpdate,
    SaveJobRequest,
    SavedJobNoteUpdate,
    CollectionCreate
)

logger = logging.getLogger(__name__)

# ─── Jobs ────────────────────────────────────────────────────────────────────

def search_jobs(
    db: Session,
    params: JobSearchParams,
    user_id: Optional[str] = None
) -> dict:
    query = db.query(Job).filter(Job.is_active == True)

    # Keyword search across title, company, description
    if params.q:
        search_term = f"%{params.q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Job.title).like(search_term),
                func.lower(Job.company_name).like(search_term),
                func.lower(Job.description).like(search_term)
            )
        )

    # Location filter
    if params.location:
        query = query.filter(
            func.lower(Job.location).like(f"%{params.location.lower()}%")
        )

    # Work model filter
    if params.work_model:
        query = query.filter(
            func.lower(Job.work_model) == params.work_model.lower()
        )

    # Job type filter
    if params.job_type:
        query = query.filter(
            func.lower(Job.job_type).like(f"%{params.job_type.lower()}%")
        )

    # Experience filter
    if params.min_exp is not None:
        query = query.filter(
            or_(
                Job.min_experience_years == None,
                Job.min_experience_years <= params.min_exp
            )
        )

    if params.max_exp is not None:
        query = query.filter(
            or_(
                Job.min_experience_years == None,
                Job.min_experience_years <= params.max_exp
            )
        )

    # Salary filter
    if params.salary_min:
        query = query.filter(
            or_(
                Job.salary_max == None,
                Job.salary_max >= params.salary_min
            )
        )

    if params.salary_max:
        query = query.filter(
            or_(
                Job.salary_min == None,
                Job.salary_min <= params.salary_max
            )
        )

    # Count total before pagination
    total = query.count()

    # Order by newest first
    query = query.order_by(Job.posted_at.desc())

    # Pagination
    offset = (params.page - 1) * params.page_size
    jobs = query.offset(offset).limit(params.page_size).all()

    total_pages = (total + params.page_size - 1) // params.page_size

    return {
        "jobs": jobs,
        "total": total,
        "page": params.page,
        "page_size": params.page_size,
        "total_pages": total_pages,
        "has_next": params.page < total_pages,
        "has_prev": params.page > 1
    }

def get_job_by_id(db: Session, job_id: str) -> Job:
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.is_active == True
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# ─── Applications ────────────────────────────────────────────────────────────

def get_user_applications(
    db: Session,
    user_id: str
) -> List[JobApplication]:
    return db.query(JobApplication).options(
        joinedload(JobApplication.job)
    ).filter(
        JobApplication.user_id == user_id
    ).order_by(JobApplication.applied_at.desc()).all()

def apply_to_job(
    db: Session,
    user_id: str,
    data: ApplicationCreate
) -> JobApplication:
    # Check job exists
    job = get_job_by_id(db, data.job_id)

    # Check if already applied
    existing = db.query(JobApplication).filter(
        JobApplication.user_id == user_id,
        JobApplication.job_id == data.job_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="You have already applied to this job"
        )

    application = JobApplication(
        user_id=user_id,
        job_id=data.job_id,
        status="applied",
        role_title=job.title,
        company_name=job.company_name,
        location=job.location,
        column_id="applied",
        match_score_at_apply=data.match_score_at_apply
    )

    try:
        db.add(application)
        db.commit()
        db.refresh(application)
        logger.info(f"Application created: user={user_id} job={data.job_id}")
        return application
    except Exception as e:
        db.rollback()
        logger.error(f"Application create error: {e}")
        raise HTTPException(status_code=500, detail="Could not submit application")

def update_application(
    db: Session,
    user_id: str,
    application_id: str,
    data: ApplicationUpdate
) -> JobApplication:
    app = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == user_id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    update_data = data.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] != app.status:
        app.status_updated_at = datetime.now(timezone.utc)
        if update_data["status"] in ["applied", "viewed"]:
            app.column_id = update_data["status"]
        elif update_data["status"] == "interviewing":
            app.column_id = "interviewing"
        elif update_data["status"] == "offered":
            app.column_id = "offered"
        elif update_data["status"] == "closed":
            app.column_id = "closed"
            app.is_closed = True

    for field, value in update_data.items():
        setattr(app, field, value)

    try:
        db.commit()
        db.refresh(app)
        return app
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update application")

def delete_application(db: Session, user_id: str, application_id: str):
    app = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == user_id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    try:
        db.delete(app)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete application")

# ─── Saved Jobs ───────────────────────────────────────────────────────────────

def get_saved_jobs(db: Session, user_id: str) -> List[SavedJob]:
    return db.query(SavedJob).options(
        joinedload(SavedJob.job)
    ).filter(
        SavedJob.user_id == user_id
    ).order_by(SavedJob.saved_at.desc()).all()

def save_job(
    db: Session,
    user_id: str,
    data: SaveJobRequest
) -> SavedJob:
    # Check job exists
    get_job_by_id(db, data.job_id)

    # Check if already saved
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == user_id,
        SavedJob.job_id == data.job_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Job already saved"
        )

    saved = SavedJob(
        user_id=user_id,
        job_id=data.job_id,
        collection_id=data.collection_id,
        match_score=data.match_score
    )

    try:
        db.add(saved)
        db.commit()
        db.refresh(saved)
        return saved
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not save job")

def unsave_job(db: Session, user_id: str, job_id: str):
    saved = db.query(SavedJob).filter(
        SavedJob.user_id == user_id,
        SavedJob.job_id == job_id
    ).first()

    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")

    try:
        db.delete(saved)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not remove saved job")

def update_saved_job_note(
    db: Session,
    user_id: str,
    saved_job_id: str,
    data: SavedJobNoteUpdate
) -> SavedJob:
    saved = db.query(SavedJob).filter(
        SavedJob.id == saved_job_id,
        SavedJob.user_id == user_id
    ).first()

    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")

    saved.note_text = data.note_text
    saved.has_note = bool(data.note_text and data.note_text.strip())

    try:
        db.commit()
        db.refresh(saved)
        return saved
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update note")

# ─── Collections ──────────────────────────────────────────────────────────────

def get_collections(
    db: Session,
    user_id: str
) -> List[SavedJobCollection]:
    return db.query(SavedJobCollection).filter(
        SavedJobCollection.user_id == user_id
    ).order_by(SavedJobCollection.created_at).all()

def create_collection(
    db: Session,
    user_id: str,
    data: CollectionCreate
) -> SavedJobCollection:
    # Check duplicate label
    existing = db.query(SavedJobCollection).filter(
        SavedJobCollection.user_id == user_id,
        func.lower(SavedJobCollection.label) == data.label.lower()
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Collection '{data.label}' already exists"
        )

    collection = SavedJobCollection(
        user_id=user_id,
        label=data.label,
        icon=data.icon,
        icon_color=data.icon_color
    )

    try:
        db.add(collection)
        db.commit()
        db.refresh(collection)
        return collection
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not create collection")

def delete_collection(db: Session, user_id: str, collection_id: str):
    collection = db.query(SavedJobCollection).filter(
        SavedJobCollection.id == collection_id,
        SavedJobCollection.user_id == user_id
    ).first()

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Unlink saved jobs from this collection before deleting
    db.query(SavedJob).filter(
        SavedJob.collection_id == collection_id
    ).update({"collection_id": None})

    try:
        db.delete(collection)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete collection")
