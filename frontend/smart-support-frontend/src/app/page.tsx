/**
 * Main page component for the Smart Support application.
 * Manages the chat state, conversations, and API interactions.
 * Features glassmorphism styling and brown-red neon accent.
 */

"use client";

import * as React from "react";
import { Layers } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { DetailsPanel } from "@/components/details/DetailsPanel";
import { Conversation, ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import {
  getConversations,
  saveConversations,
  createConversation,
  addMessageToConversation,
  updateConversation,
  deleteConversation,
  getCurrentConversationId,
  setCurrentConversationId,
  clearCurrentConversationId,
  getDebugMode,
  setDebugMode,
} from "@/lib/storage";
import { runAgent, createUserMessage, agentResponseToMessage } from "@/lib/api";
import { toast } from "sonner";

/**
 * Main page component.
 * 
 * Features:
 * - Conversation management (create, select, rename, delete)
 * - Message sending and receiving
 * - Loading states
 * - Error handling
 * - Debug mode toggle
 * - Details panel for debug information
 * - LocalStorage persistence
 */
export default function Home() {
  // Conversation state
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationIdState] =
    React.useState<string | null>(null);

  // Message state
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Debug mode state
  const [debugMode, setDebugModeState] = React.useState(false);

  // Details panel state
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  // Abort controller for stopping requests
  const abortControllerRef = React.useRef<AbortController | null>(null);

  /**
   * Load conversations from localStorage on mount.
   */
  React.useEffect(() => {
    const loadedConversations = getConversations();
    setConversations(loadedConversations);

    const currentId = getCurrentConversationId();
    if (currentId) {
      const currentConv = loadedConversations.find((c) => c.id === currentId);
      if (currentConv) {
        setCurrentConversationIdState(currentId);
        setMessages(currentConv.messages);
      }
    }

    setDebugModeState(getDebugMode());
  }, []);

  /**
   * Handle creating a new conversation.
   */
  const handleNewConversation = () => {
    const newConversation = createConversation("New Chat");
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setCurrentConversationIdState(newConversation.id);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    setInput("");
  };

  /**
   * Handle selecting a conversation.
   */
  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      setCurrentConversationIdState(id);
      setCurrentConversationId(id);
      setMessages(conversation.messages);
    }
  };

  /**
   * Handle renaming a conversation.
   */
  const handleRenameConversation = (id: string, newTitle: string) => {
    const updatedConversation = updateConversation(id, { title: newTitle });
    if (updatedConversation) {
      const updatedConversations = conversations.map((c) =>
        c.id === id ? updatedConversation : c
      );
      setConversations(updatedConversations);
    }
  };

  /**
   * Handle deleting a conversation.
   */
  const handleDeleteConversation = (id: string) => {
    const success = deleteConversation(id);
    if (success) {
      const updatedConversations = conversations.filter((c) => c.id !== id);
      setConversations(updatedConversations);

      // If we deleted the current conversation, clear it
      if (id === currentConversationId) {
        setCurrentConversationIdState(null);
        clearCurrentConversationId();
        setMessages([]);
      }
    }
  };

  /**
   * Handle sending a message.
   */
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) {
      return;
    }

    const trimmedMessage = messageContent.trim();
    setInput("");
    setIsLoading(true);

    // Create or get current conversation
    let conversationId: string;
    let currentConv = currentConversationId
      ? conversations.find((c) => c.id === currentConversationId)
      : undefined;

    if (!currentConv) {
      // Create new conversation with the first message as title
      currentConv = createConversation(trimmedMessage);
      conversationId = currentConv.id;
      const updatedConversations = [currentConv, ...conversations];
      setConversations(updatedConversations);
      saveConversations(updatedConversations);
      setCurrentConversationIdState(conversationId);
      setCurrentConversationId(conversationId);
    } else {
      conversationId = currentConv.id;
    }

    // Create user message
    const userMessage = createUserMessage(trimmedMessage);

    // Add user message to state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message to conversation
    addMessageToConversation(conversationId, userMessage);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Call the API
      const response = await runAgent(
        trimmedMessage,
        conversationId,
        updatedMessages,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      // Create assistant message
      const assistantMessage = agentResponseToMessage(response);

      // Add assistant message to state
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save assistant message to conversation
      addMessageToConversation(conversationId, assistantMessage);

      // Update conversation title if this is the first message
      if (updatedMessages.length === 1) {
        const updatedConv = updateConversation(conversationId, {
          title: trimmedMessage.substring(0, 40),
        });
        if (updatedConv) {
          const updatedConversations = conversations.map((c) =>
            c.id === conversationId ? updatedConv : c
          );
          setConversations(updatedConversations);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      toast.error(errorMessage);

      // Mark user message as error
      const errorUserMessage: ChatMessage = {
        ...userMessage,
        status: "error",
      };
      const errorMessages = updatedMessages.map((m) =>
        m.id === userMessage.id ? errorUserMessage : m
      );
      setMessages(errorMessages);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  /**
   * Handle retrying a failed message.
   */
  const handleRetryMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.role === "user") {
      // Remove the failed message and any subsequent messages
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const messagesToKeep = messages.slice(0, messageIndex);
      setMessages(messagesToKeep);

      // Retry sending the message
      handleSendMessage(message.content);
    }
  };

  /**
   * Handle clicking an example prompt.
   */
  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt);
    // Auto-send after a short delay
    setTimeout(() => {
      handleSendMessage(prompt);
    }, 100);
  };

  /**
   * Handle stopping the current request.
   */
  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast.info("Request stopped");
    }
  };

  /**
   * Toggle debug mode.
   */
  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugModeState(newDebugMode);
    setDebugMode(newDebugMode);
    toast.success(`Debug mode ${newDebugMode ? "enabled" : "disabled"}`);
  };

  return (
    <main className="flex h-screen w-full overflow-hidden">
      {/* Main app shell */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppShell
          conversations={conversations}
          currentConversationId={currentConversationId}
          messages={messages}
          isTyping={isLoading}
          debugMode={debugMode}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onSendMessage={handleSendMessage}
          onInputChange={setInput}
          inputValue={input}
          onRetryMessage={handleRetryMessage}
          onExamplePrompt={handleExamplePrompt}
          onStopRequest={handleStopRequest}
        />
      </div>

      {/* Details panel (collapsible) */}
      <DetailsPanel
        messages={messages}
        debugMode={debugMode}
        onToggleDebug={toggleDebugMode}
        isOpen={isDetailsOpen}
        onToggleOpen={() => setIsDetailsOpen(!isDetailsOpen)}
      />

      {/* Floating toggle button for details panel */}
      <button
        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        className={cn(
          "fixed right-4 top-20 z-50 flex h-10 w-10 items-center justify-center rounded-xl glass transition-all duration-200 hover:scale-110 focus-ring-ember",
          isDetailsOpen && "bg-primary/10 border-primary/30"
        )}
        title={isDetailsOpen ? "Close details" : "Open details"}
      >
        <Layers className={cn(
          "h-5 w-5 transition-colors",
          isDetailsOpen ? "text-primary" : "text-muted-foreground"
        )} />
      </button>
    </main>
  );
}