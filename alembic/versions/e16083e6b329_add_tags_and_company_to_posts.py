"""add_tags_and_company_to_posts

Revision ID: e16083e6b329
Revises: 1b907b1f8e9f
Create Date: 2025-12-12 05:52:01.395400

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e16083e6b329'
down_revision = '1b907b1f8e9f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create PostTag enum
    op.execute("""
        CREATE TYPE posttag AS ENUM (
            'success_story',
            'career_milestone',
            'achievement',
            'learning_journey',
            'volunteering'
        )
    """)
    
    # Add tag and company columns to posts table
    op.add_column('posts', sa.Column('tag', sa.Enum('success_story', 'career_milestone', 'achievement', 'learning_journey', 'volunteering', name='posttag'), nullable=True))
    op.add_column('posts', sa.Column('company', sa.String(255), nullable=True))
    
    # Create indexes for filtering
    op.create_index(op.f('ix_posts_tag'), 'posts', ['tag'], unique=False)
    op.create_index(op.f('ix_posts_company'), 'posts', ['company'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_posts_company'), table_name='posts')
    op.drop_index(op.f('ix_posts_tag'), table_name='posts')
    
    # Drop columns
    op.drop_column('posts', 'company')
    op.drop_column('posts', 'tag')
    
    # Drop enum
    op.execute("DROP TYPE posttag")


