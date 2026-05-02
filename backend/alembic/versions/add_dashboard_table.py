"""Add dashboard table (already exists - skip)

Revision ID: add_dashboard_table
Revises: add_market_data_table
Create Date: 2026-05-01
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_dashboard_table'
down_revision = 'add_market_data_table'
branch_labels = None
depends_on = None


def upgrade():
    # Table already created manually - skip
    pass


def downgrade():
    # Table stays - manual cleanup if needed
    pass
