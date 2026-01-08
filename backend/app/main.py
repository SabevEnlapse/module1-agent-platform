"""
Main FastAPI application for the Smart Customer Support Bot.

This module creates and configures the FastAPI application, including
CORS middleware, route registration, and tool registration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import config
from .api.routes import router
from .tools.registry import register_tool
from .tools.order_status import getOrderStatus


# Create the FastAPI application
app = FastAPI(
    title="Smart Customer Support Bot",
    description="A production-ready customer support agent using the Anatomy of an Agent architecture",
    version="1.0.0"
)


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register the API routes
app.include_router(router)


# Register tools
register_tool("getOrderStatus", getOrderStatus)


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint that provides basic information about the API.
    
    Returns:
        Dictionary with API information
    """
    return {
        "name": "Smart Customer Support Bot",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "agent_run": "/agent/run"
        }
    }