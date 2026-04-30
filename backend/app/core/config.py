"""
Application configuration using Pydantic Settings.
"""

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    POSTGRES_USER: str = "jobfor_user"
    POSTGRES_PASSWORD: str = "jobfor_pass"
    POSTGRES_DB: str = "jobfor_db"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql://jobfor_user:jobfor_pass@postgres:5432/jobfor_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-minimum-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI Service
    GROQ_API_KEY: str = ""
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Computed fields
    @property
    def ALLOWED_ORIGINS_LIST(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        """Convert MB to bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Validate SECRET_KEY meets minimum length."""
        if len(v) < 32:
            import logging
            logging.warning("SECRET_KEY is less than 32 characters. Please use a more secure key in production.")
        return v
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Create global settings instance
settings = Settings()
