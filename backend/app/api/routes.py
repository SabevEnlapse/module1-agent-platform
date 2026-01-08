"""
API routes for the Smart Customer Support Bot.

This module defines the FastAPI routes for the agent, including the
health check endpoint and the main agent run endpoint.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from fastapi import APIRouter, HTTPException

from ..agent.orchestrator import run_agent
from ..config import config


# Create the API router
router = APIRouter()


# Request model for the agent run endpoint
class AgentRunRequest(BaseModel):
    """
    Request model for the agent run endpoint.
    
    Attributes:
        user_id: Optional user identifier
        conversation_id: Optional conversation identifier for multi-turn context
        message: The user's input message (required)
        history: Optional list of previous messages with 'role' and 'content'
    """
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    conversation_id: Optional[str] = Field(None, description="Optional conversation identifier")
    message: str = Field(..., description="The user's input message", min_length=1)
    history: Optional[List[Dict[str, str]]] = Field(
        None,
        description="Optional list of previous messages with 'role' and 'content' fields"
    )


# Response model for the agent run endpoint
class AgentRunResponse(BaseModel):
    """
    Response model for the agent run endpoint.
    
    Attributes:
        run_id: Unique identifier for this run
        answer: The formatted response to the user
        intent: Detected intent ("product_query" or "order_status")
        sources: List of source information for transparency
        tool_result: Raw tool output (if tools were used)
        traces: List of trace events for debugging/observability
    """
    run_id: str = Field(..., description="Unique identifier for this run")
    answer: str = Field(..., description="The formatted response to the user")
    intent: Optional[str] = Field(None, description="Detected intent")
    sources: List[Dict[str, Any]] = Field(default_factory=list, description="Source information")
    tool_result: Optional[Dict[str, Any]] = Field(None, description="Raw tool output")
    traces: List[Dict[str, Any]] = Field(default_factory=list, description="Trace events")


# Response model for the health check endpoint
class HealthResponse(BaseModel):
    """
    Response model for the health check endpoint.
    
    Attributes:
        status: The health status of the service
    """
    status: str = Field(..., description="Health status")


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns a simple status to indicate the service is running.
    
    Returns:
        HealthResponse with status "ok"
        
    Examples:
        >>> response = await health_check()
        >>> response.status
        'ok'
    """
    return HealthResponse(status="ok")


@router.post("/agent/run", response_model=AgentRunResponse)
async def agent_run(request: AgentRunRequest) -> AgentRunResponse:
    """
    Run the agent to process a user message.
    
    This is the main endpoint for the agent. It processes the user's
    message through the full agent pipeline and returns the result.
    
    Args:
        request: The agent run request containing the user message
        
    Returns:
        AgentRunResponse with the agent's answer and metadata
        
    Raises:
        HTTPException: If there's an error processing the request
        
    Examples:
        >>> request = AgentRunRequest(message="Track order ORD-1001")
        >>> response = await agent_run(request)
        >>> "Order ORD-1001 status:" in response.answer
        True
    """
    try:
        # Run the agent pipeline
        result = run_agent(
            user_message=request.message,
            user_id=request.user_id,
            conversation_id=request.conversation_id,
            history=request.history
        )
        
        # Return the response
        return AgentRunResponse(**result)
        
    except Exception as e:
        # Log the error and return a 500 response
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )