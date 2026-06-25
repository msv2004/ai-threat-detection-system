from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy 2.0 models.
    Inherits from DeclarativeBase to provide PEP-561 compliant typing and modern model mapping.
    """
    pass
