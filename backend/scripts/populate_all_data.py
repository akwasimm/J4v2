#!/usr/bin/env python3
"""
Master Data Population Script
=============================
Populates all required data for JobFor application.

Usage:
    cd backend
    python scripts/populate_all_data.py              # Populate all data
    python scripts/populate_all_data.py --jobs-only  # Only populate test jobs
    python scripts/populate_all_data.py --market-only # Only populate market data
    python scripts/populate_all_data.py --force      # Force refresh all data

Order of operations:
    1. Check prerequisites (DB connection, API keys)
    2. Populate test jobs (if none exist)
    3. Populate market data (120 role+location combinations)
"""

import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.config import settings
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_prerequisites():
    """Check all prerequisites before populating data."""
    logger.info("=" * 60)
    logger.info("CHECKING PREREQUISITES")
    logger.info("=" * 60)
    
    checks_passed = True
    
    # Check 1: Database connection
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"✅ Database connection OK ({len(tables)} tables found)")
    except Exception as e:
        logger.error(f"❌ Database connection FAILED: {e}")
        logger.error("   Run: alembic upgrade head")
        checks_passed = False
    
    # Check 2: GROQ API Key
    if settings.GROQ_API_KEY:
        logger.info(f"✅ GROQ_API_KEY configured ({settings.GROQ_API_KEY[:10]}...)")
    else:
        logger.error("❌ GROQ_API_KEY not found in environment!")
        logger.error("   Add GROQ_API_KEY to .env file")
        checks_passed = False
    
    # Check 3: Optional API keys
    if settings.NVIDIA_NIM_API_KEY:
        logger.info(f"✅ NVIDIA_NIM_API_KEY configured (fallback ready)")
    else:
        logger.info("ℹ️  NVIDIA_NIM_API_KEY not set (optional fallback)")
    
    # Check 4: market_data table
    if 'market_data' in tables:
        logger.info("✅ market_data table exists")
    else:
        logger.warning("⚠️  market_data table NOT found - will be created by migration")
    
    # Check 5: jobs table
    if 'jobs' in tables:
        logger.info("✅ jobs table exists")
    else:
        logger.warning("⚠️  jobs table NOT found - will be created by migration")
    
    logger.info("=" * 60)
    return checks_passed


def populate_jobs(db: Session, force: bool = False):
    """Populate test jobs if none exist."""
    from app.models.jobs import Job
    from app.models.user import User
    import uuid
    from datetime import datetime, timezone
    
    logger.info("\n📋 POPULATING TEST JOBS")
    logger.info("-" * 60)
    
    existing = db.query(Job).count()
    if existing > 0 and not force:
        logger.info(f"✅ Database already has {existing} jobs. Skipping.")
        return
    
    if force and existing > 0:
        logger.info(f"Force mode: Will add more jobs (current: {existing})")
    
    # Get first user to post jobs
    user = db.query(User).first()
    if not user:
        logger.warning("⚠️  No users found. Please register a user first.")
        logger.warning("   Jobs will be created when you have a user.")
        return
    
    test_jobs = [
        {
            "title": "Senior Frontend Developer",
            "company_name": "TechCorp India",
            "location": "Bangalore, India",
            "work_model": "hybrid",
            "job_type": "full_time",
            "description": "We are looking for an experienced React developer with 5+ years of experience. Strong TypeScript skills required.",
            "requirements": "- 5+ years React experience\n- Strong TypeScript\n- Experience with Next.js\n- Knowledge of state management (Redux/Zustand)",
            "core_skills": ["React", "TypeScript", "Next.js", "Redux", "Tailwind CSS"],
            "min_experience_years": 5,
            "salary_min": 1800000,
            "salary_max": 2800000,
            "currency": "INR",
        },
        {
            "title": "Full Stack Engineer",
            "company_name": "StartupXYZ",
            "location": "Remote",
            "work_model": "remote",
            "job_type": "full_time",
            "description": "Join our fast-growing startup as a full-stack engineer. Work on cutting-edge products.",
            "requirements": "- 3+ years Node.js/Python\n- React/Vue experience\n- Database design (PostgreSQL/MongoDB)\n- AWS/GCP knowledge",
            "core_skills": ["Node.js", "React", "PostgreSQL", "AWS", "Docker"],
            "min_experience_years": 3,
            "salary_min": 1500000,
            "salary_max": 2200000,
            "currency": "INR",
        },
        {
            "title": "UI/UX Designer",
            "company_name": "Design Studio Pro",
            "location": "Mumbai, India",
            "work_model": "onsite",
            "job_type": "full_time",
            "description": "Creative designer needed for product design team. Must have portfolio demonstrating strong visual design skills.",
            "requirements": "- 4+ years UI/UX experience\n- Figma mastery\n- Design system experience\n- User research skills\n- HTML/CSS knowledge",
            "core_skills": ["Figma", "UI Design", "UX Research", "Design Systems", "Prototyping"],
            "min_experience_years": 4,
            "salary_min": 1200000,
            "salary_max": 2000000,
            "currency": "INR",
        },
        {
            "title": "DevOps Engineer",
            "company_name": "CloudFirst Solutions",
            "location": "Hyderabad, India",
            "work_model": "hybrid",
            "job_type": "full_time",
            "description": "Join our infrastructure team to build and maintain cloud infrastructure at scale.",
            "requirements": "- 4+ years DevOps experience\n- Kubernetes expertise\n- Terraform/IaC\n- CI/CD pipeline design\n- Monitoring and observability",
            "core_skills": ["Kubernetes", "Docker", "Terraform", "AWS", "Jenkins", "Prometheus"],
            "min_experience_years": 4,
            "salary_min": 2000000,
            "salary_max": 3500000,
            "currency": "INR",
        },
        {
            "title": "Product Manager",
            "company_name": "ProductHub",
            "location": "Pune, India",
            "work_model": "hybrid",
            "job_type": "full_time",
            "description": "Lead product development for our B2B SaaS platform. Work closely with engineering and design teams.",
            "requirements": "- 5+ years product management\n- SaaS experience\n- Data-driven decision making\n- Agile/Scrum\n- Stakeholder management",
            "core_skills": ["Product Management", "Agile", "Data Analysis", "Strategy", "Communication"],
            "min_experience_years": 5,
            "salary_min": 2500000,
            "salary_max": 4000000,
            "currency": "INR",
        },
        {
            "title": "Mobile App Developer",
            "company_name": "AppWorks",
            "location": "Chennai, India",
            "work_model": "remote",
            "job_type": "full_time",
            "description": "Build beautiful mobile experiences for iOS and Android using React Native.",
            "requirements": "- 3+ years React Native\n- iOS/Android deployment\n- Performance optimization\n- Firebase integration\n- Push notifications",
            "core_skills": ["React Native", "JavaScript", "iOS", "Android", "Firebase"],
            "min_experience_years": 3,
            "salary_min": 1400000,
            "salary_max": 2200000,
            "currency": "INR",
        },
        {
            "title": "Data Scientist",
            "company_name": "DataDriven Inc",
            "location": "Bangalore, India",
            "work_model": "hybrid",
            "job_type": "full_time",
            "description": "Work on ML models and data pipelines for our analytics platform.",
            "requirements": "- 3+ years data science experience\n- Python, SQL\n- Machine learning frameworks\n- Data visualization\n- Statistical analysis",
            "core_skills": ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas", "Data Visualization"],
            "min_experience_years": 3,
            "salary_min": 1800000,
            "salary_max": 3000000,
            "currency": "INR",
        },
        {
            "title": "Backend Engineer (Java)",
            "company_name": "Enterprise Solutions",
            "location": "Delhi, India",
            "work_model": "onsite",
            "job_type": "full_time",
            "description": "Build scalable microservices for our enterprise clients using Java Spring Boot.",
            "requirements": "- 4+ years Java development\n- Spring Boot expertise\n- Microservices architecture\n- Database design\n- REST API development",
            "core_skills": ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Redis", "Kafka"],
            "min_experience_years": 4,
            "salary_min": 2000000,
            "salary_max": 3500000,
            "currency": "INR",
        },
    ]
    
    created_count = 0
    for job_data in test_jobs:
        job = Job(
            id=str(uuid.uuid4()),
            posted_by=user.id,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            **job_data
        )
        db.add(job)
        created_count += 1
    
    db.commit()
    logger.info(f"✅ Created {created_count} test jobs successfully!")


def populate_market_data(force: bool = False):
    """Populate market data using the dedicated script."""
    logger.info("\n📊 POPULATING MARKET DATA")
    logger.info("-" * 60)
    
    # Import and run the market data population
    try:
        from scripts.populate_market_data import main as market_main
        
        # Set up args for the script
        import argparse
        sys.argv = ['populate_market_data.py']
        if force:
            sys.argv.append('--force')
        
        market_main()
    except Exception as e:
        logger.error(f"❌ Market data population failed: {e}")
        raise


def show_status(db: Session):
    """Show current data status."""
    from app.models.jobs import Job
    from app.models.ai_pages import MarketData
    from app.models.user import User
    
    logger.info("\n📈 CURRENT DATA STATUS")
    logger.info("-" * 60)
    
    try:
        job_count = db.query(Job).count()
        logger.info(f"Jobs:          {job_count} entries")
    except:
        logger.info("Jobs:          Table not accessible")
    
    try:
        market_count = db.query(MarketData).count()
        logger.info(f"Market Data:   {market_count} entries (120 expected)")
    except:
        logger.info("Market Data:   Table not accessible")
    
    try:
        user_count = db.query(User).count()
        logger.info(f"Users:         {user_count} entries")
    except:
        logger.info("Users:         Table not accessible")
    
    logger.info("-" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Populate all required data for JobFor application"
    )
    parser.add_argument(
        '--jobs-only',
        action='store_true',
        help='Only populate test jobs'
    )
    parser.add_argument(
        '--market-only',
        action='store_true',
        help='Only populate market data'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force refresh all data'
    )
    parser.add_argument(
        '--status-only',
        action='store_true',
        help='Only show current status'
    )
    
    args = parser.parse_args()
    
    # Show status only mode
    if args.status_only:
        db = SessionLocal()
        try:
            show_status(db)
        finally:
            db.close()
        return
    
    # Check prerequisites
    if not check_prerequisites():
        logger.error("\n❌ Prerequisites check FAILED. Please fix the issues above.")
        sys.exit(1)
    
    db = SessionLocal()
    try:
        # Populate jobs
        if not args.market_only:
            populate_jobs(db, force=args.force)
        
        # Populate market data
        if not args.jobs_only:
            db.close()  # Close before running market script (it has its own sessions)
            populate_market_data(force=args.force)
            db = SessionLocal()  # Reopen for status
        
        # Show final status
        show_status(db)
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ DATA POPULATION COMPLETE")
        logger.info("=" * 60)
        logger.info("\nNext steps:")
        logger.info("1. Start the backend: uvicorn main:app --reload")
        logger.info("2. Start the frontend: npm run dev (in frontend directory)")
        logger.info("3. Register a user and test the dashboard")
        
    except Exception as e:
        logger.error(f"\n❌ Error during data population: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
