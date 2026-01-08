"""
Planner module for the Smart Customer Support Bot.

This module implements the planning logic that determines how to handle
a user query. It analyzes the message to detect intent (order status vs
product query) and creates an execution plan with appropriate steps.

The routing logic matches the exact behavior from the original repository.
"""

import re
from typing import Optional

from .types import RunState, PlanStep, StepType, ToolCall


# Keywords that indicate an order-related question
ORDER_KEYWORDS = {
    "order", "orders", "status", "track", "tracking", "where", "shipment",
    "delivery", "deliver", "shipped", "shipping", "package", "when", "arrive"
}

# Regular expressions for extracting order IDs
ORDER_ID_REGEXES = [
    # ORD- followed by 3+ digits (case-insensitive)
    re.compile(r'ORD-(\d{3,})', re.IGNORECASE),
    # Standalone 4+ digit numbers
    re.compile(r'\b(\d{4,})\b'),
]


def _looks_like_order_question(message: str) -> bool:
    """
    Determine if a message appears to be asking about an order.
    
    Checks if the message contains any order-related keywords.
    
    Args:
        message: The user's message
        
    Returns:
        True if the message appears to be about orders, False otherwise
        
    Examples:
        >>> _looks_like_order_question("Where is my order?")
        True
        >>> _looks_like_order_question("Tell me about wireless mouse")
        False
    """
    message_lower = message.lower()
    # Check if any order keyword appears in the message
    return any(keyword in message_lower for keyword in ORDER_KEYWORDS)


def _extract_order_id(message: str) -> Optional[str]:
    """
    Extract an order ID from a message.
    
    Tries multiple regex patterns to find an order ID:
    1. ORD- followed by 3+ digits (case-insensitive)
    2. Standalone 4+ digit numbers
    
    Args:
        message: The user's message
        
    Returns:
        The extracted order ID, or None if no ID found
        
    Examples:
        >>> _extract_order_id("Track order ORD-1001")
        'ORD-1001'
        >>> _extract_order_id("Where is 55512?")
        '55512'
        >>> _extract_order_id("Tell me about orders")
        None
    """
    # Try each regex pattern in order
    for pattern in ORDER_ID_REGEXES:
        match = pattern.search(message)
        if match:
            # For ORD- pattern, preserve the prefix
            if pattern.pattern.startswith('ORD'):
                return match.group(0).upper()
            # For numeric pattern, return just the number
            else:
                return match.group(1)
    
    return None


def plan(state: RunState) -> None:
    """
    Create an execution plan for the user's message.
    
    Analyzes the user message to determine intent and creates appropriate
    plan steps:
    - If order question with ID: TOOL step to get order status
    - If order question without ID: DIRECT step to ask for clarification
    - Otherwise: RAG step to search product catalog
    
    Args:
        state: The run state to update with the plan
        
    Examples:
        >>> state = RunState(user_message="Track order ORD-1001")
        >>> plan(state)
        >>> state.intent
        'order_status'
        >>> state.plan[0].step_type
        <StepType.TOOL: 'tool'>
    """
    message = state.user_message
    
    # Check if this is an order-related question
    if _looks_like_order_question(message):
        state.intent = "order_status"
        
        # Try to extract order ID
        order_id = _extract_order_id(message)
        
        if order_id:
            # We have an order ID - plan to call the order status tool
            state.order_id = order_id
            step = PlanStep(
                step_type=StepType.TOOL,
                rationale=f"User is asking about order {order_id}",
                tool_call=ToolCall(
                    name="getOrderStatus",
                    arguments={"order_id": order_id}
                )
            )
        else:
            # No order ID found - plan to ask for clarification
            step = PlanStep(
                step_type=StepType.DIRECT,
                rationale="User is asking about an order but didn't provide an order ID"
            )
    else:
        # Not an order question - plan to search products
        state.intent = "product_query"
        step = PlanStep(
            step_type=StepType.RAG,
            rationale="User is asking about products",
            rag_query=message
        )
    
    # Add the step to the plan
    state.plan.append(step)
    
    # Trace the planning decision
    state.trace("planner.plan", {
        "intent": state.intent,
        "order_id": state.order_id,
        "step_type": step.step_type.value,
        "rationale": step.rationale
    })