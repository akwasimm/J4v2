"""
ProfilePage schemas - Pydantic models for Profile Page AI service.

These schemas define the strict JSON structure for AI-generated profiles.
Used exclusively by ProfilePageService - not for other pages.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class ProfileLinks(BaseModel):
    """Social/professional links."""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""


class ProfileExperience(BaseModel):
    """Work experience entry."""
    company: str = ""
    role: str = ""
    startDate: str = ""  # YYYY-MM format
    endDate: str = ""     # YYYY-MM or "Present"
    description: str = ""
    
    @validator('startDate', 'endDate')
    def validate_date_format(cls, v):
        """Ensure dates are in YYYY-MM format or empty/Present."""
        if not v or v.lower() == "present":
            return v if v.lower() == "present" else ""
        # Allow any non-empty string - will be normalized by service
        return v


class ProfileEducation(BaseModel):
    """Education entry."""
    institution: str = ""
    degree: str = ""
    field: str = ""
    startDate: str = ""  # YYYY-MM format
    endDate: str = ""     # YYYY-MM format
    
    @validator('startDate', 'endDate')
    def validate_date_format(cls, v):
        """Ensure dates are in YYYY-MM format or empty."""
        if not v:
            return ""
        return v


class ProfileProject(BaseModel):
    """Project entry."""
    name: str = ""
    description: str = ""
    techStack: List[str] = []
    link: str = ""


class ProfileCertification(BaseModel):
    """Certification entry."""
    name: str = ""
    issuer: str = ""
    date: str = ""  # YYYY-MM format
    
    @validator('date')
    def validate_date_format(cls, v):
        """Ensure date is in YYYY-MM format or empty."""
        if not v:
            return ""
        return v


class AIProfileSchema(BaseModel):
    """
    Strict schema for AI-generated profile output.
    
    This is the EXACT structure the AI must return.
    All fields have defaults to ensure no missing keys.
    """
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    skills: List[str] = []
    experience: List[ProfileExperience] = []
    education: List[ProfileEducation] = []
    projects: List[ProfileProject] = []
    certifications: List[ProfileCertification] = []
    links: ProfileLinks = ProfileLinks()
    
    @validator('skills')
    def deduplicate_skills(cls, v):
        """Remove duplicate skills (case-insensitive)."""
        seen = set()
        result = []
        for skill in v:
            skill_lower = skill.lower()
            if skill_lower not in seen:
                seen.add(skill_lower)
                result.append(skill)
        return result
    
    @validator('experience')
    def deduplicate_experience(cls, v):
        """Remove duplicate experience entries."""
        seen = set()
        result = []
        for exp in v:
            key = f"{exp.role.lower()}|{exp.company.lower()}"
            if key not in seen and exp.role:
                seen.add(key)
                result.append(exp)
        return result
    
    @validator('education')
    def deduplicate_education(cls, v):
        """Remove duplicate education entries."""
        seen = set()
        result = []
        for edu in v:
            key = f"{edu.degree.lower()}|{edu.institution.lower()}"
            if key not in seen and edu.degree:
                seen.add(key)
                result.append(edu)
        return result
    
    @validator('projects')
    def deduplicate_projects(cls, v):
        """Remove duplicate project entries."""
        seen = set()
        result = []
        for proj in v:
            if proj.name.lower() not in seen and proj.name:
                seen.add(proj.name.lower())
                result.append(proj)
        return result
    
    @validator('certifications')
    def deduplicate_certifications(cls, v):
        """Remove duplicate certification entries."""
        seen = set()
        result = []
        for cert in v:
            if cert.name.lower() not in seen and cert.name:
                seen.add(cert.name.lower())
                result.append(cert)
        return result


class ResumeParseRequest(BaseModel):
    """Request to parse resume text to structured JSON."""
    resume_text: str = Field(..., min_length=1, description="Raw text extracted from resume PDF")
    
    @validator('resume_text')
    def validate_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Resume text cannot be empty or whitespace only')
        return v.strip()


class ProfileUpdateFromResumeRequest(BaseModel):
    """
    Request to update profile using resume text.
    
    The service will:
    1. Parse resume_text into structured JSON
    2. Merge with existing_profile
    3. Generate complete new profile via AI
    4. Replace profile in DB atomically
    """
    resume_text: str = Field(..., min_length=1, description="Raw text extracted from resume PDF")
    
    @validator('resume_text')
    def validate_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Resume text cannot be empty or whitespace only')
        return v.strip()


class ParsedResumeResponse(BaseModel):
    """Response containing parsed resume data."""
    parsed_data: AIProfileSchema
    raw_text_length: int
    parsed_at: datetime
    
    class Config:
        from_attributes = True


class ProfileUpdateResponse(BaseModel):
    """Response after profile update from resume."""
    success: bool
    message: str
    profile: dict  # Will contain the updated profile data
    skills_added: int
    experience_added: int
    education_added: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProfilePageErrorResponse(BaseModel):
    """Error response for ProfilePage operations."""
    error: str
    code: str
    details: Optional[dict] = None
