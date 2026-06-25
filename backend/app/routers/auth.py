from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token, TokenRefreshRequest
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(schema: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user account.
    """
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    return auth_service.register(schema)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticates a user and returns JWT Access and Refresh Tokens.
    Accepts Standard OAuth2 form data (username is user email).
    """
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    login_schema = UserLogin(email=form_data.username, password=form_data.password)
    return auth_service.login(login_schema)

@router.post("/refresh", response_model=Token)
def refresh(schema: TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    Renews an expired access token using a valid, unrevoked refresh token.
    Enforces one-time token rotation (the old refresh token is revoked).
    """
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    return auth_service.refresh_token(schema.refresh_token)

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(schema: TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    Logs out a user by revoking their refresh token.
    """
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    auth_service.logout(schema.refresh_token)
    return {"detail": "Successfully logged out."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieves the currently authenticated user's profile details.
    """
    return current_user
