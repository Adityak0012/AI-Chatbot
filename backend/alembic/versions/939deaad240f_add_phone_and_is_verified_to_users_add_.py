"""add phone and is_verified to users, add otps table

Revision ID: 939deaad240f
Revises: e080343e6033
Create Date: 2026-08-02 21:57:08.512112

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '939deaad240f'
down_revision: Union[str, Sequence[str], None] = 'e080343e6033'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('phone', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.create_unique_constraint('uq_users_phone', 'users', ['phone'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_users_phone', 'users', type_='unique')
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'phone')
