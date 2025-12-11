"""Add university_id to documents

Revision ID: add_university_to_docs
Revises: 
Create Date: 2025-12-10

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_university_to_docs'
down_revision = None  # Update this with your latest revision
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add university_id column to documents table
    op.add_column('documents', sa.Column('university_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_documents_university_id'), 'documents', ['university_id'], unique=False)
    op.create_foreign_key(
        'fk_document_university',
        'documents',
        'universities',
        ['university_id'],
        ['id'],
        ondelete='SET NULL'
    )
    
    # Update existing documents: set university_id from uploader's university_id
    op.execute("""
        UPDATE documents d
        SET university_id = u.university_id
        FROM users u
        WHERE d.uploader_id = u.id
        AND u.university_id IS NOT NULL
    """)


def downgrade() -> None:
    # Remove foreign key, index, and column
    op.drop_constraint('fk_document_university', 'documents', type_='foreignkey')
    op.drop_index(op.f('ix_documents_university_id'), table_name='documents')
    op.drop_column('documents', 'university_id')

