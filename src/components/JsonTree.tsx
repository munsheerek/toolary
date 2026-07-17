import { type ReactNode } from 'react'
import { highlight } from '../lib/highlight'

interface TreeCtx {
  collapsed: Record<string, boolean>
  toggle: (path: string) => void
  terms: string[]
}

function node(label: string | number | null, val: unknown, path: string, depth: number, ctx: TreeCtx): ReactNode {
  const pad = 4 + depth * 15
  const { terms } = ctx
  const keyText = label != null ? (typeof label === 'number' ? label : JSON.stringify(label)) + ': ' : null
  const keyEl = keyText != null ? <span style={{ color: 'rgb(var(--accent-rgb))' }}>{highlight(keyText, terms)}</span> : null

  if (val && typeof val === 'object') {
    const arr = Array.isArray(val)
    const entries: [string | number, unknown][] = arr
      ? (val as unknown[]).map((v, i) => [i, v])
      : Object.entries(val as object)
    const collapsed = terms.length ? false : !!ctx.collapsed[path]
    const br = arr ? ['[', ']'] : ['{', '}']
    const header = (
      <div
        key="h"
        onClick={() => ctx.toggle(path)}
        style={{ cursor: 'pointer', paddingLeft: pad, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 5 }}
      >
        <span
          style={{
            color: 'rgba(var(--fg-rgb),.35)', fontSize: 9, width: 9, display: 'inline-block',
            transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .12s',
          }}
        >
          ▶
        </span>
        {keyEl}
        <span style={{ color: 'rgba(var(--fg-rgb),.5)' }}>
          {collapsed ? br[0] + ' … ' + br[1] + '   ' + entries.length + (arr ? ' items' : ' keys') : br[0]}
        </span>
      </div>
    )
    if (collapsed) return <div key={path}>{header}</div>
    return (
      <div key={path}>
        {header}
        {entries.map(([k, v]) => node(k, v, path + '/' + k, depth + 1, ctx))}
        <div key="c" style={{ paddingLeft: pad + 15, color: 'rgba(var(--fg-rgb),.5)' }}>{br[1]}</div>
      </div>
    )
  }

  let color = 'rgba(var(--fg-rgb),.6)'
  let disp: string
  if (typeof val === 'string') { color = 'rgb(122,178,140)'; disp = JSON.stringify(val) }
  else if (typeof val === 'number') { color = 'rgb(210,170,110)'; disp = String(val) }
  else if (typeof val === 'boolean') { color = 'rgb(170,150,205)'; disp = String(val) }
  else if (val === null) { color = 'rgba(var(--fg-rgb),.35)'; disp = 'null' }
  else disp = String(val)

  return (
    <div key={path} style={{ paddingLeft: pad + 15, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {keyEl}
      <span style={{ color }}>{highlight(disp, terms)}</span>
    </div>
  )
}

export function JsonTree({ value, ctx }: { value: unknown; ctx: TreeCtx }) {
  return <>{node(null, value, '$', 0, ctx)}</>
}
