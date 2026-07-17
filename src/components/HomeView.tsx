import { useAppStore } from '../store/useAppStore'
import { WS, wsById } from '../lib/workspaces'
import { CONFIG, GITHUB_URL, colOf, tintOf } from '../lib/config'
import { wsIcon } from '../lib/icons'
import { timeAgo } from '../lib/highlight'

function greeting(): { line: string; show: boolean } {
  const mode = CONFIG.greetingMode
  if (mode === 'None') return { line: '', show: false }
  if (mode === 'Focus') return { line: 'Ready when you are. What are you working on?', show: true }
  const h = new Date().getHours()
  const g = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return { line: g + '. What are you working on?', show: true }
}

export function HomeView() {
  const recents = useAppStore((s) => s.recents)
  const favs = useAppStore((s) => s.favs)
  const openPalette = useAppStore((s) => s.openPalette)
  const clearRecents = useAppStore((s) => s.clearRecents)
  const launchTool = useAppStore((s) => s.launchTool)
  const launchWorkspace = useAppStore((s) => s.launchWorkspace)
  const toggleFav = useAppStore((s) => s.toggleFav)

  const hero = greeting()
  const favWorkspaces = WS.filter((w) => favs.includes(w.id))
  const browseCount = WS.length + ' workspaces · ' + WS.reduce((a, w) => a + w.count, 0) + ' tools'

  return (
    <>
      <section style={{ padding: '66px 0 52px', textAlign: 'center' }}>
        {hero.show && (
          <p style={{ margin: '0 0 22px', fontSize: 15, color: 'rgba(var(--fg-rgb),.5)', letterSpacing: '.01em' }}>{hero.line}</p>
        )}
        <button
          onClick={openPalette}
          className="hov-search"
          style={{ width: '100%', maxWidth: 680, display: 'flex', alignItems: 'center', gap: 14, margin: '0 auto', padding: '18px 18px 18px 20px', background: 'rgba(var(--sf-rgb),.035)', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 18, cursor: 'text', textAlign: 'left', color: 'inherit', fontFamily: 'inherit', boxShadow: '0 1px 0 rgba(var(--sf-rgb),.06) inset,0 22px 46px -30px rgba(0,0,0,.6)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--fg-rgb),.5)" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <span style={{ flex: 1, fontSize: 16, color: 'rgba(var(--fg-rgb),.45)' }}>Search tools, workspaces &amp; actions…</span>
          <kbd style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: 'rgba(var(--fg-rgb),.55)', background: 'rgba(var(--sf-rgb),.06)', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 7, padding: '4px 8px' }}>⌘K</kbd>
        </button>
      </section>

      {recents.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 16px' }}>
            <h2 style={{ fontWeight: 600, fontSize: 12, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)', margin: 0 }}>Continue working</h2>
            <button onClick={clearRecents} style={{ background: 'none', border: 'none', color: 'rgba(var(--fg-rgb),.3)', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>Clear</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 12 }}>
            {recents.map((r, i) => {
              const w = wsById(r.wsId) || WS[0]
              return (
                <button key={i} onClick={() => launchTool(r.name, r.wsId)} className="hov-bg" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, background: 'rgba(var(--sf-rgb),.028)', border: '1px solid rgba(var(--sf-rgb),.07)', borderRadius: 13, cursor: 'pointer', textAlign: 'left', color: 'inherit', fontFamily: 'inherit' }}>
                  <span style={{ flex: 'none', width: 34, height: 34, borderRadius: 9, background: tintOf(r.wsId, 0.14), color: colOf(r.wsId), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wsIcon(w.id, 18)}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'rgba(var(--fg-rgb),.42)', marginTop: 2 }}>{w.name + ' · ' + timeAgo(r.ts)}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {favWorkspaces.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <h2 style={{ fontWeight: 600, fontSize: 12, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)', margin: '0 0 16px' }}>Favorite workspaces</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {favWorkspaces.map((w) => (
              <button key={w.id} onClick={() => launchWorkspace(w.id)} style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 13, padding: 14, background: tintOf(w.id, 0.05), border: '1px solid ' + tintOf(w.id, 0.18), borderRadius: 14, cursor: 'pointer', textAlign: 'left', color: 'inherit', fontFamily: 'inherit' }}>
                <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 11, background: tintOf(w.id, 0.14), color: colOf(w.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wsIcon(w.id, 22)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{w.name} Workspace</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(var(--fg-rgb),.45)', marginTop: 2 }}>{w.count + ' tools'}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={colOf(w.id)} stroke={colOf(w.id)} strokeWidth="1"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" /></svg>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 16px' }}>
          <h2 style={{ fontWeight: 600, fontSize: 12, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)', margin: 0 }}>Browse workspaces</h2>
          <span style={{ font: "400 12px/1 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.32)' }}>{browseCount}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {WS.map((w) => {
            const fav = favs.includes(w.id)
            const quick = w.tools.slice(0, 2)
            return (
              <div key={w.id} onClick={() => launchWorkspace(w.id)} className="ws-card" style={{ position: 'relative', padding: 20, background: 'rgba(var(--sf-rgb),.026)', border: '1px solid rgba(var(--sf-rgb),.07)', borderRadius: 18, boxShadow: '0 1px 0 rgba(var(--sf-rgb),.045) inset', transition: 'transform .18s,border-color .18s,box-shadow .18s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: tintOf(w.id, 0.14), color: colOf(w.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wsIcon(w.id, 24)}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(w.id) }} title="Toggle favorite" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: fav ? colOf(w.id) : 'rgba(var(--fg-rgb),.3)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? colOf(w.id) : 'none'} stroke="currentColor" strokeWidth="1.5"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" /></svg>
                  </button>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: '16px 0 5px' }}>{w.name} Workspace</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(var(--fg-rgb),.5)', margin: '0 0 18px', textWrap: 'pretty' }}>{w.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(var(--sf-rgb),.06)' }}>
                  <span style={{ font: "400 11px/1 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.36)' }}>{w.count + ' tools'}</span>
                  <div style={{ display: 'flex', gap: 7 }}>
                    {quick.map((t) => (
                      <button key={t} onClick={(e) => { e.stopPropagation(); launchTool(t, w.id) }} className="ws-quick" style={{ fontFamily: 'inherit', fontSize: 12, padding: '5px 10px', borderRadius: 8, border: 'none', background: 'rgba(var(--sf-rgb),.05)', color: 'rgba(var(--fg-rgb),.7)', cursor: 'pointer' }}>{t.split(' ')[0]}</button>
                    ))}
                    {w.tools.length > 2 && (
                      <button onClick={(e) => { e.stopPropagation(); launchWorkspace(w.id) }} title="Open workspace" className="hov-morebtn" style={{ fontFamily: "'JetBrains Mono'", fontSize: 11.5, padding: '5px 9px', borderRadius: 8, border: '1px solid rgba(var(--sf-rgb),.08)', background: 'transparent', color: 'rgba(var(--fg-rgb),.45)', cursor: 'pointer' }}>{'+' + (w.tools.length - 2)}</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <footer style={{ marginTop: 64, paddingTop: 20, borderTop: '1px solid rgba(var(--sf-rgb),.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, font: "400 12px/1.4 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.3)' }}>
        <span>No account. No sync. Everything stays in this browser.</span>
        <a href={GITHUB_URL} target="_blank" rel="noopener" title="Open Toolary on GitHub — star, fork and contribute" className="hov-github" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'rgba(var(--fg-rgb),.42)', textDecoration: 'none', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 9, padding: '6px 8px 6px 11px', background: 'rgba(var(--sf-rgb),.03)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" /></svg>
          <span>Contribute on GitHub</span>
        </a>
      </footer>
    </>
  )
}
