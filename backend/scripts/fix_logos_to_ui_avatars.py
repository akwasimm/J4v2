#!/usr/bin/env python3
"""
Fix Broken Logos - Switch to UI Avatars
========================================

Replaces all Clearbit URLs with UI Avatars (reliable, always works).
UI Avatars generates colored initials based on company name.

Examples:
- "Wipro" → Blue circle with "WI"
- "Amazon" → Red circle with "AZ"  
- "TCS" → Green circle with "TC"

Usage:
    python scripts/fix_logos_to_ui_avatars.py --dry-run --limit 100
    python scripts/fix_logos_to_ui_avatars.py                    # Fix all 98k jobs
"""

import sys
import os
import argparse
import logging
from datetime import datetime, timezone
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.jobs import Job

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def generate_ui_avatar_url(company_name: str) -> str:
    """
    Generate UI Avatar URL for company.
    
    UI Avatars API: https://ui-avatars.com/
    - Always returns a valid image
    - Generates colored circle with initials
    - Looks professional and consistent
    """
    if not company_name:
        company_name = "JOB"
    
    # Clean the name
    clean = company_name.strip()
    
    # URL encode for safety
    encoded = quote(clean)
    
    # Generate URL with nice styling
    # background=random gives each company a consistent random color
    # size=128 is good quality
    # color=fff makes text white
    # bold=true makes initials stand out
    # length=2 limits to 2 initials max
    return f"https://ui-avatars.com/api/?name={encoded}&background=random&size=128&color=fff&bold=true&length=2&font-size=0.5"


def fix_logos(db: Session, dry_run: bool = False, limit: int = None, batch_size: int = 1000) -> dict:
    """Update all job logos to UI Avatars."""
    stats = {'total': 0, 'updated': 0}
    
    query = db.query(Job)
    if limit:
        query = query.limit(limit)
    
    jobs = query.all()
    stats['total'] = len(jobs)
    
    logger.info(f"Updating {stats['total']} jobs to UI Avatars...")
    logger.info(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    
    updated = []
    for i, job in enumerate(jobs, 1):
        if i % 1000 == 0:
            logger.info(f"Processing {i}/{stats['total']}...")
        
        old_url = job.company_logo_url
        new_url = generate_ui_avatar_url(job.company_name)
        
        # Only update if changed
        if old_url != new_url:
            job.company_logo_url = new_url
            job.updated_at = datetime.now(timezone.utc)
            updated.append(job)
            stats['updated'] += 1
            
            if i <= 5:
                logger.info(f"  {job.company_name}: {old_url[:60]}... -> {new_url}")
        
        # Batch commit
        if len(updated) >= batch_size and not dry_run:
            db.commit()
            logger.info(f"Committed {len(updated)} jobs")
            updated = []
    
    # Final commit
    if updated and not dry_run:
        db.commit()
        logger.info(f"Committed final {len(updated)} jobs")
    
    return stats


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Preview without saving')
    parser.add_argument('--limit', type=int, help='Only process N jobs')
    parser.add_argument('--batch-size', type=int, default=1000)
    args = parser.parse_args()
    
    db = SessionLocal()
    try:
        stats = fix_logos(db, dry_run=args.dry_run, limit=args.limit, batch_size=args.batch_size)
        
        logger.info("=" * 50)
        logger.info(f"Total checked: {stats['total']}")
        logger.info(f"Updated:       {stats['updated']}")
        logger.info("=" * 50)
        
        if args.dry_run:
            logger.info("DRY RUN - no changes saved")
        else:
            logger.info("✅ All logos fixed to UI Avatars!")
            logger.info("Refresh /discover to see colored company initials")
            
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
