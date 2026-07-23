import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { WorkspaceHeader } from './WorkspaceHeader'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { wsById } from '../lib/workspaces'

const btnStyle = { padding: '8px 12px', background: 'rgba(var(--accent-rgb),.15)', color: 'rgb(var(--accent-rgb))', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 } as const
const inputStyle = { width: '100%', background: 'rgba(var(--sf-rgb),.04)', border: '1px solid rgba(var(--sf-rgb),.1)', borderRadius: 8, padding: '12px 14px', color: 'rgba(var(--fg-rgb),.9)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", outline: 'none', resize: 'vertical' as const } as const
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(var(--fg-rgb),.5)', textTransform: 'uppercase' as const, letterSpacing: '.05em', marginBottom: 6 } as const
const blockStyle = { background: 'rgba(var(--sf-rgb),.02)', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 12, padding: 20 } as const

// --- Tool: JWT Decoder ---
function JwtDecoder() {
  const [token, setToken] = useState('')
  const decoded = useMemo(() => {
    if (!token) return null
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      const decodeB64 = (str: string) => decodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
      return {
        header: JSON.stringify(JSON.parse(decodeB64(parts[0])), null, 2),
        payload: JSON.stringify(JSON.parse(decodeB64(parts[1])), null, 2),
      }
    } catch { return null }
  }, [token])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div>
        <label style={labelStyle}>JWT Token</label>
        <textarea style={{ ...inputStyle, minHeight: 100 }} value={token} onChange={e => setToken(e.target.value)} placeholder="Paste your eyJ... token here" />
      </div>
      {decoded ? (
        <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Header</label>
            <div style={{ flex: 1, overflow: 'auto', borderRadius: 8, border: '1px solid rgba(var(--sf-rgb),.1)' }}>
              <CodeMirror value={decoded.header} theme={oneDark} height="100%" extensions={[json()]} readOnly />
            </div>
          </div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Payload</label>
            <div style={{ flex: 1, overflow: 'auto', borderRadius: 8, border: '1px solid rgba(var(--sf-rgb),.1)' }}>
              <CodeMirror value={decoded.payload} theme={oneDark} height="100%" extensions={[json()]} readOnly />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...blockStyle, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(var(--fg-rgb),.4)' }}>{token ? 'Invalid JWT' : 'Paste a token to decode'}</div>
      )}
    </div>
  )
}

// --- Tool: Base64 Encode / Decode ---
function Base64Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode'|'decode'>('encode')
  const [output, setOutput] = useState('')

  useEffect(() => {
    try {
      if (!input) setOutput('')
      else if (mode === 'encode') setOutput(btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))))
      else setOutput(decodeURIComponent(atob(input).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')))
    } catch { setOutput('Invalid input') }
  }, [input, mode])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnStyle, opacity: mode === 'encode' ? 1 : 0.5 }} onClick={() => { setMode('encode'); setInput(output) }}>Encode</button>
        <button style={{ ...btnStyle, opacity: mode === 'decode' ? 1 : 0.5 }} onClick={() => { setMode('decode'); setInput(output) }}>Decode</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Input</label>
        <textarea style={{ ...inputStyle, flex: 1 }} value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Text to encode...' : 'Base64 to decode...'} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Output</label>
        <textarea style={{ ...inputStyle, flex: 1 }} value={output} readOnly />
      </div>
    </div>
  )
}

// --- Tool: URL Encode / Decode ---
function UrlTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode'|'decode'>('encode')
  const [output, setOutput] = useState('')

  useEffect(() => {
    try {
      if (!input) setOutput('')
      else if (mode === 'encode') setOutput(encodeURIComponent(input))
      else setOutput(decodeURIComponent(input))
    } catch { setOutput('Invalid input') }
  }, [input, mode])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnStyle, opacity: mode === 'encode' ? 1 : 0.5 }} onClick={() => { setMode('encode'); setInput(output) }}>Encode</button>
        <button style={{ ...btnStyle, opacity: mode === 'decode' ? 1 : 0.5 }} onClick={() => { setMode('decode'); setInput(output) }}>Decode</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Input</label>
        <textarea style={{ ...inputStyle, flex: 1 }} value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encode' ? 'URL to encode...' : 'URL to decode...'} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Output</label>
        <textarea style={{ ...inputStyle, flex: 1 }} value={output} readOnly />
      </div>
    </div>
  )
}

// --- Tool: HTML Entity ---
function HtmlEntityTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode'|'decode'>('encode')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input) { setOutput(''); return }
    if (mode === 'encode') {
      const el = document.createElement('div'); el.innerText = input; setOutput(el.innerHTML)
    } else {
      const doc = new DOMParser().parseFromString(input, 'text/html')
      setOutput(doc.documentElement.textContent || '')
    }
  }, [input, mode])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnStyle, opacity: mode === 'encode' ? 1 : 0.5 }} onClick={() => { setMode('encode'); setInput(output) }}>Encode</button>
        <button style={{ ...btnStyle, opacity: mode === 'decode' ? 1 : 0.5 }} onClick={() => { setMode('decode'); setInput(output) }}>Decode</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Input</label>
        <textarea style={{ ...inputStyle, flex: 1 }} value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encode' ? 'HTML to encode...' : 'Entities to decode...'} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Output</label>
        <textarea style={{ ...inputStyle, flex: 1 }} value={output} readOnly />
      </div>
    </div>
  )
}

// --- Tool: Hash Generator ---
function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState({ sha1: '', sha256: '', sha384: '', sha512: '' })

  useEffect(() => {
    if (!input) { setHashes({ sha1: '', sha256: '', sha384: '', sha512: '' }); return }
    const buf = new TextEncoder().encode(input)
    const toHex = (b: ArrayBuffer) => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')
    Promise.all([
      crypto.subtle.digest('SHA-1', buf).then(toHex),
      crypto.subtle.digest('SHA-256', buf).then(toHex),
      crypto.subtle.digest('SHA-384', buf).then(toHex),
      crypto.subtle.digest('SHA-512', buf).then(toHex),
    ]).then(([sha1, sha256, sha384, sha512]) => setHashes({ sha1, sha256, sha384, sha512 }))
  }, [input])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Input String</label>
        <textarea style={{ ...inputStyle, flex: 1 }} value={input} onChange={e => setInput(e.target.value)} placeholder="Type something to hash..." />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo} style={blockStyle}>
            <label style={labelStyle}>{algo.toUpperCase()}</label>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'rgba(var(--fg-rgb),.8)', wordBreak: 'break-all' }}>{hash || '...'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Tool: UUID Generator ---
function UuidGenerator() {
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState<string[]>([])
  const [upper, setUpper] = useState(false)
  const [hyphens, setHyphens] = useState(true)

  const generate = () => {
    const list = Array.from({ length: count }).map(() => {
      let id: string = crypto.randomUUID()
      if (!hyphens) id = id.replace(/-/g, '')
      if (upper) id = id.toUpperCase()
      return id
    })
    setUuids(list)
  }

  useEffect(() => { generate() }, []) // eslint-disable-line

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ ...blockStyle, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Count:</label>
          <input type="number" min="1" max="1000" value={count} onChange={e => setCount(Number(e.target.value))} style={{ ...inputStyle, width: 80, padding: '6px 10px' }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} /> Uppercase
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={hyphens} onChange={e => setHyphens(e.target.checked)} /> Hyphens
        </label>
        <div style={{ flex: 1 }} />
        <button style={btnStyle} onClick={generate}>Generate UUIDs</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea style={{ ...inputStyle, flex: 1 }} value={uuids.join('\n')} readOnly />
      </div>
    </div>
  )
}

// --- Tool: Color Converter ---
function ColorConverter() {
  const [hex, setHex] = useState('#6A95F9')
  const [rgb, setRgb] = useState('rgb(106, 149, 249)')
  const [hsl, setHsl] = useState('hsl(222, 91%, 70%)')

  const updateFromHex = (h: string) => {
    setHex(h)
    if (!/^#[0-9A-Fa-f]{6}$/i.test(h)) return
    const r = parseInt(h.slice(1,3), 16), g = parseInt(h.slice(3,5), 16), b = parseInt(h.slice(5,7), 16)
    setRgb(`rgb(${r}, ${g}, ${b})`)
    const r_ = r/255, g_ = g/255, b_ = b/255
    const cmax = Math.max(r_, g_, b_), cmin = Math.min(r_, g_, b_), d = cmax - cmin
    let h_ = 0, s_ = 0, l_ = (cmax + cmin) / 2
    if (d !== 0) {
      s_ = l_ > 0.5 ? d / (2 - cmax - cmin) : d / (cmax + cmin)
      switch(cmax) {
        case r_: h_ = (g_ - b_) / d + (g_ < b_ ? 6 : 0); break
        case g_: h_ = (b_ - r_) / d + 2; break
        case b_: h_ = (r_ - g_) / d + 4; break
      }
      h_ = Math.round(h_ * 60)
    }
    setHsl(`hsl(${h_}, ${Math.round(s_*100)}%, ${Math.round(l_*100)}%)`)
  }

  return (
    <div style={{ display: 'flex', gap: 24, height: '100%' }}>
      <div style={{ flex: 1, ...blockStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <input type="color" value={hex} onChange={e => updateFromHex(e.target.value)} style={{ width: 120, height: 120, border: 'none', borderRadius: 60, cursor: 'pointer', background: 'transparent' }} />
        <div style={{ fontSize: 16, fontWeight: 500 }}>Pick a color</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>HEX</label>
          <input type="text" style={inputStyle} value={hex} onChange={e => updateFromHex(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>RGB</label>
          <input type="text" style={inputStyle} value={rgb} readOnly />
        </div>
        <div>
          <label style={labelStyle}>HSL</label>
          <input type="text" style={inputStyle} value={hsl} readOnly />
        </div>
      </div>
    </div>
  )
}


export function DevWorkspace() {
  const mode = useAppStore(s => s.mode)
  const setMode = useAppStore(s => s.setMode)
  const devWorkspace = wsById('dev')!
  
  // Ensure mode is a valid dev tool, default to first tool otherwise
  useEffect(() => {
    if (!devWorkspace.tools.includes(mode)) {
      setMode(devWorkspace.tools[0])
    }
  }, [mode, setMode, devWorkspace.tools])

  const renderTool = () => {
    switch (mode) {
      case 'JWT Decoder': return <JwtDecoder />
      case 'Base64 Encode/Decode': return <Base64Tool />
      case 'URL Encode/Decode': return <UrlTool />
      case 'Hash Generator': return <HashGenerator />
      case 'UUID Generator': return <UuidGenerator />
      case 'HTML Entity Encode/Decode': return <HtmlEntityTool />
      case 'Color Converter': return <ColorConverter />
      default: return <JwtDecoder />
    }
  }

  return (
    <div style={{ padding: '6px 0 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <WorkspaceHeader view="dev" name="Developer" subtitle="local-first utilities" />

      <div style={{ display: 'flex', flex: 1, gap: 16, marginTop: 16, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', background: 'rgba(var(--sf-rgb),.026)', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(var(--sf-rgb),.06)' }}>
            <span style={{ font: "600 11px 'JetBrains Mono'", letterSpacing: '.05em', color: 'rgba(var(--fg-rgb),.6)' }}>UTILITIES</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {devWorkspace.tools.map(tool => {
              const isActive = tool === mode
              return (
                <div key={tool} onClick={() => setMode(tool)} style={{ padding: '8px 10px', borderRadius: 8, background: isActive ? 'rgba(var(--accent-rgb),.1)' : 'transparent', color: isActive ? 'rgb(var(--accent-rgb))' : 'rgba(var(--fg-rgb),.8)', cursor: 'pointer', marginBottom: 4, fontSize: 13, fontWeight: isActive ? 500 : 400 }}>
                  {tool}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Pane */}
        <div style={{ flex: 1, background: 'rgba(var(--bg))', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>{mode}</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {renderTool()}
          </div>
        </div>
      </div>
    </div>
  )
}
