"""
Experience router.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.experience import (
    ExperienceCreate, ExperienceUpdate,
    ExperienceResponse, BulkExperienceUpdate
)
from app.schemas.common import SuccessResponse

router = APIRouter()


@router.get("", response_model=List[ExperienceResponse])
def get_experience(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import get_experience
    return get_experience(db, user_id)


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def add_experience(
    data: ExperienceCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import add_experience
    return add_experience(db, user_id, data)


@router.put("/bulk", response_model=List[ExperienceResponse])
def bulk_update_experience(
    data: BulkExperienceUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import bulk_update_experience
    return bulk_update_experience(db, user_id, data)


@router.put("/{exp_id}", response_model=ExperienceResponse)
def update_experience(
    exp_id: str,
    data: ExperienceUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import update_experience
    return update_experience(db, user_id, exp_id, data)


@router.delete("/{exp_id}", response_model=SuccessResponse)
def delete_experience(
    exp_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import delete_experience
    delete_experience(db, user_id, exp_id)
    return SuccessResponse(message="Experience deleted")
