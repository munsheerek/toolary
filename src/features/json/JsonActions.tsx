import { 
  Copy, 
  Download, 
  Minimize, 
  Sparkles, 
  CheckCircle2, 
  GitCompare,
} from 'lucide-react'

interface JsonActionsProps {
  onFormat: () => void
  onMinify: () => void
  onValidate: () => void
  onCopy: () => void
  onDownload: () => void
  hasContent: boolean
  isMac: boolean
  isDiffMode: boolean
  onToggleDiff: () => void
}

export const JsonActions = ({
  onFormat,
  onMinify,
  onValidate,
  onCopy,
  onDownload,
  hasContent,
  isMac,
  isDiffMode,
  onToggleDiff
}: JsonActionsProps) => {
  const secondaryBtnClass = "flex items-center gap-1.5 px-3 py-1.8 bg-neutral-100 hover:bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 disabled:border-neutral-200 dark:disabled:border-neutral-850 text-neutral-800 dark:text-neutral-200 disabled:text-neutral-400 dark:disabled:text-neutral-500 text-xs font-semibold rounded-lg transition-all disabled:cursor-not-allowed cursor-pointer"

  return (
    <div className="flex flex-wrap items-center gap-2 select-none">
      {/* Primary Actions */}
      <button
        onClick={onFormat}
        disabled={!hasContent}
        className="flex items-center gap-1.5 px-3 py-1.8 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 text-white disabled:text-neutral-400 dark:disabled:text-neutral-500 text-xs font-semibold rounded-lg shadow hover:shadow-md transition-all disabled:cursor-not-allowed border border-violet-500/20 cursor-pointer"
        title={`Format JSON (${isMac ? '⌘↵' : 'Ctrl+Enter'})`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Format JSON</span>
        <kbd className="hidden sm:inline bg-violet-700/50 text-violet-200 dark:text-violet-250 px-1 rounded text-[9px] font-mono border border-violet-500/20 ml-1">
          {isMac ? '⌘↵' : 'Ctrl+↵'}
        </kbd>
      </button>

      <button
        onClick={onMinify}
        disabled={!hasContent}
        className={secondaryBtnClass}
        title="Minify JSON"
      >
        <Minimize className="h-3.5 w-3.5" />
        <span>Minify</span>
      </button>

      <button
        onClick={onValidate}
        disabled={!hasContent}
        className={secondaryBtnClass}
        title="Validate JSON syntax"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-450" />
        <span>Validate</span>
      </button>

      <button
        onClick={onToggleDiff}
        className={`${secondaryBtnClass} ${isDiffMode ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400' : ''}`}
        title="Toggle Diff Mode"
      >
        <GitCompare className="h-3.5 w-3.5" />
        <span>{isDiffMode ? 'Exit Diff' : 'Diff Mode'}</span>
      </button>

      <div className="h-6 w-[1px] bg-neutral-250 dark:bg-neutral-800 mx-1 hidden sm:block" />

      {/* Output Actions */}
      <button
        onClick={onCopy}
        disabled={!hasContent}
        className={secondaryBtnClass}
        title={`Copy to clipboard (${isMac ? '⌘⇧C' : 'Ctrl+Shift+C'})`}
      >
        <Copy className="h-3.5 w-3.5" />
        <span>Copy JSON</span>
        <kbd className="hidden sm:inline bg-neutral-200 dark:bg-neutral-800 text-neutral-500 px-1 rounded text-[9px] font-mono border border-neutral-300 dark:border-neutral-700 ml-1">
          {isMac ? '⌘⇧C' : 'Ctrl+⇧C'}
        </kbd>
      </button>

      <button
        onClick={onDownload}
        disabled={!hasContent}
        className={secondaryBtnClass}
        title="Download JSON File"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Download</span>
      </button>
    </div>
  )
}
