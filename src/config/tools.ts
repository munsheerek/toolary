import { FileJson, Table } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ToolDefinition {
  id: 'json' | 'excel'
  title: string
  sidebarLabel: string
  description: string
  icon: LucideIcon
  releaseDate: string
  // Styling properties for dashboard card highlights
  glowColor: string
  hoverCardBorder: string
  hoverIconBorder: string
  hoverText: string
  hoverIcon: string
}

export const TOOLS_CONFIG: readonly ToolDefinition[] = [
  {
    id: 'json',
    title: 'JSON Workspace',
    sidebarLabel: 'JSON Workspace',
    description: 'Format, validate, inspect and transform JSON data.',
    icon: FileJson,
    glowColor: 'from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10',
    hoverCardBorder: 'hover:border-violet-500/30 dark:hover:border-violet-500/25',
    hoverIconBorder: 'group-hover:border-violet-500/30 dark:group-hover:border-violet-500/30',
    hoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-300',
    hoverIcon: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    releaseDate: '2026-07-15'
  },
  {
    id: 'excel',
    title: 'Excel Workspace',
    sidebarLabel: 'Excel Workspace',
    description: 'View, filter and convert spreadsheet files.',
    icon: Table,
    glowColor: 'from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10',
    hoverCardBorder: 'hover:border-blue-500/30 dark:hover:border-blue-500/25',
    hoverIconBorder: 'group-hover:border-blue-500/30 dark:group-hover:border-blue-500/30',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-300',
    hoverIcon: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    releaseDate: '2026-07-15'
  }
] as const
