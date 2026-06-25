import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.session import get_db
from app.database.base_models import Base
from app.models.role import Role
from app.repositories.user_repository import UserRepository

# SQLite file-backed database configuration for shared testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_project.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def db_setup():
    """
    Creates all database tables and seeds default roles once for the entire test session.
    Clean up tables and files afterwards.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    user_repo = UserRepository(db)
    roles = [
        ("Admin", "Full administrative access."),
        ("Security Analyst", "Access to threat models."),
        ("Viewer", "Read-only access.")
    ]
    for name, desc in roles:
        if not user_repo.get_role_by_name(name):
            user_repo.create_role(Role(name=name, description=desc))
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_project.db"):
        try:
            os.remove("./test_project.db")
        except Exception:
            pass

@pytest.fixture
def db_session():
    """
    Yields a database session wrapped in a transaction that is rolled back
    after the test finishes, ensuring database isolation between individual tests.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def override_get_db(db_session):
    """
    Applies the dependency overrides for get_db per-test and cleans up after.
    """
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()
