"""
Database configuration and session management.
"""

from sqlalchemy import create_engine, text, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Engine setup
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,        # Test connection before using
    pool_size=5,               # Small pool for our 50 user scale
    max_overflow=10,
    pool_recycle=300,          # Recycle connections every 5 minutes
    echo=settings.DEBUG        # Log SQL only in debug mode
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Event listeners for connection debugging
@event.listens_for(engine, "connect")
def on_connect(dbapi_conn, connection_record):
    logger.debug("Database connection established")


@event.listens_for(engine, "checkout")
def on_checkout(dbapi_conn, connection_record, connection_proxy):
    logger.debug("Database connection checked out from pool")


@event.listens_for(engine, "checkin")
def on_checkin(dbapi_conn, connection_record):
    logger.debug("Database connection returned to pool")


def get_db():
    """
    Dependency to get database session.
    Use this in FastAPI dependencies.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


def check_db_connection() -> bool:
    """Check if database connection is working."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def init_db() -> None:
    """
    Initialize database by creating all tables.
    Note: In production, use Alembic migrations instead.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise
