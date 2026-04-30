"""
Security utilities for password hashing and JWT token management.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# bcrypt has 72 byte limit, configure to truncate automatically
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=False  # Silently truncate to 72 bytes
)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt (max 72 bytes)."""
    # bcrypt has a 72 byte limit, truncate if necessary
    password_bytes = password.encode('utf-8')[:72]
    return pwd_context.hash(password_bytes)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        # bcrypt has a 72 byte limit, truncate if necessary
        password_bytes = plain_password.encode('utf-8')[:72]
        return pwd_context.verify(password_bytes, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a new access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a new refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"Token decode failed: {e}")
        return None


def verify_access_token(token: str) -> Optional[str]:
    """Verify an access token and return user_id."""
    payload = decode_token(token)
    if not payload:
        return None
    if payload.get("type") != "access":
        return None
    user_id: str = payload.get("sub")
    if not user_id:
        return None
    return user_id


def verify_refresh_token(token: str) -> Optional[str]:
    """Verify a refresh token and return user_id."""
    payload = decode_token(token)
    if not payload:
        return None
    if payload.get("type") != "refresh":
        return None
    user_id: str = payload.get("sub")
    if not user_id:
        return None
    return user_id
