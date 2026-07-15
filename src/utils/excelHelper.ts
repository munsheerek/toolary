import * as XLSX from 'xlsx'

export interface SheetData {
  name: string
  headers: string[]
  rows: any[][]
  stats: ExcelStats
  rawSheet: XLSX.WorkSheet
}

export interface ExcelStats {
  sheetCount: number
  currentSheetName: string
  rowCount: number
  colCount: number
  emptyCellCount: number
}

export interface ExcelFileInfo {
  name: string
  size: number
  type: string
}

// Parse uploaded spreadsheet file
export function parseSpreadsheet(
  data: ArrayBuffer
): { sheetNames: string[]; workbook: XLSX.WorkBook } {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true })
  return {
    sheetNames: workbook.SheetNames,
    workbook
  }
}

// Convert worksheet to structure suitable for table viewer
export function processWorksheet(
  workbook: XLSX.WorkBook,
  sheetName: string
): SheetData {
  const worksheet = workbook.Sheets[sheetName]
  
  // Get 2D array representation (header: 1 returns array of arrays)
  const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' })
  
  const sheetCount = workbook.SheetNames.length
  
  if (rawRows.length === 0) {
    return {
      name: sheetName,
      headers: [],
      rows: [],
      rawSheet: worksheet,
      stats: {
        sheetCount,
        currentSheetName: sheetName,
        rowCount: 0,
        colCount: 0,
        emptyCellCount: 0
      }
    }
  }

  // Treat first row as headers, rest as data rows
  const headers = rawRows[0].map((h, i) => h !== '' ? String(h) : `Column ${i + 1}`)
  const rows = rawRows.slice(1)
  
  // Calculate stats
  const rowCount = rows.length
  const colCount = headers.length
  const totalCells = (rowCount + 1) * colCount // including headers
  
  let filledCells = 0
  rawRows.forEach((row) => {
    // Make sure we only check up to colCount
    for (let i = 0; i < colCount; i++) {
      const val = row[i]
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        filledCells++
      }
    }
  })
  
  const emptyCellCount = totalCells - filledCells

  return {
    name: sheetName,
    headers,
    rows,
    rawSheet: worksheet,
    stats: {
      sheetCount,
      currentSheetName: sheetName,
      rowCount,
      colCount,
      emptyCellCount
    }
  }
}

// Helper to convert sheet to CSV string
export function exportToCSV(worksheet: XLSX.WorkSheet): string {
  return XLSX.utils.sheet_to_csv(worksheet)
}

// Helper to convert sheet to JSON string
export function exportToJSON(worksheet: XLSX.WorkSheet): string {
  const jsonData = XLSX.utils.sheet_to_json(worksheet)
  return JSON.stringify(jsonData, null, 2)
}
