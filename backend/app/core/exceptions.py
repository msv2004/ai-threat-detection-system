from typing import Any, Dict, Optional

class AppException(Exception):
    """Base application exception."""
    def __init__(self, status_code: int, message: str, details: Optional[Dict[str, Any]] = None):
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(self.message)

class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=404, message=message, details=details)

class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized access", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=401, message=message, details=details)

class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden access", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=403, message=message, details=details)

class ValidationError(AppException):
    def __init__(self, message: str = "Validation error", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=422, message=message, details=details)
