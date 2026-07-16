import { useMemo } from 'react'
import { 
  ChevronLeft, 
  Home, 
  Library,
  FileSpreadsheet,
  Type,
  Database,
  Folder,
  Terminal
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { TOOLS_CONFIG } from '../../config/tools'

export const Sidebar = () => {
  const { activeTool, setActiveTool, sidebarOpen, toggleSidebar } = useAppStore()

  // Generate Navigation list dynamically from Single Source of Truth tools configuration
  const navItems = useMemo(() => [
    { id: 'home' as const, label: 'Home', icon: Home, releaseDate: undefined },
    ...TOOLS_CONFIG.map(tool => ({
      id: tool.id,
      label: tool.sidebarLabel,
      icon: tool.icon,
      releaseDate: tool.releaseDate
    }))
  ], [])

  // Check if a release date is in the current calendar quarter of the current year
  const isNewTool = (releaseDate?: string): boolean => {
    if (!releaseDate) return false
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentQuarter = Math.floor(now.getMonth() / 3) // 0: Q1, 1: Q2, 2: Q3, 3: Q4

    const release = new Date(releaseDate)
    const releaseYear = release.getFullYear()
    const releaseQuarter = Math.floor(release.getMonth() / 3)

    return releaseYear === currentYear && releaseQuarter === currentQuarter
  }

  return (
    <aside 
      className={`bg-neutral-100 border-r border-neutral-250 dark:bg-neutral-900 dark:border-neutral-800 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } h-screen sticky top-0 shrink-0 select-none`}
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-250 dark:border-neutral-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 font-bold text-lg text-neutral-900 dark:text-white select-none">
            <div className="bg-violet-600/10 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400 p-1.5 rounded-lg border border-violet-500/20 dark:border-violet-500/30">
              <Library className="h-5 w-5" />
            </div>
            <span>Toolary</span>
            <span className="text-[10px] font-medium bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">
              v1.0
            </span>
          </div>
        ) : (
          <div className="mx-auto bg-violet-600/10 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400 p-1.5 rounded-lg border border-violet-500/20 dark:border-violet-500/30">
            <Library className="h-5 w-5" />
          </div>
        )}
        
        {sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 flex flex-col justify-between overflow-y-auto">
        {/* Main tools */}
        <div className="space-y-1 px-2">
          {sidebarOpen && (
            <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 px-3 uppercase tracking-wider mb-2">
              Tools
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTool === item.id
            const isNew = 'releaseDate' in item && isNewTool(item.releaseDate)

            return (
              <button
                key={item.id}
                onClick={() => setActiveTool(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-violet-600/10 text-violet-650 dark:bg-violet-600/20 dark:text-violet-300 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
                title={!sidebarOpen ? (isNew ? `${item.label} (New)` : item.label) : undefined}
              >
                <div className="relative shrink-0">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-violet-600 dark:text-violet-400' : ''}`} />
                  {!sidebarOpen && isNew && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-500 border border-neutral-100 dark:border-neutral-900 animate-pulse" />
                  )}
                </div>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && isNew && (
                  <span className="ml-auto text-[8px] font-extrabold bg-violet-600/10 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                    New
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Coming soon */}
        <div className="space-y-1 px-2 mt-4">
          {sidebarOpen && (
            <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 px-3 uppercase tracking-wider mb-2">
              Coming Soon
            </p>
          )}
          {[
            { label: 'CSV Workspace', icon: FileSpreadsheet },
            { label: 'Text Tools', icon: Type },
            { label: 'SQL Tools', icon: Database },
            { label: 'File Tools', icon: Folder },
            { label: 'Developer Tools', icon: Terminal },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={i}
                disabled
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60"
                title={!sidebarOpen ? `${item.label} (Coming Soon)` : undefined}
              >
                <div className="relative shrink-0">
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer / Info */}
      <div className="p-4 border-t border-neutral-250 dark:border-neutral-800 flex items-center justify-center">
        {sidebarOpen ? (
          <div className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-neutral-900 dark:text-white leading-none">Privacy Active</p>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-500 leading-none mt-1">Local execution only</p>
            </div>
          </div>
        ) : (
          <div 
            className="h-5 w-5 rounded-full bg-emerald-500/25 border border-emerald-500/35 flex items-center justify-center shrink-0 cursor-help"
            title="Privacy Mode: Active (Local Only)"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  )
}
