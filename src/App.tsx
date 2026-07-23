import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { buildAppearance } from './lib/config'
import { Header } from './components/Header'
import { HomeView } from './components/HomeView'
import { JsonWorkspace } from './components/JsonWorkspace'
import { ExcelWorkspace } from './components/ExcelWorkspace'
import { MarkdownWorkspace } from './components/MarkdownWorkspace'
import { DevWorkspace } from './components/DevWorkspace'
import { CommandPalette } from './components/CommandPalette'
import { DistinctModal, FullscreenTree } from './components/Overlays'
import { Toast } from './components/Toast'

function App() {
  const init = useAppStore((s) => s.init)
  const theme = useAppStore((s) => s.theme)
  const view = useAppStore((s) => s.view)

  useEffect(() => { init() }, [init])

  // Global keyboard: ⌘K / Ctrl+K toggles palette, Escape closes overlays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = useAppStore.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (st.paletteOpen) st.closePalette()
        else st.openPalette()
      } else if (e.key === 'Escape') {
        if (st.fullscreen) st.closeFullscreen()
        else if (st.xDistinct) st.closeDistinct()
        else if (st.paletteOpen) st.closePalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close an open column menu when clicking elsewhere.
  useEffect(() => {
    const onClick = () => {
      const st = useAppStore.getState()
      if (st.xColMenu !== -1) st.toggleColMenu(st.xColMenu)
      if (st.xFilterMenu !== -1) st.closeFilterMenu()
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const appearance = buildAppearance(theme)

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: '100vh',
        color: 'rgb(var(--fg-rgb))',
        background: 'radial-gradient(1200px 560px at 50% -160px,rgba(255,255,255,.05),transparent 60%) fixed, var(--bg)',
        ...(Object.fromEntries(appearance.cssVars.split(';').filter(Boolean).map((d) => { const i = d.indexOf(':'); return [d.slice(0, i), d.slice(i + 1)] })) as React.CSSProperties),
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 32px 96px' }}>
        <Header />
        {view === 'home' && <HomeView />}
        {view === 'json' && <JsonWorkspace />}
        {view === 'excel' && <ExcelWorkspace />}
        {view === 'markdown' && <MarkdownWorkspace />}
        {view === 'dev' && <DevWorkspace />}
      </div>

      <FullscreenTree />
      <DistinctModal />
      <CommandPalette />
      <Toast />
    </div>
  )
}

export default App
