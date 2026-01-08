"""
Configuration module for the Smart Customer Support Bot.
This module provides environment-based configuration using Pydantic settings.
It handles all configuration values needed for the application including
CORS settings, feature flags, and file paths.
"""
import os
from pathlib import Path
from typing import List

# --- HELPER FUNCTIONS MOVED TO THE TOP ---

def _parse_bool(value: str) -> bool:
    """
    Parse a string value to a boolean.
    
    Args:
        value: String value to parse (case-insensitive)
        
    Returns:
        True if value is "true", "1", "yes", "on"; False otherwise
        
    Examples:
        >>> _parse_bool("true")
        True
        >>> _parse_bool("FALSE")
        False
        >>> _parse_bool("1")
        True
    """
    if value is None: 
        return False
    return str(value).lower() in ("true", "1", "yes", "on")

def _parse_list(value: str) -> List[str]:
    """
    Parse a comma-separated string into a list.
    
    Args:
        value: Comma-separated string
        
    Returns:
        List of stripped strings
        
    Examples:
        >>> _parse_list("http://localhost:3000,http://localhost:3001")
        ['http://localhost:3000', 'http://localhost:3001']
    """
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]

# --- CONFIG CLASS DEFINED AFTER HELPERS ---

class Config:
    """
    Simple configuration class that reads environment variables.
    
    Uses a simple approach without additional dependencies beyond what's
    already required (pydantic is used for validation elsewhere).
    """
    
    # Feature flags
    INCLUDE_TRACES: bool = _parse_bool(os.getenv("INCLUDE_TRACES", "true"))
    
    # File paths
    PRODUCTS_PATH: str = os.getenv(
        "PRODUCTS_PATH",
        str(Path(__file__).parent.parent.parent / "products.json")
    )
    
    # CORS configuration
    CORS_ORIGINS: List[str] = _parse_list(os.getenv("CORS_ORIGINS", "http://localhost:3000"))
    
    # Server configuration
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

# Global config instance
config = Config()