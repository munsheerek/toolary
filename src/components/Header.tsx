import { useAppStore } from '../store/useAppStore'

export function Header() {
  const goHome = useAppStore((s) => s.goHome)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const theme = useAppStore((s) => s.theme)
  const thumbX = theme === 'light' ? 'translateX(0)' : 'translateX(30px)'

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 8px' }}>
      <div onClick={goHome} title="Toolary home" style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(var(--accent-rgb),.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <rect x="4" y="4" width="7" height="7" rx="2" fill="rgb(var(--accent-rgb))" />
            <rect x="13" y="4" width="7" height="7" rx="2" fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="1.8" />
            <rect x="4" y="13" width="7" height="7" rx="2" fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="1.8" />
            <rect x="13" y="13" width="7" height="7" rx="2" fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="1.8" />
          </svg>
        </div>
        <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.01em' }}>Toolary</span>
      </div>
      <button
        onClick={toggleTheme}
        title="Toggle light / dark"
        aria-label="Toggle appearance"
        style={{ position: 'relative', width: 60, height: 30, borderRadius: 999, border: '1px solid rgba(var(--sf-rgb),.1)', background: 'rgba(var(--sf-rgb),.05)', cursor: 'pointer', padding: 0, flex: 'none' }}
      >
        <span style={{ position: 'absolute', top: 0, left: 0, width: 30, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(var(--accent-rgb),.85)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.4M12 19.6V22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2 12h2.4M19.6 12H22M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
          </svg>
        </span>
        <span style={{ position: 'absolute', top: 0, right: 0, width: 30, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(var(--fg-rgb),.5)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 13.2A8 8 0 1 1 10.8 3.5 6.3 6.3 0 0 0 20.5 13.2z" />
          </svg>
        </span>
        <span style={{ position: 'absolute', top: 3, left: 3, width: 24, height: 24, borderRadius: '50%', background: 'rgb(var(--fg-rgb))', transform: thumbX, transition: 'transform .22s cubic-bezier(.3,.8,.3,1)', boxShadow: '0 2px 6px rgba(0,0,0,.35)' }} />
      </button>
    </header>
  )
}
