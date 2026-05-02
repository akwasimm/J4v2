"""
Resume parser service - converts raw resume text to structured data using Groq AI.
"""

import logging
from typing import Optional, List, Dict, Any
from app.services.groq_service import call_groq_json

logger = logging.getLogger(__name__)

RESUME_PARSER_SYSTEM_PROMPT = """
You are an expert resume parser. Your job is to extract structured information 
from resume text with 100% accuracy. Extract everything you can find.
Never skip any information. Always return valid JSON.
"""


def parse_date_safe(date_str: Optional[str]) -> Optional[str]:
    """
    Safely parse date string from AI output.
    Returns ISO format date string or None.
    """
    if not date_str:
        return None
    
    date_str = str(date_str).strip()
    
    # Already in YYYY-MM-DD format
    if len(date_str) == 10 and date_str[4] == "-":
        return date_str
    
    # YYYY-MM format
    if len(date_str) == 7 and date_str[4] == "-":
        return date_str + "-01"
    
    # Just year
    if len(date_str) == 4 and date_str.isdigit():
        return date_str + "-01-01"
    
    return None


def parse_resume_text(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Parse raw resume text into structured data using Groq AI.
    Returns structured dict or None if parsing fails.
    """
    if not raw_text or len(raw_text.strip()) < 50:
        logger.warning("Resume text too short to parse")
        return None
    
    # Truncate if too long (Groq has token limits)
    max_chars = 12000
    if len(raw_text) > max_chars:
        logger.warning(f"Resume text truncated from {len(raw_text)} to {max_chars} chars")
        raw_text = raw_text[:max_chars] + "\n[TEXT TRUNCATED]"
    
    prompt = f"""
Parse this resume text and extract ALL information into this exact JSON format.
Do not skip any section. Extract everything you find.

RESUME TEXT:
{raw_text}

Return this exact JSON structure (fill in what you find, use null for missing):
{{
    "personal_info": {{
        "first_name": "string or null",
        "last_name": "string or null",
        "email": "string or null",
        "phone": "string or null",
        "location": "string or null",
        "linkedin": "string or null (just username, not full URL)",
        "github": "string or null (just username, not full URL)",
        "portfolio": "string or null (full URL)",
        "headline": "string or null (professional title/summary headline)"
    }},
    "summary": "string or null (professional summary if present)",
    "skills": [
        {{
            "name": "skill name",
            "level": "Beginner|Intermediate|Advanced|Expert",
            "category": "string (e.g. Programming Language, Framework, Tool, Soft Skill)"
        }}
    ],
    "experience": [
        {{
            "title": "job title",
            "company": "company name or null",
            "location": "location or null",
            "start_date": "YYYY-MM-DD or YYYY-MM or null",
            "end_date": "YYYY-MM-DD or YYYY-MM or null",
            "current": true or false,
            "description": ["bullet point 1", "bullet point 2"]
        }}
    ],
    "education": [
        {{
            "degree": "degree type (e.g. Bachelor's Degree, Master's Degree, PhD)",
            "field": "field of study or null",
            "school": "institution name or null",
            "info": "additional info like GPA, graduation year or null"
        }}
    ],
    "certifications": [
        {{
            "name": "certification name",
            "issuer": "issuing organization or null",
            "date": "date or null"
        }}
    ],
    "projects": [
        {{
            "name": "project name",
            "description": "description or null",
            "technologies": ["tech1", "tech2"],
            "url": "url or null"
        }}
    ],
    "languages": ["language1", "language2"],
    "total_experience_years": number or null
}}

Rules:
- Skill levels: infer from context (years of experience, job titles, descriptions)
- Dates must be in YYYY-MM-DD format when possible, YYYY-MM if only month/year known
- For current jobs, set current=true and end_date=null
- Extract ALL skills mentioned anywhere in the resume (job descriptions, projects, skills section)
- If a field is not found, use null not empty string
- description for experience should be array of bullet points, not one long string
- Do not hallucinate or add information not present in the resume
"""
    
    result = call_groq_json(
        prompt=prompt,
        system_prompt=RESUME_PARSER_SYSTEM_PROMPT,
        model="groq/compound-mini",  # 70K tokens/min, no daily limit
        temperature=0.1,
        max_tokens=5000
    )
    
    if not result:
        logger.error("Groq returned no result for resume parsing")
        return None
    
    logger.info(
        f"Resume parsed: "
        f"{len(result.get('skills', []))} skills, "
        f"{len(result.get('experience', []))} experience, "
        f"{len(result.get('education', []))} education"
    )
    
    return result


def extract_skills_from_parsed(parsed_data: Dict) -> List[Dict]:
    """
    Extract skills list from parsed resume data in format ready for DB.
    """
    skills = []
    seen_names = set()
    
    for skill in parsed_data.get("skills", []) or []:
        name = skill.get("name", "").strip()
        if not name or name.lower() in seen_names:
            continue
        seen_names.add(name.lower())
        
        level = skill.get("level", "Intermediate")
        if level not in ["Beginner", "Intermediate", "Advanced", "Expert"]:
            level = "Intermediate"
        
        skills.append({
            "name": name,
            "level": level,
            "source": "resume"
        })
    
    return skills


def extract_experience_from_parsed(parsed_data: Dict) -> List[Dict]:
    """
    Extract experience list from parsed resume data in format ready for DB.
    """
    experience = []
    
    for exp in parsed_data.get("experience", []) or []:
        title = exp.get("title", "").strip()
        if not title:
            continue
        
        # Parse dates safely
        start_date = parse_date_safe(exp.get("start_date"))
        end_date = parse_date_safe(exp.get("end_date"))
        current = bool(exp.get("current", False))
        
        if current:
            end_date = None
        
        description = exp.get("description", [])
        if isinstance(description, str):
            description = [description]
        if not isinstance(description, list):
            description = []
        
        experience.append({
            "title": title,
            "company": exp.get("company"),
            "location": exp.get("location"),
            "start_date": start_date,
            "end_date": end_date,
            "current": current,
            "description": description,
            "source": "resume"
        })
    
    return experience


def extract_education_from_parsed(parsed_data: Dict) -> List[Dict]:
    """
    Extract education list from parsed resume data in format ready for DB.
    """
    education = []
    
    for edu in parsed_data.get("education", []) or []:
        degree = edu.get("degree", "").strip()
        if not degree:
            continue
        
        education.append({
            "degree": degree,
            "field": edu.get("field"),
            "school": edu.get("school"),
            "info": edu.get("info"),
            "source": "resume"
        })
    
    return education
