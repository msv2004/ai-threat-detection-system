from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Parse the database URL to ensure compatibility with SQLAlchemy and psycopg (v3)
database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
elif database_url.startswith("postgresql://") and not database_url.startswith("postgresql+psycopg://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Configure the SQLAlchemy connection pool
# pool_pre_ping: tests connections before executing queries (pings the DB)
# pool_size: number of persistent connections to hold in the pool
# max_overflow: additional connections allowed above pool_size during peak demand
connect_args = {}
if database_url.startswith("sqlite"):
    # SQLite requires check_same_thread=False for multi-thread FastAPI access
    connect_args["check_same_thread"] = False

engine = create_engine(
    database_url,
    pool_size=5 if not database_url.startswith("sqlite") else None,
    max_overflow=10 if not database_url.startswith("sqlite") else None,
    pool_pre_ping=True,
    connect_args=connect_args
)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Setup a thread-local session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency helper that yields a local database session.
    Closes the session after the FastAPI request lifecycle completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
