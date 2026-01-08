/**
 * DebugToggle component - A toggle button for enabling/disabling debug mode.
 * Styled with brown-red neon accent.
 */

"use client";

import * as React from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * DebugToggle component props.
 */
export interface DebugToggleProps {
  /** Whether debug mode is enabled */
  enabled: boolean;
  /** Callback to toggle debug mode */
  onToggle: () => void;
  /** Optional size variant */
  size?: "sm" | "default" | "icon";
}

/**
 * DebugToggle component - Renders a toggle button for debug mode.
 * 
 * Features:
 * - Visual indication of debug state
 * - Neon glow when enabled
 * - Multiple size variants
 * 
 * @example
 * <DebugToggle
 *   enabled={debugMode}
 *   onToggle={() => setDebugMode(!debugMode)}
 *   size="sm"
 * />
 */
export function DebugToggle({
  enabled,
  onToggle,
  size = "default",
}: DebugToggleProps) {
  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    default: "h-9 px-3 text-sm",
    icon: "h-9 w-9",
  };

  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size={size === "icon" ? "icon" : "sm"}
      className={cn(
        sizeClasses[size],
        enabled
          ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 glow-subtle"
          : "hover:bg-primary/5 hover:text-primary"
      )}
      onClick={onToggle}
      title={enabled ? "Disable debug mode" : "Enable debug mode"}
    >
      <Bug className={cn(size === "icon" ? "h-4 w-4" : "mr-2 h-3 w-3")} />
      {size !== "icon" && <span>Debug</span>}
    </Button>
  );
}