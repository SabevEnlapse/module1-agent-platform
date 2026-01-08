/**
 * Chat component for the Smart Customer Support Bot.
 * 
 * Provides a chat interface with:
 * - Message input and send button
 * - Message list showing user and assistant messages
 * - Loading indicator while awaiting response
 * - Error display for failed requests
 * - Optional intent display
 */

'use client';

import { useState, FormEvent } from 'react';

/**
 * Type for a chat message
 */
interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
}

/**
 * Type for the API response
 */
interface AgentResponse {
  run_id: string;
  answer: string;
  intent: string | null;
  sources: any[];
  tool_result: any;
  traces: any[];
}

/**
 * Chat component
 */
export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission to send a message
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Don't send empty messages
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to the list
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call the API proxy route
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data: AgentResponse = await response.json();

      // Add assistant response to the list
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          intent: data.intent || undefined,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Smart Customer Support</h1>
        <p>Ask about orders or products</p>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Try asking:</p>
            <ul>
              <li>"Track order ORD-1001"</li>
              <li>"Where is my order 55512?"</li>
              <li>"Wireless Mouse"</li>
              <li>"What is the price of Mechanical Keyboard?"</li>
            </ul>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              {message.intent && (
                <div className="message-intent">Intent: {message.intent}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .chat-header h1 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .chat-header p {
          margin: 0;
          color: #666;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .empty-state {
          text-align: center;
          color: #666;
          padding: 40px 20px;
        }

        .empty-state ul {
          text-align: left;
          display: inline-block;
          margin-top: 10px;
          padding-left: 20px;
        }

        .empty-state li {
          margin: 5px 0;
        }

        .message {
          margin-bottom: 15px;
          display: flex;
        }

        .user-message {
          justify-content: flex-end;
        }

        .assistant-message {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 8px;
        }

        .user-message .message-content {
          background: #007bff;
          color: white;
        }

        .assistant-message .message-content {
          background: white;
          color: #333;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .message-text {
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .message-intent {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 5px;
        }

        .assistant-message .message-intent {
          color: #666;
        }

        .loading-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .loading-indicator span {
          width: 8px;
          height: 8px;
          background: #007bff;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .input-form {
          display: flex;
          gap: 10px;
        }

        .input-form input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .input-form input:focus {
          outline: none;
          border-color: #007bff;
        }

        .input-form button {
          padding: 12px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        }

        .input-form button:hover:not(:disabled) {
          background: #0056b3;
        }

        .input-form button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}