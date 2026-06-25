import logging
import sys
import json
from datetime import datetime, timezone
from app.middleware.request_id_middleware import request_id_ctx_var

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        # Retrieve the request ID from the context variable
        request_id = request_id_ctx_var.get()
        record.request_id = request_id if request_id else "-"
        return True

class JSONFormatter(logging.Formatter):
    def format(self, record):
        # Determine log type based on logger name or extra fields
        if record.name.startswith("app.security"):
            log_type = "security"
        elif record.name.startswith("app.audit"):
            log_type = "audit"
        elif record.name.startswith("app.detection"):
            log_type = "detection"
        else:
            log_type = getattr(record, "log_type", "application")
            
        request_id = getattr(record, "request_id", "-")
        
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id,
            "type": log_type
        }
        
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)

def setup_logging():
    from app.config import settings
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers to prevent duplicate logging
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    
    if settings.LOG_FORMAT.upper() == "JSON":
        formatter = JSONFormatter()
    else:
        log_format = (
            "%(asctime)s - [%(levelname)s] - [%(request_id)s] - "
            "%(name)s:%(lineno)d - %(message)s"
        )
        formatter = logging.Formatter(log_format)
        
    handler.setFormatter(formatter)
    
    # Add RequestIdFilter to root and handler
    request_id_filter = RequestIdFilter()
    root_logger.addFilter(request_id_filter)
    handler.addFilter(request_id_filter)
    
    root_logger.addHandler(handler)

# Create logger instances for easy import in other files
logger = logging.getLogger("app")
security_logger = logging.getLogger("app.security")
audit_logger = logging.getLogger("app.audit")
detection_logger = logging.getLogger("app.detection")

