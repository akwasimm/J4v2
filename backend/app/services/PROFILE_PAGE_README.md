# ProfilePageService - README

## Overview

`ProfilePageService` is a **dedicated AI service** exclusively for the **Profile Page** of JobFor. It handles AI-powered profile generation and updates from resume text.

**IMPORTANT**: This service is self-contained and must NOT be imported or used by other pages (Dashboard, Jobs, Applications, Coach, etc.). Each page has its own dedicated Groq service to avoid conflicts and prompt-leakage.

## File Location

- **Service**: `backend/app/services/profile_page_service.py`
- **Schema**: `backend/app/schemas/profile_page.py`
- **Router**: `backend/app/routers/profile.py` (Profile Page AI endpoints section)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Profile Page UI                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Profile Router (profile.py)                   │
│  POST /api/v1/profile/parse-resume                             │
│  POST /api/v1/profile/update-from-resume                         │
│  POST /api/v1/profile/ai-preview                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ProfilePageService                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ parseResumeToJson│ │ generateUpdatedProfile│ │ replaceUserProfile│ │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐                                            │
│  │ validateProfileSchema│                                         │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Groq AI (via groq_service.py)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Methods

### 1. `parse_resume_to_json(resume_text: str) -> dict`

Converts raw resume text into structured JSON using AI.

**Input**: Raw text extracted from PDF resume  
**Output**: Structured JSON with parsed resume data

**Edge Cases Handled**:
- Empty resume text returns empty structure
- Very large text is truncated (max 15,000 chars)
- Non-English resumes are parsed as-is

### 2. `generate_updated_profile(existing_profile: dict, parsed_resume: dict) -> dict`

Sends both existing profile and parsed resume to Groq AI. AI returns a **complete new profile JSON** (not partial, not patches).

**Input**:
- `existing_profile`: Current full user profile from DB
- `parsed_resume`: Structured JSON from `parse_resume_to_json()`

**Output**: Complete updated profile JSON matching strict schema

**Merge Strategy**:
- Prefer resume data for experience, education, projects (more recent)
- Keep existing profile data for personal info if resume doesn't have it
- Combine and deduplicate skills
- Prefer the most complete information when both sources have data

**Edge Cases Handled**:
- Empty existing profile builds entirely from resume
- Empty resume returns existing profile unchanged
- AI invalid JSON triggers retry once
- AI commentary/markdown is stripped
- Missing fields filled with defaults
- Duplicate skills/experiences are deduped
- Conflicting data prefers most recent/complete info
- Date format normalization
- Extra AI hallucinated fields are stripped

### 3. `validate_profile_schema(profile_json: dict) -> dict | None`

Validates AI output against strict schema and normalizes data.

**Validations**:
- All required fields present (empty strings/arrays if missing)
- Deduplicate skills (case-insensitive)
- Deduplicate experience entries
- Deduplicate education entries
- Normalize dates to YYYY-MM format
- Strip extra fields not in schema
- Reject partial/invalid output

### 4. `replace_user_profile(db: Session, user_id: str, new_profile_json: dict) -> dict`

**Atomic replace operation**: Replaces the old profile in DB entirely with the new JSON.

**Strategy**:
- Deletes all existing skills/experience/education
- Inserts new data from AI profile
- Updates user basic info (name, headline, location, links)
- Recalculates profile completion score
- Full rollback on any failure

**Edge Cases**:
- Atomic operation (all-or-nothing)
- Network/DB failures return error without overwriting

## Strict JSON Schema

The AI response MUST match this schema exactly:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM | Present",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["string"],
      "link": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM"
    }
  ],
  "links": {
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  }
}
```

**Rules**:
- If a field is missing → return `""` for strings or `[]` for arrays
- NEVER return `null`, `undefined`, or omit keys
- Dates normalized to `YYYY-MM` format
- Deduplication applied to all list fields

## Groq System Prompt

```
You are a strict JSON profile generator for a Profile Page only.
You will receive:
- existingProfile (JSON)
- parsedResume (JSON)

Your job:
- Merge them intelligently
- Remove duplicates
- Prefer most recent and complete information
- Return ONE complete updated profile JSON

RULES:
- Output ONLY valid JSON. No explanations. No markdown. No comments.
- Follow the provided schema EXACTLY.
- Never invent fake data.
- Never leave keys missing.
- Use "" for missing strings and [] for missing arrays.
- Normalize dates to YYYY-MM.
- Do not include any field not defined in the schema.
```

## API Endpoints

### POST `/api/v1/profile/parse-resume`

Parse resume text into structured JSON (preview only, no DB changes).

**Request**:
```json
{
  "resume_text": "Raw text from PDF resume..."
}
```

**Response**:
```json
{
  "success": true,
  "parsed_data": { /* AIProfileSchema */ },
  "raw_text_length": 12345,
  "parsed_at": "2024-01-15T10:30:00"
}
```

### POST `/api/v1/profile/update-from-resume`

Complete workflow: Parse resume and update profile via AI.

**Request**:
```json
{
  "resume_text": "Raw text from PDF resume..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully from resume",
  "skills_added": 12,
  "experience_added": 3,
  "education_added": 2,
  "updated_at": "2024-01-15T10:30:00",
  "profile": { /* Full profile data */ }
}
```

### POST `/api/v1/profile/ai-preview`

Preview what the profile would look like after AI update (no DB changes).

**Request**:
```json
{
  "resume_text": "Raw text from PDF resume..."
}
```

**Response**:
```json
{
  "success": true,
  "preview": { /* AIProfileSchema */ },
  "changes": {
    "skills_count": 15,
    "experience_count": 4,
    "education_count": 2
  }
}
```

## Edge Cases Handled

1. **Empty resume text** → returns existing profile unchanged
2. **Empty existing profile** → builds profile entirely from resume
3. **AI returns invalid JSON** → retry once, then throw controlled error
4. **AI returns extra commentary/markdown** → strip and parse only JSON block
5. **Missing required fields** → fill with empty defaults, never crash
6. **Duplicate skills/experiences** → AI dedupes; backend double-checks
7. **Conflicting data between resume and existing profile** → Prefer most recent/complete
8. **Dates in wrong format** → normalize to `YYYY-MM`
9. **AI hallucinated fields not in schema** → strip them out
10. **Network/Groq API failure** → return error response, do NOT overwrite DB
11. **Partial AI output** → reject and do NOT save
12. **Very large resume text** → truncate safely (15K char limit) with warning log
13. **Non-English resume** → still parse, do not translate unless asked
14. **Replace operation must be atomic** → if save fails, full rollback

## Usage Example (Frontend)

```javascript
import { apiClient } from '@/api/client';

// 1. Preview changes before applying
const preview = await apiClient.post('/profile/ai-preview', {
  resume_text: extractedResumeText
});

if (preview.success) {
  console.log('Preview:', preview.preview);
  console.log('Changes:', preview.changes);
}

// 2. Apply changes to profile
const result = await apiClient.post('/profile/update-from-resume', {
  resume_text: extractedResumeText
});

if (result.success) {
  console.log('Profile updated!');
  console.log(`Added ${result.skills_added} skills`);
  console.log(`Added ${result.experience_added} experiences`);
}
```

## Important Notes

- **Do NOT reuse** this service for other pages
- **Do NOT modify** the existing `profile_service.py` - this is a separate service
- **Do NOT create** generic AIService abstractions
- All Groq calls go through the centralized `groq_service.py` (uses existing SDK setup)
- Service is self-contained with no external dependencies except Groq service and models
- Logging is minimal and never includes sensitive data (PII)

## Dependencies

- `app.services.groq_service` - Central Groq AI client
- `app.models.user` - User model
- `app.models.profile` - UserSkill, UserExperience, UserEducation models
- `app.utils.profile_completion` - Profile completion calculator

## Error Codes

| Code | Description |
|------|-------------|
| `EMPTY_RESUME` | Resume text is empty or whitespace only |
| `VALIDATION_FAILED` | AI output failed schema validation |
| `UPDATE_FAILED` | Database error during profile update |
| `AI_UNAVAILABLE` | Groq API error or network failure |

## Future Enhancements

- Add support for custom merge strategies (user preference)
- Add confidence scores to AI-generated fields
- Add field-level approval (user reviews each change)
- Support for multiple resume versions comparison
