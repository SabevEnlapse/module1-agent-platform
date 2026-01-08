# Smart Customer Support Bot Platform

A production-ready customer support agent platform implementing the "Anatomy of an Agent" architecture. The platform consists of a Python FastAPI backend and a Next.js TypeScript frontend.

## Overview

This project demonstrates a modular, production-minded agent architecture that handles customer support queries for:
- **Order Status**: Track orders and get delivery information
- **Product Information**: Search and retrieve product details from a catalog

The agent uses deterministic logic for consistent results, including keyword-based product scoring and order ID extraction.

## Architecture

### Backend (Python FastAPI)

The backend implements the "Anatomy of an Agent" architecture with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Orchestrator                            │
│  Coordinates the entire agent pipeline                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Safety Guard  │   │ Memory Manager│   │ Run Manager   │
│ Block sensitive│  │ History state │  │ Lifecycle     │
│ information   │   │ (stateless)   │  │ management    │
└───────────────┘   └───────────────┘   └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│    Planner    │   │Context Builder│   │   Executor    │
│ Intent detect │   │ RAG product   │   │ Tool execution │
│ & plan steps  │   │ search        │   │ & latency     │
└───────────────┘   └───────────────┘   └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Reporter    │   │    Critic     │   │ Memory Manager│
│ Format answer │   │ Validate      │   │ Save history  │
│ for user      │   │ output        │   │ (stateless)   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Frontend (Next.js)

The frontend provides a clean chat interface that:
- Displays messages in a conversational format
- Shows loading indicators while awaiting responses
- Displays errors when requests fail
- Optionally shows the detected intent

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at `http://127.0.0.1:8000`

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend/smart-support-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Example Prompts

### Order Status Queries
- "Track order ORD-1001"
- "Where is my order 55512?"
- "What's the status of ORD-1002?"

### Product Queries
- "Wireless Mouse"
- "What is the price of Mechanical Keyboard?"
- "Tell me about P1004"
- "USB-C hub"

## API Endpoints

### Backend

#### Health Check
```
GET /health
```

Returns the service health status.

#### Agent Run
```
POST /agent/run
```

Process a user message through the agent pipeline.

**Request:**
```json
{
  "user_id": "optional-user-id",
  "conversation_id": "optional-conversation-id",
  "message": "Track order ORD-1001",
  "history": []
}
```

**Response:**
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "answer": "Order ORD-1001 status: Shipped. Carrier: DHL • Tracking: DHL123456789. Estimated delivery: 2024-01-15.",
  "intent": "order_status",
  "sources": [...],
  "tool_result": {...},
  "traces": [...]
}
```

### Frontend

#### Agent Proxy
```
POST /api/agent/run
```

Proxies requests to the backend agent endpoint.

## Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `INCLUDE_TRACES` | `true` | Include trace events in responses |
| `PRODUCTS_PATH` | `backend/products.json` | Path to product catalog JSON |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `HOST` | `127.0.0.1` | Server host |
| `PORT` | `8000` | Server port |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://127.0.0.1:8000` | Backend API URL |

## Deterministic Behavior

The agent uses deterministic logic for consistent results:

### Order Detection
- Matches keywords: "order", "status", "track", "where", "delivery", "shipment", "shipped", "shipping", "package", "when", "arrive"

### Order ID Extraction
- Supports `ORD-XXX` format (case-insensitive, 3+ digits)
- Supports standalone 4+ digit numbers

### Product Scoring
- Keyword extraction with stopword filtering
- Scoring boosts:
  - Exact ID match: +50 points
  - Name overlap: +10 points per keyword
  - Category match: +5 points
  - Description overlap: +3 points per keyword
  - Keywords field: +8 points per keyword
  - Features overlap: +2 points per keyword

### Product Selection
- No matches: Inform user
- Single match: Display product details
- Multiple matches with best score ≥ 40: Display best match
- Multiple matches with best score < 40: Ask for disambiguation

## Project Structure

```
module1-agent/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration
│   │   ├── api/
│   │   │   └── routes.py        # API routes
│   │   ├── agent/
│   │   │   ├── orchestrator.py  # Pipeline coordinator
│   │   │   ├── types.py         # Data structures
│   │   │   ├── run_manager.py   # Run lifecycle
│   │   │   ├── planner.py       # Intent & planning
│   │   │   ├── context_builder.py # RAG context
│   │   │   ├── executor.py      # Tool execution
│   │   │   ├── reporter.py      # Response formatting
│   │   │   ├── safety_guard.py  # Safety checks
│   │   │   ├── memory_manager.py # History (stateless)
│   │   │   └── critic.py        # Output validation
│   │   ├── rag/
│   │   │   ├── product_catalog.py # Product search
│   │   │   └── scoring.py       # Relevance scoring
│   │   └── tools/
│   │       ├── registry.py      # Tool registration
│   │       └── order_status.py  # Order status tool
│   ├── products.json            # Product catalog
│   ├── requirements.txt         # Python dependencies
│   └── README.md
├── frontend/
│   └── smart-support-frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx      # Main page
│       │   │   └── api/
│       │   │       └── agent/
│       │   │           └── run/
│       │   │               └── route.ts # API proxy
│       │   └── components/
│       │       └── Chat.tsx      # Chat component
│       ├── .env.local.example    # Env template
│       ├── next.config.ts        # Next.js config
│       ├── tsconfig.json         # TypeScript config
│       ├── package.json          # Dependencies
│       └── README.md
└── README.md                    # This file
```

## Technology Stack

### Backend
- **FastAPI 0.115.6**: Modern, fast web framework
- **Pydantic 2.10.4**: Data validation
- **Uvicorn 0.34.0**: ASGI server

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **React 18**: UI library
- **Styled-jsx**: CSS-in-JS styling

## License

This project is provided as-is for educational and demonstration purposes.