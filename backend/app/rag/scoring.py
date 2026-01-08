"""
Product scoring logic for the Smart Customer Support Bot.

This module implements the scoring algorithm used to match user queries
against products in the catalog. It uses keyword extraction, overlap
scoring, and boost factors to rank products by relevance.

The scoring logic matches the exact behavior from the original repository.
"""

import re
from typing import List, Set, Dict, Any


# Common English stopwords to filter out during keyword extraction
STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "can", "need",
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us",
    "them", "my", "your", "his", "its", "our", "their", "this", "that",
    "these", "those", "what", "which", "who", "whom", "whose", "where",
    "when", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "just", "also", "now", "here",
    "there", "then", "once", "get", "got", "want", "like", "look", "find",
    "show", "tell", "give", "make", "take", "come", "go", "see", "know",
    "think", "use", "help", "please", "thanks", "thank", "price", "cost",
    "buy", "purchase", "order", "status", "track", "tracking", "check"
}


def _normalize(text: str) -> str:
    """
    Normalize text for comparison by lowercasing and removing special characters.
    
    Args:
        text: The text to normalize
        
    Returns:
        Normalized text (lowercase, alphanumeric and spaces only)
        
    Examples:
        >>> _normalize("Wireless Mouse!")
        'wireless mouse'
        >>> _normalize("P1001")
        'p1001'
    """
    # Convert to lowercase
    text = text.lower()
    # Replace special characters with spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def _keywords_from_query(query: str) -> Set[str]:
    """
    Extract meaningful keywords from a user query.
    
    Removes stopwords and splits the query into individual keywords.
    
    Args:
        query: The user's search query
        
    Returns:
        Set of keywords (lowercase, no stopwords)
        
    Examples:
        >>> _keywords_from_query("wireless mouse for gaming")
        {'wireless', 'mouse', 'gaming'}
        >>> _keywords_from_query("what is the price of keyboard")
        {'price', 'keyboard'}
    """
    normalized = _normalize(query)
    words = normalized.split()
    # Filter out stopwords and empty strings
    keywords = {word for word in words if word and word not in STOPWORDS}
    return keywords


def _score_product(product: Dict[str, Any], query_keywords: Set[str]) -> float:
    """
    Calculate a relevance score for a product based on query keywords.
    
    The scoring algorithm uses multiple factors:
    1. Exact ID match: +50 points
    2. Name overlap: +10 points per matching keyword
    3. Category match: +5 points
    4. Description overlap: +3 points per matching keyword
    5. Keywords field overlap: +8 points per matching keyword
    6. Features overlap: +2 points per matching keyword
    
    Args:
        product: Product dictionary with fields: id, name, category, description, features, keywords
        query_keywords: Set of keywords extracted from the user query
        
    Returns:
        Relevance score (higher is more relevant)
        
    Examples:
        >>> product = {"id": "P1001", "name": "Wireless Mouse", "category": "Accessories", ...}
        >>> _score_product(product, {"wireless", "mouse"})
        20.0  # 10 + 10 for name overlap
    """
    score = 0.0
    
    if not query_keywords:
        return score
    
    # Extract product fields for scoring
    product_id = _normalize(product.get("id", ""))
    product_name = _normalize(product.get("name", ""))
    product_category = _normalize(product.get("category", ""))
    product_description = _normalize(product.get("description", ""))
    product_keywords = [_normalize(k) for k in product.get("keywords", [])]
    product_features = [_normalize(f) for f in product.get("features", [])]
    
    # 1. Exact ID match (highest boost)
    if product_id in query_keywords:
        score += 50
    
    # 2. Name overlap (high boost)
    name_words = set(product_name.split())
    name_overlap = query_keywords & name_words
    score += len(name_overlap) * 10
    
    # 3. Category match (medium boost)
    if product_category in query_keywords:
        score += 5
    
    # 4. Description overlap (low boost)
    desc_words = set(product_description.split())
    desc_overlap = query_keywords & desc_words
    score += len(desc_overlap) * 3
    
    # 5. Keywords field overlap (high boost)
    keyword_set = set(product_keywords)
    keyword_overlap = query_keywords & keyword_set
    score += len(keyword_overlap) * 8
    
    # 6. Features overlap (very low boost)
    feature_words = set()
    for feature in product_features:
        feature_words.update(feature.split())
    feature_overlap = query_keywords & feature_words
    score += len(feature_overlap) * 2
    
    return score