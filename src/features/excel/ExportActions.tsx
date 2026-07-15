import { Copy, FileText, Code2 } from 'lucide-react'

interface ExportActionsProps {
  onExportCSV: () => void
  onExportJSON: () => void
  onCopyTable: () => void
  disabled: boolean
}

export const ExportActions = ({
  onExportCSV,
  onExportJSON,
  onCopyTable,
  disabled
}: ExportActionsProps) => {
  const secondaryBtnClass = "flex items-center gap-1.5 px-3 py-1.8 bg-neutral-100 hover:bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 disabled:border-neutral-200 dark:disabled:border-neutral-850 text-neutral-800 dark:text-neutral-200 disabled:text-neutral-450 dark:disabled:text-neutral-500 text-xs font-semibold rounded-lg transition-all disabled:cursor-not-allowed cursor-pointer"

  return (
    <div className="flex flex-wrap items-center gap-2 select-none">
      {/* Copy TSV */}
      <button
        onClick={onCopyTable}
        disabled={disabled}
        className={secondaryBtnClass}
        title="Copy spreadsheet table values as Tab-Separated Values (TSV) to clipboard"
      >
        <Copy className="h-3.5 w-3.5" />
        <span>Copy Table Data</span>
      </button>

      {/* Export to CSV */}
      <button
        onClick={onExportCSV}
        disabled={disabled}
        className={secondaryBtnClass}
        title="Export active sheet as CSV"
      >
        <FileText className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
        <span>Export to CSV</span>
      </button>

      {/* Export to JSON */}
      <button
        onClick={onExportJSON}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.8 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 text-white disabled:text-neutral-400 dark:disabled:text-neutral-500 text-xs font-semibold rounded-lg shadow hover:shadow-md transition-all disabled:cursor-not-allowed border border-violet-500/20 cursor-pointer"
        title="Export active sheet as JSON array"
      >
        <Code2 className="h-3.5 w-3.5" />
        <span>Export to JSON</span>
      </button>
    </div>
  )
}
