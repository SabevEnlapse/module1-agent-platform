/**
 * AppShell component - The main application layout with sidebar, header, and chat area.
 * Provides a responsive layout with mobile sidebar support.
 */

"use client";

import * as React from "react";
import { Menu, Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Composer } from "@/components/chat/Composer";
import { Conversation, ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

/**
 * AppShell component props.
 */
export interface AppShellProps {
  /** Array of conversations */
  conversations: Conversation[];
  /** ID of the current conversation */
  currentConversationId: string | null;
  /** Messages in the current conversation */
  messages: ChatMessage[];
  /** Whether the assistant is currently typing */
  isTyping?: boolean;
  /** Whether debug mode is enabled */
  debugMode?: boolean;
  /** Callback when a conversation is selected */
  onSelectConversation: (id: string) => void;
  /** Callback when a new conversation is created */
  onNewConversation: () => void;
  /** Callback when a conversation is renamed */
  onRenameConversation: (id: string, newTitle: string) => void;
  /** Callback when a conversation is deleted */
  onDeleteConversation: (id: string) => void;
  /** Callback when a message is sent */
  onSendMessage: (message: string) => void;
  /** Callback when message input changes */
  onInputChange: (value: string) => void;
  /** Current input value */
  inputValue: string;
  /** Callback when a failed message is retried */
  onRetryMessage?: (messageId: string) => void;
  /** Callback when an example prompt is clicked */
  onExamplePrompt?: (prompt: string) => void;
  /** Callback to stop the current request */
  onStopRequest?: () => void;
}

/**
 * AppShell component - Renders the main application layout.
 * 
 * Features:
 * - Responsive sidebar (collapses on mobile)
 * - Header with app name, theme toggle, and new chat button
 * - Main chat area with messages and composer
 * - Mobile menu button to open sidebar
 * 
 * @example
 * <AppShell
 *   conversations={conversations}
 *   currentConversationId={currentId}
 *   messages={messages}
 *   isTyping={isLoading}
 *   debugMode={debugMode}
 *   onSelectConversation={handleSelect}
 *   onNewConversation={handleNew}
 *   onRenameConversation={handleRename}
 *   onDeleteConversation={handleDelete}
 *   onSendMessage={handleSend}
 *   onInputChange={setInput}
 *   inputValue={input}
 *   onRetryMessage={handleRetry}
 *   onExamplePrompt={handleExample}
 *   onStopRequest={handleStop}
 * />
 */
export function AppShell({
  conversations,
  currentConversationId,
  messages,
  isTyping = false,
  debugMode = false,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onSendMessage,
  onInputChange,
  inputValue,
  onRetryMessage,
  onExamplePrompt,
  onStopRequest,
}: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);

  /**
   * Get the current conversation title.
   */
  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );
  const conversationTitle = currentConversation?.title || "New Chat";

  /**
   * Handle new conversation click.
   */
  const handleNewConversation = () => {
    onNewConversation();
    setIsMobileSidebarOpen(false);
  };

  /**
   * Check if the send button should be disabled.
   */
  const isSendDisabled = !inputValue.trim() || isTyping;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* App logo and title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold">Smart Support</h1>
            </div>
          </div>

          {/* Conversation title (desktop only) */}
          {currentConversationId && (
            <>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <span className="hidden truncate text-sm text-muted-foreground sm:block">
                {conversationTitle}
              </span>
            </>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          {/* New chat button (desktop) */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex"
            onClick={handleNewConversation}
          >
            <Menu className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Settings button (placeholder) */}
          <Button variant="ghost" size="icon" disabled title="Settings (coming soon)">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={onSelectConversation}
            onNewConversation={onNewConversation}
            onRenameConversation={onRenameConversation}
            onDeleteConversation={onDeleteConversation}
            isOpen={isDesktopSidebarOpen}
          />
        </div>

        {/* Mobile sidebar (sheet) */}
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isSheet
        />

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Chat panel */}
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            debugMode={debugMode}
            onRetry={onRetryMessage}
            onExamplePrompt={onExamplePrompt}
          />

          {/* Composer */}
          <Composer
            value={inputValue}
            onChange={onInputChange}
            onSubmit={() => onSendMessage(inputValue)}
            isLoading={isTyping}
            disabled={isSendDisabled}
            placeholder="Type your message..."
            onStop={onStopRequest}
          />
        </div>
      </div>
    </div>
  );
}