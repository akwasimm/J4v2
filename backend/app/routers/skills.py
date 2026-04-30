"""
Skills router.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.skills import (
    SkillCreate, SkillUpdate, SkillResponse, BulkSkillsUpdate
)
from app.schemas.common import SuccessResponse

router = APIRouter()


@router.get("", response_model=List[SkillResponse])
def get_skills(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import get_skills
    return get_skills(db, user_id)


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def add_skill(
    data: SkillCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import add_skill
    return add_skill(db, user_id, data)


@router.put("/bulk", response_model=List[SkillResponse])
def bulk_update_skills(
    data: BulkSkillsUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import bulk_update_skills
    return bulk_update_skills(db, user_id, data)


@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: str,
    data: SkillUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import update_skill
    return update_skill(db, user_id, skill_id, data)


@router.delete("/{skill_id}", response_model=SuccessResponse)
def delete_skill(
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import delete_skill
    delete_skill(db, user_id, skill_id)
    return SuccessResponse(message="Skill deleted")
