from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class Role(Base):
    """
    SQLAlchemy model representing user security roles.
    E.g., Admin, Security Analyst, Viewer.
    """
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    # Back-populates "role" in User model
    users: Mapped[list["User"]] = relationship(
        back_populates="role",
        cascade="all, delete-orphan"
    )
