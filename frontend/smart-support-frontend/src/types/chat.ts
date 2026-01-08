/**
 * Type definitions for the chat system.
 * These types define the data structures used throughout the chat application.
 */

/**
 * Role of a message sender - either the user or the assistant.
 */
export type Role = "user" | "assistant";

/**
 * Status of a message - indicates if it was sent successfully or encountered an error.
 */
export type MessageStatus = "sent" | "error";

/**
 * Response metadata from the backend agent.
 * Contains additional information about the assistant's response.
 */
export interface ResponseMeta {
  /** Unique identifier for the agent run */
  runId: string;
  /** Detected intent of the user's message */
  intent?: string;
  /** Sources/references used to generate the response */
  sources?: Source[];
  /** Debug traces from the agent execution */
  traces?: Trace[];
}

/**
 * Source information - references used by the agent to generate responses.
 * Can be product information or order details.
 */
export interface Source {
  /** Type of source (e.g., 'product', 'order') */
  type?: string;
  /** Product ID if source is a product */
  product_id?: string;
  /** Order ID if source is an order */
  order_id?: string;
  /** Relevance score of this source */
  score?: number;
  /** Additional source data */
  data?: Record<string, any>;
}

/**
 * Debug trace information from agent execution.
 * Shows the steps taken by the agent to generate a response.
 */
export interface Trace {
  /** Step name or description */
  step?: string;
  /** Timestamp of the trace */
  timestamp?: string;
  /** Additional trace data */
  data?: Record<string, any>;
}

/**
 * A single chat message in a conversation.
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Role of the message sender */
  role: Role;
  /** Content of the message */
  content: string;
  /** Timestamp when the message was created (Unix timestamp in milliseconds) */
  createdAt: number;
  /** Status of the message (for user messages) */
  status?: MessageStatus;
  /** Metadata for assistant responses */
  responseMeta?: ResponseMeta;
}

/**
 * A conversation containing multiple messages.
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: string;
  /** Title of the conversation (auto-generated from first message) */
  title: string;
  /** Timestamp when the conversation was created (Unix timestamp in milliseconds) */
  createdAt: number;
  /** Timestamp when the conversation was last updated (Unix timestamp in milliseconds) */
  updatedAt: number;
  /** Array of messages in this conversation */
  messages: ChatMessage[];
}

/**
 * Request payload for the agent run API.
 */
export interface AgentRunRequest {
  /** The user's message */
  message: string;
  /** Optional conversation ID for context (snake_case for backend compatibility) */
  conversation_id?: string;
  /** Optional user ID (nullable) */
  user_id?: string | null;
  /** Optional message history for context (only role and content) */
  history?: Array<{ role: Role; content: string }>;
}

/**
 * Response from the agent run API.
 */
export interface AgentRunResponse {
  /** Unique identifier for the agent run */
  run_id: string;
  /** The assistant's response text */
  answer: string;
  /** Detected intent of the user's message */
  intent: string | null;
  /** Sources/references used to generate the response */
  sources: any[];
  /** Result from tool execution */
  tool_result: any;
  /** Debug traces from agent execution */
  traces: any[];
}