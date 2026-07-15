import React, { useState, useMemo } from 'react'
import { ExcelUploader } from './ExcelUploader'
import { SpreadsheetViewer } from './SpreadsheetViewer'
import { ExportActions } from './ExportActions'
import { ExcelInfo } from './ExcelInfo'
import { 
  parseSpreadsheet, 
  processWorksheet, 
  exportToCSV, 
  exportToJSON,
} from '../../utils/excelHelper'
import type { ExcelFileInfo, SheetData } from '../../utils/excelHelper'
import { useAppStore } from '../../store/useAppStore'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcuts'
import * as XLSX from 'xlsx'

export const ExcelWorkspace: React.FC = () => {
  const { showToast } = useAppStore()
  
  // File upload state
  const [fileInfo, setFileInfo] = useState<ExcelFileInfo | null>(null)
  
  // Sheet states
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [activeSheet, setActiveSheet] = useState<string>('')

  // Parse file and load sheets
  const handleFileLoaded = (buffer: ArrayBuffer, info: ExcelFileInfo) => {
    try {
      const { sheetNames: names, workbook: wb } = parseSpreadsheet(buffer)
      setFileInfo(info)
      setWorkbook(wb)
      setSheetNames(names)
      if (names.length > 0) {
        setActiveSheet(names[0])
      }
    } catch (e) {
      showToast('Failed to parse spreadsheet file', 'error')
    }
  }

  // Clear workspace
  const handleClear = () => {
    setFileInfo(null)
    setWorkbook(null)
    setSheetNames([])
    setActiveSheet('')
    showToast('Workspace reset', 'info')
  }

  // Get active sheet structured data for viewing
  const activeSheetData = useMemo<SheetData | null>(() => {
    if (!workbook || !activeSheet) return null
    try {
      return processWorksheet(workbook, activeSheet)
    } catch (e) {
      return null
    }
  }, [workbook, activeSheet])

  // Export handlers
  const handleExportCSV = () => {
    if (!activeSheetData) return
    try {
      const csvContent = exportToCSV(activeSheetData.rawSheet)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileInfo?.name.split('.')[0]}-${activeSheet}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('CSV export started', 'success')
    } catch (e) {
      showToast('Export to CSV failed', 'error')
    }
  }

  const handleExportJSON = () => {
    if (!activeSheetData) return
    try {
      const jsonContent = exportToJSON(activeSheetData.rawSheet)
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileInfo?.name.split('.')[0]}-${activeSheet}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('JSON export started', 'success')
    } catch (e) {
      showToast('Export to JSON failed', 'error')
    }
  }

  const handleCopyTable = () => {
    if (!activeSheetData) return
    try {
      const { headers, rows } = activeSheetData
      
      // Construct tab-separated string (TSV)
      const tsvHeaders = headers.join('\t')
      const tsvRows = rows.map(row => row.join('\t')).join('\n')
      const tsvContent = `${tsvHeaders}\n${tsvRows}`
      
      navigator.clipboard.writeText(tsvContent)
        .then(() => showToast('Copied table data to clipboard as TSV', 'success'))
        .catch(() => showToast('Failed to copy table data', 'error'))
    } catch (e) {
      showToast('Failed to copy table data', 'error')
    }
  }

  // Set up shortcut listener for Copy Table: Cmd/Ctrl + Shift + C
  useKeyboardShortcut({ key: 'c', ctrlOrCmd: true, shift: true, disabled: !activeSheetData }, () => {
    handleCopyTable()
  })

  return (
    <div className="flex-1 flex flex-col gap-6 h-full min-h-0">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-neutral-250 dark:border-neutral-855 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Excel / CSV Viewer</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">View, sort, filter, and export CSV, XLS, and XLSX sheets in browser locally</p>
        </div>
        <ExportActions
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onCopyTable={handleCopyTable}
          disabled={!activeSheetData}
        />
      </div>

      {/* Info Stats Panel */}
      <ExcelInfo stats={activeSheetData?.stats || null} />

      {/* Main Area */}
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        <ExcelUploader
          onFileLoaded={handleFileLoaded}
          currentFile={fileInfo}
          onClear={handleClear}
        />

        {activeSheetData && (
          <div className="flex-1 flex flex-col min-h-0">
            <SpreadsheetViewer
              sheetData={activeSheetData}
              sheetNames={sheetNames}
              activeSheet={activeSheet}
              onSheetChange={setActiveSheet}
            />
          </div>
        )}
      </div>
    </div>
  )
}
