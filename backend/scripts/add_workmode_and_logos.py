#!/usr/bin/env python3
"""
Add Work Mode and Company Logos to Jobs
========================================

Quick script to populate missing fields for ~98k jobs WITHOUT AI:
- work_mode: random assignment (40% onsite, 35% hybrid, 25% remote)
- company_logo_url: Clearbit logo API with UI Avatars fallback

Usage:
    cd backend
    python scripts/add_workmode_and_logos.py --dry-run --limit 100
    python scripts/add_workmode_and_logos.py                    # Update all jobs
    python scripts/add_workmode_and_logos.py --reset             # Update all (even existing)

Speed: ~10 seconds for 100k jobs (no API calls, direct DB updates)
"""

import sys
import os
import random
import argparse
import logging
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.jobs import Job

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_company_logo_url(company_name: str) -> str:
    """
    Generate logo URL for a company.
    
    Priority:
    1. Clearbit Logo API (free, works for known companies like Infosys, TCS, etc.)
    2. UI Avatars (always works - generates colored initials)
    
    Args:
        company_name: Company name from job data
        
    Returns:
        URL string for logo image
    """
    if not company_name:
        return "https://ui-avatars.com/api/?name=JOB&background=random&size=128"
    
    # Clean company name
    clean = company_name.lower().strip()
    
    # Remove common suffixes to get domain-friendly name
    suffixes = [
        ' pvt ltd', ' private limited', ' limited', ' ltd', ' inc', 
        ' corp', ' corporation', ' co.', ' company', ' llc', ' llp', 
        ' services', ' solutions', ' technologies', ' tech', ' consulting',
        ' consultancy', ' (india)', ' international', ' india', ' pvt'
    ]
    for suffix in suffixes:
        clean = clean.replace(suffix, '')
    
    clean = clean.strip().replace(' ', '')
    
    # Known company domain mappings (for common abbreviations)
    domain_mappings = {
        'tcs': 'tcs.com',
        'infosys': 'infosys.com',
        'wipro': 'wipro.com',
        'hcl': 'hcltech.com',
        'accenture': 'accenture.com',
        'cognizant': 'cognizant.com',
        'ibm': 'ibm.com',
        'microsoft': 'microsoft.com',
        'google': 'google.com',
        'amazon': 'amazon.com',
        'flipkart': 'flipkart.com',
        'ola': 'ola.com',
        'uber': 'uber.com',
        'swiggy': 'swiggy.com',
        'zomato': 'zomato.com',
        'phonepe': 'phonepe.com',
        'paytm': 'paytm.com',
        'byju': 'byjus.com',
        'freshworks': 'freshworks.com',
        'zoho': 'zoho.com',
    }
    
    # Check if it's a known company
    for key, domain in domain_mappings.items():
        if key in clean:
            return f"https://logo.clearbit.com/{domain}"
    
    # Try Clearbit with company name directly
    # Clearbit works for: techcorp.com, apollo.com, tvs.com, etc.
    if len(clean) > 2:
        # Try common domains
        for tld in ['.com', '.in', '.co']:
            return f"https://logo.clearbit.com/{clean}{tld}"
    
    # Fallback to UI Avatars (colored initials)
    # This always works and looks decent
    encoded = company_name.replace(' ', '%20')
    return f"https://ui-avatars.com/api/?name={encoded}&background=random&size=128&color=fff&bold=true"


def assign_work_model(location: str = None) -> str:
    """
    Assign work model based on location and weighted random.
    
    India market distribution (realistic):
    - Onsite: 40% (manufacturing, healthcare, retail)
    - Hybrid: 35% (IT, corporate offices)
    - Remote: 25% (tech, global companies)
    
    Location-aware adjustments:
    - Metro cities (Bangalore, Mumbai, etc.): more hybrid
    - Tier 2/3 cities: more onsite
    """
    if not location:
        weights = [0.35, 0.35, 0.30]  # onsite, hybrid, remote
    else:
        loc = location.lower()
        
        # Metro cities - more hybrid/remote friendly
        metros = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 
                  'pune', 'gurugram', 'gurgaon', 'noida', 'kolkata', 'remote']
        is_metro = any(city in loc for city in metros)
        
        if is_metro or 'remote' in loc:
            weights = [0.25, 0.45, 0.30]  # less onsite, more hybrid
        else:
            weights = [0.55, 0.30, 0.15]  # more onsite for tier 2/3
    
    return random.choices(['onsite', 'hybrid', 'remote'], weights=weights)[0]


def update_jobs(
    db: Session,
    dry_run: bool = False,
    limit: int = None,
    batch_size: int = 1000,
    reset: bool = False
) -> dict:
    """
    Update jobs with work mode and logos.
    
    Args:
        db: Database session
        dry_run: Preview without saving
        limit: Max jobs to process
        batch_size: Commit batch size
        reset: Update even jobs that already have data
        
    Returns:
        Statistics dict
    """
    stats = {
        'total': 0,
        'work_mode_updated': 0,
        'logo_updated': 0,
        'both_updated': 0,
        'skipped': 0,
    }
    
    # Build query
    query = db.query(Job)
    
    if not reset:
        # Only jobs missing work_mode OR logo
        query = query.filter(
            (Job.work_model.is_(None)) | 
            (Job.work_model == 'na') |
            (Job.company_logo_url.is_(None))
        )
    
    if limit:
        query = query.limit(limit)
    
    jobs = query.all()
    stats['total'] = len(jobs)
    
    logger.info("=" * 60)
    logger.info("ADD WORK MODE AND LOGOS")
    logger.info("=" * 60)
    logger.info(f"Jobs to update: {stats['total']}")
    logger.info(f"Batch size: {batch_size}")
    logger.info(f"Mode: {'DRY RUN' if dry_run else 'LIVE UPDATE'}")
    if reset:
        logger.info("Reset mode: Will update ALL jobs (even existing)")
    logger.info("=" * 60)
    
    if stats['total'] == 0:
        logger.info("No jobs need updating!")
        return stats
    
    updated = []
    
    for i, job in enumerate(jobs, 1):
        # Progress
        if i % 1000 == 0 or i == 1:
            logger.info(f"Processing {i}/{stats['total']}...")
        
        changed = False
        
        # 1. Work mode
        needs_work_mode = reset or not job.work_model or job.work_model == 'na'
        if needs_work_mode:
            job.work_model = assign_work_model(job.location)
            stats['work_mode_updated'] += 1
            changed = True
        
        # 2. Logo URL
        needs_logo = reset or not job.company_logo_url
        if needs_logo:
            job.company_logo_url = get_company_logo_url(job.company_name)
            stats['logo_updated'] += 1
            changed = True
        
        if changed:
            stats['both_updated'] += 1
            job.updated_at = datetime.now(timezone.utc)
            updated.append(job)
        else:
            stats['skipped'] += 1
        
        # Batch commit
        if len(updated) >= batch_size and not dry_run:
            db.commit()
            logger.info(f"Committed batch: {len(updated)} jobs")
            updated = []
    
    # Final commit
    if updated and not dry_run:
        db.commit()
        logger.info(f"Committed final batch: {len(updated)} jobs")
    
    return stats


def main():
    parser = argparse.ArgumentParser(
        description='Add work mode and company logos to jobs (fast, no AI needed)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview without saving'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Only process first N jobs'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=1000,
        help='Commit batch size (default: 1000)'
    )
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Update ALL jobs, even those with existing data'
    )
    
    args = parser.parse_args()
    
    db = SessionLocal()
    try:
        stats = update_jobs(
            db=db,
            dry_run=args.dry_run,
            limit=args.limit,
            batch_size=args.batch_size,
            reset=args.reset
        )
        
        logger.info("=" * 60)
        logger.info("UPDATE STATISTICS")
        logger.info("=" * 60)
        logger.info(f"Total jobs checked:   {stats['total']}")
        logger.info(f"Work modes assigned:  {stats['work_mode_updated']}")
        logger.info(f"Logos assigned:       {stats['logo_updated']}")
        logger.info(f"Jobs with changes:    {stats['both_updated']}")
        logger.info(f"Skipped (no change):  {stats['skipped']}")
        logger.info("=" * 60)
        
        if args.dry_run:
            logger.info("DRY RUN - no changes saved to database")
            logger.info("Run without --dry-run to apply changes")
        else:
            logger.info("Update complete! 🎉")
            
    except KeyboardInterrupt:
        logger.warning("\nInterrupted! Rolling back changes...")
        db.rollback()
    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
