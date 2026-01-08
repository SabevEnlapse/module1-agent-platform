"""
Order status tool for the Smart Customer Support Bot.

This module implements a deterministic mock database for order status lookups.
The function getOrderStatus returns consistent results for specific order IDs,
matching the behavior from the original repository.
"""

from typing import Dict, Any


def getOrderStatus(order_id: str) -> Dict[str, Any]:
    """
    Retrieve the status of an order from the mock database.
    
    This is a deterministic mock database that returns consistent results
    for specific order IDs. It matches the exact behavior from the original
    repository's order status lookup logic.
    
    Known order IDs:
    - ORD-1001: Shipped via DHL with tracking
    - ORD-1002: Processing (no tracking yet)
    - 55512: Delivered via UPS with tracking
    
    Args:
        order_id: The order ID to look up (case-insensitive for ORD- prefix)
        
    Returns:
        Dictionary with order information:
        - If found: {found: True, order_id, status, carrier, tracking_number, estimated_delivery}
        - If not found: {found: False, error, message}
        
    Examples:
        >>> getOrderStatus("ORD-1001")
        {'found': True, 'order_id': 'ORD-1001', 'status': 'Shipped', 'carrier': 'DHL', 'tracking_number': 'DHL123456789', 'estimated_delivery': '2024-01-15'}
        
        >>> getOrderStatus("55512")
        {'found': True, 'order_id': '55512', 'status': 'Delivered', 'carrier': 'UPS', 'tracking_number': 'UPS987654321', 'estimated_delivery': '2024-01-10'}
        
        >>> getOrderStatus("ORD-9999")
        {'found': False, 'error': 'Order not found', 'message': 'Order ORD-9999 not found in our system.'}
    """
    # Normalize order_id for case-insensitive matching of ORD- prefix
    normalized_id = order_id.upper() if order_id.upper().startswith("ORD-") else order_id
    
    # Deterministic mock database
    mock_db = {
        "ORD-1001": {
            "found": True,
            "order_id": "ORD-1001",
            "status": "Shipped",
            "carrier": "DHL",
            "tracking_number": "DHL123456789",
            "estimated_delivery": "2024-01-15"
        },
        "ORD-1002": {
            "found": True,
            "order_id": "ORD-1002",
            "status": "Processing",
            "carrier": None,
            "tracking_number": None,
            "estimated_delivery": None
        },
        "55512": {
            "found": True,
            "order_id": "55512",
            "status": "Delivered",
            "carrier": "UPS",
            "tracking_number": "UPS987654321",
            "estimated_delivery": "2024-01-10"
        }
    }
    
    # Look up the order
    result = mock_db.get(normalized_id)
    
    if result:
        return result
    else:
        return {
            "found": False,
            "error": "Order not found",
            "message": f"Order {order_id} not found in our system."
        }