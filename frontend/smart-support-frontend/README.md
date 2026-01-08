# Smart Customer Support Bot - Frontend

A Next.js frontend for the Smart Customer Support Bot, providing a clean chat interface for interacting with the agent.

## Features

- Clean, responsive chat interface
- Real-time message display
- Loading indicators while awaiting responses
- Error handling and display
- Intent detection display
- Example prompts for new users

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend/smart-support-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend URL:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set the `BACKEND_URL` to your backend server address:
```
BACKEND_URL=http://127.0.0.1:8000
```

## Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
frontend/smart-support-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page component
│   │   └── api/
│   │       └── agent/
│   │           └── run/
│   │               └── route.ts  # API proxy route
│   └── components/
│       └── Chat.tsx              # Chat component
├── .env.local.example            # Environment variables template
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## API Proxy

The frontend uses a Next.js API route at `/api/agent/run` to proxy requests to the backend. This provides:

- CORS handling
- Request timeout (20 seconds)
- Error handling and forwarding
- Clean separation between frontend and backend

## Example Prompts

Try these prompts to test the bot:

- "Track order ORD-1001"
- "Where is my order 55512?"
- "Wireless Mouse"
- "What is the price of Mechanical Keyboard?"
- "Tell me about P1004"
- "USB-C hub"

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **React 18**: UI library
- **CSS-in-JS**: Styled-jsx for component styling