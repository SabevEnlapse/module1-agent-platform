"""
Orchestrator module for the Smart Customer Support Bot.

This module implements the main agent pipeline that coordinates all
the components of the "Anatomy of an Agent" architecture. It follows
the standard flow: safety -> memory -> planning -> context -> execution
-> reporting -> critic -> memory -> end.
"""

from typing import Optional, List, Dict, Any

from .types import RunState, Message
from .run_manager import create_run, end_run
from .safety_guard import check_safety
from .memory_manager import load_memory, save_memory
from .planner import plan
from .context_builder import build_context
from .executor import execute
from .reporter import report
from .critic import review
from ..config import config


def run_agent(
    user_message: str,
    user_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Run the agent pipeline to process a user message.
    
    This is the main entry point for the agent. It creates a new run,
    processes it through the full pipeline, and returns the result.
    
    Pipeline stages:
    1. Create run - Initialize state with unique run ID
    2. Safety check - Block if message contains sensitive info
    3. Load memory - Load conversation history (stateless in this impl)
    4. Plan - Determine intent and create execution plan
    5. Build context - Search products for RAG steps
    6. Execute - Run tool functions for TOOL steps
    7. Report - Format the final answer
    8. Critic - Review and validate the answer
    9. Save memory - Save interaction (stateless in this impl)
    10. End run - Trace completion
    
    Args:
        user_message: The user's input message
        user_id: Optional user identifier
        conversation_id: Optional conversation identifier
        history: Optional list of previous messages with 'role' and 'content'
        
    Returns:
        Dictionary containing:
        - run_id: Unique identifier for this run
        - answer: The formatted response to the user
        - intent: Detected intent ("product_query" or "order_status")
        - sources: List of source information
        - tool_result: Raw tool output (if tools were used)
        - traces: List of trace events (only if INCLUDE_TRACES is true)
        
    Examples:
        >>> result = run_agent("Track order ORD-1001")
        >>> result['answer']
        'Order ORD-1001 status: Shipped. Carrier: DHL • Tracking: DHL123456789. Estimated delivery: 2024-01-15.'
        >>> result['intent']
        'order_status'
    """
    # Stage 1: Create run
    state = create_run()
    
    # Set input fields
    state.user_message = user_message
    state.user_id = user_id
    state.conversation_id = conversation_id
    
    # Convert history dict format to Message objects
    if history:
        state.history = [
            Message(role=msg["role"], content=msg["content"])
            for msg in history
        ]
    
    # Stage 2: Safety check
    check_safety(state)
    
    # If blocked, return early with error message
    if state.blocked:
        state.final_answer = f"I cannot process this request: {state.block_reason}"
        end_run(state)
        return _format_response(state)
    
    # Stage 3: Load memory
    load_memory(state)
    
    # Stage 4: Plan
    plan(state)
    
    # Stage 5: Build context (only for RAG steps)
    build_context(state)
    
    # Stage 6: Execute (only for TOOL steps)
    execute(state)
    
    # Stage 7: Report
    report(state)
    
    # Stage 8: Critic
    review(state)
    
    # Stage 9: Save memory
    save_memory(state)
    
    # Stage 10: End run
    end_run(state)
    
    # Format and return response
    return _format_response(state)


def _format_response(state: RunState) -> Dict[str, Any]:
    """
    Format the run state into the API response format.
    
    Args:
        state: The completed run state
        
    Returns:
        Dictionary formatted for the API response
    """
    response = {
        "run_id": state.run_id,
        "answer": state.final_answer,
        "intent": state.intent,
        "sources": state.sources,
        "tool_result": state.tool_result,
        "traces": state.traces if config.INCLUDE_TRACES else []
    }
    
    return response