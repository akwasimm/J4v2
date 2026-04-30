from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
    TokenResponse,
    UserResponse
)
from app.schemas.common import SuccessResponse
from app import services

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED
)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    from app.services.auth_service import register_user
    return register_user(db, data)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    from app.services.auth_service import login_user
    return login_user(db, data)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    from app.services.auth_service import refresh_tokens
    return refresh_tokens(db, data.refresh_token)


@router.get("/me", response_model=UserResponse)
def get_me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.auth_service import get_me
    return get_me(db, user_id)


@router.post("/forgot-password", response_model=SuccessResponse)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    from app.services.auth_service import forgot_password
    result = forgot_password(db, data.email)
    return SuccessResponse(message=result["message"])


@router.post("/reset-password", response_model=SuccessResponse)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    from app.services.auth_service import reset_password
    result = reset_password(db, data.token, data.new_password)
    return SuccessResponse(message=result["message"])
