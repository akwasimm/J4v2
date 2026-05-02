"""
Populate test jobs for dashboard demonstration.
Run: python scripts/populate_test_jobs.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.jobs import Job
from app.models.user import User
import uuid
from datetime import datetime, timezone

def populate_test_jobs():
    db = SessionLocal()
    
    # Check if jobs already exist
    existing = db.query(Job).count()
    if existing > 0:
        print(f"Database already has {existing} jobs. Skipping.")
        db.close()
        return
    
    # Get first user to post jobs (or create mock)
    user = db.query(User).first()
    if not user:
        print("No users found. Please register a user first.")
        db.close()
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
            "description": "Join our fast-growing startup as a full-stack engineer. Work on cutting-edge products with modern tech stack.",
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
    ]
    
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
    
    db.commit()
    print(f"✅ Created {len(test_jobs)} test jobs successfully!")
    db.close()

if __name__ == "__main__":
    populate_test_jobs()
