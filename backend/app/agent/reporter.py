"""
Reporter module for the Smart Customer Support Bot.

This module formats the final response to the user based on the agent's
execution results. It implements the exact formatting logic from the
original repository for both order status and product queries.
"""

from typing import List

from .types import RunState, StepType


def report(state: RunState) -> None:
    """
    Format the final answer based on the agent's execution results.
    
    This function generates the user-facing response based on the intent
    and available data. It handles:
    - Order status responses (with or without order ID)
    - Product query responses (no matches, single match, multiple matches)
    - Direct responses for clarification
    
    Args:
        state: The run state to update with the formatted answer
        
    Examples:
        >>> state = RunState(user_message="Track order ORD-1001")
        >>> state.intent = "order_status"
        >>> state.tool_result = {"found": True, "order_id": "ORD-1001", "status": "Shipped", ...}
        >>> report(state)
        >>> "Order ORD-1001 status: Shipped" in state.final_answer
        True
    """
    # Handle order status intent
    if state.intent == "order_status":
        _format_order_response(state)
    # Handle product query intent
    elif state.intent == "product_query":
        _format_product_response(state)
    # Handle direct response (e.g., clarification needed)
    elif state.plan and state.plan[0].step_type == StepType.DIRECT:
        _format_direct_response(state)
    
    # Populate sources
    _populate_sources(state)
    
    # Trace the formatting
    state.trace("reporter.format", {
        "intent": state.intent,
        "answer_length": len(state.final_answer),
        "sources_count": len(state.sources)
    })


def _format_order_response(state: RunState) -> None:
    """
    Format an order status response.
    
    Handles three cases:
    1. Missing order ID - ask for clarification
    2. Order not found - inform user
    3. Order found - display status, carrier, tracking, and ETA
    
    Args:
        state: The run state to update with the formatted answer
    """
    # Case 1: Missing order ID
    if not state.order_id:
        state.final_answer = "Please provide your order ID (for example: ORD-1001 or 55512)."
        return
    
    # Case 2: Order not found
    if not state.tool_result or not state.tool_result.get("found", False):
        # Use the tool's message if available, otherwise use default
        if state.tool_result and "message" in state.tool_result:
            state.final_answer = state.tool_result["message"]
        else:
            state.final_answer = "Order not found."
        return
    
    # Case 3: Order found - format the response
    order_id = state.tool_result.get("order_id", state.order_id)
    status = state.tool_result.get("status", "Unknown")
    carrier = state.tool_result.get("carrier")
    tracking_number = state.tool_result.get("tracking_number")
    estimated_delivery = state.tool_result.get("estimated_delivery")
    
    # Build the response
    lines = [f"Order {order_id} status: {status}."]
    
    # Add carrier and tracking if available
    if carrier and tracking_number:
        lines.append(f"Carrier: {carrier} • Tracking: {tracking_number}.")
    
    # Add ETA if available
    if estimated_delivery:
        lines.append(f"Estimated delivery: {estimated_delivery}.")
    
    state.final_answer = " ".join(lines)


def _format_product_response(state: RunState) -> None:
    """
    Format a product query response.
    
    Handles three cases:
    1. No matches - inform user
    2. Single match selected - display product details
    3. Multiple matches - ask for disambiguation
    
    Args:
        state: The run state to update with the formatted answer
    """
    # Case 1: No matches
    if not state.product_matches:
        state.final_answer = "I couldn't find that product in our catalog. Try searching by product name or ID (e.g., P1001)."
        return
    
    # Case 2: Single product selected
    if state.selected_product:
        product = state.selected_product
        name = product.get("name", "Unknown")
        product_id = product.get("id", "Unknown")
        price = product.get("price", "N/A")
        currency = product.get("currency", "")
        in_stock = product.get("in_stock", False)
        description = product.get("description", "")
        
        # Build the response
        lines = [
            f"{name} ({product_id})",
            f"Price: {price} {currency}",
            f"Availability: {'In stock' if in_stock else 'Out of stock'}",
            f"About: {description}"
        ]
        
        state.final_answer = "\n".join(lines)
        return
    
    # Case 3: Multiple matches - disambiguation needed
    match_summaries = []
    for product, score in state.product_matches:
        name = product.get("name", "Unknown")
        product_id = product.get("id", "Unknown")
        match_summaries.append(f"{name} ({product_id})")
    
    matches_str = ", ".join(match_summaries)
    state.final_answer = f"I found multiple possible matches: {matches_str} Which one do you mean?"


def _format_direct_response(state: RunState) -> None:
    """
    Format a direct response (e.g., for clarification).
    
    Args:
        state: The run state to update with the formatted answer
    """
    # For order questions without ID, we already have a standard message
    if state.intent == "order_status":
        state.final_answer = "Please provide your order ID (for example: ORD-1001 or 55512)."
    else:
        # Generic direct response
        state.final_answer = "I'm not sure how to help with that. Could you please rephrase your question?"


def _populate_sources(state: RunState) -> None:
    """
    Populate the sources list for transparency.
    
    For order queries: includes tool name and order ID
    For product queries: includes product IDs and scores
    
    Args:
        state: The run state to update with sources
    """
    if state.intent == "order_status":
        # Add tool info as source
        if state.tool_result:
            state.sources.append({
                "type": "tool",
                "name": "getOrderStatus",
                "order_id": state.order_id
            })
    elif state.intent == "product_query":
        # Add product matches as sources
        for product, score in state.product_matches:
            state.sources.append({
                "type": "product",
                "id": product.get("id"),
                "name": product.get("name"),
                "score": score
            })