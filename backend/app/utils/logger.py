import logging
import sys

def get_logger(name: str = "ArogyaMitra"):
    logger = logging.getLogger(name)
    
    # Only configure if no handlers exist to prevent duplicate logs
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Create console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(module)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(formatter)
        
        # Add handler to logger
        logger.addHandler(console_handler)
        
    return logger

# Create a default logger instance
logger = get_logger()
