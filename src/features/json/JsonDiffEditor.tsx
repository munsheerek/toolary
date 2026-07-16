import { useState } from 'react'
import { DiffEditor } from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
import { 
  FileCode, 
  Maximize, 
  Minimize, 
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

interface JsonDiffEditorProps {
  originalValue: string
  modifiedValue: string
  onOriginalChange: (val: string) => void
}

export const JsonDiffEditor = ({
  originalValue,
  modifiedValue,
  onOriginalChange
}: JsonDiffEditorProps) => {
  const { theme } = useAppStore()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const isDark = theme === 'dark'

  const handleEditorDidMount = (editor: any, _monaco: Monaco) => {
    // Listen for changes in the original editor
    editor.getOriginalEditor().onDidChangeModelContent(() => {
      const val = editor.getOriginalEditor().getValue()
      onOriginalChange(val)
    })
  }

  return (
    <div 
      className={`flex flex-col border border-neutral-250 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950 transition-all duration-300 relative ${
        isFullscreen 
          ? 'fixed inset-4 z-50 shadow-2xl' 
          : 'h-[500px]'
      }`}
    >
      {/* Editor Header */}
      <div className="h-11 border-b border-neutral-250 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <FileCode className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          <span>Diff Viewer (Original vs Modified)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 rounded text-neutral-600 dark:text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-3.5 w-3.5" />
            ) : (
              <Maximize className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Diff Content Area */}
      <div className="flex-1 bg-[#fffffe] dark:bg-[#1e1e1e]">
        <DiffEditor
          height="100%"
          language="json"
          theme={isDark ? 'vs-dark' : 'vs'}
          original={originalValue}
          modified={modifiedValue}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 20,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 8, bottom: 8 },
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            renderSideBySide: true,
            enableSplitViewResizing: true,
            ignoreTrimWhitespace: false,
            readOnly: true,
            originalEditable: true, // Allow user to edit original to see diffs interactively
          }}
          loading={
            <div className="h-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-550 dark:text-neutral-500 gap-2">
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Loading Diff Editor...</span>
            </div>
          }
        />
      </div>
    </div>
  )
}
