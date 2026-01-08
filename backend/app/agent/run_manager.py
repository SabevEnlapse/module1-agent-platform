"""
Run manager module for the Smart Customer Support Bot.

This module manages the lifecycle of an agent run, including creating
unique run IDs and tracing run start/end events.
"""

import uuid
import time

from .types import RunState


def create_run() -> RunState:
    """
    Create a new run state with a unique run ID.
    
    Initializes a new RunState with a unique UUID and traces the
    run start event.
    
    Returns:
        A new RunState with a unique run_id
        
    Examples:
        >>> state = create_run()
        >>> state.run_id
        '550e8400-e29b-41d4-a716-446655440000'
    """
    state = RunState()
    state.trace("run.start", {
        "run_id": state.run_id,
        "timestamp": time.time()
    })
    return state


def end_run(state: RunState) -> None:
    """
    Mark the end of a run and trace the completion.
    
    This function should be called at the end of the agent pipeline
    to trace the run completion event.
    
    Args:
        state: The run state to mark as completed
        
    Examples:
        >>> state = create_run()
        >>> # ... process the run ...
        >>> end_run(state)
    """
    state.trace("run.end", {
        "run_id": state.run_id,
        "timestamp": time.time(),
        "intent": state.intent,
        "blocked": state.blocked,
        "answer_length": len(state.final_answer)
    })