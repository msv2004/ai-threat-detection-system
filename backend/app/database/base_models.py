# Import all database models in one place so that Alembic's env.py
# can discover all tables dynamically for autogenerating migrations.

from app.database.base import Base
from app.models.role import Role
from app.models.user import User
from app.models.refresh_token import RefreshToken
