"""add_target_role_to_preferences

Revision ID: add_target_role_to_preferences
Revises: 4ade65708610
Create Date: 2026-05-02 18:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_target_role_to_preferences'
down_revision = '4ade65708610'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add target_role column to user_preferences table
    op.add_column('user_preferences', 
                  sa.Column('target_role', sa.String(length=100), nullable=True))


def downgrade() -> None:
    # Remove target_role column from user_preferences table
    op.drop_column('user_preferences', 'target_role')
