"""add_document_requests_table

Revision ID: f4a5b6c7d8e9
Revises: e16083e6b329
Create Date: 2025-12-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f4a5b6c7d8e9'
down_revision = 'e16083e6b329'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create document_request_type enum
    op.execute("""
        CREATE TYPE documentrequesttype AS ENUM ('transcript', 'certificate', 'letter', 'degree', 'other')
    """)
    
    # Create document_request_status enum
    op.execute("""
        CREATE TYPE documentrequeststatus AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled')
    """)
    
    # Create document_requests table
    op.create_table(
        'document_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('document_type', postgresql.ENUM('transcript', 'certificate', 'letter', 'degree', 'other', name='documentrequesttype'), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', postgresql.ENUM('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled', name='documentrequeststatus'), nullable=False, server_default='pending'),
        sa.Column('requestor_id', sa.Integer(), nullable=False),
        sa.Column('university_id', sa.Integer(), nullable=False),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('processed_by_id', sa.Integer(), nullable=True),
        sa.Column('processed_at', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.String(length=255), nullable=False),
        sa.Column('updated_at', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['requestor_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['university_id'], ['universities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['processed_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_document_requests_document_type'), 'document_requests', ['document_type'], unique=False)
    op.create_index(op.f('ix_document_requests_status'), 'document_requests', ['status'], unique=False)
    op.create_index(op.f('ix_document_requests_requestor_id'), 'document_requests', ['requestor_id'], unique=False)
    op.create_index(op.f('ix_document_requests_university_id'), 'document_requests', ['university_id'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_document_requests_university_id'), table_name='document_requests')
    op.drop_index(op.f('ix_document_requests_requestor_id'), table_name='document_requests')
    op.drop_index(op.f('ix_document_requests_status'), table_name='document_requests')
    op.drop_index(op.f('ix_document_requests_document_type'), table_name='document_requests')
    
    # Drop table
    op.drop_table('document_requests')
    
    # Drop enums
    op.execute('DROP TYPE documentrequeststatus')
    op.execute('DROP TYPE documentrequesttype')

