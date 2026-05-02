#!/usr/bin/env python3
"""
Job Import Script from CSV
===========================
Imports ~100k jobs from neon_jobs_import.csv into the jobs table.
Handles nested JSON columns and proper null/empty value handling.

Usage:
    cd backend
    python scripts/import_jobs_from_csv.py
    python scripts/import_jobs_from_csv.py --dry-run    # Preview without importing
    python scripts/import_jobs_from_csv.py --limit 100  # Import only first 100 rows
    python scripts/import_jobs_from_csv.py --reset      # Clear existing jobs first

CSV Field Mapping:
    id                      -> id (auto-generate if empty)
    company_meta.name       -> company_name
    company_meta.logo_url   -> company_logo_url
    job_meta.title          -> title
    job_meta.location       -> location
    job_meta.work_model     -> work_model (maps: 'na' -> None)
    requirements.core_skills -> core_skills (JSON array)
    requirements.minimum_experience_years -> min_experience_years
    content.description_html -> description
    is_active               -> is_active
    posted_at               -> posted_at

Null Handling:
    - Empty strings -> None/NULL in database
    - 'na' values in work_model -> None
    - Invalid JSON -> Empty array []
    - Missing numeric fields -> None (or 0 for experience)
    - Invalid dates -> Current timestamp
"""

import sys
import os
import json
import csv
import argparse
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.jobs import Job
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def utcnow():
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)


def safe_parse_json(value: str, default: Any = None) -> Any:
    """Safely parse JSON string, return default on error."""
    if not value or value.strip() in ('', 'na', 'NA', 'null', 'None'):
        return default
    try:
        return json.loads(value)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse error: {e}, value: {value[:100]}...")
        return default


def safe_int(value: Any, default: Optional[int] = None) -> Optional[int]:
    """Safely convert to int, return default on error."""
    if value is None or value == '':
        return default
    try:
        # Handle float strings like "2.0"
        return int(float(str(value)))
    except (ValueError, TypeError):
        return default


def safe_datetime(value: str, default: Optional[datetime] = None) -> Optional[datetime]:
    """Safely parse datetime string."""
    if not value or value.strip() in ('', 'na', 'NA', 'null', 'None'):
        return default
    try:
        # Try common formats
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%SZ',
            '%d-%m-%Y',
            '%d/%m/%Y',
        ]
        for fmt in formats:
            try:
                return datetime.strptime(value.strip(), fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        # If none matched, return default
        logger.warning(f"Could not parse date: {value}")
        return default
    except Exception as e:
        logger.warning(f"Date parse error: {e}, value: {value}")
        return default


def normalize_work_model(value: str) -> Optional[str]:
    """Normalize work_model to valid values."""
    if not value or value.strip().lower() in ('', 'na', 'null', 'none'):
        return None
    value = value.strip().lower()
    valid_models = ['remote', 'hybrid', 'onsite']
    if value in valid_models:
        return value
    # Try to map common variations
    if value in ['wfh', 'work from home', 'work-from-home']:
        return 'remote'
    if value in ['office', 'in-office', 'in office']:
        return 'onsite'
    if value in ['mixed', 'flexible']:
        return 'hybrid'
    logger.warning(f"Unknown work_model: {value}, setting to None")
    return None


def map_csv_row_to_job(row: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """
    Map a CSV row to job dictionary for database insertion.
    Returns None if required fields are missing.
    """
    # Parse nested JSON fields
    company_meta = safe_parse_json(row.get('company_meta', ''), {})
    job_meta = safe_parse_json(row.get('job_meta', ''), {})
    requirements = safe_parse_json(row.get('requirements', ''), {})
    content = safe_parse_json(row.get('content', ''), {})

    # Required fields
    title = job_meta.get('title', '').strip() if job_meta else ''
    company_name = company_meta.get('name', '').strip() if company_meta else ''

    if not title:
        logger.warning(f"Skipping row: missing title. Job meta: {job_meta}")
        return None
    if not company_name:
        logger.warning(f"Skipping row: missing company_name. Company meta: {company_meta}")
        return None

    # Optional fields with null handling
    location = job_meta.get('location', '').strip() if job_meta else None
    if location in ('', 'na', 'NA', 'null', 'None'):
        location = None

    work_model = normalize_work_model(job_meta.get('work_model', '') if job_meta else None)

    company_logo_url = company_meta.get('logo_url', '').strip() if company_meta else None
    if company_logo_url in ('', 'na', 'NA', 'null', 'None', 'na'):
        company_logo_url = None

    # Core skills - ensure it's a list
    core_skills = requirements.get('core_skills', []) if requirements else []
    if not isinstance(core_skills, list):
        core_skills = []

    # Experience years
    min_experience_years = safe_int(
        requirements.get('minimum_experience_years') if requirements else None,
        default=None
    )

    # Description - strip HTML tags for cleaner text
    description = content.get('description_html', '').strip() if content else None
    if description in ('', 'na', 'NA', 'null', 'None'):
        description = None

    # Parse is_active
    is_active_str = row.get('is_active', 'true').strip().lower()
    is_active = is_active_str in ('true', '1', 'yes', 'active')

    # Parse posted_at
    posted_at = safe_datetime(row.get('posted_at', ''), default=utcnow())

    # Generate or use existing ID
    job_id = row.get('id', '').strip()
    if not job_id or job_id in ('', 'na', 'NA', 'null', 'None'):
        job_id = str(uuid.uuid4())

    return {
        'id': job_id,
        'title': title,
        'company_name': company_name,
        'location': location,
        'work_model': work_model,
        'company_logo_url': company_logo_url,
        'core_skills': core_skills if core_skills else [],
        'min_experience_years': min_experience_years,
        'description': description,
        'requirements': [],  # CSV doesn't have separate requirements array
        'benefits': [],  # CSV doesn't have benefits
        'is_active': is_active,
        'posted_at': posted_at,
        'salary_min': None,  # Not in CSV
        'salary_max': None,  # Not in CSV
        'job_type': None,  # Not in CSV
        'experience_level': None,  # Not in CSV
        'created_at': utcnow(),
        'updated_at': utcnow(),
    }


def import_jobs_from_csv(
    csv_path: str,
    db: Session,
    dry_run: bool = False,
    limit: Optional[int] = None,
    batch_size: int = 1000,
    reset: bool = False
) -> Dict[str, int]:
    """
    Import jobs from CSV file.

    Args:
        csv_path: Path to CSV file
        db: Database session
        dry_run: If True, only preview without inserting
        limit: Maximum number of rows to process (None for all)
        batch_size: Number of records to commit per batch
        reset: If True, clear existing jobs before import

    Returns:
        Statistics dict with counts
    """
    stats = {
        'total_rows': 0,
        'parsed_ok': 0,
        'parsed_failed': 0,
        'inserted': 0,
        'skipped': 0,
        'existing_ids': 0,
    }

    # Reset if requested
    if reset and not dry_run:
        logger.warning("Clearing existing jobs table...")
        db.query(Job).delete()
        db.commit()
        logger.info("Existing jobs cleared.")

    # Check if file exists
    if not os.path.exists(csv_path):
        logger.error(f"CSV file not found: {csv_path}")
        return stats

    # Get existing IDs to avoid duplicates
    existing_ids = set()
    if not reset:
        logger.info("Loading existing job IDs...")
        existing_ids = {j[0] for j in db.query(Job.id).all()}
        logger.info(f"Found {len(existing_ids)} existing jobs")

    logger.info(f"Starting import from: {csv_path}")
    logger.info(f"Mode: {'DRY RUN' if dry_run else 'LIVE IMPORT'}")
    if limit:
        logger.info(f"Limit: {limit} rows")
    logger.info(f"Batch size: {batch_size}")
    logger.info("-" * 60)

    jobs_batch = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row_num, row in enumerate(reader, start=1):
            if limit and row_num > limit:
                logger.info(f"Reached limit of {limit} rows, stopping.")
                break

            stats['total_rows'] += 1

            # Log progress every 1000 rows
            if row_num % 1000 == 0:
                logger.info(f"Processing row {row_num}...")

            # Map row to job
            job_data = map_csv_row_to_job(row)

            if job_data is None:
                stats['parsed_failed'] += 1
                continue

            stats['parsed_ok'] += 1

            # Check for duplicates
            if job_data['id'] in existing_ids:
                stats['existing_ids'] += 1
                stats['skipped'] += 1
                continue

            # Create Job object
            job = Job(**job_data)
            jobs_batch.append(job)

            # Batch insert
            if len(jobs_batch) >= batch_size:
                if not dry_run:
                    db.add_all(jobs_batch)
                    db.commit()
                    # Add new IDs to existing set
                    existing_ids.update(j.id for j in jobs_batch)
                stats['inserted'] += len(jobs_batch)
                logger.info(f"Inserted batch of {len(jobs_batch)} jobs (total: {stats['inserted']})")
                jobs_batch = []

    # Insert remaining jobs
    if jobs_batch:
        if not dry_run:
            db.add_all(jobs_batch)
            db.commit()
        stats['inserted'] += len(jobs_batch)
        logger.info(f"Inserted final batch of {len(jobs_batch)} jobs (total: {stats['inserted']})")

    return stats


def main():
    parser = argparse.ArgumentParser(
        description='Import jobs from neon_jobs_import.csv'
    )
    parser.add_argument(
        '--csv',
        type=str,
        default='../neon_jobs_import.csv',
        help='Path to CSV file (default: ../neon_jobs_import.csv)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview without importing (no DB changes)'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Only process first N rows'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=1000,
        help='Number of records per batch (default: 1000)'
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Clear existing jobs before import (DANGEROUS!)'
    )

    args = parser.parse_args()

    # Resolve CSV path
    csv_path = os.path.abspath(args.csv)

    logger.info("=" * 60)
    logger.info("JOB IMPORT SCRIPT")
    logger.info("=" * 60)

    db = SessionLocal()
    try:
        stats = import_jobs_from_csv(
            csv_path=csv_path,
            db=db,
            dry_run=args.dry_run,
            limit=args.limit,
            batch_size=args.batch_size,
            reset=args.reset
        )

        logger.info("=" * 60)
        logger.info("IMPORT STATISTICS")
        logger.info("=" * 60)
        logger.info(f"Total rows read:      {stats['total_rows']}")
        logger.info(f"Successfully parsed:  {stats['parsed_ok']}")
        logger.info(f"Parse failures:       {stats['parsed_failed']}")
        logger.info(f"Inserted:             {stats['inserted']}")
        logger.info(f"Skipped (duplicates): {stats['existing_ids']}")
        logger.info(f"Total skipped:        {stats['skipped']}")
        logger.info("=" * 60)

        if args.dry_run:
            logger.info("DRY RUN completed - no changes made to database")
        else:
            logger.info("Import completed successfully!")

    except Exception as e:
        logger.error(f"Import failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
