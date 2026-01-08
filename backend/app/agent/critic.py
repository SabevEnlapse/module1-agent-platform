"""
Critic module for the Smart Customer Support Bot.

This module reviews and validates the agent's output before returning it
to the user. It enforces constraints like maximum response length and
ensures the output is appropriate.
"""

from .types import RunState


# Maximum allowed length for the final answer
MAX_ANSWER_LENGTH = 4000


def review(state: RunState) -> None:
    """
    Review and validate the agent's final answer.
    
    This function applies quality checks to the final answer:
    - Caps the answer at MAX_ANSWER_LENGTH characters
    - Traces the review operation for observability
    
    Args:
        state: The run state to review and potentially modify
        
    Examples:
        >>> state = RunState()
        >>> state.final_answer = "A" * 5000
        >>> review(state)
        >>> len(state.final_answer)
        4000
    """
    original_length = len(state.final_answer)
    
    # Cap the answer length
    if len(state.final_answer) > MAX_ANSWER_LENGTH:
        state.final_answer = state.final_answer[:MAX_ANSWER_LENGTH]
        truncated = True
    else:
        truncated = False
    
    # Trace the review
    state.trace("critic.review", {
        "original_length": original_length,
        "final_length": len(state.final_answer),
        "truncated": truncated
    })