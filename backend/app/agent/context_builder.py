"""
Context builder module for the Smart Customer Support Bot.

This module builds context for RAG (Retrieval-Augmented Generation) steps
by searching the product catalog and selecting the most relevant product.
It implements the same selection rules as the original repository.
"""

from typing import Optional

from ..config import config
from ..rag.product_catalog import load_products, search_products
from .types import RunState, StepType


def build_context(state: RunState) -> None:
    """
    Build context for RAG steps by searching and selecting products.
    
    This function only processes RAG steps. It:
    1. Loads products from the catalog
    2. Searches for matching products using the query
    3. Selects a single product if there's a clear match
    4. Otherwise keeps multiple candidates for disambiguation
    
    Selection rules:
    - No matches: Keep matches empty
    - One match: Select that product
    - Multiple matches with best_score >= 40: Select the best match
    - Multiple matches with best_score < 40: Keep all for disambiguation
    
    Args:
        state: The run state to update with context
        
    Examples:
        >>> state = RunState(user_message="wireless mouse")
        >>> state.plan = [PlanStep(StepType.RAG, "Product query", rag_query="wireless mouse")]
        >>> build_context(state)
        >>> state.selected_product['name']
        'Wireless Mouse'
    """
    # Only process RAG steps
    if not state.plan or state.plan[0].step_type != StepType.RAG:
        return
    
    # Get the RAG query from the plan
    rag_query = state.plan[0].rag_query
    if not rag_query:
        return
    
    # Load products from the catalog
    try:
        products = load_products(config.PRODUCTS_PATH)
    except Exception as e:
        # If we can't load products, log and continue with empty results
        state.trace("context.build", {
            "error": f"Failed to load products: {str(e)}",
            "matches": 0
        })
        return
    
    # Search for matching products
    matches = search_products(
        products=products,
        query=rag_query,
        limit=5,
        min_score=10.0
    )
    
    # Store the matches
    state.product_matches = matches
    
    # Apply selection rules
    if not matches:
        # No matches found
        state.selected_product = None
        state.selected_product_score = None
    elif len(matches) == 1:
        # Single match - select it
        state.selected_product = matches[0][0]
        state.selected_product_score = matches[0][1]
    else:
        # Multiple matches - check if we have a clear winner
        best_score = matches[0][1]
        if best_score >= 40.0:
            # Clear winner - select the best match
            state.selected_product = matches[0][0]
            state.selected_product_score = best_score
        else:
            # No clear winner - keep all for disambiguation
            state.selected_product = None
            state.selected_product_score = None
    
    # Trace the context building
    state.trace("context.build", {
        "query": rag_query,
        "matches": len(matches),
        "selected_product_id": state.selected_product.get("id") if state.selected_product else None,
        "selected_score": state.selected_product_score,
        "needs_disambiguation": state.selected_product is None and len(matches) > 1
    })