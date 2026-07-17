import { type ReactNode } from 'react'
import { useAppStore } from '../store/useAppStore'
import { WorkspaceHeader } from './WorkspaceHeader'
import { JsonTree } from './JsonTree'
import { parseJson, prettyJson, jsonStats, diffLines, countMatches } from '../lib/json'
import { highlight, terms } from '../lib/highlight'

const MODES = ['Tree View', 'Validate', 'Minify', 'Diff Mode']
const mono = { fontFamily: "'JetBrains Mono'", fontSize: 12.5, lineHeight: 1.7 }
const toolBtn = { fontFamily: 'inherit', fontSize: 11.5, padding: '4px 9px', borderRadius: 7, border: 'none', background: 'rgba(var(--sf-rgb),.06)', color: 'rgba(var(--fg-rgb),.6)', cursor: 'pointer' } as const
const outBtn = { display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 11.5, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(var(--sf-rgb),.06)', color: 'rgba(var(--fg-rgb),.6)', cursor: 'pointer' } as const

function errBody(msg: string): ReactNode {
  return (
    <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: 'rgb(224,140,140)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span>✕</span><span>Parse error: {msg}</span>
    </div>
  )
}

export function JsonWorkspace() {
  const s = useAppStore()
  const jTerms = terms(s.jSearch)
  const diffMode = s.mode === 'Diff Mode'
  const isTree = s.mode === 'Tree View'

  let outputBody: ReactNode = null
  let outputText = ''
  let statusText = ''
  let statusColor = 'rgba(var(--fg-rgb),.4)'

  if (diffMode) {
    const lines = diffLines(prettyJson(s.jsonInput), prettyJson(s.jsonB))
    statusText = '+' + lines.filter((l) => l.t === '+').length + '  −' + lines.filter((l) => l.t === '-').length
    outputText = lines.map((l) => l.t + ' ' + l.x).join('\n')
    outputBody = (
      <div style={mono}>
        {lines.map((l, i) => {
          const bg = l.t === '+' ? 'rgba(122,178,140,.13)' : l.t === '-' ? 'rgba(214,110,110,.13)' : 'transparent'
          const col = l.t === '+' ? 'rgb(150,196,150)' : l.t === '-' ? 'rgb(226,144,144)' : 'rgba(var(--fg-rgb),.6)'
          return <div key={i} style={{ background: bg, color: col, padding: '0 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{(l.t === ' ' ? '  ' : l.t + ' ') + l.x}</div>
        })}
      </div>
    )
  } else {
    const p = parseJson(s.jsonInput)
    if (!p.ok) {
      statusText = 'Invalid'; statusColor = 'rgb(226,144,144)'; outputText = p.error!; outputBody = errBody(p.error!)
    } else if (s.mode === 'Minify') {
      outputText = JSON.stringify(p.value); statusText = outputText.length + ' chars'
      outputBody = <div style={{ ...mono, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'rgba(var(--fg-rgb),.82)' }}>{highlight(outputText, jTerms)}</div>
    } else if (s.mode === 'Validate') {
      const st = jsonStats(p.value); statusText = 'Valid'; statusColor = 'rgb(150,196,150)'; outputText = 'Valid JSON — ' + st.nodes + ' nodes, depth ' + st.depth
      outputBody = (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'rgb(150,196,150)', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(122,178,140,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</span>Valid JSON
          </div>
          <div style={{ ...mono, lineHeight: 2.1, color: 'rgba(var(--fg-rgb),.55)' }}>
            <div>{'nodes    ' + st.nodes}</div><div>{'depth    ' + st.depth}</div><div>{'size     ' + s.jsonInput.length + ' chars'}</div>
          </div>
        </div>
      )
    } else {
      const st = jsonStats(p.value); outputText = JSON.stringify(p.value, null, 2); statusText = st.nodes + ' nodes'
      outputBody = <div style={{ ...mono, lineHeight: 1.75 }}><JsonTree value={p.value} ctx={{ collapsed: s.collapsed, toggle: s.toggleCollapse, terms: jTerms }} /></div>
    }
  }

  const matchText = jTerms.length ? countMatches(parseJson(s.jsonInput).value ?? {}, jTerms) + ' matches' : ''

  return (
    <div style={{ padding: '6px 0 0' }}>
      <WorkspaceHeader view="json" name="JSON" subtitle="local · in-browser" />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 0 18px' }}>
        {MODES.map((m) => {
          const on = m === s.mode
          return (
            <button key={m} onClick={() => s.setMode(m)} style={{ flex: 'none', padding: '8px 15px', borderRadius: 10, border: '1px solid ' + (on ? 'rgba(var(--accent-rgb),.4)' : 'rgba(var(--sf-rgb),.08)'), background: on ? 'rgba(var(--accent-rgb),.14)' : 'rgba(var(--sf-rgb),.05)', color: on ? 'rgb(var(--accent-rgb))' : 'rgba(var(--fg-rgb),.6)', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{m}</button>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px', padding: '9px 13px', background: 'rgba(var(--sf-rgb),.04)', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 11 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--fg-rgb),.45)" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input value={s.jSearch} onChange={(e) => s.setJSearch(e.target.value)} placeholder="Find in JSON — keys &amp; values (space-separated)…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'rgb(var(--fg-rgb))', fontSize: 13.5 }} />
        {jTerms.length > 0 && <span style={{ font: "400 11.5px 'JetBrains Mono'", color: 'rgb(var(--accent-rgb))', whiteSpace: 'nowrap' }}>{matchText}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Input panel */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(var(--sf-rgb),.026)', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 16, boxShadow: '0 1px 0 rgba(var(--sf-rgb),.045) inset', overflow: 'hidden', minHeight: 460 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: '1px solid rgba(var(--sf-rgb),.06)' }}>
            <span style={{ font: "600 10px 'JetBrains Mono'", letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)' }}>Input</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={s.formatInput} title="Pretty-print the input" className="hov-accent" style={{ ...toolBtn, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h13" /></svg>Format
              </button>
              <button onClick={s.uploadJSON} title="Upload a .json file" className="hov-accent" style={{ ...toolBtn, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>Upload
              </button>
              <button onClick={s.loadSample} className="hov-fg" style={toolBtn}>Sample</button>
              <button onClick={s.clearInput} className="hov-fg" style={toolBtn}>Clear</button>
            </div>
          </div>
          {!diffMode ? (
            <textarea value={s.jsonInput} onChange={(e) => s.setJsonInput(e.target.value)} spellCheck={false} style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: 'rgba(var(--fg-rgb),.85)', fontFamily: "'JetBrains Mono'", fontSize: 13, lineHeight: 1.6, padding: '14px 16px', caretColor: 'rgb(var(--accent-rgb))' }} />
          ) : (
            <>
              <div style={{ padding: '7px 14px 5px', font: "600 9.5px 'JetBrains Mono'", letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--accent-rgb),.7)' }}>Source A</div>
              <textarea value={s.jsonInput} onChange={(e) => s.setJsonInput(e.target.value)} spellCheck={false} style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: 'rgba(var(--fg-rgb),.85)', fontFamily: "'JetBrains Mono'", fontSize: 12.5, lineHeight: 1.55, padding: '6px 16px 14px', caretColor: 'rgb(var(--accent-rgb))' }} />
              <div style={{ padding: '7px 14px 5px', font: "600 9.5px 'JetBrains Mono'", letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)', borderTop: '1px solid rgba(var(--sf-rgb),.06)' }}>Source B</div>
              <textarea value={s.jsonB} onChange={(e) => s.setJsonB(e.target.value)} spellCheck={false} style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: 'rgba(var(--fg-rgb),.85)', fontFamily: "'JetBrains Mono'", fontSize: 12.5, lineHeight: 1.55, padding: '6px 16px 14px', caretColor: 'rgb(var(--accent-rgb))' }} />
            </>
          )}
        </div>

        {/* Output panel */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(var(--sf-rgb),.026)', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 16, boxShadow: '0 1px 0 rgba(var(--sf-rgb),.045) inset', overflow: 'hidden', minHeight: 460 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px 9px 14px', borderBottom: '1px solid rgba(var(--sf-rgb),.06)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: "600 10px 'JetBrains Mono'", letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)' }}>Output</span>
              <span style={{ font: "500 11px 'JetBrains Mono'", color: statusColor }}>{statusText}</span>
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {isTree && (
                <>
                  <button onClick={s.expandAll} title="Expand all" className="hov-fg" style={{ ...outBtn, gap: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 8.5v7M8.5 12h7" /></svg>
                  </button>
                  <button onClick={s.collapseAll} title="Collapse all" className="hov-fg" style={{ ...outBtn, gap: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8.5 12h7" /></svg>
                  </button>
                  <button onClick={s.openFullscreen} title="Fullscreen tree" className="hov-fg" style={outBtn}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
                  </button>
                </>
              )}
              <button onClick={() => s.copyOut(outputText)} title="Copy output" className="hov-fg" style={outBtn}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>Copy
              </button>
              <button onClick={() => s.downloadOut(outputText, 'json')} title="Download output" className="hov-fg" style={outBtn}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 11l5 4 5-4M5 21h14" /></svg>Download
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 8px 16px 6px' }}>{outputBody}</div>
        </div>
      </div>
    </div>
  )
}
