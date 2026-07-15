export interface JsonStats {
  byteSize: number
  charCount: number
  keyCount: number
  objectCount: number
  arrayCount: number
}

export function formatByteSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function calculateJsonStats(jsonStr: string): JsonStats | null {
  try {
    const parsed = JSON.parse(jsonStr)
    const stats: JsonStats = {
      byteSize: new Blob([jsonStr]).size,
      charCount: jsonStr.length,
      keyCount: 0,
      objectCount: 0,
      arrayCount: 0,
    }

    function traverse(value: any) {
      if (value === null || typeof value !== 'object') {
        return
      }

      if (Array.isArray(value)) {
        stats.arrayCount++
        for (const item of value) {
          traverse(item)
        }
      } else {
        stats.objectCount++
        const keys = Object.keys(value)
        stats.keyCount += keys.length
        for (const key of keys) {
          traverse(value[key])
        }
      }
    }

    traverse(parsed)
    return stats
  } catch (e) {
    return null
  }
}

export interface JsonValidationError {
  message: string
  line?: number
  column?: number
}

export function validateJson(jsonStr: string): JsonValidationError | null {
  if (!jsonStr.trim()) {
    return { message: 'Input is empty' }
  }

  try {
    JSON.parse(jsonStr)
    return null
  } catch (error: any) {
    const message = error.message || 'Invalid JSON syntax'
    
    // Parse line and column from the error message if possible
    // V8 (Chrome/Edge/Node) format: "Unexpected token } in JSON at position 45"
    // or newer Chrome format: "Expected ',' or '}' after property value in JSON at line 3 column 5"
    const lineMatch = message.match(/line (\d+)/i)
    const colMatch = message.match(/column (\d+)/i)
    const positionMatch = message.match(/position (\d+)/i)

    let line: number | undefined
    let column: number | undefined

    if (lineMatch) {
      line = parseInt(lineMatch[1], 10)
    }
    if (colMatch) {
      column = parseInt(colMatch[1], 10)
    }

    // Fallback parser if position is given but no line/col
    if (positionMatch && !line && !column) {
      const pos = parseInt(positionMatch[1], 10)
      const lines = jsonStr.substring(0, pos).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }

    return {
      message: message.replace(/at position \d+/i, '').replace(/at line \d+ column \d+/i, '').trim(),
      line,
      column
    }
  }
}
