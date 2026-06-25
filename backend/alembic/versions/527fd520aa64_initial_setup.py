"""Initial setup

Revision ID: 527fd520aa64
Revises: 
Create Date: 2026-06-25 14:34:12.866470

"""
from typing import Sequence, Union



# revision identifiers, used by Alembic.
revision: str = '527fd520aa64'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
