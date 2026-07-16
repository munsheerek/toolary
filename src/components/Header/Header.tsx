import { 
  Menu, 
  Search, 
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'

export const Header: React.FC = () => {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    activeTool,
    setCommandPaletteOpen 
  } = useAppStore()

  const getToolTitle = () => {
    switch (activeTool) {
      case 'json':
        return 'JSON Formatter & Viewer'
      case 'excel':
        return 'Excel / CSV Viewer'
      case 'home':
      default:
        return 'Home Dashboard'
    }
  }

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <header className="h-16 border-b border-neutral-250 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md transition-colors mr-2 cursor-pointer"
            title="Expand Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400 dark:text-neutral-500 font-medium">Toolary</span>
          <span className="text-neutral-350 dark:text-neutral-600">/</span>
          <span className="text-neutral-900 dark:text-neutral-200 font-semibold">{getToolTitle()}</span>
        </div>
      </div>

      {/* Center Search Trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-200/60 dark:hover:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 text-neutral-500 hover:text-neutral-450 dark:hover:text-neutral-400 rounded-lg text-xs font-mono transition-all outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search commands...</span>
          </div>
          <kbd className="bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-450 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700/80 text-[10px]">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Privacy Shield Info */}
        <div 
          className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-605 dark:text-emerald-450 text-xs rounded-full font-medium"
          title="Security guarantee: All file transformations occur in the browser environment."
        >
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-550 dark:bg-emerald-400 animate-pulse" />
          <span>Your data stays on your device.</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}
