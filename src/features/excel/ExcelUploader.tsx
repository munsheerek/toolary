import { useState, useRef } from 'react'
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { ExcelFileInfo } from '../../utils/excelHelper'

interface ExcelUploaderProps {
  onFileLoaded: (data: ArrayBuffer, fileInfo: ExcelFileInfo) => void
  currentFile: ExcelFileInfo | null
  onClear: () => void
}

export const ExcelUploader = ({
  onFileLoaded,
  currentFile,
  onClear
}: ExcelUploaderProps) => {
  const { showToast } = useAppStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!hasValidExtension) {
      showToast('Invalid file format. Please upload .xlsx, .xls or .csv', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      onFileLoaded(arrayBuffer, {
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      })
      showToast(`Loaded ${file.name} successfully`, 'success')
    }
    reader.onerror = () => {
      showToast('Error reading file', 'error')
    }
    reader.readAsArrayBuffer(file)
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="select-none animate-fade-in">
      {!currentFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-violet-500 bg-violet-600/10 dark:bg-violet-600/10' 
              : 'border-neutral-250 bg-neutral-100/30 hover:border-neutral-350 hover:bg-neutral-100/60 dark:border-neutral-805 dark:bg-neutral-900/30 dark:hover:border-neutral-700 dark:hover:bg-neutral-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className={`h-10 w-10 mb-3 ${isDragOver ? 'text-violet-500 dark:text-violet-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
          <p className="text-sm font-semibold text-neutral-750 dark:text-neutral-200">Drag & drop spreadsheet here, or click to browse</p>
          <p className="text-xs text-neutral-450 dark:text-neutral-550 mt-1.5">Supports .xlsx, .xls, and .csv files</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-600/10 dark:bg-violet-600/15 border border-violet-555/20 dark:border-violet-500/25 text-violet-600 dark:text-violet-400 rounded-xl shrink-0">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">{currentFile.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                Type: <span className="text-neutral-750 dark:text-neutral-400 font-semibold font-mono">{currentFile.type}</span> 
                <span className="mx-2">•</span> 
                Size: <span className="text-neutral-750 dark:text-neutral-400 font-semibold font-mono">{formatSize(currentFile.size)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClear}
            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 border border-neutral-250 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 rounded-lg transition-all cursor-pointer"
            title="Clear and upload new file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
