/**
 * AppShell component - The main application layout with sidebar, header, and chat area.
 * Provides a responsive layout with mobile sidebar support and glassmorphism styling.
 */

"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderBar } from "./HeaderBar";
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
 * - Glassmorphism header with neon accent
 * - Main chat area with messages and composer
 * - Mobile menu button to open sidebar
 * - Dark gradient background
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
      <HeaderBar
        conversationTitle={conversationTitle}
        onNewChat={handleNewConversation}
        showNewChat
      />

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
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Mobile menu button overlay */}
          <div className="lg:hidden flex items-center border-b bg-background/50 backdrop-blur-sm px-4 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="focus-ring-ember"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat panel */}
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            debugMode={debugMode}
            onRetry={onRetryMessage}
            onExamplePrompt={onExamplePrompt}
          />

          {/* Composer - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:left-[280px]">
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
    </div>
  );
}