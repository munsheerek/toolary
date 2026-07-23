import { useState, useMemo, useEffect, useRef } from 'react'
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


// --- Tool: Password Generator ---
function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ upper: true, lower: true, nums: true, syms: true })
  const [password, setPassword] = useState('')

  const generate = () => {
    let chars = ''
    if (opts.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (opts.lower) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (opts.nums) chars += '0123456789'
    if (opts.syms) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-='
    if (!chars) { setPassword('Select at least one character set'); return }
    
    const arr = new Uint32Array(length)
    crypto.getRandomValues(arr)
    let pwd = ''
    for (let i = 0; i < length; i++) {
      pwd += chars[arr[i] % chars.length]
    }
    setPassword(pwd)
  }

  useEffect(() => { generate() }, []) // eslint-disable-line

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ ...blockStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <label style={{ ...labelStyle, margin: 0, width: 80 }}>Length: {length}</label>
          <input type="range" min="8" max="128" value={length} onChange={e => setLength(Number(e.target.value))} style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {Object.entries({ upper: 'Uppercase', lower: 'Lowercase', nums: 'Numbers', syms: 'Symbols' }).map(([k, label]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={opts[k as keyof typeof opts]} onChange={e => setOpts({ ...opts, [k]: e.target.checked })} /> {label}
            </label>
          ))}
        </div>
        <div>
          <button style={btnStyle} onClick={generate}>Regenerate Password</button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea style={{ ...inputStyle, flex: 1, fontSize: 24, letterSpacing: '2px', wordBreak: 'break-all' }} value={password} readOnly />
      </div>
    </div>
  )
}

// --- Tool: Sample Data Downloader ---
function SampleDownloader() {
  const downloadBlob = (blob: Blob, name: string) => {
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u; a.download = name; a.click()
    setTimeout(() => URL.revokeObjectURL(u), 1000)
  }

  const dlPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.text("Dummy PDF Document", 10, 10)
      doc.text("Generated by Toolary Developer Workspace", 10, 20)
      doc.save("sample.pdf")
    } catch {
      const p = `<html style="font-family:sans-serif"><h2>Dummy PDF</h2><p>Generated by Toolary</p></html>`
      downloadBlob(new Blob([p], { type: 'application/pdf' }), 'sample.pdf')
    }
  }

  const dlImage = (format: 'png' | 'jpeg') => {
    const canvas = document.createElement('canvas')
    canvas.width = 800; canvas.height = 600
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, 800, 600)
    ctx.fillStyle = '#ccc'; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(`Sample Image (${format.toUpperCase()})`, 400, 300)
    canvas.toBlob(blob => downloadBlob(blob!, `sample.${format}`), `image/${format}`)
  }

  const dlCSV = () => {
    const csv = 'id,name,email,role\\n1,John Doe,john@example.com,Admin\\n2,Jane Smith,jane@example.com,User\\n3,Bob Wilson,bob@example.com,Editor\\n'
    downloadBlob(new Blob([csv], { type: 'text/csv' }), 'sample.csv')
  }

  const dlJSON = () => {
    const json = JSON.stringify([{ id: 1, name: 'John Doe', active: true }, { id: 2, name: 'Jane Smith', active: false }], null, 2)
    downloadBlob(new Blob([json], { type: 'application/json' }), 'sample.json')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ fontSize: 14, color: 'rgba(var(--fg-rgb),.6)', lineHeight: 1.5 }}>
        Generate standard sample files instantly for testing file upload forms, parsing scripts, and dummy data pipelines. 
        Files are generated entirely in your browser.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <button style={{ ...btnStyle, padding: '16px 24px', flexDirection: 'column', gap: 12, height: 100, width: 140, justifyContent: 'center' }} onClick={dlPDF}>
          <div style={{ fontSize: 24 }}>📄</div>
          Blank PDF
        </button>
        <button style={{ ...btnStyle, padding: '16px 24px', flexDirection: 'column', gap: 12, height: 100, width: 140, justifyContent: 'center' }} onClick={() => dlImage('png')}>
          <div style={{ fontSize: 24 }}>🖼️</div>
          Sample PNG
        </button>
        <button style={{ ...btnStyle, padding: '16px 24px', flexDirection: 'column', gap: 12, height: 100, width: 140, justifyContent: 'center' }} onClick={() => dlImage('jpeg')}>
          <div style={{ fontSize: 24 }}>🖼️</div>
          Sample JPG
        </button>
        <button style={{ ...btnStyle, padding: '16px 24px', flexDirection: 'column', gap: 12, height: 100, width: 140, justifyContent: 'center' }} onClick={dlCSV}>
          <div style={{ fontSize: 24 }}>📊</div>
          Sample CSV
        </button>
        <button style={{ ...btnStyle, padding: '16px 24px', flexDirection: 'column', gap: 12, height: 100, width: 140, justifyContent: 'center' }} onClick={dlJSON}>
          <div style={{ fontSize: 24 }}>{}</div>
          Sample JSON
        </button>
      </div>
    </div>
  )
}

// --- Tool: Lorem Ipsum ---
function LoremIpsum() {
  const [lang, setLang] = useState<'en'|'es'|'fr'|'de'|'ml'|'ar'|'ta'>('en')
  const [paras, setParas] = useState(3)
  const [output, setOutput] = useState('')

  const dicts = {
    en: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'],
    es: ['el', 'dolor', 'es', 'importante', 'la', 'consecución', 'de', 'un', 'gran', 'éxito', 'pero', 'yo', 'le', 'doy', 'a', 'este', 'tiempo', 'la', 'forma', 'de', 'caer', 'en', 'el', 'dolor', 'y', 'el', 'trabajo', 'con', 'fines', 'de', 'lograr', 'algo', 'así', 'como', 'una', 'gran', 'ayuda', 'a', 'las', 'necesidades', 'de', 'los', 'demás'],
    fr: ['le', 'douleur', 'est', 'important', 'la', 'réalisation', 'd', 'un', 'grand', 'succès', 'mais', 'je', 'lui', 'donne', 'à', 'ce', 'moment', 'la', 'forme', 'de', 'tomber', 'dans', 'la', 'douleur', 'et', 'le', 'travail', 'dans', 'le', 'but', 'de', 'réaliser', 'quelque', 'chose', 'comme', 'une', 'grande', 'aide', 'aux', 'besoins', 'des', 'autres'],
    de: ['der', 'schmerz', 'ist', 'wichtig', 'die', 'erreichung', 'eines', 'großen', 'erfolgs', 'aber', 'ich', 'gebe', 'ihm', 'zu', 'dieser', 'zeit', 'die', 'form', 'in', 'schmerz', 'und', 'arbeit', 'zu', 'fallen', 'mit', 'dem', 'ziel', 'etwas', 'wie', 'eine', 'große', 'hilfe', 'für', 'die', 'bedürfnisse', 'anderer', 'zu', 'erreichen'],
    ml: ['ഇത്', 'ഒരു', 'മാതൃക', 'ആണ്', 'നിങ്ങൾക്ക്', 'ഇവിടെ', 'കൂടുതൽ', 'വിവരങ്ങൾ', 'വായിക്കാം', 'എന്നെ', 'സഹായിക്കൂ', 'എന്തെങ്കിലും', 'ചോദിക്കുക', 'എല്ലാം', 'ശരിയാണ്', 'പുതിയ', 'കാര്യങ്ങൾ', 'പഠിക്കുക', 'സമയമില്ല', 'വേഗത്തിൽ', 'ചെയ്യുക', 'വലിയ', 'ലോകം'],
    ar: ['هذا', 'النص', 'هو', 'مثال', 'لنص', 'يمكن', 'أن', 'يستبدل', 'في', 'نفس', 'المساحة', 'لقد', 'تم', 'توليد', 'هذا', 'النص', 'من', 'مولد', 'النص', 'العربى', 'حيث', 'يمكنك', 'أن', 'تولد', 'مثل', 'هذا', 'النص', 'أو', 'العديد', 'من', 'النصوص', 'الأخرى', 'إضافة', 'إلى', 'زيادة', 'عدد', 'الحروف', 'التى', 'يولدها', 'التطبيق', 'إذا', 'كنت', 'تحتاج', 'إلى', 'عدد', 'أكبر', 'من', 'الفقرات'],
    ta: ['இது', 'ஒரு', 'மாதிரி', 'உரை', 'நீங்கள்', 'இதை', 'பயன்படுத்தலாம்', 'மேலும்', 'தகவல்களுக்கு', 'இங்கே', 'பார்க்கவும்', 'நேரம்', 'மிகவும்', 'குறைவு', 'வேகமாக', 'செயல்பட', 'வேண்டும்', 'புதிய', 'விஷயங்களை', 'கற்றுக்கொள்ளுங்கள்', 'எனக்கு', 'உதவி', 'தேவை', 'ஏதாவது', 'கேளுங்கள்', 'எல்லாம்', 'சரியாக', 'உள்ளது']
  }

  const generate = () => {
    const words = dicts[lang]
    let res = []
    for (let i = 0; i < paras; i++) {
      let p = []
      const len = Math.floor(Math.random() * 20) + 20 // 20-40 words
      for (let j = 0; j < len; j++) {
        let w = words[Math.floor(Math.random() * words.length)]
        if (j === 0) w = w.charAt(0).toUpperCase() + w.slice(1)
        p.push(w)
      }
      res.push(p.join(' ') + '.')
    }
    setOutput(res.join('\\n\\n'))
  }

  useEffect(() => { generate() }, [lang, paras]) // eslint-disable-line

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <label style={{ ...labelStyle, margin: 0 }}>Paragraphs:</label>
        <input type="number" min="1" max="50" value={paras} onChange={e => setParas(Number(e.target.value))} style={{ ...inputStyle, width: 80, padding: '6px 10px' }} />
        <label style={{ ...labelStyle, margin: 0, marginLeft: 16 }}>Language:</label>
        <select value={lang} onChange={e => setLang(e.target.value as any)} style={{ ...inputStyle, width: 120, padding: '6px 10px' }}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ml">Malayalam</option>
          <option value="ar">Arabic</option>
          <option value="ta">Tamil</option>
        </select>
        <div style={{ flex: 1 }} />
        <button style={btnStyle} onClick={generate}>Regenerate</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ ...inputStyle, flex: 1, lineHeight: 1.6 }} value={output} onChange={e => setOutput(e.target.value)} />
      </div>
    </div>
  )
}

// --- Tool: Placeholder Image Generator ---
function PlaceholderGen() {
  const [w, setW] = useState(800)
  const [h, setH] = useState(600)
  const [bg, setBg] = useState('#cccccc')
  const [fg, setFg] = useState('#666666')
  const [text, setText] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = fg; ctx.font = `bold ${Math.max(20, Math.min(w, h) / 8)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(text || `${w} × ${h}`, w / 2, h / 2)
  }

  useEffect(() => { draw() }, [w, h, bg, fg, text]) // eslint-disable-line

  const dl = () => {
    if (!canvasRef.current) return
    const u = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = u; a.download = `placeholder_${w}x${h}.png`; a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ ...blockStyle, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Size:</label>
          <input type="number" min="10" max="4000" value={w} onChange={e => setW(Number(e.target.value))} style={{ ...inputStyle, width: 80, padding: '6px 10px' }} />
          <span>×</span>
          <input type="number" min="10" max="4000" value={h} onChange={e => setH(Number(e.target.value))} style={{ ...inputStyle, width: 80, padding: '6px 10px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
          <label style={{ ...labelStyle, margin: 0 }}>BG:</label>
          <input type="color" value={bg} onChange={e => setBg(e.target.value)} style={{ width: 32, height: 32, padding: 0, border: 'none', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Text Color:</label>
          <input type="color" value={fg} onChange={e => setFg(e.target.value)} style={{ width: 32, height: 32, padding: 0, border: 'none', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Text:</label>
          <input type="text" placeholder="(Optional)" value={text} onChange={e => setText(e.target.value)} style={{ ...inputStyle, width: 150, padding: '6px 10px' }} />
        </div>
        <div style={{ flex: 1 }} />
        <button style={btnStyle} onClick={dl}>Download PNG</button>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', background: 'rgba(0,0,0,0.05)', borderRadius: 12 }}>
        <canvas ref={canvasRef} width={w} height={h} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', border: '1px solid rgba(var(--sf-rgb),.1)', borderRadius: 8, background: '#fff' }} />
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
      case 'Password Generator': return <PasswordGenerator />
      case 'Sample Data Downloader': return <SampleDownloader />
      case 'Lorem Ipsum Generator': return <LoremIpsum />
      case 'Placeholder Image Generator': return <PlaceholderGen />
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
