"""Add performance indexes for frequently queried fields

Revision ID: add_performance_indexes
Revises: 8ec0103599e9
Create Date: 2025-05-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = '8ec0103599e9'
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes for frequently filtered/queried columns in jobs table
    op.create_index('ix_jobs_location', 'jobs', ['location'])
    op.create_index('ix_jobs_work_model', 'jobs', ['work_model'])
    op.create_index('ix_jobs_job_type', 'jobs', ['job_type'])
    op.create_index('ix_jobs_posted_at', 'jobs', ['posted_at'])
    op.create_index('ix_jobs_is_active', 'jobs', ['is_active'])
    op.create_index('ix_jobs_min_experience_years', 'jobs', ['min_experience_years'])
    
    # Composite index for common query pattern: active jobs sorted by posted date
    op.create_index('ix_jobs_is_active_posted_at', 'jobs', ['is_active', 'posted_at'])
    
    # Composite index for location + work_model filters
    op.create_index('ix_jobs_location_work_model', 'jobs', ['location', 'work_model'])
    
    # Index for dashboard queries - user-related tables
    op.create_index('ix_job_applications_user_id_status', 'job_applications', ['user_id', 'status'])
    op.create_index('ix_saved_jobs_user_id_saved_at', 'saved_jobs', ['user_id', 'saved_at'])
    
    # Index for dashboard data expiration queries
    op.create_index('ix_user_dashboard_data_user_id_expires', 'user_dashboard_data', ['user_id', 'expires_at'])
    op.create_index('ix_big_opportunities_category_expires', 'big_opportunities', ['category', 'expires_at'])


def downgrade():
    op.drop_index('ix_jobs_location', table_name='jobs')
    op.drop_index('ix_jobs_work_model', table_name='jobs')
    op.drop_index('ix_jobs_job_type', table_name='jobs')
    op.drop_index('ix_jobs_posted_at', table_name='jobs')
    op.drop_index('ix_jobs_is_active', table_name='jobs')
    op.drop_index('ix_jobs_min_experience_years', table_name='jobs')
    op.drop_index('ix_jobs_is_active_posted_at', table_name='jobs')
    op.drop_index('ix_jobs_location_work_model', table_name='jobs')
    op.drop_index('ix_job_applications_user_id_status', table_name='job_applications')
    op.drop_index('ix_saved_jobs_user_id_saved_at', table_name='saved_jobs')
    op.drop_index('ix_user_dashboard_data_user_id_expires', table_name='user_dashboard_data')
    op.drop_index('ix_big_opportunities_category_expires', table_name='big_opportunities')
