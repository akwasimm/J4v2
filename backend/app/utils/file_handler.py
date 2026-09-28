"""
File handling utilities for uploads.
"""

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_RESUME_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc"
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg", 
    "image/png": "png",
    "image/webp": "webp"
}


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    if "." not in filename:
        return ""
    return filename.rsplit(".", 1)[-1].lower()


def generate_stored_filename(original_filename: str, prefix: str = "") -> str:
    """Generate a unique stored filename."""
    ext = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4()).replace("-", "")[:16]
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    if prefix:
        return f"{prefix}_{timestamp}_{unique_id}.{ext}"
    return f"{timestamp}_{unique_id}.{ext}"


async def _read_limited(file: UploadFile, max_bytes: int) -> bytes:
    """
    Read an upload, refusing anything over max_bytes.

    `await file.read()` pulls the entire body into memory before any size
    check can run, so a single large upload can exhaust the process. This
    reads in chunks and stops as soon as the limit is passed, so peak memory
    stays bounded no matter how large the request is.
    """
    # Fast path: if the client declared a length, reject before reading a byte.
    declared = None
    if getattr(file, "headers", None):
        declared = file.headers.get("content-length")
    if declared and str(declared).isdigit() and int(declared) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
        )

    buf = bytearray()
    while True:
        chunk = await file.read(64 * 1024)
        if not chunk:
            break
        buf.extend(chunk)
        if len(buf) > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
            )
    return bytes(buf)


async def read_and_validate_resume(file: UploadFile) -> Tuple[bytes, str, str]:
    """
    Read resume file, validate type and size.
    Returns: (file_bytes, file_type, original_filename)
    """
    # Validate content type
    content_type = file.content_type or ""
    
    # Also check by extension as fallback
    ext = get_file_extension(file.filename or "")
    
    if content_type in ALLOWED_RESUME_TYPES:
        file_type = ALLOWED_RESUME_TYPES[content_type]
    elif ext in ["pdf", "docx", "doc"]:
        file_type = ext
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only PDF and DOCX allowed. Got: {content_type}"
        )
    
    # Read file bytes, bounded so a huge upload cannot exhaust memory
    file_bytes = await _read_limited(file, settings.max_file_size_bytes)
    
    # Validate file size
    file_size = len(file_bytes)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="File is empty")
    
    # Basic magic bytes validation for PDF
    if file_type == "pdf" and not file_bytes.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="File does not appear to be a valid PDF"
        )
    
    return file_bytes, file_type, file.filename or "resume"


async def read_and_validate_image(file: UploadFile) -> Tuple[bytes, str, str]:
    """
    Read image file, validate type and size.
    Returns: (file_bytes, file_type, original_filename)
    """
    content_type = file.content_type or ""
    ext = get_file_extension(file.filename or "")
    
    if content_type in ALLOWED_IMAGE_TYPES:
        file_type = ALLOWED_IMAGE_TYPES[content_type]
    elif ext in ["jpg", "jpeg", "png", "webp"]:
        file_type = ext if ext != "jpeg" else "jpg"
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid image type. Only JPG, PNG, and WebP allowed."
        )
    
    file_bytes = await _read_limited(file, 5 * 1024 * 1024)
    
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Image file is empty")
    
    return file_bytes, file_type, file.filename or "avatar"


def save_file(file_bytes: bytes, directory: str, filename: str) -> str:
    """
    Save file bytes to disk. Returns full file path.
    """
    os.makedirs(directory, exist_ok=True)
    file_path = os.path.join(directory, filename)
    
    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"File saved: {file_path}")
        return file_path
    except Exception as e:
        logger.error(f"File save failed: {e}")
        raise HTTPException(status_code=500, detail="Could not save file")


def delete_file(file_path: str) -> bool:
    """
    Delete a file from disk. Returns True if deleted, False if not found.
    """
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File deleted: {file_path}")
            return True
        return False
    except Exception as e:
        logger.warning(f"Could not delete file {file_path}: {e}")
        return False


def get_file_url(stored_filename: str, subfolder: str) -> str:
    """
    Generate a URL for accessing an uploaded file.
    """
    return f"/uploads/{subfolder}/{stored_filename}"
