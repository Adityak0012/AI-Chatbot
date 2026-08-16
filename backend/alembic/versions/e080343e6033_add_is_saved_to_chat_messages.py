"""add_is_saved_to_chat_messages

Revision ID: e080343e6033
Revises: 
Create Date: 2026-08-01 13:00:08.470000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e080343e6033'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('chat_messages', sa.Column('is_saved', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('chat_messages', 'is_saved')
