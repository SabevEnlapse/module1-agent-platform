"""
Safety guard module for the Smart Customer Support Bot.

This module implements safety checks to prevent the agent from processing
sensitive information. It blocks requests that contain sensitive data
like passwords, credit card numbers, or SSNs.
"""

import re
from typing import Optional

from .types import RunState


# Patterns for sensitive information
SENSITIVE_PATTERNS = {
    "password": re.compile(r'\bpassword\s*[:=]\s*\S+', re.IGNORECASE),
    "credit_card": re.compile(r'\b(?:\d[ -]*?){13,16}\b'),  # Simple pattern for credit card-like numbers
    "ssn": re.compile(r'\b\d{3}[-.]?\d{2}[-.]?\d{4}\b'),  # SSN pattern: XXX-XX-XXXX
}


def check_safety(state: RunState) -> None:
    """
    Check if the user message contains sensitive information.
    
    Scans the message for patterns that indicate sensitive data like
    passwords, credit card numbers, or SSNs. If found, the request is
    blocked and a reason is recorded.
    
    Args:
        state: The run state to update with safety check results
        
    Examples:
        >>> state = RunState(user_message="My password is secret123")
        >>> check_safety(state)
        >>> state.blocked
        True
        >>> state.block_reason
        'Message contains sensitive information: password'
    """
    message = state.user_message
    
    # Check each sensitive pattern
    for category, pattern in SENSITIVE_PATTERNS.items():
        if pattern.search(message):
            state.blocked = True
            state.block_reason = f"Message contains sensitive information: {category}"
            state.trace("safety.block", {
                "category": category,
                "reason": state.block_reason
            })
            return
    
    # Message passed safety check
    state.trace("safety.pass", {
        "message_length": len(message)
    })