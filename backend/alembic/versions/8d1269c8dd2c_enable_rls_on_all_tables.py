"""enable_rls_on_all_tables

Revision ID: 8d1269c8dd2c
Revises: 999999999999
Create Date: 2026-06-30 19:48:21.650739

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d1269c8dd2c'
down_revision: Union[str, Sequence[str], None] = '999999999999'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TABLES = [
    'roles',
    'users',
    'refresh_tokens',
    'datasets',
    'dataset_profiles',
    'preprocessing_jobs',
    'processed_datasets',
    'trained_models',
    'training_jobs',
    'prediction_jobs',
    'prediction_histories',
    'threats',
    'detection_sessions',
    'threat_intelligence',
    'system_events'
]


def upgrade() -> None:
    """Upgrade schema."""
    if op.get_bind().dialect.name == 'postgresql':
        for table in TABLES:
            op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")


def downgrade() -> None:
    """Downgrade schema."""
    if op.get_bind().dialect.name == 'postgresql':
        for table in TABLES:
            op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")

