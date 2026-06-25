from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.models.refresh_token import RefreshToken

class UserRepository:
    """
    Repository class handling CRUD database operations for Users, Roles, and Refresh Tokens.
    Encapsulates SQLAlchemy logic so services remain independent of DB details.
    """
    def __init__(self, db: Session):
        self.db = db

    # User CRUD Operations
    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        query = select(User).where(User.email == email)
        return self.db.execute(query).scalar_one_or_none()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    # Role CRUD Operations
    def get_role_by_name(self, name: str) -> Role | None:
        query = select(Role).where(Role.name == name)
        return self.db.execute(query).scalar_one_or_none()

    def create_role(self, role: Role) -> Role:
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    # Refresh Token CRUD Operations
    def create_refresh_token(self, token: str, user_id: int, expires_at: datetime) -> RefreshToken:
        db_token = RefreshToken(token=token, user_id=user_id, expires_at=expires_at)
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token

    def get_refresh_token(self, token: str) -> RefreshToken | None:
        query = select(RefreshToken).where(RefreshToken.token == token)
        return self.db.execute(query).scalar_one_or_none()

    def revoke_refresh_token(self, token_obj: RefreshToken) -> RefreshToken:
        token_obj.is_revoked = True
        self.db.commit()
        self.db.refresh(token_obj)
        return token_obj
