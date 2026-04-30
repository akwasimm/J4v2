"""
Resume router - handles upload, management, and avatar endpoints.
"""

import logging
from fastapi import APIRouter, Depends, UploadFile, File, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.resume import ResumeResponse, ResumeListResponse
from app.schemas.profile import ProfileResponse
from app.schemas.common import SuccessResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/resume",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Upload a resume file (PDF or DOCX). Auto-parses and populates profile."""
    from app.services.resume_service import upload_resume as _upload
    return await _upload(db, user_id, file, auto_parse=True)


@router.get("/resumes", response_model=ResumeListResponse)
def get_resumes(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get list of all user resumes."""
    from app.services.resume_service import get_user_resumes
    resumes = get_user_resumes(db, user_id)
    default_id = next((str(r.id) for r in resumes if r.is_default), None)
    return ResumeListResponse(
        resumes=resumes,
        total=len(resumes),
        default_resume_id=default_id
    )


@router.delete("/resume/{resume_id}", response_model=SuccessResponse)
async def delete_resume(
    resume_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a resume."""
    from app.services.resume_service import delete_resume as _delete
    await _delete(db, user_id, resume_id)
    return SuccessResponse(message="Resume deleted successfully")


@router.put("/resume/{resume_id}/default", response_model=ResumeResponse)
async def set_default_resume(
    resume_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Set a resume as the default."""
    from app.services.resume_service import set_default_resume as _set_default
    return await _set_default(db, user_id, resume_id)


@router.post("/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Upload a profile avatar image (JPG, PNG, WebP)."""
    from app.services.resume_service import upload_avatar as _upload_avatar
    return await _upload_avatar(db, user_id, file)


@router.post("/resume/{resume_id}/reparse", response_model=ResumeResponse)
async def reparse_resume(
    resume_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Re-parse an existing resume."""
    from app.services.resume_service import get_resume_by_id, parse_and_populate
    resume = get_resume_by_id(db, resume_id, user_id)
    if not resume.raw_text:
        raise HTTPException(
            status_code=400,
            detail="Resume has no extracted text to parse"
        )
    return await parse_and_populate(db, resume, user_id)
