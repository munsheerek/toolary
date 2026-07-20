import { type ReactNode } from 'react'

// Highlights every occurrence of any search term inside `text` with a <mark>.
export function highlight(text: unknown, terms: string[]): ReactNode {
  const s = String(text == null ? '' : text)
  if (!terms || !terms.length) return s
  const low = s.toLowerCase()
  const ranges: [number, number][] = []
  terms.forEach((raw) => {
    const t = String(raw).toLowerCase()
    if (!t) return
    let i = 0
    while ((i = low.indexOf(t, i)) !== -1) {
      ranges.push([i, i + t.length])
      i += t.length
    }
  })
  if (!ranges.length) return s
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  ranges.forEach((r) => {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([r[0], r[1]])
  })
  const out: ReactNode[] = []
  let pos = 0
  let key = 0
  merged.forEach(([a, b]) => {
    if (a > pos) out.push(s.slice(pos, a))
    out.push(
      <mark
        key={key++}
        style={{ background: 'rgb(var(--accent-rgb))', color: 'var(--bg)', borderRadius: '3px', padding: '0 2px', fontWeight: 600 }}
      >
        {s.slice(a, b)}
      </mark>,
    )
    pos = b
  })
  if (pos < s.length) out.push(s.slice(pos))
  return <span>{out}</span>
}

export function terms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean)
}

export function timeAgo(ts: number): string {
  const s = (Date.now() - ts) / 1000
  if (s < 60) return 'just now'
  const m = s / 60
  if (m < 60) return Math.floor(m) + 'm ago'
  const h = m / 60
  if (h < 24) return Math.floor(h) + 'h ago'
  const d = h / 24
  if (d < 2) return 'yesterday'
  return Math.floor(d) + 'd ago'
}
