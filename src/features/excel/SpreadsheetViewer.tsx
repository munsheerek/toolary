import { useState, useMemo, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  Layers, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react'
import type { SheetData } from '../../utils/excelHelper'

interface SpreadsheetViewerProps {
  sheetData: SheetData
  sheetNames: string[]
  activeSheet: string
  onSheetChange: (name: string) => void
}

export const SpreadsheetViewer = ({
  sheetData,
  sheetNames,
  activeSheet,
  onSheetChange
}: SpreadsheetViewerProps) => {
  const { headers, rows } = sheetData

  // State Management
  const [globalSearch, setGlobalSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState<{ [colIdx: number]: string }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ colIdx: number; direction: 'asc' | 'desc' } | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Column Resizing Widths
  const [colWidths, setColWidths] = useState<{ [key: number]: number }>({})

  // Reset pagination & filters when sheet changes
  useEffect(() => {
    setCurrentPage(1)
    setGlobalSearch('')
    setColumnFilters({})
    setSortConfig(null)
  }, [activeSheet])

  // Sorting Handler
  const handleSort = (colIdx: number) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.colIdx === colIdx && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig && sortConfig.colIdx === colIdx && sortConfig.direction === 'desc') {
      setSortConfig(null)
      return
    }
    setSortConfig({ colIdx, direction })
  }

  // Column Resizer Mouse Down Handler
  const handleResizeMouseDown = (idx: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = colWidths[idx] || 150

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidth = Math.max(80, startWidth + deltaX)
      setColWidths(prev => ({ ...prev, [idx]: newWidth }))
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Filter & Sort Logic
  const processedRows = useMemo(() => {
    let result = [...rows]

    // 1. Apply Global Search
    if (globalSearch.trim()) {
      const query = globalSearch.toLowerCase()
      result = result.filter(row => 
        row.some(cell => String(cell).toLowerCase().includes(query))
      )
    }

    // 2. Apply Column Specific Filters
    if (showFilters) {
      Object.entries(columnFilters).forEach(([idxStr, filterVal]) => {
        if (!filterVal.trim()) return
        const idx = parseInt(idxStr, 10)
        const query = filterVal.toLowerCase()
        result = result.filter(row => 
          String(row[idx] ?? '').toLowerCase().includes(query)
        )
      })
    }

    // 3. Apply Sorting
    if (sortConfig) {
      const { colIdx, direction } = sortConfig
      result.sort((a, b) => {
        const valA = a[colIdx]
        const valB = b[colIdx]

        // Handle numeric sorting if both are numbers
        const numA = Number(valA)
        const numB = Number(valB)
        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return direction === 'asc' ? numA - numB : numB - numA
        }

        // Standard string fallback
        const strA = String(valA).toLowerCase()
        const strB = String(valB).toLowerCase()
        if (strA < strB) return direction === 'asc' ? -1 : 1
        if (strA > strB) return direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [rows, globalSearch, columnFilters, showFilters, sortConfig])

  // Pagination Calculations
  const totalRows = processedRows.length
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1
  
  // Sync page bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return processedRows.slice(startIndex, startIndex + rowsPerPage)
  }, [processedRows, currentPage, rowsPerPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-xl overflow-hidden min-h-0 animate-fade-in shadow-sm select-none">
      
      {/* Search & Options Toolbar */}
      <div className="p-4 border-b border-neutral-250 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-900/40 flex flex-wrap items-center justify-between gap-4 select-none">
        
        {/* Left Side: Global Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search spreadsheet data..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 focus:border-violet-500 text-neutral-800 dark:text-neutral-200 text-xs rounded-lg pl-9 pr-3 py-2 outline-none transition-all placeholder-neutral-500"
          />
        </div>

        {/* Right Side: Options & Pagination Info */}
        <div className="flex items-center gap-3">
          {/* Toggle Column Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              showFilters 
                ? 'bg-violet-650/10 border-violet-500 text-violet-650 dark:bg-violet-600/20 dark:text-violet-300' 
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-250 dark:border-neutral-800 text-neutral-600 dark:text-neutral-450 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-350 dark:hover:border-neutral-700'
            }`}
            title="Toggle column-specific filters"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Column Filters</span>
          </button>

          <div className="h-6 w-[1px] bg-neutral-250 dark:bg-neutral-800" />

          {/* Rows count label */}
          <span className="text-xs text-neutral-500">
            Showing {totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} rows
          </span>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="flex-1 overflow-auto max-h-[500px]">
        {headers.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500 text-xs italic p-12">
            No columns available
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed text-xs select-text">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-900 shadow-[0_1px_0_0_rgba(255,255,255,0.05)] z-20 select-none">
              <tr>
                {/* Index Column Header */}
                <th className="w-12 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 text-center font-mono border-b border-r border-neutral-250 dark:border-neutral-800/80 sticky left-0 z-30 font-medium">
                  #
                </th>
                {headers.map((header, idx) => {
                  const width = colWidths[idx] || 150
                  const isSorted = sortConfig?.colIdx === idx
                  return (
                    <th 
                      key={idx}
                      style={{ width }}
                      className="p-2.5 text-neutral-800 dark:text-neutral-300 font-semibold border-b border-r border-neutral-250 dark:border-neutral-850 hover:bg-neutral-200/50 dark:hover:bg-neutral-850/50 cursor-pointer relative group transition-colors select-none"
                      onClick={() => handleSort(idx)}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate pr-2" title={header}>{header}</span>
                        <span className="shrink-0 text-neutral-550 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-300">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" /> : <ArrowDown className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      </div>

                      {/* Resize Handle */}
                      <div
                        className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-violet-500/50 active:bg-violet-500 transition-colors z-10"
                        onMouseDown={(e) => handleResizeMouseDown(idx, e)}
                      />
                    </th>
                  )
                })}
              </tr>

              {/* Toggleable Column Specific Filter Inputs */}
              {showFilters && (
                <tr className="bg-white dark:bg-neutral-950">
                  <th className="bg-neutral-100 dark:bg-neutral-900 border-b border-r border-neutral-250 dark:border-neutral-800 sticky left-0 z-30" />
                  {headers.map((_, idx) => (
                    <th key={idx} className="p-1.5 border-b border-r border-neutral-250 dark:border-neutral-855 bg-neutral-100/60 dark:bg-neutral-900/60">
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={columnFilters[idx] || ''}
                        onChange={(e) => {
                          setColumnFilters(prev => ({
                            ...prev,
                            [idx]: e.target.value
                          }))
                          setCurrentPage(1)
                        }}
                        onClick={(e) => e.stopPropagation()} // Avoid triggering column sort
                        className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 focus:border-violet-500 text-neutral-800 dark:text-neutral-300 text-[10px] rounded px-1.5 py-1 outline-none transition-all placeholder-neutral-500"
                      />
                    </th>
                  ))}
                </tr>
              )}
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedRows.map((row, rowIdx) => {
                const globalRowIdx = (currentPage - 1) * rowsPerPage + rowIdx + 1
                return (
                  <tr 
                    key={rowIdx} 
                    className="hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-850 group transition-colors"
                  >
                    {/* Index Cell */}
                    <td className="bg-neutral-100/60 dark:bg-neutral-900/60 text-neutral-500 font-mono text-center border-r border-neutral-250 dark:border-neutral-850 sticky left-0 z-10 select-none group-hover:bg-neutral-200 dark:group-hover:bg-neutral-850 transition-colors">
                      {globalRowIdx}
                    </td>
                    {headers.map((_, colIdx) => {
                      const cellValue = row[colIdx]
                      return (
                        <td 
                          key={colIdx} 
                          className="p-2.5 text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-850/60 truncate font-mono"
                          title={cellValue !== undefined ? String(cellValue) : ''}
                        >
                          {cellValue !== undefined ? String(cellValue) : ''}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {paginatedRows.length === 0 && (
                <tr>
                  <td 
                    colSpan={headers.length + 1} 
                    className="text-center py-12 text-neutral-500 font-medium italic"
                  >
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls & Sheet Selector Panel */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 select-none">
        {/* Bottom Left: Sheet Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto shrink-0 max-w-full sm:max-w-md pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold mr-1.5 shrink-0">
            <Layers className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
            <span>Sheets:</span>
          </div>
          {sheetNames.map((name) => {
            const isActive = activeSheet === name
            return (
              <button
                key={name}
                onClick={() => onSheetChange(name)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-violet-605/10 border-violet-500 text-violet-650 dark:bg-violet-600/20 dark:border-violet-500 dark:text-violet-300'
                    : 'bg-white border-neutral-250 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-950 dark:border-neutral-850 dark:text-neutral-450 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {name}
              </button>
            )
          })}
        </div>

        {/* Bottom Right: Pagination Buttons */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Rows Per Page Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-white border border-neutral-250 dark:bg-neutral-950 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 text-neutral-750 dark:text-neutral-300 rounded px-1.5 py-1 text-xs outline-none transition-colors cursor-pointer"
            >
              {[25, 50, 100, 200].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-[1px] bg-neutral-250 dark:bg-neutral-805" />

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 disabled:bg-neutral-100 dark:disabled:bg-neutral-950 text-neutral-500 dark:text-neutral-400 disabled:text-neutral-300 dark:disabled:text-neutral-600 border border-neutral-250 dark:border-neutral-850 rounded-lg transition-all disabled:cursor-not-allowed cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 disabled:bg-neutral-100 dark:disabled:bg-neutral-950 text-neutral-500 dark:text-neutral-400 disabled:text-neutral-300 dark:disabled:text-neutral-600 border border-neutral-250 dark:border-neutral-850 rounded-lg transition-all disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="text-xs text-neutral-650 dark:text-neutral-400 font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 disabled:bg-neutral-100 dark:disabled:bg-neutral-950 text-neutral-500 dark:text-neutral-400 disabled:text-neutral-300 dark:disabled:text-neutral-600 border border-neutral-250 dark:border-neutral-850 rounded-lg transition-all disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 disabled:bg-neutral-100 dark:disabled:bg-neutral-950 text-neutral-500 dark:text-neutral-400 disabled:text-neutral-300 dark:disabled:text-neutral-600 border border-neutral-250 dark:border-neutral-850 rounded-lg transition-all disabled:cursor-not-allowed cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
