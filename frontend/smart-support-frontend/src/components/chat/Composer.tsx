/**
 * Composer component - The message input area at the bottom of the chat.
 * Handles user input, keyboard shortcuts (Enter to send, Shift+Enter for newline),
 * and provides send/stop buttons.
 */

"use client";

import * as React from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Composer component props.
 */
export interface ComposerProps {
  /** Current input value */
  value: string;
  /** Callback when input value changes */
  onChange: (value: string) => void;
  /** Callback when user submits the message */
  onSubmit: () => void;
  /** Whether a message is currently being sent */
  isLoading?: boolean;
  /** Whether the send button should be disabled */
  disabled?: boolean;
  /** Optional placeholder text */
  placeholder?: string;
  /** Maximum character count (optional) */
  maxLength?: number;
  /** Optional callback to stop the current request */
  onStop?: () => void;
}

/**
 * Composer component - Renders the message input area.
 * 
 * Features:
 * - Auto-resizing textarea
 * - Enter to send, Shift+Enter for newline
 * - Character counter (optional)
 * - Send button with loading state
 * - Stop button (when loading)
 * - Disabled attach button (placeholder for future functionality)
 * 
 * @example
 * <Composer
 *   value={input}
 *   onChange={setInput}
 *   onSubmit={handleSubmit}
 *   isLoading={isSending}
 *   disabled={!input.trim()}
 * />
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  maxLength,
  onStop,
}: ComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize the textarea based on content.
   */
  const autoResize = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  /**
   * Handle keyboard events.
   * - Enter: Send message
   * - Shift+Enter: New line
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isLoading) {
        onSubmit();
      }
    }
  };

  /**
   * Handle input change and auto-resize.
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    onChange(newValue);
    autoResize();
  };

  /**
   * Focus the textarea when component mounts.
   */
  React.useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto flex max-w-3xl gap-2">
        {/* Attach button (disabled for now) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled
          title="Attach files (coming soon)"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[44px] max-h-[200px] resize-none py-3 pr-12"
            rows={1}
          />
          
          {/* Clear button when there's content */}
          {value && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Send/Stop button */}
        {isLoading ? (
          <Button
            type="button"
            variant="default"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={onStop}
            title="Stop generating"
          >
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={onSubmit}
            disabled={disabled}
            title="Send message (Enter)"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Character counter */}
      {maxLength && (
        <div className="mx-auto mt-2 max-w-3xl text-right">
          <span
            className={cn(
              "text-xs text-muted-foreground",
              value.length > maxLength * 0.9 && "text-destructive"
            )}
          >
            {value.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}