#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.jobs import Job

db = SessionLocal()
jobs = db.query(Job).filter(Job.company_logo_url.isnot(None)).limit(20).all()
print("Sample logos in database:")
print("-" * 80)
for j in jobs:
    print(f'{j.company_name:<40} -> {j.company_logo_url}')
print("-" * 80)
print(f"\nTotal jobs with logos: {db.query(Job).filter(Job.company_logo_url.isnot(None)).count()}")
db.close()
