"""
Product catalog module for the Smart Customer Support Bot.

This module handles loading products from a JSON file and searching
them using the scoring algorithm. Products are cached in memory for
performance.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Tuple

from .scoring import _keywords_from_query, _score_product


# In-memory cache for loaded products
_products_cache: List[Dict[str, Any]] = None


def load_products(products_path: str) -> List[Dict[str, Any]]:
    """
    Load products from a JSON file.
    
    The products file should contain a JSON array of product objects.
    Each product should have fields: id, name, category, price, currency,
    in_stock, description, features, keywords.
    
    Args:
        products_path: Path to the products JSON file
        
    Returns:
        List of product dictionaries
        
    Raises:
        FileNotFoundError: If the products file doesn't exist
        json.JSONDecodeError: If the file contains invalid JSON
        
    Examples:
        >>> products = load_products("backend/products.json")
        >>> len(products)
        5
    """
    global _products_cache
    
    # Return cached products if available
    if _products_cache is not None:
        return _products_cache
    
    # Load products from file
    path = Path(products_path)
    if not path.exists():
        raise FileNotFoundError(f"Products file not found: {products_path}")
    
    with open(path, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    # Validate that products is a list
    if not isinstance(products, list):
        raise ValueError(f"Products file must contain a JSON array, got {type(products)}")
    
    # Cache the products
    _products_cache = products
    
    return products


def search_products(
    products: List[Dict[str, Any]],
    query: str,
    limit: int = 5,
    min_score: float = 10.0
) -> List[Tuple[Dict[str, Any], float]]:
    """
    Search products by query using keyword-based scoring.
    
    Extracts keywords from the query, scores each product based on
    keyword overlap, and returns the top matches above the minimum score.
    
    Args:
        products: List of product dictionaries to search
        query: User's search query
        limit: Maximum number of results to return
        min_score: Minimum score threshold for a match
        
    Returns:
        List of (product, score) tuples, sorted by score descending
        
    Examples:
        >>> products = load_products("backend/products.json")
        >>> results = search_products(products, "wireless mouse")
        >>> len(results)
        1
        >>> results[0][0]['name']
        'Wireless Mouse'
    """
    # Extract keywords from the query
    query_keywords = _keywords_from_query(query)
    
    # If no meaningful keywords, return empty results
    if not query_keywords:
        return []
    
    # Score all products
    scored_products = []
    for product in products:
        score = _score_product(product, query_keywords)
        if score >= min_score:
            scored_products.append((product, score))
    
    # Sort by score descending
    scored_products.sort(key=lambda x: x[1], reverse=True)
    
    # Return top results
    return scored_products[:limit]


def clear_cache() -> None:
    """
    Clear the in-memory products cache.
    
    This is useful for testing or when the products file changes
    and needs to be reloaded.
    """
    global _products_cache
    _products_cache = None