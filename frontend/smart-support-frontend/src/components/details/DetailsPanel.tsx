/**
 * DetailsPanel component - A collapsible panel showing debug information and metadata.
 * Features include debug traces, sources, and conversation details.
 * Styled with glassmorphism and brown-red neon accent.
 */

"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Bug, Info, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";

/**
 * DetailsPanel component props.
 */
export interface DetailsPanelProps {
  /** Current messages in the conversation */
  messages: ChatMessage[];
  /** Whether debug mode is enabled */
  debugMode: boolean;
  /** Callback to toggle debug mode */
  onToggleDebug: () => void;
  /** Whether the panel is open */
  isOpen?: boolean;
  /** Callback to toggle panel open/close */
  onToggleOpen?: () => void;
}

/**
 * Format timestamp for display.
 */
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * DetailsPanel component - Renders the details/debug panel.
 * 
 * Features:
 * - Collapsible panel
 * - Debug mode toggle
 * - Display of all message metadata
 * - Sources and traces display
 * - Glassmorphism styling
 * 
 * @example
 * <DetailsPanel
 *   messages={messages}
 *   debugMode={debugMode}
 *   onToggleDebug={() => setDebugMode(!debugMode)}
 *   isOpen={isDetailsOpen}
 *   onToggleOpen={() => setIsDetailsOpen(!isDetailsOpen)}
 * />
 */
export function DetailsPanel({
  messages,
  debugMode,
  onToggleDebug,
  isOpen = false,
  onToggleOpen,
}: DetailsPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="glass border-l backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Details</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Debug toggle */}
          <Button
            variant={debugMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-7 text-xs",
              debugMode && "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
            )}
            onClick={onToggleDebug}
          >
            <Bug className="mr-1.5 h-3 w-3" />
            Debug
          </Button>
          {/* Close button */}
          {onToggleOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleOpen}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-3.5rem-3.5rem)] scrollbar-thin">
        <div className="p-4 space-y-4">
          {/* Conversation info */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-xs font-semibold">Conversation Info</h4>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total Messages:</span>
                <span className="text-foreground">{messages.length}</span>
              </div>
              {messages.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>First Message:</span>
                    <span className="text-foreground">
                      {formatTimestamp(messages[0].createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Message:</span>
                    <span className="text-foreground">
                      {formatTimestamp(messages[messages.length - 1].createdAt)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Messages with metadata */}
          {messages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold">Messages</h4>
              {messages.map((message, index) => (
                <Card
                  key={message.id}
                  className="border-border/50 bg-card/50 backdrop-blur-sm p-3"
                >
                  {/* Message header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={message.role === "user" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {message.role}
                      </Badge>
                      {message.status === "error" && (
                        <Badge variant="destructive" className="text-xs">
                          Error
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Message content preview */}
                  <div className="mb-2 text-xs text-muted-foreground line-clamp-2">
                    {message.content}
                  </div>

                  {/* Metadata */}
                  {message.responseMeta && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-border/50">
                      {/* Run ID */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Run ID:</span>
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-primary">
                          {message.responseMeta.runId}
                        </code>
                      </div>

                      {/* Intent */}
                      {message.responseMeta.intent && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Intent:</span>
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {message.responseMeta.intent}
                          </Badge>
                        </div>
                      )}

                      {/* Sources */}
                      {message.responseMeta.sources && message.responseMeta.sources.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Sources:</span>
                          <div className="flex flex-wrap gap-1">
                            {message.responseMeta.sources.map((source, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {source.type || "source"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Traces (only in debug mode) */}
                      {debugMode && message.responseMeta.traces && message.responseMeta.traces.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Traces:</span>
                          <div className="space-y-1">
                            {message.responseMeta.traces.map((trace, idx) => (
                              <div key={idx} className="bg-muted/50 p-2 rounded text-xs">
                                <div className="font-medium text-primary">
                                  {trace.step || `Step ${idx + 1}`}
                                </div>
                                {trace.data && (
                                  <pre className="mt-1 overflow-x-auto text-[10px] text-muted-foreground">
                                    {JSON.stringify(trace.data, null, 2)}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Info className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No messages yet
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}