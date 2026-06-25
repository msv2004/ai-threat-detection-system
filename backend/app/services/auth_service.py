from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, Token
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt import create_access_token, create_refresh_token, decode_token

class AuthService:
    """
    Service class encapsulating authentication business logic.
    Coordinates database repository queries with security/jwt computations.
    """
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, schema: UserCreate) -> User:
        # Prevent duplicate email signups
        existing = self.user_repo.get_by_email(schema.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered."
            )
        
        # Retrieve Default 'Viewer' Role
        role = self.user_repo.get_role_by_name("Viewer")
        if not role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Default security role not initialized."
            )

        # Hash and store user credentials
        hashed = hash_password(schema.password)
        db_user = User(
            email=schema.email,
            hashed_password=hashed,
            role_id=role.id
        )
        return self.user_repo.create(db_user)

    def login(self, schema: UserLogin) -> Token:
        # Fetch user and check password
        user = self.user_repo.get_by_email(schema.email)
        if not user or not verify_password(schema.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is deactivated."
            )

        # Generate tokens
        access = create_access_token(subject=user.id, role=user.role.name)
        refresh = create_refresh_token(subject=user.id)
        
        # Parse expiry date (naive datetime for simple DB comparison)
        decoded_refresh = decode_token(refresh)
        exp_timestamp = decoded_refresh.get("exp") if decoded_refresh else None
        if exp_timestamp:
            expires_at = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc).replace(tzinfo=None)
        else:
            expires_at = datetime.now(timezone.utc).replace(tzinfo=None)
        
        # Persist refresh token session in database
        self.user_repo.create_refresh_token(token=refresh, user_id=user.id, expires_at=expires_at)
        
        return Token(access_token=access, refresh_token=refresh)

    def refresh_token(self, refresh_token: str) -> Token:
        # Validate refresh token structure
        decoded = decode_token(refresh_token)
        if not decoded or decoded.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token."
            )
        
        # Fetch and check token status in database
        db_token = self.user_repo.get_refresh_token(refresh_token)
        if not db_token or db_token.is_revoked or db_token.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired or revoked."
            )
        
        user = self.user_repo.get_by_id(db_token.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is disabled or missing."
            )
            
        # Revoke current refresh token to enforce one-time use (rotation)
        self.user_repo.revoke_refresh_token(db_token)
        
        # Generate new credentials
        access = create_access_token(subject=user.id, role=user.role.name)
        new_refresh = create_refresh_token(subject=user.id)
        
        # Store new refresh token
        new_decoded = decode_token(new_refresh)
        new_exp = new_decoded.get("exp") if new_decoded else None
        if new_exp:
            expires_at = datetime.fromtimestamp(new_exp, tz=timezone.utc).replace(tzinfo=None)
        else:
            expires_at = datetime.now(timezone.utc).replace(tzinfo=None)
        
        self.user_repo.create_refresh_token(token=new_refresh, user_id=user.id, expires_at=expires_at)
        
        return Token(access_token=access, refresh_token=new_refresh)

    def logout(self, refresh_token: str) -> None:
        db_token = self.user_repo.get_refresh_token(refresh_token)
        if db_token:
            self.user_repo.revoke_refresh_token(db_token)
