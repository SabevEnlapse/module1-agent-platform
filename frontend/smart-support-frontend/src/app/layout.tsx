/**
 * Root layout component for the Smart Support application.
 * Provides the ThemeProvider and global styles.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

/**
 * Inter font for the application.
 */
const inter = Inter({ subsets: ["latin"] });

/**
 * Metadata for the application.
 */
export const metadata: Metadata = {
  title: "Smart Support - AI Customer Service",
  description: "Intelligent customer support powered by AI",
};

/**
 * Root layout component.
 * Wraps the application with ThemeProvider and includes global styles.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
