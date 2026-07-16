import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
import { 
  Upload, 
  FileCode, 
  Maximize, 
  Minimize, 
  Trash2, 
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

interface JsonEditorProps {
  value: string
  onChange: (val: string) => void
  onLoadSample: () => void
  onClear: () => void
}

export const JsonEditor = ({
  value,
  onChange,
  onLoadSample,
  onClear
}: JsonEditorProps) => {
  const { theme, showToast } = useAppStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isDark = theme === 'dark'

  const handleEditorChange = (val: string | undefined) => {
    onChange(val || '')
  }

  // File Drop Handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showToast('Please upload a valid JSON file (.json)', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      onChange(text)
      showToast(`Loaded ${file.name} successfully`, 'success')
    }
    reader.onerror = () => {
      showToast('Error reading file', 'error')
    }
    reader.readAsText(file)
  }

  const triggerUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleEditorDidMount = (_editor: any, _monaco: Monaco) => {
    // Custom editor configuration if needed
  }

  return (
    <div 
      className={`flex flex-col border border-neutral-250 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950 transition-all duration-300 relative h-[500px]`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-violet-600/20 backdrop-blur-sm border-2 border-dashed border-violet-500 rounded-xl z-20 flex flex-col items-center justify-center pointer-events-none select-none">
          <Upload className="h-10 w-10 text-violet-400 animate-bounce mb-2" />
          <p className="text-sm font-semibold text-white">Drop JSON File Here</p>
          <p className="text-xs text-neutral-400 mt-1">Accepts .json files</p>
        </div>
      )}

      {/* Editor Header */}
      <div className="h-11 border-b border-neutral-250 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <FileCode className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
          <span>Editor Input</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Load Sample */}
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-750 px-2.5 py-1.2 rounded transition-all cursor-pointer"
            title="Load Sample JSON Data"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Load Sample</span>
          </button>

          {/* Upload */}
          <button
            onClick={triggerUploadClick}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-250 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-750 px-2.5 py-1.2 rounded transition-all cursor-pointer"
            title="Upload .json file"
          >
            <Upload className="h-3 w-3 text-violet-500 dark:text-violet-400" />
            <span>Upload File</span>
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-600 hover:text-rose-605 dark:text-neutral-400 dark:hover:text-rose-400 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 hover:border-rose-200 dark:hover:border-rose-950/40 px-2.5 py-1.2 rounded transition-all cursor-pointer"
            title="Clear Editor"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 bg-[#fffffe] dark:bg-[#1e1e1e]">
        <Editor
          height="100%"
          language="json"
          theme={isDark ? 'vs-dark' : 'vs'}
          value={value}
          onChange={handleEditorChange}
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
            tabSize: 2,
            formatOnPaste: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true }
          }}
          loading={
            <div className="h-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-550 dark:text-neutral-500 gap-2">
              <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Loading Monaco Editor...</span>
            </div>
          }
        />
      </div>
    </div>
  )
}
