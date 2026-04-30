"""
Profile completion calculation utility.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User


def calculate_profile_completion(user) -> int:
    """Calculate profile completion percentage for a user."""
    score = 0
    total = 100

    # Basic info - 40 points
    if user.first_name:
        score += 10
    if user.last_name:
        score += 5
    if user.headline:
        score += 10
    if user.location:
        score += 5
    if user.avatar_url:
        score += 10

    # Social links - 10 points
    social_count = sum([
        bool(user.linkedin),
        bool(user.github),
        bool(user.leetcode),
        bool(user.portfolio)
    ])
    score += min(social_count * 3, 10)

    # Skills - 15 points
    if hasattr(user, 'skills') and user.skills:
        skill_count = len(user.skills)
        if skill_count >= 5:
            score += 15
        elif skill_count >= 3:
            score += 10
        elif skill_count >= 1:
            score += 5

    # Experience - 15 points
    if hasattr(user, 'experience') and user.experience:
        score += 15

    # Education - 10 points
    if hasattr(user, 'education') and user.education:
        score += 10

    # Resume uploaded - 10 points
    if hasattr(user, 'resumes') and user.resumes:
        score += 10

    return min(score, total)
