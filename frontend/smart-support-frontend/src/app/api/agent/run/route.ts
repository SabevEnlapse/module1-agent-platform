/**
 * Next.js API route that proxies requests to the backend agent endpoint.
 *
 * This route acts as a proxy between the frontend and the backend,
 * handling CORS, payload normalization, and providing a clean API surface.
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend URL from environment variable
const BACKEND_URL = process.env.BACKEND_URL;

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 20000;

/**
 * Normalizes the request payload to match backend schema.
 * Converts camelCase to snake_case and filters history items.
 *
 * @param body - The raw request body from the frontend
 * @returns Normalized payload matching backend expectations
 */
function normalizePayload(body: any): any {
  const normalized: any = {
    message: body.message,
    conversation_id: body.conversation_id || body.conversationId || null,
    user_id: body.user_id || body.userId || null,
    history: [],
  };

  // Validate message is a non-empty string
  if (typeof normalized.message !== 'string' || normalized.message.trim() === '') {
    throw new Error('Message must be a non-empty string');
  }

  // Normalize history items - only include role and content
  if (Array.isArray(body.history)) {
    normalized.history = body.history
      .filter((item: any) => {
        // Runtime guard: ensure item has required fields
        return (
          item &&
          typeof item === 'object' &&
          typeof item.role === 'string' &&
          typeof item.content === 'string'
        );
      })
      .map((item: any) => ({
        role: item.role,
        content: item.content,
      }));
  }

  return normalized;
}

/**
 * POST handler for the agent run proxy route.
 *
 * Normalizes the request payload, validates it, and forwards to the backend.
 * Handles errors and timeouts gracefully.
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

    // Normalize and validate the payload
    let normalizedBody;
    try {
      normalizedBody = normalizePayload(body);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid request payload' },
        { status: 400 }
      );
    }

    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Forward the normalized request to the backend
    const response = await fetch(`${BACKEND_URL}/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedBody),
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