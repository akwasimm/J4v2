import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.user import User
from app.models.auth import PasswordResetToken
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token
)
from app.core.config import settings
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    AuthResponse
)

logger = logging.getLogger(__name__)


def split_full_name(full_name: str) -> Tuple[str, Optional[str]]:
    parts = full_name.strip().split(" ", 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else None
    return first_name, last_name


def build_token_response(user_id: str) -> TokenResponse:
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


def build_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        is_active=user.is_active,
        is_verified=user.is_verified or False,
        is_new_user=user.is_new_user or True,
        profile_completion=user.profile_completion or 0,
        created_at=user.created_at.isoformat()
    )


def register_user(db: Session, data: RegisterRequest) -> AuthResponse:
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )

    first_name, last_name = split_full_name(data.full_name)

    user = User(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        first_name=first_name,
        last_name=last_name,
        full_name=data.full_name.strip(),
        agreed_to_terms=data.agreed_to_terms,
        is_active=True,
        is_verified=False,
        is_new_user=True,
        profile_completion=0
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"New user registered: {user.email}")
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

    tokens = build_token_response(str(user.id))

    return AuthResponse(
        user=build_user_response(user),
        tokens=tokens
    )


def login_user(db: Session, data: LoginRequest) -> AuthResponse:
    user = db.query(User).filter(User.email == data.email.lower()).first()

    # Same error message for wrong email or wrong password (security best practice)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated"
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Could not update last_login_at: {e}")

    tokens = build_token_response(str(user.id))
    logger.info(f"User logged in: {user.email}")

    return AuthResponse(
        user=build_user_response(user),
        tokens=tokens
    )


def refresh_tokens(db: Session, refresh_token: str) -> TokenResponse:
    user_id = verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated"
        )

    return build_token_response(str(user.id))


def get_me(db: Session, user_id: str) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return build_user_response(user)


def forgot_password(db: Session, email: str) -> dict:
    user = db.query(User).filter(User.email == email.lower()).first()

    # Always return success even if email not found (security best practice)
    # This prevents email enumeration attacks
    if not user:
        logger.info(f"Password reset requested for non-existent email: {email}")
        return {"message": "If this email exists, a reset link has been sent"}

    # Invalidate old tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False
    ).update({"used": True, "used_at": datetime.now(timezone.utc)})

    # Create new token
    token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        user_id=str(user.id),
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
    )

    try:
        db.add(reset_token)
        db.commit()
        logger.info(f"Password reset token created for: {user.email}")
        # In production: send email here
        # For now: log the token for testing
        logger.info(f"[DEV] Reset token: {token}")
    except Exception as e:
        db.rollback()
        logger.error(f"Could not create reset token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process request. Try again."
        )

    return {"message": "If this email exists, a reset link has been sent"}


def reset_password(db: Session, token: str, new_password: str) -> dict:
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()

    if not reset_token or not reset_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.hashed_password = hash_password(new_password)
    reset_token.used = True
    reset_token.used_at = datetime.now(timezone.utc)

    try:
        db.commit()
        logger.info(f"Password reset successful for: {user.email}")
    except Exception as e:
        db.rollback()
        logger.error(f"Password reset failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed. Try again."
        )

    return {"message": "Password reset successful"}
