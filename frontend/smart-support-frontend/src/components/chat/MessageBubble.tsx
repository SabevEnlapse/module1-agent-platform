/**
 * MessageBubble component - Displays a single chat message with all its metadata.
 * Features include avatars, copy button, intent badge, sources panel, and traces panel.
 */

"use client";

import * as React from "react";
import { Copy, Check, ChevronDown, ChevronUp, Bot, User, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChatMessage, Source, Trace } from "@/types/chat";
import { toast } from "sonner";

/**
 * MessageBubble component props.
 */
export interface MessageBubbleProps {
  /** The message to display */
  message: ChatMessage;
  /** Whether debug mode is enabled (shows traces) */
  debugMode?: boolean;
  /** Optional callback to retry a failed message */
  onRetry?: () => void;
}

/**
 * SourcesPanel component - Displays the sources used for the response.
 */
function SourcesPanel({ sources }: { sources: Source[] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronUp className="mr-1 h-3 w-3" />
        ) : (
          <ChevronDown className="mr-1 h-3 w-3" />
        )}
        Sources ({sources.length})
      </Button>
      
      {isExpanded && (
        <Card className="mt-2 p-3">
          <div className="space-y-2">
            {sources.map((source, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="shrink-0">
                  {source.type || "source"}
                </Badge>
                <div className="flex-1 space-y-1">
                  {source.product_id && (
                    <div className="text-xs text-muted-foreground">
                      Product: {source.product_id}
                    </div>
                  )}
                  {source.order_id && (
                    <div className="text-xs text-muted-foreground">
                      Order: {source.order_id}
                    </div>
                  )}
                  {source.score !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      Score: {source.score.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * TracesPanel component - Displays debug traces from the agent execution.
 */
function TracesPanel({ traces }: { traces: Trace[] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!traces || traces.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronUp className="mr-1 h-3 w-3" />
        ) : (
          <ChevronDown className="mr-1 h-3 w-3" />
        )}
        Debug Traces ({traces.length})
      </Button>
      
      {isExpanded && (
        <Card className="mt-2 p-3">
          <div className="space-y-2">
            {traces.map((trace, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {trace.step || `Step ${index + 1}`}
                  </Badge>
                  {trace.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(trace.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {trace.data && (
                  <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(trace.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * MessageBubble component - Renders a single chat message.
 * 
 * Features:
 * - Different styles for user vs assistant messages
 * - Avatar with initials or icon
 * - Copy to clipboard for assistant messages
 * - Intent badge for assistant messages
 * - Collapsible sources panel
 * - Collapsible traces panel (when debug mode is enabled)
 * - Retry button for failed user messages
 * 
 * @example
 * <MessageBubble
 *   message={message}
 *   debugMode={true}
 *   onRetry={() => retryMessage(message.id)}
 * />
 */
export function MessageBubble({
  message,
  debugMode = false,
  onRetry,
}: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";
  const isError = message.status === "error";

  /**
   * Copy message content to clipboard.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  /**
   * Format timestamp for display.
   */
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar (only for assistant) */}
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isUser && "items-end"
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-lg px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            isError && "bg-destructive text-destructive-foreground"
          )}
        >
          {/* Message text */}
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </div>

          {/* Intent badge (assistant only) */}
          {!isUser && message.responseMeta?.intent && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Intent: {message.responseMeta.intent}
              </Badge>
            </div>
          )}

          {/* Sources panel (assistant only) */}
          {!isUser && message.responseMeta?.sources && (
            <SourcesPanel sources={message.responseMeta.sources} />
          )}

          {/* Traces panel (assistant only, debug mode) */}
          {!isUser && debugMode && message.responseMeta?.traces && (
            <TracesPanel traces={message.responseMeta.traces} />
          )}
        </div>

        {/* Message actions and timestamp */}
        <div className="flex items-center gap-2">
          {/* Timestamp */}
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>

          {/* Copy button (assistant only) */}
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}

          {/* Retry button (user only, on error) */}
          {isUser && isError && onRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={onRetry}
              title="Retry message"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Avatar (only for user) */}
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}