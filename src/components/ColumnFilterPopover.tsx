import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { distinctColumn } from '../lib/table'

// Excel-style autofilter: a checklist of the column's distinct values.
// Checked values are kept; "all checked" means the column is unfiltered.
export function ColumnFilterPopover({ ci }: { ci: number }) {
  const rows = useAppStore((s) => s.xData[s.xActive]?.rows)
  const committed = useAppStore((s) => s.xValueFilters[ci])
  const setValueFilter = useAppStore((s) => s.setValueFilter)
  const clearValueFilter = useAppStore((s) => s.clearValueFilter)

  const distinct = useMemo(() => distinctColumn({ headers: [], rows: rows || [] }, ci), [rows, ci])
  const allRaws = useMemo(() => distinct.map((d) => d.raw), [distinct])

  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Set<string>>(() => new Set(committed && committed.length ? committed : allRaws))

  const shown = q ? distinct.filter((d) => d.label.toLowerCase().includes(q.toLowerCase())) : distinct
  const shownRaws = shown.map((d) => d.raw)
  const allShownChecked = shownRaws.length > 0 && shownRaws.every((r) => sel.has(r))

  const toggle = (raw: string) =>
    setSel((prev) => { const n = new Set(prev); if (n.has(raw)) n.delete(raw); else n.add(raw); return n })
  const toggleAllShown = () =>
    setSel((prev) => { const n = new Set(prev); shownRaws.forEach((r) => { if (allShownChecked) n.delete(r); else n.add(r) }); return n })

  const apply = () => {
    const values = [...sel]
    if (values.length === allRaws.length) clearValueFilter(ci) // all checked → no filter
    else setValueFilter(ci, values)
  }

  const box = (checked: boolean) => (
    <span style={{ flex: 'none', width: 15, height: 15, borderRadius: 4, border: '1px solid ' + (checked ? 'rgba(var(--accent-rgb),.9)' : 'rgba(var(--sf-rgb),.22)'), background: checked ? 'rgb(var(--accent-rgb))' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 6.5" /></svg>}
    </span>
  )
  const rowStyle = { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 9px', background: 'none', border: 'none', borderRadius: 8, color: 'rgb(var(--fg-rgb))', fontFamily: 'inherit', fontSize: 12.5, cursor: 'pointer', textAlign: 'left' } as const

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 30, width: 236, background: 'var(--panel)', border: '1px solid rgba(var(--sf-rgb),.11)', borderRadius: 12, boxShadow: '0 22px 55px -20px rgba(0,0,0,.7)', animation: 'menuIn .12s ease', fontWeight: 400 }}>
      <div style={{ padding: 8, borderBottom: '1px solid rgba(var(--sf-rgb),.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: 'rgba(var(--sf-rgb),.05)', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--fg-rgb),.45)" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search values…" style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: 'rgb(var(--fg-rgb))', fontFamily: 'inherit', fontSize: 12.5 }} />
        </div>
      </div>
      <div style={{ maxHeight: 232, overflow: 'auto', padding: 5 }}>
        {shownRaws.length > 0 && (
          <button onClick={toggleAllShown} className="hov-bg" style={{ ...rowStyle, color: 'rgba(var(--fg-rgb),.7)' }}>
            {box(allShownChecked)}<span style={{ fontWeight: 500 }}>{q ? 'Select all matching' : 'Select all'}</span>
          </button>
        )}
        {shown.map((d) => (
          <button key={d.raw} onClick={() => toggle(d.raw)} className="hov-bg" style={rowStyle}>
            {box(sel.has(d.raw))}
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: d.raw === '' ? 'rgba(var(--fg-rgb),.45)' : undefined }}>{d.label}</span>
            <span style={{ flex: 'none', font: "500 10.5px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.4)', background: 'rgba(var(--sf-rgb),.06)', borderRadius: 5, padding: '2px 6px' }}>{d.count}</span>
          </button>
        ))}
        {shown.length === 0 && <div style={{ padding: '18px 10px', textAlign: 'center', fontSize: 12, color: 'rgba(var(--fg-rgb),.4)' }}>No matching values</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderTop: '1px solid rgba(var(--sf-rgb),.07)' }}>
        <span style={{ flex: 1, font: "400 11px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.42)' }}>{sel.size} of {allRaws.length}</span>
        <button onClick={() => clearValueFilter(ci)} className="hov-fg" style={{ fontFamily: 'inherit', fontSize: 12, padding: '6px 11px', borderRadius: 8, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.65)', cursor: 'pointer' }}>Clear</button>
        <button onClick={apply} disabled={sel.size === 0} style={{ fontFamily: 'inherit', fontSize: 12, padding: '6px 13px', borderRadius: 8, border: '1px solid rgba(var(--accent-rgb),.4)', background: sel.size === 0 ? 'rgba(var(--sf-rgb),.05)' : 'rgba(var(--accent-rgb),.14)', color: sel.size === 0 ? 'rgba(var(--fg-rgb),.3)' : 'rgb(var(--accent-rgb))', cursor: sel.size === 0 ? 'not-allowed' : 'pointer' }}>Apply</button>
      </div>
    </div>
  )
}
