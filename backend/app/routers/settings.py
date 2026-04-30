"""
Settings Router - User settings, password, connected accounts, data export.
"""

from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.settings import (
    SettingsUpdate, SettingsResponse,
    ChangePasswordRequest, ConnectedAccountResponse
)
from app.schemas.common import SuccessResponse

router = APIRouter()

@router.get("", response_model=SettingsResponse)
def get_settings(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.settings_service import get_or_create_settings
    return get_or_create_settings(db, user_id)

@router.put("", response_model=SettingsResponse)
def update_settings(
    data: SettingsUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.settings_service import update_settings as _update
    return _update(db, user_id, data)

@router.put("/password", response_model=SuccessResponse)
def change_password(
    data: ChangePasswordRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.settings_service import change_password as _change
    result = _change(db, user_id, data)
    return SuccessResponse(message=result["message"])

@router.get("/connected-accounts", response_model=List[ConnectedAccountResponse])
def get_connected_accounts(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.settings_service import get_connected_accounts
    return get_connected_accounts(db, user_id)

@router.delete("/connected-accounts/{platform}", response_model=SuccessResponse)
def disconnect_account(
    platform: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.settings_service import disconnect_account as _disconnect
    result = _disconnect(db, user_id, platform)
    return SuccessResponse(message=result["message"])

@router.post("/export-data")
def export_data(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.settings_service import export_user_data
    return export_user_data(db, user_id)

@router.delete("/account", response_model=SuccessResponse)
def delete_account(
    password: str = Body(..., embed=True),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.settings_service import delete_account as _delete
    result = _delete(db, user_id, password)
    return SuccessResponse(message=result["message"])
