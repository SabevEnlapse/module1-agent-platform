# Smart Customer Support Bot - Backend

A production-ready customer support agent backend built with FastAPI, implementing the "Anatomy of an Agent" architecture.

## Architecture

The backend follows a modular agent architecture with the following components:

### Agent Pipeline Components

- **Run Manager** (`run_manager.py`): Manages run lifecycle with unique IDs and tracing
- **Safety Guard** (`safety_guard.py`): Blocks requests containing sensitive information
- **Memory Manager** (`memory_manager.py`): Handles conversation history (stateless implementation)
- **Planner** (`planner.py`): Determines intent and creates execution plans
- **Context Builder** (`context_builder.py`): Builds context for RAG steps via product search
- **Executor** (`executor.py`): Executes tool functions with latency measurement
- **Reporter** (`reporter.py`): Formats final responses for users
- **Critic** (`critic.py`): Reviews and validates output (e.g., length limits)
- **Orchestrator** (`orchestrator.py`): Coordinates the entire pipeline

### Supporting Modules

- **Types** (`types.py`): Core data structures (RunState, PlanStep, ToolCall, etc.)
- **Config** (`config.py`): Environment-based configuration
- **Tool Registry** (`tools/registry.py`): Registration and lookup of tool functions
- **Order Status Tool** (`tools/order_status.py`): Deterministic mock order database
- **Product Catalog** (`rag/product_catalog.py`): Product loading and search
- **Scoring** (`rag/scoring.py`): Keyword-based product relevance scoring

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The server will be available at `http://127.0.0.1:8000`

## API Endpoints

### Health Check
```
GET /health
```

Returns the service health status.

### Agent Run
```
POST /agent/run
```

Process a user message through the agent pipeline.

**Request Body:**
```json
{
  "user_id": "optional-user-id",
  "conversation_id": "optional-conversation-id",
  "message": "Track order ORD-1001",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
  ]
}
```

**Response:**
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "answer": "Order ORD-1001 status: Shipped. Carrier: DHL • Tracking: DHL123456789. Estimated delivery: 2024-01-15.",
  "intent": "order_status",
  "sources": [
    {
      "type": "tool",
      "name": "getOrderStatus",
      "order_id": "ORD-1001"
    }
  ],
  "tool_result": {
    "found": true,
    "order_id": "ORD-1001",
    "status": "Shipped",
    "carrier": "DHL",
    "tracking_number": "DHL123456789",
    "estimated_delivery": "2024-01-15"
  },
  "traces": [...]
}
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `INCLUDE_TRACES` | `true` | Include trace events in responses |
| `PRODUCTS_PATH` | `backend/products.json` | Path to product catalog JSON |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `HOST` | `127.0.0.1` | Server host |
| `PORT` | `8000` | Server port |

## Example Prompts

### Order Status
- "Track order ORD-1001"
- "Where is my order 55512?"
- "What's the status of ORD-1002?"

### Product Queries
- "Wireless Mouse"
- "What is the price of Mechanical Keyboard?"
- "Tell me about P1004"
- "USB-C hub"

## Deterministic Behavior

The agent uses deterministic logic for consistent results:

- **Order Detection**: Matches keywords like "order", "status", "track", "where", "delivery"
- **Order ID Extraction**: Supports `ORD-XXX` format and 4+ digit numbers
- **Product Scoring**: Keyword-based scoring with boosts for ID, name, category, description, and keywords
- **Selection Rules**: Single match or score ≥ 40 selects product; otherwise asks for disambiguation

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/
│   │   └── routes.py        # API route definitions
│   ├── agent/
│   │   ├── orchestrator.py  # Main pipeline coordinator
│   │   ├── types.py         # Core data structures
│   │   ├── run_manager.py   # Run lifecycle management
│   │   ├── planner.py       # Intent detection and planning
│   │   ├── context_builder.py  # RAG context building
│   │   ├── executor.py      # Tool execution
│   │   ├── reporter.py      # Response formatting
│   │   ├── safety_guard.py  # Safety checks
│   │   ├── memory_manager.py # Conversation history
│   │   └── critic.py        # Output validation
│   ├── rag/
│   │   ├── product_catalog.py # Product loading and search
│   │   └── scoring.py       # Product relevance scoring
│   └── tools/
│       ├── registry.py      # Tool registration
│       └── order_status.py  # Order status tool
├── products.json            # Product catalog
├── requirements.txt         # Python dependencies
└── README.md               # This file