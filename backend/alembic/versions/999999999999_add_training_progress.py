"""Add training progress tracking fields

Revision ID: 999999999999
Revises: 295cf96b80a5
Create Date: 2026-06-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '999999999999'
down_revision: Union[str, Sequence[str], None] = '295cf96b80a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to training_jobs table
    op.add_column('training_jobs', sa.Column('progress_stage', sa.String(), nullable=True))
    op.add_column('training_jobs', sa.Column('progress_percent', sa.Integer(), nullable=True))
    op.add_column('training_jobs', sa.Column('progress_logs', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove the columns
    op.drop_column('training_jobs', 'progress_logs')
    op.drop_column('training_jobs', 'progress_percent')
    op.drop_column('training_jobs', 'progress_stage')
