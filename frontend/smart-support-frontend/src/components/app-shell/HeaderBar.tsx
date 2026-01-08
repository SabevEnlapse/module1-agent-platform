/**
 * HeaderBar component - The top navigation bar with app branding and actions.
 * Features glassmorphism styling and brown-red neon accent.
 */

"use client";

import * as React from "react";
import { Bot, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * HeaderBar component props.
 */
export interface HeaderBarProps {
  /** Title of the current conversation (optional) */
  conversationTitle?: string;
  /** Callback when new chat button is clicked */
  onNewChat?: () => void;
  /** Whether to show the new chat button */
  showNewChat?: boolean;
}

/**
 * HeaderBar component - Renders the top navigation bar.
 * 
 * Features:
 * - Glassmorphism styling
 * - App branding with neon accent
 * - Theme toggle
 * - New chat button
 * - Settings button (placeholder)
 * 
 * @example
 * <HeaderBar
 *   conversationTitle="Track order ORD-1001"
 *   onNewChat={handleNewChat}
 *   showNewChat
 * />
 */
export function HeaderBar({
  conversationTitle,
  onNewChat,
  showNewChat = true,
}: HeaderBarProps) {
  return (
    <header className="glass sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 backdrop-blur-xl">
      {/* Left side - Logo and conversation title */}
      <div className="flex items-center gap-3">
        {/* App logo with neon glow */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-600 glow-ember">
          <Bot className="h-5 w-5 text-white" />
        </div>

        {/* App name */}
        <div className="hidden sm:block">
          <h1 className="flex items-center gap-2 text-sm font-semibold">
            Smart Support
            <Sparkles className="h-3 w-3 text-primary" />
          </h1>
        </div>

        {/* Conversation title (desktop only) */}
        {conversationTitle && (
          <>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <span className="hidden max-w-[200px] truncate text-sm text-muted-foreground sm:block">
              {conversationTitle}
            </span>
          </>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* New chat button (desktop) */}
        {showNewChat && onNewChat && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex btn-hover-glow focus-ring-ember"
            onClick={onNewChat}
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            New Chat
          </Button>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Settings button (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 focus-ring-ember"
          disabled
          title="Settings (coming soon)"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}