"""
Education router.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.education import (
    EducationCreate, EducationUpdate,
    EducationResponse, BulkEducationUpdate
)
from app.schemas.common import SuccessResponse

router = APIRouter()


@router.get("", response_model=List[EducationResponse])
def get_education(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import get_education
    return get_education(db, user_id)


@router.post("", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def add_education(
    data: EducationCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import add_education
    return add_education(db, user_id, data)


@router.put("/bulk", response_model=List[EducationResponse])
def bulk_update_education(
    data: BulkEducationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import bulk_update_education
    return bulk_update_education(db, user_id, data)


@router.put("/{edu_id}", response_model=EducationResponse)
def update_education(
    edu_id: str,
    data: EducationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import update_education
    return update_education(db, user_id, edu_id, data)


@router.delete("/{edu_id}", response_model=SuccessResponse)
def delete_education(
    edu_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import delete_education
    delete_education(db, user_id, edu_id)
    return SuccessResponse(message="Education deleted")
