// Pure JSON helpers ported from the Toolary design.

export interface ParseResult {
  ok: boolean
  value?: unknown
  error?: string
}

export function parseJson(str: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(str) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function prettyJson(str: string): string {
  const p = parseJson(str)
  return p.ok ? JSON.stringify(p.value, null, 2) : str
}

export function jsonStats(v: unknown): { nodes: number; depth: number } {
  let nodes = 0
  let depth = 0
  const walk = (x: unknown, d: number) => {
    nodes++
    depth = Math.max(depth, d)
    if (x && typeof x === 'object') {
      (Array.isArray(x) ? x : Object.values(x as object)).forEach((c) => walk(c, d + 1))
    }
  }
  walk(v, 1)
  return { nodes, depth }
}

export interface DiffLine {
  t: ' ' | '+' | '-'
  x: string
}

// LCS-based line diff.
export function diffLines(aStr: string, bStr: string): DiffLine[] {
  const a = aStr.split('\n')
  const b = bStr.split('\n')
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ t: ' ', x: a[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: '-', x: a[i] }); i++ }
    else { out.push({ t: '+', x: b[j] }); j++ }
  }
  while (i < n) out.push({ t: '-', x: a[i++] })
  while (j < m) out.push({ t: '+', x: b[j++] })
  return out
}

export function countMatches(val: unknown, terms: string[]): number {
  if (!terms.length) return 0
  let n = 0
  const has = (s: unknown) => {
    const str = String(s).toLowerCase()
    return terms.some((t) => str.includes(t))
  }
  const walk = (v: unknown, label: string | number | null) => {
    if (label != null && has(String(label))) n++
    if (v && typeof v === 'object') {
      (Array.isArray(v) ? v.map((x, idx) => [idx, x] as const) : Object.entries(v as object)).forEach(
        ([k, x]) => walk(x, k as string | number),
      )
    } else if (has(v)) n++
  }
  walk(val, null)
  return n
}
