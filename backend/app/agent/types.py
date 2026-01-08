"""
Type definitions for the Smart Customer Support Bot agent.

This module defines all the core data structures used throughout the agent
pipeline, following the "Anatomy of an Agent" architecture. These types
represent the state, plans, and execution results that flow through the
orchestrator's pipeline stages.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Literal
import uuid
import time


class StepType(Enum):
    """
    Enumeration of possible step types in an agent plan.
    
    Each step type represents a different approach to handling a user query:
    - RAG: Retrieval-Augmented Generation (search product catalog)
    - TOOL: Execute a tool function (e.g., get order status)
    - DIRECT: Direct response without external data (e.g., clarification)
    """
    RAG = "rag"
    TOOL = "tool"
    DIRECT = "direct"


@dataclass
class ToolCall:
    """
    Represents a tool function call to be executed.
    
    Attributes:
        name: The name of the tool to call (must be registered in the tool registry)
        arguments: Dictionary of arguments to pass to the tool function
    """
    name: str
    arguments: Dict[str, Any]
    
    def __repr__(self) -> str:
        return f"ToolCall(name={self.name!r}, args={self.arguments})"


@dataclass
class ToolResult:
    """
    Represents the result of executing a tool function.
    
    Attributes:
        name: The name of the tool that was executed
        ok: Whether the tool execution was successful
        data: The data returned by the tool (if successful)
        error: Error message if the tool execution failed
        latency_ms: Execution time in milliseconds
    """
    name: str
    ok: bool
    data: Any = None
    error: Optional[str] = None
    latency_ms: Optional[int] = None
    
    def __repr__(self) -> str:
        status = "OK" if self.ok else "ERROR"
        return f"ToolResult({self.name}={status}, latency={self.latency_ms}ms)"


@dataclass
class PlanStep:
    """
    Represents a single step in the agent's execution plan.
    
    Each step defines what action to take and why (rationale). The step
    type determines which component will handle execution.
    
    Attributes:
        step_type: The type of step (RAG, TOOL, or DIRECT)
        rationale: Human-readable explanation of why this step was chosen
        tool_call: Tool call details (only for TOOL steps)
        rag_query: Query string for RAG search (only for RAG steps)
    """
    step_type: StepType
    rationale: str
    tool_call: Optional[ToolCall] = None
    rag_query: Optional[str] = None
    
    def __repr__(self) -> str:
        if self.step_type == StepType.TOOL and self.tool_call:
            return f"PlanStep({self.step_type.value}: {self.tool_call})"
        elif self.step_type == StepType.RAG:
            return f"PlanStep({self.step_type.value}: query={self.rag_query!r})"
        else:
            return f"PlanStep({self.step_type.value}: {self.rationale})"


@dataclass
class Message:
    """
    Represents a message in the conversation history.
    
    Attributes:
        role: Either "user" or "assistant"
        content: The message text content
    """
    role: Literal["user", "assistant"]
    content: str
    
    def __repr__(self) -> str:
        return f"Message({self.role}: {self.content[:50]}...)"


@dataclass
class RunState:
    """
    Central state object that flows through the agent pipeline.
    
    This dataclass holds all mutable state that is updated as the agent
    processes a user request through its various stages (planning, context
    building, execution, reporting, etc.).
    
    Attributes:
        run_id: Unique identifier for this execution run
        user_id: Optional user identifier
        conversation_id: Optional conversation identifier for multi-turn context
        user_message: The original user input message
        history: List of previous messages in the conversation
        plan: List of planned steps to execute
        product_matches: List of (product, score) tuples from RAG search
        selected_product: The single product selected (if applicable)
        selected_product_score: Score of the selected product
        order_id: Extracted order ID (if applicable)
        final_answer: The formatted response to return to the user
        intent: Detected intent ("product_query" or "order_status")
        sources: List of source information for transparency
        tool_result: Raw tool output (if tools were used)
        tool_results: List of all tool execution results
        blocked: Whether the request was blocked by safety guard
        block_reason: Reason for blocking (if blocked)
        traces: List of trace events for debugging/observability
    """
    # Identification
    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    
    # Input
    user_message: str = ""
    history: List[Message] = field(default_factory=list)
    
    # Planning
    plan: List[PlanStep] = field(default_factory=list)
    
    # Product-related state
    product_matches: List[tuple] = field(default_factory=list)
    selected_product: Optional[Dict[str, Any]] = None
    selected_product_score: Optional[float] = None
    
    # Order-related state
    order_id: Optional[str] = None
    
    # Output
    final_answer: str = ""
    intent: Optional[str] = None
    sources: List[Dict[str, Any]] = field(default_factory=list)
    tool_result: Optional[Dict[str, Any]] = None
    tool_results: List[ToolResult] = field(default_factory=list)
    
    # Governance
    blocked: bool = False
    block_reason: Optional[str] = None
    
    # Observability
    traces: List[Dict[str, Any]] = field(default_factory=list)
    
    def trace(self, event: str, payload: Dict[str, Any]) -> None:
        """
        Add a trace event to the execution history.
        
        Traces are used for debugging, observability, and understanding
        the agent's decision-making process.
        
        Args:
            event: Name of the event (e.g., "planner.plan", "executor.tool")
            payload: Dictionary of event-specific data
        """
        self.traces.append({
            "event": event,
            "timestamp": time.time(),
            "payload": payload
        })
    
    def __repr__(self) -> str:
        return (
            f"RunState(id={self.run_id[:8]}..., "
            f"intent={self.intent}, "
            f"steps={len(self.plan)}, "
            f"traces={len(self.traces)})"
        )