import { useEffect, useRef, type ReactNode } from 'react'
import { useAppStore } from '../store/useAppStore'
import { WS, ALL_TOOLS, ACTIONS, wsById, type ActionDef } from '../lib/workspaces'
import { GITHUB_URL, colOf, tintOf } from '../lib/config'
import { wsIcon, actionIcon } from '../lib/icons'
import { highlight, terms } from '../lib/highlight'

interface ResultItem {
  name: string
  wsId?: string
  action?: ActionDef
  kind: 'recent' | 'tool' | 'workspace' | 'action'
}

export function CommandPalette() {
  const open = useAppStore((s) => s.paletteOpen)
  const query = useAppStore((s) => s.query)
  const active = useAppStore((s) => s.active)
  const recents = useAppStore((s) => s.recents)
  const closePalette = useAppStore((s) => s.closePalette)
  const setQuery = useAppStore((s) => s.setQuery)
  const setActive = useAppStore((s) => s.setActive)
  const launchTool = useAppStore((s) => s.launchTool)
  const launchWorkspace = useAppStore((s) => s.launchWorkspace)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const toast_ = useAppStore((s) => s.toast_)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { const t = setTimeout(() => inputRef.current?.focus(), 30); return () => clearTimeout(t) }
  }, [open])

  if (!open) return null

  const q = query.trim().toLowerCase()
  let raw: ResultItem[]
  if (!q) {
    let items: ResultItem[] = recents.slice(0, 5).map((r) => ({ name: r.name, wsId: r.wsId, kind: 'recent' }))
    if (items.length === 0) items = ALL_TOOLS.slice(0, 5).map((t) => ({ name: t.name, wsId: t.ws.id, kind: 'tool' }))
    raw = [...items, ...ACTIONS.map((a) => ({ name: a.name, action: a, kind: 'action' as const }))]
  } else {
    const wsHits: ResultItem[] = WS.filter((w) => (w.name + ' workspace').toLowerCase().includes(q)).map((w) => ({ name: w.name + ' Workspace', wsId: w.id, kind: 'workspace' }))
    const toolHits: ResultItem[] = ALL_TOOLS.filter((t) => t.name.toLowerCase().includes(q) || t.ws.name.toLowerCase().includes(q)).map((t) => ({ name: t.name, wsId: t.ws.id, kind: 'tool' }))
    const actHits: ResultItem[] = ACTIONS.filter((a) => (a.name + ' ' + a.keys).toLowerCase().includes(q)).map((a) => ({ name: a.name, action: a, kind: 'action' }))
    raw = [...wsHits, ...toolHits, ...actHits].slice(0, 9)
  }

  const activeIdx = Math.min(active, Math.max(0, raw.length - 1))
  const qTerms = terms(query)

  const runAction = (a: ActionDef) => {
    if (a.at === 'theme') toggleTheme()
    else { try { window.open(GITHUB_URL, '_blank', 'noopener') } catch { /* ignore */ } closePalette(); toast_('Opening GitHub') }
  }
  const runItem = (it: ResultItem) => {
    if (it.kind === 'action' && it.action) return runAction(it.action)
    if (it.kind === 'workspace') return launchWorkspace(it.wsId!)
    return launchTool(it.name, it.wsId!)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const n = raw.length
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, n - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (raw[activeIdx]) runItem(raw[activeIdx]) }
  }

  const results = raw.map((it, i) => {
    const bg = i === activeIdx ? 'rgba(var(--sf-rgb),.06)' : 'transparent'
    let name: ReactNode, sub: string, icon: ReactNode, color: string, tint: string, kind: string
    if (it.kind === 'action' && it.action) {
      name = highlight(it.name, qTerms); sub = it.action.sub; icon = actionIcon(it.action.at, 18)
      color = 'rgb(var(--accent-rgb))'; tint = 'rgba(var(--accent-rgb),.14)'; kind = 'action'
    } else {
      const w = wsById(it.wsId!) || WS[0]
      const isW = it.kind === 'workspace'
      name = highlight(it.name, qTerms); sub = isW ? w.count + ' tools' : w.name + ' Workspace'
      icon = wsIcon(w.id, 18); color = colOf(it.wsId!); tint = tintOf(it.wsId!, 0.14)
      kind = it.kind === 'recent' ? 'recent' : it.kind
    }
    return { it, i, bg, name, sub, icon, color, tint, kind }
  })

  const resultsLabel = query.trim() ? 'Results' : (recents.length ? 'Recent' : 'Suggested')
  const noResults = !!query.trim() && raw.length === 0

  return (
    <div onClick={closePalette} style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', backdropFilter: 'blur(8px) saturate(1.3)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '14vh 20px 20px', animation: 'omFade .13s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, background: 'var(--panel)', border: '1px solid rgba(var(--sf-rgb),.11)', borderRadius: 20, boxShadow: '0 44px 110px -34px rgba(0,0,0,.66),0 1px 0 rgba(var(--sf-rgb),.09) inset', overflow: 'hidden', animation: 'omPop .16s cubic-bezier(.2,.8,.3,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '16px 18px', borderBottom: '1px solid rgba(var(--sf-rgb),.07)' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--fg-rgb),.5)" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey} placeholder="Search tools, workspaces & actions…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'rgb(var(--fg-rgb))', fontSize: 16 }} />
          <kbd style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: 'rgba(var(--fg-rgb),.4)', background: 'rgba(var(--sf-rgb),.06)', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 6, padding: '3px 7px' }}>esc</kbd>
        </div>
        <div style={{ maxHeight: '52vh', overflowY: 'auto', padding: 8 }}>
          <div style={{ padding: '6px 10px 8px', font: "600 10px/1 'JetBrains Mono'", letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.32)' }}>{resultsLabel}</div>
          {results.map((res) => (
            <button key={res.i} onClick={() => runItem(res.it)} onMouseEnter={() => setActive(res.i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '11px 12px', background: res.bg, border: 'none', borderRadius: 11, cursor: 'pointer', textAlign: 'left', color: 'inherit', fontFamily: 'inherit' }}>
              <span style={{ flex: 'none', width: 32, height: 32, borderRadius: 9, background: res.tint, color: res.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{res.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{res.name}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'rgba(var(--fg-rgb),.42)', marginTop: 1 }}>{res.sub}</span>
              </span>
              <span style={{ flex: 'none', font: "500 10px/1 'JetBrains Mono'", letterSpacing: '.05em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.34)', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 6, padding: '4px 7px' }}>{res.kind}</span>
            </button>
          ))}
          {noResults && (
            <div style={{ padding: '34px 12px', textAlign: 'center', color: 'rgba(var(--fg-rgb),.38)', fontSize: 14 }}>No matches for “{query}”.</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '11px 16px', borderTop: '1px solid rgba(var(--sf-rgb),.07)', fontSize: 11.5, color: 'rgba(var(--fg-rgb),.4)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><kbd style={{ fontFamily: "'JetBrains Mono'", background: 'rgba(var(--sf-rgb),.06)', borderRadius: 5, padding: '2px 5px' }}>↑↓</kbd> navigate</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><kbd style={{ fontFamily: "'JetBrains Mono'", background: 'rgba(var(--sf-rgb),.06)', borderRadius: 5, padding: '2px 6px' }}>↵</kbd> open</span>
          <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.28)' }}>Toolary</span>
        </div>
      </div>
    </div>
  )
}
