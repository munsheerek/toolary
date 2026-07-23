import { useAppStore, type View } from '../store/useAppStore'
import { colOf, tintOf } from '../lib/config'
import { wsIcon } from '../lib/icons'

const boxBtn = {
  flex: 'none' as const, width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(var(--sf-rgb),.09)',
  background: 'rgba(var(--sf-rgb),.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

export function WorkspaceHeader({ view, name, subtitle, compactSearch, actions }: { view: View; name: string; subtitle: string; compactSearch?: boolean; actions?: React.ReactNode }) {
  const goHome = useAppStore((s) => s.goHome)
  const openPalette = useAppStore((s) => s.openPalette)
  const toggleFav = useAppStore((s) => s.toggleFav)
  const favs = useAppStore((s) => s.favs)
  const isFav = favs.includes(view)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0 22px' }}>
      <button onClick={goHome} title="Back to workspaces" className="hov-soft" style={{ ...boxBtn, color: 'rgba(var(--fg-rgb),.7)', fontSize: 16 }}>←</button>
      <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 11, background: tintOf(view, 0.14), color: colOf(view), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wsIcon(view, 22)}</span>
      <div>
        <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-.02em' }}>{name} Workspace</div>
        <div style={{ fontSize: 11.5, color: 'rgba(var(--fg-rgb),.4)', fontFamily: "'JetBrains Mono'", marginTop: 1 }}>{subtitle}</div>
      </div>
      <div style={{ flex: 1 }} />
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16, borderRight: '1px solid rgba(var(--sf-rgb),.1)', paddingRight: 24 }}>
          {actions}
        </div>
      )}
      {compactSearch ? (
        <button onClick={openPalette} title="Search tools" style={{ ...boxBtn, color: 'rgba(var(--fg-rgb),.55)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </button>
      ) : (
        <button onClick={openPalette} className="hov-searchbtn" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', borderRadius: 10, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.55)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          Search tools
          <kbd style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, background: 'rgba(var(--sf-rgb),.07)', borderRadius: 5, padding: '2px 6px' }}>⌘K</kbd>
        </button>
      )}
      <button onClick={() => toggleFav(view)} title="Favorite workspace" style={{ ...boxBtn, color: isFav ? colOf(view) : 'rgba(var(--fg-rgb),.35)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill={isFav ? colOf(view) : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" /></svg>
      </button>
    </div>
  )
}
