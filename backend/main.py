"""
JobFor Backend - FastAPI Application
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import check_db_connection
from app.core.ai_client import ai_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("==========================================")
    logger.info("JobFor Backend Starting...")
    logger.info("==========================================")
    
    # Check AI providers
    if not ai_client.is_configured:
        logger.warning("No AI provider configured - AI features unavailable")
    else:
        logger.info(f"AI configured: primary={ai_client.primary_provider}")
        # Test providers
        results = ai_client.test_providers()
        for provider, status in results.items():
            if status:
                logger.info(f"  {provider}: OK")
            else:
                logger.warning(f"  {provider}: FAILED")

    # Check DB
    if check_db_connection():
        logger.info("Database connection verified")
    else:
        logger.error("Database connection FAILED - check DATABASE_URL")

    # Ensure uploads dir exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/avatars", exist_ok=True)
    os.makedirs(f"{settings.UPLOAD_DIR}/resumes", exist_ok=True)
    logger.info(f"Upload directories ready")

    logger.info(f"CORS Origins: {settings.allowed_origins_list}")
    logger.info("Backend ready!")
    logger.info("==========================================")
    
    yield
    
    # Shutdown
    logger.info("==========================================")
    logger.info("JobFor Backend Shutting down...")
    logger.info("==========================================")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check (no auth required)
@app.get("/health")
async def health_check():
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "version": settings.APP_VERSION,
        "database": "connected" if db_ok else "disconnected",
        "ai": "configured" if ai_client.is_configured else "not configured",
        "services": {
            "database": db_ok,
            "groq": bool(settings.GROQ_API_KEY),
            "nvidia_nim": bool(settings.NVIDIA_NIM_API_KEY),
        }
    }


# AI service status endpoint
@app.get("/api/v1/ai/status", tags=["AI"])
async def ai_status():
    """Check if AI service is configured and test providers."""
    if not ai_client.is_configured:
        return JSONResponse(
            status_code=503,
            content={"detail": "AI service not configured"}
        )
    
    results = ai_client.test_providers()
    return {
        "status": "available",
        "primary_provider": ai_client.primary_provider,
        "providers": results
    }


# Import and include routers
from app.routers import auth as auth_router
from app.routers import profile as profile_router
from app.routers import skills as skills_router
from app.routers import experience as experience_router
from app.routers import education as education_router
from app.routers import resume as resume_router
from app.routers import jobs as jobs_router
from app.routers import ai_pages as ai_router
from app.routers import coach as coach_router
from app.routers import settings as settings_router

app.include_router(
    auth_router.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)
app.include_router(
    profile_router.router,
    prefix="/api/v1/profile",
    tags=["Profile"]
)
app.include_router(
    skills_router.router,
    prefix="/api/v1/profile/skills",
    tags=["Skills"]
)
app.include_router(
    experience_router.router,
    prefix="/api/v1/profile/experience",
    tags=["Experience"]
)
app.include_router(
    education_router.router,
    prefix="/api/v1/profile/education",
    tags=["Education"]
)
app.include_router(
    resume_router.router,
    prefix="/api/v1/profile",
    tags=["Resume & Avatar"]
)
app.include_router(
    jobs_router.router,
    prefix="/api/v1/jobs",
    tags=["Jobs"]
)
app.include_router(
    ai_router.router,
    prefix="/api/v1/ai",
    tags=["AI Features"]
)
app.include_router(
    coach_router.router,
    prefix="/api/v1/coach",
    tags=["Career Coach"]
)
app.include_router(
    settings_router.router,
    prefix="/api/v1/settings",
    tags=["Settings"]
)

# Future routers:
# from app.routers import jobs, applications, ai
# app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])
# app.include_router(applications.router, prefix="/api/v1/applications", tags=["Applications"])
# app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])


# Serve static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Root
@app.get("/")
async def root():
    return {
        "message": "JobFor API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
