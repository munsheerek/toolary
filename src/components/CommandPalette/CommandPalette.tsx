import { useState, useEffect, useRef, useMemo } from 'react'
import { 
  Search, 
  FileJson, 
  Table, 
  Key, 
  X,
  Sidebar,
  Moon
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcuts'

interface CommandItem {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  action: () => void
}

export const CommandPalette = () => {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen,
    triggerFormat,
    setActiveTool,
    toggleTheme,
    toggleSidebar,
    showToast
  } = useAppStore()

  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Toggle command palette on Cmd+K or Ctrl+K
  useKeyboardShortcut({ key: 'k', ctrlOrCmd: true }, () => {
    setCommandPaletteOpen(!commandPaletteOpen)
  })

  // Close command palette on Escape
  useEffect(() => {
    if (!commandPaletteOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setCommandPaletteOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen])

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('')
      setSelectedIndex(0)
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [commandPaletteOpen])

  // Generate UUID
  const handleGenerateUUID = () => {
    try {
      const uuid = crypto.randomUUID()
      navigator.clipboard.writeText(uuid)
      showToast(`UUID Generated & Copied: ${uuid}`, 'success')
      setCommandPaletteOpen(false)
    } catch (e) {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
      navigator.clipboard.writeText(uuid)
      showToast(`UUID Generated & Copied: ${uuid}`, 'success')
      setCommandPaletteOpen(false)
    }
  }

  const commands: CommandItem[] = [
    {
      id: 'format-json',
      title: 'Format JSON',
      subtitle: 'Pretty print, validate and clean up JSON code',
      icon: FileJson,
      shortcut: '⌥↵',
      action: () => triggerFormat()
    },
    {
      id: 'open-excel',
      title: 'Open Excel Viewer',
      subtitle: 'Analyze and view CSV, XLS, and XLSX spreadsheet files',
      icon: Table,
      action: () => {
        setActiveTool('excel')
        setCommandPaletteOpen(false)
      }
    },
    {
      id: 'generate-uuid',
      title: 'Generate UUID',
      subtitle: 'Create a unique UUID v4 and copy it to clipboard',
      icon: Key,
      action: handleGenerateUUID
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Color Theme',
      subtitle: 'Switch between Dark and Light mode',
      icon: Moon,
      action: () => {
        toggleTheme()
        setCommandPaletteOpen(false)
      }
    },
    {
      id: 'toggle-sidebar',
      title: 'Toggle Sidebar',
      subtitle: 'Collapse or expand navigation sidebar',
      icon: Sidebar,
      action: () => {
        toggleSidebar()
        setCommandPaletteOpen(false)
      }
    }
  ]

  // Filter commands by search term
  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(search.toLowerCase()) || 
      cmd.subtitle.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  // Handle arrow keys and enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filteredCommands[selectedIndex].action()
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) return

    const selectedElement = listElement.children[selectedIndex] as HTMLElement
    if (!selectedElement) return

    const listHeight = listElement.clientHeight
    const elementTop = selectedElement.offsetTop
    const elementHeight = selectedElement.clientHeight

    if (elementTop + elementHeight > listElement.scrollTop + listHeight) {
      listElement.scrollTop = elementTop + elementHeight - listHeight
    } else if (elementTop < listElement.scrollTop) {
      listElement.scrollTop = elementTop
    }
  }, [selectedIndex])

  if (!commandPaletteOpen) return null


  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 select-none animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette Box */}
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[400px]">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-neutral-250 dark:border-neutral-800 h-12 gap-2 bg-neutral-100/40 dark:bg-neutral-900/40">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 text-neutral-905 dark:text-white text-sm outline-none placeholder-neutral-400 dark:placeholder-neutral-500"
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded text-neutral-450 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-0.5"
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-violet-600/10 dark:bg-violet-600/20 border-l-2 border-violet-500 text-violet-750 dark:text-violet-100' 
                      : 'text-neutral-600 dark:text-neutral-450 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${
                      isSelected 
                        ? 'bg-violet-500/10 text-violet-650 dark:bg-violet-500/20 dark:text-violet-400' 
                        : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-violet-900 dark:text-white font-semibold' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {cmd.title}
                      </p>
                      <p className="text-xs text-neutral-450 dark:text-neutral-500 line-clamp-1">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-450 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700/80 text-[10px]">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              )
            })
          ) : (
            <div className="py-12 text-center text-sm text-neutral-500">
              No commands matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
