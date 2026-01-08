/**
 * Next.js API route that proxies requests to the backend agent endpoint.
 * 
 * This route acts as a proxy between the frontend and the backend,
 * handling CORS and providing a clean API surface for the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend URL from environment variable
const BACKEND_URL = process.env.BACKEND_URL;

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 20000;

/**
 * POST handler for the agent run proxy route.
 * 
 * Forwards the request body to the backend /agent/run endpoint
 * and returns the response. Handles errors and timeouts gracefully.
 * 
 * @param request - The incoming Next.js request
 * @returns NextResponse with the backend response or error
 */
export async function POST(request: NextRequest) {
  // Check if backend URL is configured
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: 'Backend URL not configured. Please set BACKEND_URL environment variable.' },
      { status: 500 }
    );
  }

  try {
    // Parse the request body
    const body = await request.json();

    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    // If the backend returned a non-2xx status, forward the error
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Backend request failed' },
        { status: response.status }
      );
    }

    // Parse and return the backend response
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. Backend did not respond in time.' },
        { status: 504 }
      );
    }

    // Handle other errors
    console.error('Error proxying to backend:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with backend' },
      { status: 500 }
    );
  }
}