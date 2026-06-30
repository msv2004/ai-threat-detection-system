import os
import sys
from slowapi import Limiter
from slowapi.util import get_remote_address

# Detect test execution to disable rate limiting and prevent test failures
is_testing = "pytest" in sys.modules or os.getenv("TESTING") == "True"

# Global limiter instance to prevent circular dependencies in API routes
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "memory://"),
    enabled=not is_testing
)
