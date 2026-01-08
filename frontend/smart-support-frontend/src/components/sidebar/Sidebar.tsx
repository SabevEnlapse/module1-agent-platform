/**
 * Sidebar component - Displays the conversation list with management actions.
 * Features include new conversation, rename, delete, and mobile sheet support.
 * Styled with glassmorphism and brown-red neon accent.
 */

"use client";

import * as React from "react";
import { Plus, MessageSquare, MoreHorizontal, Trash2, Edit2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";
import { toast } from "sonner";

/**
 * Sidebar component props.
 */
export interface SidebarProps {
  /** Array of conversations to display */
  conversations: Conversation[];
  /** ID of the currently selected conversation */
  currentConversationId: string | null;
  /** Callback when a conversation is selected */
  onSelectConversation: (id: string) => void;
  /** Callback when a new conversation is created */
  onNewConversation: () => void;
  /** Callback when a conversation is renamed */
  onRenameConversation: (id: string, newTitle: string) => void;
  /** Callback when a conversation is deleted */
  onDeleteConversation: (id: string) => void;
  /** Whether the sidebar is open (for mobile) */
  isOpen?: boolean;
  /** Callback when sidebar is closed (for mobile) */
  onClose?: () => void;
  /** Whether to render as a sheet (for mobile) */
  isSheet?: boolean;
}

/**
 * Format timestamp for display.
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * ConversationItem component - Displays a single conversation in the list.
 */
function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(conversation.title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Handle rename submission.
   */
  const handleRenameSubmit = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== conversation.title) {
      onRename();
    } else {
      setEditTitle(conversation.title);
    }
    setIsEditing(false);
  };

  /**
   * Handle rename cancel.
   */
  const handleRenameCancel = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  /**
   * Focus input when editing starts.
   */
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /**
   * Handle keyboard events in edit mode.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary glow-subtle"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      {/* Conversation icon */}
      <MessageSquare className={cn(
        "h-4 w-4 shrink-0",
        isActive && "text-primary"
      )} />

      {/* Conversation title or edit input */}
      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleRenameSubmit}
            className="h-7 px-2 py-1 text-sm focus-ring-ember"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 p-0"
            onClick={handleRenameCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          onClick={onSelect}
          className="flex flex-1 truncate text-left"
        >
          <span className="truncate">{conversation.title}</span>
        </button>
      )}

      {/* Message count badge */}
      {!isEditing && conversation.messages.length > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          {conversation.messages.length}
        </span>
      )}

      {/* Actions dropdown (only show on hover or when active) */}
      {!isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100",
                isActive && "opacity-100"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/**
 * Sidebar component - Renders the conversation list sidebar.
 * 
 * Features:
 * - Display all conversations
 * - Create new conversation
 * - Select conversation
 * - Rename conversation
 * - Delete conversation
 * - Mobile sheet support
 * - Active conversation highlighting with neon glow
 * - Message count badges
 * - Last updated timestamps
 * 
 * @example
 * <Sidebar
 *   conversations={conversations}
 *   currentConversationId={currentId}
 *   onSelectConversation={handleSelect}
 *   onNewConversation={handleNew}
 *   onRenameConversation={handleRename}
 *   onDeleteConversation={handleDelete}
 *   isOpen={isSidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   isSheet={isMobile}
 * />
 */
export function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  isOpen = true,
  onClose,
  isSheet = false,
}: SidebarProps) {
  /**
   * Handle conversation selection.
   */
  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    if (isSheet && onClose) {
      onClose();
    }
  };

  /**
   * Handle conversation rename.
   */
  const handleRenameConversation = (id: string, newTitle: string) => {
    onRenameConversation(id, newTitle);
    toast.success("Conversation renamed");
  };

  /**
   * Handle conversation delete.
   */
  const handleDeleteConversation = (id: string) => {
    onDeleteConversation(id);
    toast.success("Conversation deleted");
  };

  /**
   * Sort conversations by updated date (newest first).
   */
  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 btn-hover-glow focus-ring-ember"
          onClick={onNewConversation}
          title="New conversation"
        >
          <Plus className="h-4 w-4 text-primary" />
        </Button>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="space-y-1 p-2">
          {sortedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-3 py-12 text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Start a new one!
              </p>
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <div key={conversation.id}>
                <ConversationItem
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  onSelect={() => handleSelectConversation(conversation.id)}
                  onRename={() => {
                    const newTitle = prompt(
                      "Enter new title:",
                      conversation.title
                    );
                    if (newTitle) {
                      handleRenameConversation(conversation.id, newTitle);
                    }
                  }}
                  onDelete={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete this conversation?"
                      )
                    ) {
                      handleDeleteConversation(conversation.id);
                    }
                  }}
                />
                {/* Last updated timestamp */}
                {conversation.id === currentConversationId && (
                  <div className="ml-9 mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/70">
                    <Clock className="h-3 w-3" />
                    {formatTime(conversation.updatedAt)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Render as sheet for mobile
  if (isSheet) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="left" className="w-[280px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Render as regular sidebar for desktop
  return (
    <aside
      className={cn(
        "glass flex h-full w-[280px] flex-col border-r transition-all",
        !isOpen && "hidden"
      )}
    >
      {sidebarContent}
    </aside>
  );
}