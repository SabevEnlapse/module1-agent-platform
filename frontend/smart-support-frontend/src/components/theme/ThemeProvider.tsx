/**
 * ThemeProvider component - Provides theme context to the application.
 * Uses next-themes for theme management with localStorage persistence.
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Define the ThemeProviderProps type locally to avoid import issues
// Using 'any' for props to avoid type conflicts with next-themes
export interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: any;
}

/**
 * ThemeProvider component - Wraps the app to provide theme context.
 * 
 * @param children - Child components to be wrapped
 * @param props - Additional theme provider props
 * 
 * @example
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}