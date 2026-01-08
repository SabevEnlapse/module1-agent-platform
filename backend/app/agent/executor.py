"""
Executor module for the Smart Customer Support Bot.

This module executes TOOL steps by calling registered tool functions.
It measures execution latency and stores results for later use by the
reporter.
"""

import time
from typing import Any

from ..tools.registry import get_tool
from .types import RunState, StepType, ToolResult


def execute(state: RunState) -> None:
    """
    Execute TOOL steps in the plan.
    
    This function iterates through the plan and executes any TOOL steps
    by calling the registered tool function. It measures execution time
    and stores the result in the state.
    
    Args:
        state: The run state to update with execution results
        
    Examples:
        >>> state = RunState(user_message="Track order ORD-1001")
        >>> state.plan = [PlanStep(StepType.TOOL, "Get order status", 
        ...                        tool_call=ToolCall("getOrderStatus", {"order_id": "ORD-1001"}))]
        >>> execute(state)
        >>> state.tool_result['found']
        True
    """
    # Only process TOOL steps
    if not state.plan or state.plan[0].step_type != StepType.TOOL:
        return
    
    # Get the tool call from the plan
    tool_call = state.plan[0].tool_call
    if not tool_call:
        return
    
    # Get the tool function from the registry
    try:
        tool_func = get_tool(tool_call.name)
    except KeyError as e:
        # Tool not registered - create error result
        result = ToolResult(
            name=tool_call.name,
            ok=False,
            error=str(e),
            latency_ms=0
        )
        state.tool_results.append(result)
        state.trace("executor.tool", {
            "tool_name": tool_call.name,
            "success": False,
            "error": str(e),
            "latency_ms": 0
        })
        return
    
    # Execute the tool and measure latency
    start_time = time.time()
    try:
        tool_output = tool_func(**tool_call.arguments)
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Create success result
        result = ToolResult(
            name=tool_call.name,
            ok=True,
            data=tool_output,
            latency_ms=latency_ms
        )
        
        # Store the raw tool output in state
        state.tool_result = tool_output
        
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Create error result
        result = ToolResult(
            name=tool_call.name,
            ok=False,
            error=str(e),
            latency_ms=latency_ms
        )
    
    # Store the result
    state.tool_results.append(result)
    
    # Trace the execution
    state.trace("executor.tool", {
        "tool_name": tool_call.name,
        "arguments": tool_call.arguments,
        "success": result.ok,
        "error": result.error,
        "latency_ms": result.latency_ms
    })