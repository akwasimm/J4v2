# Models package - import in order to resolve dependencies
from app.models.auth import PasswordResetToken
from app.models.profile import UserSkill, UserExperience, UserEducation
from app.models.preferences import UserPreference
from app.models.resume import UserResume
from app.models.jobs import Job, JobApplication, SavedJob, SavedJobCollection
from app.models.ai_pages import JobMatchHistory, SkillGapAnalysis, ResumeAnalysis, AIRecommendation, MarketInsightsCache, BigOpportunities, MarketData
from app.models.coach import CoachSession, CoachMessage
from app.models.settings import UserSettings, ConnectedAccount
from app.models.dashboard import UserDashboardData, UserAICallTracking
from app.models.user import User
