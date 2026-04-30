"""
Run with: docker exec jobfor_backend python seed_jobs.py
Seeds 15 sample jobs covering different roles, locations, work models.
"""
import sys
sys.path.insert(0, '/app')

from app.core.database import SessionLocal
from app.models.jobs import Job
from datetime import datetime, timezone, timedelta
import uuid

def utcnow():
    return datetime.now(timezone.utc)

SAMPLE_JOBS = [
    {
        "title": "Senior Python Developer",
        "company_name": "TechCorp India",
        "location": "Bangalore, India",
        "salary_min": 1800000,
        "salary_max": 2800000,
        "work_model": "hybrid",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "min_experience_years": 4,
        "core_skills": ["Python", "Django", "PostgreSQL", "AWS", "Docker"],
        "description": "We are looking for a Senior Python Developer to join our growing team. You will build scalable backend services and APIs.",
        "requirements": [
            "4+ years of Python experience",
            "Strong knowledge of Django or FastAPI",
            "Experience with PostgreSQL",
            "Familiarity with AWS services",
            "Docker and containerization experience"
        ],
        "benefits": ["Health insurance", "Remote flexibility", "Stock options", "Learning budget"],
        "posted_at": utcnow() - timedelta(days=2)
    },
    {
        "title": "React Frontend Engineer",
        "company_name": "Startup Labs",
        "location": "Hyderabad, India",
        "salary_min": 1200000,
        "salary_max": 2000000,
        "work_model": "remote",
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "min_experience_years": 2,
        "core_skills": ["React", "TypeScript", "Tailwind CSS", "Node.js"],
        "description": "Join our product team to build beautiful, performant user interfaces for our SaaS platform.",
        "requirements": [
            "2+ years of React experience",
            "Proficiency in TypeScript",
            "Experience with REST APIs",
            "Strong CSS and responsive design skills"
        ],
        "benefits": ["Fully remote", "Flexible hours", "Equity package"],
        "posted_at": utcnow() - timedelta(days=1)
    },
    {
        "title": "Full Stack Developer",
        "company_name": "Infosys",
        "location": "Pune, India",
        "salary_min": 1000000,
        "salary_max": 1600000,
        "work_model": "onsite",
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "min_experience_years": 2,
        "core_skills": ["React", "Node.js", "MongoDB", "JavaScript"],
        "description": "Build and maintain full stack applications for our enterprise clients.",
        "requirements": [
            "2+ years full stack experience",
            "React and Node.js proficiency",
            "Database design experience",
            "Good communication skills"
        ],
        "benefits": ["PF + Gratuity", "Health coverage", "Training programs"],
        "posted_at": utcnow() - timedelta(days=3)
    },
    {
        "title": "DevOps Engineer",
        "company_name": "CloudBase Technologies",
        "location": "Bangalore, India",
        "salary_min": 1600000,
        "salary_max": 2400000,
        "work_model": "hybrid",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "min_experience_years": 3,
        "core_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
        "description": "Lead our infrastructure automation and cloud operations.",
        "requirements": [
            "3+ years DevOps experience",
            "AWS certifications preferred",
            "Kubernetes cluster management",
            "Infrastructure as Code experience"
        ],
        "benefits": ["AWS training budget", "Health insurance", "WFH 3 days"],
        "posted_at": utcnow() - timedelta(days=5)
    },
    {
        "title": "Data Scientist",
        "company_name": "Analytics Pro",
        "location": "Mumbai, India",
        "salary_min": 1400000,
        "salary_max": 2200000,
        "work_model": "hybrid",
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "min_experience_years": 2,
        "core_skills": ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
        "description": "Work on cutting-edge ML models and data pipelines for our financial analytics platform.",
        "requirements": [
            "2+ years data science experience",
            "Strong Python and ML skills",
            "Experience with neural networks",
            "SQL proficiency"
        ],
        "benefits": ["Research budget", "Conference allowance", "Flexible hours"],
        "posted_at": utcnow() - timedelta(days=4)
    },
    {
        "title": "Backend Engineer - Java",
        "company_name": "Wipro Technologies",
        "location": "Chennai, India",
        "salary_min": 1200000,
        "salary_max": 1800000,
        "work_model": "onsite",
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "min_experience_years": 3,
        "core_skills": ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Kafka"],
        "description": "Design and develop high-performance microservices for our banking platform.",
        "requirements": [
            "3+ years Java development",
            "Spring Boot expertise",
            "Microservices architecture",
            "Database design skills"
        ],
        "benefits": ["PF", "Medical insurance", "Annual bonus"],
        "posted_at": utcnow() - timedelta(days=6)
    },
    {
        "title": "iOS Developer",
        "company_name": "Mobify Solutions",
        "location": "Delhi NCR, India",
        "salary_min": 1300000,
        "salary_max": 2000000,
        "work_model": "hybrid",
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "min_experience_years": 2,
        "core_skills": ["Swift", "iOS", "Xcode", "UIKit", "Core Data"],
        "description": "Build high-quality iOS applications for millions of users.",
        "requirements": [
            "2+ years iOS development",
            "Swift proficiency",
            "App Store deployment experience",
            "UI/UX sensibility"
        ],
        "benefits": ["MacBook Pro", "App Store credits", "Remote Fridays"],
        "posted_at": utcnow() - timedelta(days=7)
    },
    {
        "title": "Machine Learning Engineer",
        "company_name": "AI Ventures",
        "location": "Bangalore, India",
        "salary_min": 2000000,
        "salary_max": 3500000,
        "work_model": "remote",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "min_experience_years": 4,
        "core_skills": ["Python", "PyTorch", "Machine Learning", "Kubernetes", "MLOps"],
        "description": "Build and deploy production ML systems at scale.",
        "requirements": [
            "4+ years ML engineering",
            "PyTorch or TensorFlow expertise",
            "MLOps experience",
            "Strong software engineering skills"
        ],
        "benefits": ["Top market salary", "Fully remote", "GPU workstation", "Equity"],
        "posted_at": utcnow() - timedelta(days=1)
    },
    {
        "title": "Product Manager - Tech",
        "company_name": "GrowthStack",
        "location": "Bangalore, India",
        "salary_min": 2000000,
        "salary_max": 3200000,
        "work_model": "hybrid",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "min_experience_years": 4,
        "core_skills": ["Product Strategy", "Agile", "SQL", "User Research", "Roadmapping"],
        "description": "Lead product development for our B2B SaaS platform.",
        "requirements": [
            "4+ years product management",
            "Technical background preferred",
            "Strong analytical skills",
            "Excellent communication"
        ],
        "benefits": ["ESOPs", "Team offsites", "Learning stipend"],
        "posted_at": utcnow() - timedelta(days=2)
    },
    {
        "title": "React Native Developer",
        "company_name": "CrossPlatform Inc",
        "location": "Hyderabad, India",
        "salary_min": 1100000,
        "salary_max": 1800000,
        "work_model": "remote",
        "job_type": "Full-time",
        "experience_level": "Mid-Level",
        "min_experience_years": 2,
        "core_skills": ["React Native", "JavaScript", "TypeScript", "Redux", "REST APIs"],
        "description": "Build cross-platform mobile apps used by 500K+ users.",
        "requirements": [
            "2+ years React Native",
            "Published apps on Play Store/App Store",
            "State management experience",
            "Performance optimization skills"
        ],
        "benefits": ["Remote first", "Home office stipend", "Health insurance"],
        "posted_at": utcnow() - timedelta(days=3)
    },
    {
        "title": "Cloud Architect",
        "company_name": "Enterprise Cloud Co",
        "location": "Mumbai, India",
        "salary_min": 3000000,
        "salary_max": 4500000,
        "work_model": "hybrid",
        "job_type": "Full-time",
        "experience_level": "Lead",
        "min_experience_years": 8,
        "core_skills": ["AWS", "Azure", "GCP", "Terraform", "Architecture"],
        "description": "Design multi-cloud architecture for Fortune 500 clients.",
        "requirements": [
            "8+ years cloud experience",
            "Multi-cloud expertise",
            "Architecture certifications",
            "Enterprise client experience"
        ],
        "benefits": ["Director-level compensation", "Travel allowance", "Premium insurance"],
        "posted_at": utcnow() - timedelta(days=8)
    },
    {
        "title": "Security Engineer",
        "company_name": "SecureNet India",
        "location": "Bangalore, India",
        "salary_min": 1800000,
        "salary_max": 2800000,
        "work_model": "hybrid",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "min_experience_years": 4,
        "core_skills": ["Cybersecurity", "Python", "Penetration Testing", "AWS Security", "SIEM"],
        "description": "Protect our infrastructure and lead security initiatives.",
        "requirements": [
            "4+ years security experience",
            "CISSP or CEH preferred",
            "Penetration testing experience",
            "Cloud security knowledge"
        ],
        "benefits": ["Security conferences budget", "Certifications paid", "Remote options"],
        "posted_at": utcnow() - timedelta(days=10)
    },
    {
        "title": "Junior Python Developer",
        "company_name": "TechStart",
        "location": "Bangalore, India",
        "salary_min": 500000,
        "salary_max": 800000,
        "work_model": "onsite",
        "job_type": "Full-time",
        "experience_level": "Junior",
        "min_experience_years": 0,
        "core_skills": ["Python", "Django", "MySQL", "Git"],
        "description": "Great opportunity for fresh graduates to kickstart their career.",
        "requirements": [
            "Python basics",
            "Understanding of web development",
            "Quick learner",
            "Team player"
        ],
        "benefits": ["Mentorship program", "Training provided", "Career growth"],
        "posted_at": utcnow() - timedelta(days=1)
    },
    {
        "title": "Software Engineer - Internship",
        "company_name": "InternHub",
        "location": "Pune, India",
        "salary_min": 25000,
        "salary_max": 50000,
        "work_model": "hybrid",
        "job_type": "Internship",
        "experience_level": "Intern",
        "min_experience_years": 0,
        "core_skills": ["Python", "JavaScript", "Git", "REST APIs"],
        "description": "6-month internship with pre-placement offer for top performers.",
        "requirements": [
            "Currently pursuing CS/IT degree",
            "Basic programming knowledge",
            "Eager to learn"
        ],
        "benefits": ["PPO opportunity", "Mentorship", "Certificate"],
        "posted_at": utcnow() - timedelta(days=2)
    },
    {
        "title": "Contract - FastAPI Developer",
        "company_name": "Freelance Portal",
        "location": "Remote, India",
        "salary_min": 100000,
        "salary_max": 150000,
        "work_model": "remote",
        "job_type": "Contract",
        "experience_level": "Mid-Level",
        "min_experience_years": 2,
        "core_skills": ["FastAPI", "Python", "PostgreSQL", "Docker", "REST APIs"],
        "description": "3-month contract to build REST API for fintech startup.",
        "requirements": [
            "FastAPI expertise",
            "2+ years Python",
            "Available immediately",
            "Strong API design skills"
        ],
        "benefits": ["Fully remote", "Flexible hours", "Contract extension possible"],
        "posted_at": utcnow() - timedelta(days=1)
    }
]

def seed_jobs():
    db = SessionLocal()
    try:
        existing_count = db.query(Job).count()
        if existing_count > 0:
            print(f"Jobs already seeded ({existing_count} jobs exist). Skipping.")
            return

        for job_data in SAMPLE_JOBS:
            job = Job(
                id=str(uuid.uuid4()),
                **job_data
            )
            db.add(job)

        db.commit()
        print(f"Successfully seeded {len(SAMPLE_JOBS)} jobs!")

    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_jobs()
