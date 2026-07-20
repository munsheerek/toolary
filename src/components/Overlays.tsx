import { useAppStore } from '../store/useAppStore'
import { JsonTree } from './JsonTree'
import { parseJson } from '../lib/json'
import { colOf } from '../lib/config'
import { wsIcon } from '../lib/icons'

export function DistinctModal() {
  const xd = useAppStore((s) => s.xDistinct)
  const close = useAppStore((s) => s.closeDistinct)
  const copy = useAppStore((s) => s.copyDistinct)
  const filterByValue = useAppStore((s) => s.filterByValue)
  if (!xd) return null
  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', backdropFilter: 'blur(6px) saturate(1.3)', zIndex: 105, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12vh 20px 20px', animation: 'omFade .13s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: 'var(--panel)', border: '1px solid rgba(var(--sf-rgb),.11)', borderRadius: 18, boxShadow: '0 40px 100px -30px rgba(0,0,0,.7)', overflow: 'hidden', animation: 'omPop .16s cubic-bezier(.2,.8,.3,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid rgba(var(--sf-rgb),.07)' }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Distinct · {xd.label}</div>
            <div style={{ font: "400 11.5px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.42)', marginTop: 2 }}>{xd.values.length} unique values</div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button onClick={copy} title="Copy all values" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 12, padding: '6px 11px', borderRadius: 8, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.7)', cursor: 'pointer' }}>Copy</button>
            <button onClick={close} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.55)', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        </div>
        <div style={{ maxHeight: '56vh', overflow: 'auto', padding: 6 }}>
          {xd.values.map((d, i) => (
            <button key={i} onClick={() => filterByValue(d.raw)} title="Filter by this value" className="hov-bg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', background: 'none', border: 'none', borderRadius: 9, color: 'rgb(var(--fg-rgb))', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
              <span style={{ flex: 'none', font: "500 11px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.4)', background: 'rgba(var(--sf-rgb),.06)', borderRadius: 6, padding: '3px 8px' }}>{d.count}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: '11px 18px', borderTop: '1px solid rgba(var(--sf-rgb),.07)', font: "400 11.5px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.38)' }}>Click a value to filter the table by it</div>
      </div>
    </div>
  )
}

export function FullscreenTree() {
  const open = useAppStore((s) => s.fullscreen)
  const jsonInput = useAppStore((s) => s.jsonInput)
  const collapsed = useAppStore((s) => s.collapsed)
  const toggle = useAppStore((s) => s.toggleCollapse)
  const close = useAppStore((s) => s.closeFullscreen)
  if (!open) return null
  const p = parseJson(jsonInput)
  const mono = { fontFamily: "'JetBrains Mono'", fontSize: 13.5, lineHeight: 1.85 }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'omFade .14s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 26px', borderBottom: '1px solid rgba(var(--sf-rgb),.07)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, fontWeight: 600 }}>
          <span style={{ color: colOf('json'), display: 'flex' }}>{wsIcon('json', 22)}</span>JSON Tree — fullscreen
        </span>
        <button onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', fontSize: 13, padding: '8px 13px', borderRadius: 9, border: '1px solid rgba(var(--sf-rgb),.1)', background: 'rgba(var(--sf-rgb),.05)', color: 'rgb(var(--fg-rgb))', cursor: 'pointer' }}>
          Close <kbd style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, background: 'rgba(var(--sf-rgb),.08)', borderRadius: 5, padding: '2px 6px' }}>esc</kbd>
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '26px 34px' }}>
        {p.ok ? (
          <div style={mono}><JsonTree value={p.value} ctx={{ collapsed, toggle, terms: [] }} /></div>
        ) : (
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: 'rgb(224,140,140)', display: 'flex', gap: 10 }}><span>✕</span><span>Parse error: {p.error}</span></div>
        )}
      </div>
    </div>
  )
}
