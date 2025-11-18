// AppShell Layout Component (scaffold)
import type { ReactNode } from 'react'

export interface AppShellProps {
  children: ReactNode
}

/**
 * AppShell - Layout wrapper component for all pages
 * Provides consistent navigation and page structure
 *
 * Will be completed in Phase 6 (User Story 4) with:
 * - Sidebar navigation
 * - Responsive behavior
 * - Mobile drawer
 */
export function AppShell({ children }: AppShellProps) {
  // Scaffold implementation - just renders children for now
  // Will be enhanced in User Story 4 with Sidebar component
  return <div className="app-shell">{children}</div>
}
