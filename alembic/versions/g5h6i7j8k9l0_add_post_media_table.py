"""add_post_media_table

Revision ID: g5h6i7j8k9l0
Revises: e16083e6b329
Create Date: 2025-12-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'g5h6i7j8k9l0'
down_revision = 'e16083e6b329'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create mediatype enum
    op.execute("""
        CREATE TYPE mediatype AS ENUM ('image', 'video')
    """)
    
    # Create post_media table
    op.create_table(
        'post_media',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('media_type', postgresql.ENUM('image', 'video', name='mediatype'), nullable=False),
        sa.Column('file_path', sa.String(length=512), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('thumbnail_path', sa.String(length=512), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.String(length=255), nullable=False),
        sa.Column('updated_at', sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_post_media_post_id'), 'post_media', ['post_id'], unique=False)
    op.create_index(op.f('ix_post_media_media_type'), 'post_media', ['media_type'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_post_media_media_type'), table_name='post_media')
    op.drop_index(op.f('ix_post_media_post_id'), table_name='post_media')
    
    # Drop table
    op.drop_table('post_media')
    
    # Drop enum
    op.execute('DROP TYPE mediatype')

