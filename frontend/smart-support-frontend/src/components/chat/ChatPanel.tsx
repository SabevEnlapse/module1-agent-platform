/**
 * ChatPanel component - The main chat area displaying messages and handling auto-scroll.
 * Features include message list, typing indicator, scroll-to-bottom button, and empty state.
 */

"use client";

import * as React from "react";
import { ArrowDown, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageBubble } from "./MessageBubble";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

/**
 * Example prompts for the empty state.
 */
const EXAMPLE_PROMPTS = [
  "Track order ORD-1001",
  "Where is my order 55512?",
  "Wireless Mouse",
  "What is the price of Mechanical Keyboard?",
];

/**
 * ChatPanel component props.
 */
export interface ChatPanelProps {
  /** Array of messages to display */
  messages: ChatMessage[];
  /** Whether the assistant is currently typing */
  isTyping?: boolean;
  /** Whether debug mode is enabled */
  debugMode?: boolean;
  /** Optional callback to retry a failed message */
  onRetry?: (messageId: string) => void;
  /** Optional callback when an example prompt is clicked */
  onExamplePrompt?: (prompt: string) => void;
}

/**
 * ChatPanel component - Renders the main chat area.
 * 
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Scroll-to-bottom button when user scrolls up
 * - Typing indicator when assistant is responding
 * - Empty state with example prompts
 * - Smooth scrolling animations
 * 
 * @example
 * <ChatPanel
 *   messages={messages}
 *   isTyping={isLoading}
 *   debugMode={debugMode}
 *   onRetry={handleRetry}
 *   onExamplePrompt={handleExamplePrompt}
 * />
 */
export function ChatPanel({
  messages,
  isTyping = false,
  debugMode = false,
  onRetry,
  onExamplePrompt,
}: ChatPanelProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [isAtBottom, setIsAtBottom] = React.useState(true);

  /**
   * Scroll to the bottom of the chat.
   */
  const scrollToBottom = React.useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  /**
   * Check if the user is at the bottom of the chat.
   */
  const checkScrollPosition = React.useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const threshold = 100; // Distance from bottom to consider "at bottom"
    const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom);
  }, []);

  /**
   * Handle scroll events to show/hide the scroll-to-bottom button.
   */
  const handleScroll = React.useCallback(() => {
    checkScrollPosition();
  }, [checkScrollPosition]);

  /**
   * Auto-scroll to bottom when new messages arrive or typing state changes.
   */
  React.useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isTyping, isAtBottom, scrollToBottom]);

  /**
   * Set up scroll event listener.
   */
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  /**
   * Initial scroll to bottom when component mounts.
   */
  React.useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  return (
    <div className="relative flex h-full flex-col">
      {/* Chat messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        <div className="flex min-h-full flex-col">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md space-y-6 text-center">
                {/* Bot icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-8 w-8 text-primary" />
                </div>

                {/* Welcome message */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">
                    Welcome to Smart Support
                  </h2>
                  <p className="text-muted-foreground">
                    I can help you track orders, find products, and answer your questions.
                  </p>
                </div>

                {/* Example prompts */}
                {onExamplePrompt && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Try asking:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {EXAMPLE_PROMPTS.map((prompt, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer border-dashed transition-colors hover:border-primary/50 hover:bg-accent"
                          onClick={() => onExamplePrompt(prompt)}
                        >
                          <div className="p-3 text-sm">
                            {prompt}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-1 pb-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  debugMode={debugMode}
                  onRetry={
                    message.status === "error" && onRetry
                      ? () => onRetry(message.id)
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-3">
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}

          {/* Spacer for scroll */}
          <div className="h-4" />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg"
            onClick={() => scrollToBottom()}
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}