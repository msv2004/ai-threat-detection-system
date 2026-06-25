import logging
import sys
from app.middleware.request_id_middleware import request_id_ctx_var

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        # Retrieve the request ID from the context variable
        request_id = request_id_ctx_var.get()
        record.request_id = request_id if request_id else "-"
        return True

def setup_logging():
    # Define a custom log format that includes the request_id
    log_format = (
        "%(asctime)s - [%(levelname)s] - [%(request_id)s] - "
        "%(name)s:%(lineno)d - %(message)s"
    )
    
    # Configure the standard logging module
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Add the RequestIdFilter to the root logger
    root_logger = logging.getLogger()
    
    # To avoid adding the filter multiple times if setup_logging is called again
    has_filter = any(isinstance(f, RequestIdFilter) for f in root_logger.filters)
    if not has_filter:
        root_logger.addFilter(RequestIdFilter())
    
    # Also attach the filter to the handlers to make sure the format gets the request_id
    for handler in root_logger.handlers:
        handler.addFilter(RequestIdFilter())

# Create a logger instance for easy import in other files
logger = logging.getLogger("app")
