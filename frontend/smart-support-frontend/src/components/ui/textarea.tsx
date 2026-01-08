/**
 * Textarea component - A reusable multi-line text input field.
 * Built with Tailwind CSS for consistent styling.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea component props extending standard HTML textarea attributes.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Textarea component.
 * 
 * @example
 * <Textarea placeholder="Enter your message" rows={4} />
 * <Textarea disabled />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };