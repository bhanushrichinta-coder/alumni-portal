"""
Simple logging utility
"""
import logging
import sys

# Create logger
logger = logging.getLogger("alumni_connect_hub")
logger.setLevel(logging.INFO)

# Create console handler
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)

# Create formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)

# Add handler to logger
if not logger.handlers:
    logger.addHandler(handler)

