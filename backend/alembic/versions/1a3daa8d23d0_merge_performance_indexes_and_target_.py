"""Merge performance indexes and target role migrations

Revision ID: 1a3daa8d23d0
Revises: add_performance_indexes, add_target_role_to_preferences
Create Date: 2026-05-03 13:35:02.514450

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1a3daa8d23d0'
down_revision = ('add_performance_indexes', 'add_target_role_to_preferences')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
