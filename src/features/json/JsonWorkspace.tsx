import { useState, useEffect, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { JsonEditor } from './JsonEditor'
import { JsonViewer } from './JsonViewer'
import { JsonActions } from './JsonActions'
import { JsonInfo } from './JsonInfo'
import { 
  calculateJsonStats, 
  validateJson, 
} from '../../utils/jsonHelper'
import type { JsonValidationError, JsonStats } from '../../utils/jsonHelper'
import { useAppStore } from '../../store/useAppStore'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcuts'

const SAMPLE_JSON = `{
  "appName": "DevBox",
  "version": "1.0.0",
  "status": "active",
  "privacyFirst": true,
  "metrics": {
    "filesProcessed": 254,
    "uptime": "99.99%"
  },
  "supportedFormats": [
    "JSON",
    "CSV",
    "XLSX",
    "XLS"
  ],
  "author": {
    "name": "Developer Utilities Team",
    "contact": "support@devbox.local"
  }
}`

export const JsonWorkspace: React.FC = () => {
  const { formatTrigger, showToast } = useAppStore()
  const [jsonStr, setJsonStr] = useState('')
  const [validationError, setValidationError] = useState<JsonValidationError | null>(null)
  
  // Format json and update state
  const handleFormat = () => {
    if (!jsonStr.trim()) return
    try {
      const parsed = JSON.parse(jsonStr)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonStr(formatted)
      setValidationError(null)
      showToast('JSON Formatted successfully', 'success')
    } catch (e) {
      const err = validateJson(jsonStr)
      setValidationError(err)
      showToast('Format failed: invalid JSON syntax', 'error')
    }
  }

  // Minify json and update state
  const handleMinify = () => {
    if (!jsonStr.trim()) return
    try {
      const parsed = JSON.parse(jsonStr)
      const minified = JSON.stringify(parsed)
      setJsonStr(minified)
      setValidationError(null)
      showToast('JSON Minified successfully', 'success')
    } catch (e) {
      const err = validateJson(jsonStr)
      setValidationError(err)
      showToast('Minify failed: invalid JSON syntax', 'error')
    }
  }

  // Validate json manually
  const handleValidate = () => {
    if (!jsonStr.trim()) {
      showToast('Input is empty', 'error')
      return
    }
    const err = validateJson(jsonStr)
    setValidationError(err)
    if (err) {
      showToast('Invalid JSON syntax', 'error')
    } else {
      showToast('JSON is valid!', 'success')
    }
  }

  // Copy json to clipboard
  const handleCopy = () => {
    if (!jsonStr.trim()) return
    navigator.clipboard.writeText(jsonStr)
      .then(() => showToast('Copied JSON to clipboard', 'success'))
      .catch(() => showToast('Failed to copy to clipboard', 'error'))
  }

  // Download json as file
  const handleDownload = () => {
    if (!jsonStr.trim()) return
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devbox-format-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Download started', 'success')
    } catch (e) {
      showToast('Download failed', 'error')
    }
  }

  const handleClear = () => {
    setJsonStr('')
    setValidationError(null)
    showToast('Workspace cleared', 'info')
  }

  const handleLoadSample = () => {
    setJsonStr(SAMPLE_JSON)
    setValidationError(null)
    showToast('Loaded sample JSON', 'success')
  }

  // Listen to command palette formatting trigger
  useEffect(() => {
    if (formatTrigger > 0) {
      handleFormat()
    }
  }, [formatTrigger])

  // Hook up shortcuts: Cmd/Ctrl + Enter to Format, Cmd/Ctrl + Shift + C to Copy
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  useKeyboardShortcut({ key: 'enter', ctrlOrCmd: true }, () => {
    handleFormat()
  })

  useKeyboardShortcut({ key: 'c', ctrlOrCmd: true, shift: true }, () => {
    handleCopy()
  })

  // Parse JSON for the Tree View (only if it is valid JSON)
  const parsedData = useMemo(() => {
    if (!jsonStr.trim()) return undefined
    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      return undefined
    }
  }, [jsonStr])

  // Calculate metadata stats
  const stats = useMemo<JsonStats | null>(() => {
    if (!jsonStr.trim()) return null
    return calculateJsonStats(jsonStr)
  }, [jsonStr])

  // Run validation on typing to clear/update inline errors
  useEffect(() => {
    if (!jsonStr.trim()) {
      setValidationError(null)
      return
    }
    const err = validateJson(jsonStr)
    setValidationError(err)
  }, [jsonStr])

  return (
    <div className="flex-1 flex flex-col gap-6 h-full min-h-0">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between border-b border-neutral-250 dark:border-neutral-850 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">JSON Formatter</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Pretty print, minify, validate, and inspect JSON data locally</p>
        </div>
        <JsonActions
          onFormat={handleFormat}
          onMinify={handleMinify}
          onValidate={handleValidate}
          onCopy={handleCopy}
          onDownload={handleDownload}
          hasContent={!!jsonStr.trim()}
          isMac={isMac}
        />
      </div>

      {/* Info Stats Panel */}
      <JsonInfo stats={stats} />

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Editor Container */}
        <div className="flex flex-col gap-4">
          <JsonEditor
            value={jsonStr}
            onChange={setJsonStr}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
          />
          
          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-start gap-3 select-none animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-200">Invalid JSON</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{validationError.message}</p>
                {(validationError.line !== undefined || validationError.column !== undefined) && (
                  <span className="inline-block mt-2 px-1.5 py-0.5 bg-rose-550/20 text-rose-700 dark:text-rose-300 border border-rose-550/30 text-[10px] font-mono rounded">
                    Error at line {validationError.line}, column {validationError.column}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tree View Container */}
        <div className="h-[500px]">
          <JsonViewer data={parsedData} />
        </div>
      </div>
    </div>
  )
}
