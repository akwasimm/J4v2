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
from app.core.database import engine, Base

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
    
    # Validate configuration
    if len(settings.SECRET_KEY) < 32:
        logger.error("WARNING: SECRET_KEY is less than 32 characters!")
        logger.error("Please set a secure SECRET_KEY of at least 32 characters.")
    
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your-groq-api-key-here":
        logger.warning("GROQ_API_KEY not configured - AI features will be unavailable")
    
    # Create uploads directory
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    logger.info(f"Uploads directory ready: {upload_dir}")
    
    logger.info(f"Database URL: {settings.DATABASE_URL.replace(settings.POSTGRES_PASSWORD, '***')}")
    logger.info(f"Allowed Origins: {settings.ALLOWED_ORIGINS}")
    logger.info("Backend is ready to accept connections!")
    logger.info("==========================================")
    
    yield
    
    # Shutdown
    logger.info("==========================================")
    logger.info("JobFor Backend Shutting down...")
    logger.info("==========================================")


# Create FastAPI app
app = FastAPI(
    title="JobFor API",
    description="JobFor - AI-Powered Job Application Tracker",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "jobfor-backend"
    }


# AI service status endpoint
@app.get("/api/v1/ai/status", tags=["AI"])
async def ai_status():
    """Check if AI service is configured."""
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your-groq-api-key-here":
        return JSONResponse(
            status_code=503,
            content={"detail": "AI service not configured"}
        )
    return {"status": "available", "provider": "groq"}


# Import and include routers (when they exist)
# from app.api import auth, users, jobs, applications, resume, ai
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])
# app.include_router(applications.router, prefix="/api/v1/applications", tags=["Applications"])
# app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
# app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])


# Serve static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "JobFor API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health"
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
