"""Add dashboard table

Revision ID: add_dashboard_table
Revises: add_market_data_table
Create Date: 2026-05-01

Creates user_dashboard_data. This migration was previously an empty stub that
assumed the table had been created by hand, which made `alembic upgrade head`
fail on any clean database (add_performance_indexes indexes this table).
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = 'add_dashboard_table'
down_revision = 'add_market_data_table'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_dashboard_data',
        sa.Column('id', UUID(as_uuid=False), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=False), nullable=False),
        sa.Column('top_picks', sa.JSON(), nullable=True),
        sa.Column('missing_skills', sa.JSON(), nullable=True),
        sa.Column('skills_in_demand', sa.JSON(), nullable=True),
        sa.Column('market_snapshot', sa.JSON(), nullable=True),
        sa.Column('stats_summary', sa.JSON(), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ai_model_used', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index(
        op.f('ix_user_dashboard_data_user_id'),
        'user_dashboard_data',
        ['user_id'],
        unique=True,
    )


def downgrade():
    op.drop_index(
        op.f('ix_user_dashboard_data_user_id'),
        table_name='user_dashboard_data',
    )
    op.drop_table('user_dashboard_data')
