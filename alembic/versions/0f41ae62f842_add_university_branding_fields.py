"""add_university_branding_fields

Revision ID: 0f41ae62f842
Revises: g5h6i7j8k9l0
Create Date: 2025-12-12 09:24:02.077120

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0f41ae62f842'
down_revision = 'g5h6i7j8k9l0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add branding fields to universities table
    op.add_column('universities', sa.Column('logo_url', sa.String(length=512), nullable=True))
    op.add_column('universities', sa.Column('light_primary_color', sa.String(length=7), nullable=True))
    op.add_column('universities', sa.Column('light_secondary_color', sa.String(length=7), nullable=True))
    op.add_column('universities', sa.Column('light_accent_color', sa.String(length=7), nullable=True))
    op.add_column('universities', sa.Column('dark_primary_color', sa.String(length=7), nullable=True))
    op.add_column('universities', sa.Column('dark_secondary_color', sa.String(length=7), nullable=True))
    op.add_column('universities', sa.Column('dark_accent_color', sa.String(length=7), nullable=True))


def downgrade() -> None:
    # Remove branding fields from universities table
    op.drop_column('universities', 'dark_accent_color')
    op.drop_column('universities', 'dark_secondary_color')
    op.drop_column('universities', 'dark_primary_color')
    op.drop_column('universities', 'light_accent_color')
    op.drop_column('universities', 'light_secondary_color')
    op.drop_column('universities', 'light_primary_color')
    op.drop_column('universities', 'logo_url')


