import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Maximize2, 
  Minimize2,
  Maximize,
  Minimize,
  FolderTree,
  Copy,
  X
} from 'lucide-react'

// Helper to escape object keys that have special characters or spaces
const escapePathKey = (key: string | number) => {
  if (typeof key === 'number') return `[${key}]`
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return `.${key}`
  return `["${key}"]`
}

interface JsonViewerProps {
  data: any
}

// Highlight matched text in yellow
const HighlightText = ({ text, search }: { text: string; search: string }) => {
  if (!search) return <span>{text}</span>
  
  const index = text.toLowerCase().indexOf(search.toLowerCase())
  if (index === -1) return <span>{text}</span>

  const before = text.substring(0, index)
  const match = text.substring(index, index + search.length)
  const after = text.substring(index + search.length)

  return (
    <span>
      {before}
      <mark className="bg-yellow-500/30 text-yellow-800 dark:text-yellow-200 px-0.5 rounded">{match}</mark>
      {after}
    </span>
  )
}

// Check if value or any child has a match
function hasMatch(val: any, term: string): boolean {
  if (!term) return false
  const lowerTerm = term.toLowerCase()
  
  function check(v: any): boolean {
    if (v === null || v === undefined) {
      return String(v).toLowerCase().includes(lowerTerm)
    }
    if (typeof v === 'object') {
      if (Array.isArray(v)) {
        return v.some(item => check(item))
      } else {
        return Object.entries(v).some(([key, val]) => 
          key.toLowerCase().includes(lowerTerm) || check(val)
        )
      }
    }
    return String(v).toLowerCase().includes(lowerTerm)
  }
  
  return check(val)
}

interface TreeNodeProps {
  name: string | number | null
  value: any
  depth: number
  searchTerm: string
  forceExpanded: boolean | null
  currentPath: string
  onCopyPath: (path: string) => void
}

const TreeNode = ({ 
  name, 
  value, 
  depth, 
  searchTerm, 
  forceExpanded,
  currentPath,
  onCopyPath
}: TreeNodeProps) => {
  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  
  const [isExpanded, setIsExpanded] = useState(depth < 2)

  // Sync with forceExpanded action triggers
  useEffect(() => {
    if (forceExpanded !== null) {
      setIsExpanded(forceExpanded)
    }
  }, [forceExpanded])

  // Auto expand if search term matches a child
  useEffect(() => {
    if (searchTerm && hasMatch(value, searchTerm)) {
      setIsExpanded(true)
    }
  }, [searchTerm, value])

  const getType = (val: any): string => {
    if (val === null) return 'null'
    if (Array.isArray(val)) return 'array'
    return typeof val
  }

  const type = getType(value)

  const renderBadge = () => {
    switch (type) {
      case 'string':
        return <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-mono shrink-0">str</span>
      case 'number':
        return <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1 py-0.2 rounded font-mono shrink-0">num</span>
      case 'boolean':
        return <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-1 py-0.2 rounded font-mono shrink-0">bool</span>
      case 'null':
        return <span className="text-[10px] bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-500 border border-neutral-305 dark:border-neutral-700 px-1 py-0.2 rounded font-mono shrink-0">null</span>
      case 'object':
        return <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono shrink-0">{Object.keys(value).length} keys</span>
      case 'array':
        return <span className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-1 py-0.2 rounded font-mono shrink-0">{value.length} items</span>
      default:
        return null
    }
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  // Filter keys/items based on search term
  const renderedChildren = useMemo(() => {
    if (!isObject) return []
    
    const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value)
    
    if (!searchTerm) return entries

    // If search term is present, only show entry if it has a match or the key itself matches
    return entries.filter(([k, v]) => 
      String(k).toLowerCase().includes(searchTerm.toLowerCase()) || 
      hasMatch(v, searchTerm)
    )
  }, [isObject, isArray, value, searchTerm])

  return (
    <div className="flex flex-col ml-4">
      <div 
        className="flex items-center gap-1.5 py-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-900/60 rounded px-1 group cursor-pointer text-xs relative"
        onClick={isObject ? toggleExpand : undefined}
      >
        {isObject ? (
          <button className="text-neutral-500 hover:text-neutral-805 dark:hover:text-neutral-300 focus:outline-none shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <div className="w-3.5 h-3.5 shrink-0" />
        )}

        {name !== null && (
          <span className="font-mono text-neutral-800 dark:text-neutral-300 font-medium shrink-0">
            <HighlightText text={String(name)} search={searchTerm} />
            <span className="text-neutral-400 dark:text-neutral-600 mr-1.5">:</span>
          </span>
        )}

        {isObject ? (
          <span className="text-neutral-450 dark:text-neutral-500 font-mono text-[11px] select-none">
            {isArray ? '[' : '{'}
          </span>
        ) : (
          <div className="flex items-center gap-2 select-text overflow-hidden text-ellipsis whitespace-nowrap pr-2">
            <HighlightText text={type === 'string' ? `"${value}"` : String(value)} search={searchTerm} />
          </div>
        )}

        {renderBadge()}

        {isObject && !isExpanded && (
          <span className="text-neutral-450 dark:text-neutral-500 font-mono text-[11px] select-none">
            ... {isArray ? ']' : '}'}
          </span>
        )}

        {/* Copy Path Action */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCopyPath(currentPath)
          }}
          className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all focus:outline-none shrink-0"
          title={`Copy path: ${currentPath || 'root'}`}
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>

      {isObject && isExpanded && (
        <div className="border-l border-neutral-200 dark:border-neutral-800/80 ml-2">
          {renderedChildren.map(([key, val]) => {
            const nextPath = depth === 0 && currentPath === '' 
              ? (typeof key === 'number' ? `[${key}]` : String(key))
              : `${currentPath}${escapePathKey(key)}`
            return (
              <TreeNode
                key={String(key)}
                name={isArray ? null : key}
                value={val}
                depth={depth + 1}
                searchTerm={searchTerm}
                forceExpanded={forceExpanded}
                currentPath={nextPath}
                onCopyPath={onCopyPath}
              />
            )
          })}
          {renderedChildren.length === 0 && searchTerm && (
            <div className="pl-4 py-0.5 text-neutral-450 dark:text-neutral-600 italic font-mono text-[10px]">
              No matches inside
            </div>
          )}
          <div className="pl-4 text-neutral-450 dark:text-neutral-500 font-mono text-[11px] py-0.5 select-none">
            {isArray ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  )
}

export const JsonViewer = ({ data }: JsonViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [forceExpanded, setForceExpanded] = useState<boolean | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Close fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsFullscreen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])
  
  // Custom Toast could be imported if we wanted to show a success message, 
  // but we can just use a simple clipboard write for now.
  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path || 'root').catch(console.error)
  }

  // Check if root data is object
  const isRootObject = data !== null && typeof data === 'object'

  const handleExpandAll = () => {
    setForceExpanded(true)
    // Clear force flag in next tick so toggle still works
    setTimeout(() => setForceExpanded(null), 50)
  }

  const handleCollapseAll = () => {
    setForceExpanded(false)
    // Clear force flag in next tick so toggle still works
    setTimeout(() => setForceExpanded(null), 50)
  }

  const renderContent = () => (
    <>
      {/* Header toolbar */}
      <div className="min-h-[44px] h-auto border-b border-neutral-250 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 select-none shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-550 dark:text-neutral-400 whitespace-nowrap shrink-0">
          <FolderTree className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
          <span>Interactive Tree View</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Search keys/values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-105 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 focus:border-violet-500 text-neutral-800 dark:text-neutral-200 text-[11px] rounded-lg pl-7 pr-2.5 py-1 w-32 md:w-40 xl:w-44 outline-none transition-all placeholder-neutral-500"
            />
          </div>

          <div className="h-4 w-[1px] bg-neutral-250 dark:bg-neutral-800 hidden sm:block" />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExpandAll}
              className="flex items-center gap-1 text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 px-2 py-1 rounded transition-all cursor-pointer"
              title="Expand All"
            >
              <Maximize2 className="h-2.5 w-2.5" />
              <span className="hidden xl:inline">Expand All</span>
            </button>
            <button
              onClick={handleCollapseAll}
              className="flex items-center gap-1 text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 px-2 py-1 rounded transition-all cursor-pointer"
              title="Collapse All"
            >
              <Minimize2 className="h-2.5 w-2.5" />
              <span className="hidden xl:inline">Collapse All</span>
            </button>

            <div className="h-4 w-[1px] bg-neutral-250 dark:bg-neutral-800 mx-0.5" />

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1 p-1.5 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 rounded text-neutral-600 dark:text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all cursor-pointer"
              title={isFullscreen ? 'Close Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold pr-0.5">Close</span>
                </>
              ) : (
                <Maximize className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content area */}
      <div className={`flex-1 overflow-auto p-4 select-text ${isFullscreen ? 'h-full' : 'max-h-[500px]'}`}>
        {data === undefined ? (
          <div className="h-full flex items-center justify-center text-neutral-500 text-xs italic">
            No JSON loaded
          </div>
        ) : (
          <div className="font-mono text-sm leading-6">
            {isRootObject ? (
              <TreeNode 
                name={null} 
                value={data} 
                depth={0} 
                searchTerm={searchTerm} 
                forceExpanded={forceExpanded}
                currentPath=""
                onCopyPath={handleCopyPath}
              />
            ) : (
              <div className="ml-4 py-1 text-xs">
                <TreeNode 
                  name="Value" 
                  value={data} 
                  depth={0} 
                  searchTerm={searchTerm} 
                  forceExpanded={forceExpanded}
                  currentPath=""
                  onCopyPath={handleCopyPath}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )

  if (isFullscreen) {
    return (
      <>
        {/* Placeholder in grid when fullscreen */}
        <div className="flex flex-col bg-neutral-50 dark:bg-neutral-900/30 border border-dashed border-neutral-250 dark:border-neutral-800 rounded-xl h-full items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2 select-none">
          <FolderTree className="h-5 w-5 opacity-50" />
          <span className="text-xs">Tree View is open in fullscreen</span>
        </div>
        
        {/* Portal for fullscreen modal */}
        {createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsFullscreen(false)}
            />
            
            {/* Modal */}
            <div className="relative flex flex-col bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-xl overflow-hidden animate-fade-in select-none w-[95vw] max-w-5xl h-[90vh] shadow-2xl ring-1 ring-neutral-200/50 dark:ring-neutral-800/50">
              {renderContent()}
            </div>
          </div>,
          document.body
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-xl overflow-hidden animate-fade-in select-none h-full">
      {renderContent()}
    </div>
  )
}
