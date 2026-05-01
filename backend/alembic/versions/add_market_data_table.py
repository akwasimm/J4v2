"""Add market_data table for global role+location combinations (idempotent)

Revision ID: add_market_data_table
Revises: add_big_opportunities
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'add_market_data_table'
down_revision = 'add_big_opportunities'
branch_labels = None
depends_on = None


def upgrade():
    """Create market_data table and indexes if they don't exist."""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    # Get existing tables
    existing_tables = inspector.get_table_names()
    
    # Create table if it doesn't exist
    if 'market_data' not in existing_tables:
        op.create_table(
            'market_data',
            sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
            sa.Column('role', sa.String(200), nullable=False),
            sa.Column('location', sa.String(200), nullable=False),
            sa.Column('location_type', sa.String(50), nullable=False, server_default='onsite'),
            sa.Column('local_currency', sa.String(10), nullable=False, server_default='USD'),
            sa.Column('inr_available', sa.Boolean(), nullable=False, server_default='false'),
            
            # Salary metrics (local currency)
            sa.Column('salary_min', sa.Integer(), nullable=True),
            sa.Column('salary_median', sa.Integer(), nullable=True),
            sa.Column('salary_max', sa.Integer(), nullable=True),
            
            # Salary in INR
            sa.Column('salary_min_inr', sa.Integer(), nullable=True),
            sa.Column('salary_median_inr', sa.Integer(), nullable=True),
            sa.Column('salary_max_inr', sa.Integer(), nullable=True),
            
            # Market trends
            sa.Column('growth_percentage', sa.Float(), nullable=True),
            sa.Column('active_listings', sa.Integer(), nullable=True),
            sa.Column('avg_time_to_hire', sa.Integer(), nullable=True),
            
            # JSON data arrays
            sa.Column('skills_in_demand', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('top_hiring_companies', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('experience_distribution', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('geographic_distribution', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('salary_trends', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            
            # Metadata
            sa.Column('market_summary', sa.Text(), nullable=True),
            sa.Column('data_source', sa.String(50), nullable=False, server_default='groq'),
            sa.Column('confidence_score', sa.Float(), nullable=True),
            
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
            
            # Primary key
            sa.PrimaryKeyConstraint('id'),
            
            # Unique constraint on role+location
            sa.UniqueConstraint('role', 'location', name='uix_role_location')
        )
        print("Created market_data table.")
    else:
        print("Table market_data already exists, skipping table creation.")
    
    # Get existing indexes after table creation
    existing_indexes = [idx['name'] for idx in inspector.get_indexes('market_data')]
    
    # Create indexes only if they don't exist
    if 'ix_market_data_role' not in existing_indexes:
        op.create_index('ix_market_data_role', 'market_data', ['role'])
        print("Created index ix_market_data_role.")
    else:
        print("Index ix_market_data_role already exists, skipping.")
    
    if 'ix_market_data_location' not in existing_indexes:
        op.create_index('ix_market_data_location', 'market_data', ['location'])
        print("Created index ix_market_data_location.")
    else:
        print("Index ix_market_data_location already exists, skipping.")
    
    if 'ix_market_data_updated_at' not in existing_indexes:
        op.create_index('ix_market_data_updated_at', 'market_data', ['updated_at'])
        print("Created index ix_market_data_updated_at.")
    else:
        print("Index ix_market_data_updated_at already exists, skipping.")
    
    # Check for partial index (IMMUTABLE-safe - no NOW() function)
    partial_index_exists = False
    for idx in inspector.get_indexes('market_data'):
        if idx['name'] == 'ix_market_data_not_expired':
            partial_index_exists = True
            break
    
    if not partial_index_exists:
        # Create partial index for records with expiration (IMMUTABLE-safe, no NOW())
        # Filter in application queries for expires_at > current_time
        op.execute("""
            CREATE INDEX ix_market_data_not_expired 
            ON market_data (role, location, expires_at)
            WHERE expires_at IS NOT NULL
        """)
        print("Created partial index ix_market_data_not_expired (IMMUTABLE-safe).")
    else:
        print("Partial index ix_market_data_not_expired already exists, skipping.")


def downgrade():
    """Drop market_data table and indexes if they exist."""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    existing_tables = inspector.get_table_names()
    
    if 'market_data' in existing_tables:
        # Get existing indexes
        existing_indexes = [idx['name'] for idx in inspector.get_indexes('market_data')]
        
        # Drop indexes if they exist
        for idx_name in ['ix_market_data_not_expired', 'ix_market_data_updated_at', 
                         'ix_market_data_location', 'ix_market_data_role']:
            if idx_name in existing_indexes:
                op.drop_index(idx_name, table_name='market_data')
                print(f"Dropped index {idx_name}.")
        
        # Drop table
        op.drop_table('market_data')
        print("Dropped market_data table.")
    else:
        print("Table market_data does not exist, skipping downgrade.")
