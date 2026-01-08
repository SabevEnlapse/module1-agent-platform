"""
Tool registry for the Smart Customer Support Bot.

This module provides a simple registry for tool functions that can be
called by the agent's executor. Tools are registered by name and can
be looked up for execution.
"""

from typing import Callable, Dict, Any


# Global tool registry
_tools: Dict[str, Callable] = {}


def register_tool(name: str, func: Callable) -> None:
    """
    Register a tool function in the registry.
    
    Args:
        name: The name to register the tool under
        func: The callable function to execute for this tool
        
    Examples:
        >>> def my_tool(arg1: str) -> dict:
        ...     return {"result": arg1}
        >>> register_tool("my_tool", my_tool)
    """
    _tools[name] = func


def get_tool(name: str) -> Callable:
    """
    Retrieve a tool function from the registry.
    
    Args:
        name: The name of the tool to retrieve
        
    Returns:
        The callable function for the tool
        
    Raises:
        KeyError: If the tool is not registered
        
    Examples:
        >>> tool = get_tool("getOrderStatus")
        >>> result = tool("ORD-1001")
    """
    if name not in _tools:
        raise KeyError(f"Tool '{name}' is not registered")
    return _tools[name]


def list_tools() -> list[str]:
    """
    Get a list of all registered tool names.
    
    Returns:
        List of tool names
        
    Examples:
        >>> list_tools()
        ['getOrderStatus']
    """
    return list(_tools.keys())


def clear_registry() -> None:
    """
    Clear all registered tools.
    
    This is primarily useful for testing.
    """
    global _tools
    _tools = {}