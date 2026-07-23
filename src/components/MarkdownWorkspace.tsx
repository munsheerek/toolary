import { useMemo, useRef, useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { search } from '@codemirror/search'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import html2pdf from 'html2pdf.js'
// @ts-ignore
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import mermaid from 'mermaid'
import { Columns, FileText, Monitor, Download, Code2, List } from 'lucide-react'

import { useAppStore } from '../store/useAppStore'
import { WorkspaceHeader } from './WorkspaceHeader'

const toolBtn = { fontFamily: 'inherit', fontSize: 11.5, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(var(--sf-rgb),.06)', color: 'rgba(var(--fg-rgb),.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 } as const
const iconBtn = { background: 'transparent', border: 'none', color: 'rgba(var(--fg-rgb),.5)', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 } as const
const iconBtnActive = { ...iconBtn, color: 'rgb(var(--accent-rgb))', background: 'rgba(var(--accent-rgb),.1)' } as const

mermaid.initialize({ startOnLoad: false, theme: 'dark' })

// Configure marked to inject ids into headings for TOC
const renderer = new marked.Renderer()
// @ts-ignore
renderer.heading = (token: any) => {
  const id = (token.raw || '').toLowerCase().replace(/[^\w]+/g, '-')
  return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>\n`
}
marked.setOptions({ renderer })

export function MarkdownWorkspace() {
  const s = useAppStore()
  const activeFile = s.mdFiles.find(f => f.id === s.mdActiveId)
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [viewMode, setViewMode] = useState<'split'|'editor'|'preview'>('split')
  const [showToc, setShowToc] = useState(false)

  // Parse markdown and sanitize it for preview
  const htmlContent = useMemo(() => {
    if (!activeFile) return ''
    const rawHtml = marked.parse(activeFile.content) as string
    return DOMPurify.sanitize(rawHtml)
  }, [activeFile?.content])

  // Extract headings for TOC
  const toc = useMemo(() => {
    if (!activeFile) return []
    const headings = [...activeFile.content.matchAll(/^(#{1,6})\s+(.+)$/gm)]
    return headings.map(match => ({
      level: match[1].length,
      text: match[2].trim(),
      id: match[2].trim().toLowerCase().replace(/[^\w]+/g, '-')
    }))
  }, [activeFile?.content])

  // Render Mermaid diagrams whenever HTML content changes
  useEffect(() => {
    if (!previewRef.current) return
    const mermaidNodes = previewRef.current.querySelectorAll('.language-mermaid')
    mermaidNodes.forEach(node => {
      // Create a mermaid div wrapper and render it
      const text = node.textContent || ''
      const div = document.createElement('div')
      div.className = 'mermaid'
      div.textContent = text
      if (node.parentNode && node.parentNode.nodeName === 'PRE') {
        (node.parentNode as HTMLElement).replaceWith(div)
      }
    })
    
    if (mermaidNodes.length > 0) {
      mermaid.run({ querySelector: '.mermaid' }).catch(console.error)
    }
  }, [htmlContent])

  // Sync scroll from editor to preview
  const scrollSync = useMemo(() => {
    return EditorView.domEventHandlers({
      scroll: (event) => {
        if (!previewRef.current || viewMode !== 'split') return
        const target = event.target as HTMLElement
        const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight)
        if (isNaN(percentage)) return
        const preview = previewRef.current
        preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight)
      }
    })
  }, [viewMode])

  const exportPDF = () => {
    if (!activeFile || !previewRef.current) return
    const element = previewRef.current.querySelector('.markdown-body') as HTMLElement
    if (!element) return
    
    const opt = {
      margin: 0.5,
      filename: `${activeFile.name.replace('.md', '')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    }
    
    html2pdf().set(opt).from(element).save()
  }

  const scrollToHeading = (id: string) => {
    if (!previewRef.current) return
    const element = previewRef.current.querySelector(`#${id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div style={{ padding: '6px 0 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <WorkspaceHeader 
        view="markdown" 
        name="Markdown" 
        subtitle="pro split-pane editor" 
        actions={
          <>
            <button onClick={() => setViewMode('editor')} style={viewMode === 'editor' ? iconBtnActive : iconBtn} title="Editor Only">
              <Code2 size={16} />
            </button>
            <button onClick={() => setViewMode('split')} style={viewMode === 'split' ? iconBtnActive : iconBtn} title="Split View">
              <Columns size={16} />
            </button>
            <button onClick={() => setViewMode('preview')} style={viewMode === 'preview' ? iconBtnActive : iconBtn} title="Preview Only">
              <Monitor size={16} />
            </button>
          </>
        }
      />

      <div style={{ display: 'flex', flex: 1, gap: 16, marginTop: 16, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', background: 'rgba(var(--sf-rgb),.026)', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(var(--sf-rgb),.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ font: "600 11px 'JetBrains Mono'", letterSpacing: '.05em', color: 'rgba(var(--fg-rgb),.6)' }}>FILES</span>
            <button onClick={s.createMdFile} className="hov-accent" style={toolBtn}>+ New</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {s.mdFiles.map(f => {
              const isActive = f.id === s.mdActiveId
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: isActive ? 'rgba(var(--accent-rgb),.1)' : 'transparent', color: isActive ? 'rgb(var(--accent-rgb))' : 'rgba(var(--fg-rgb),.8)', cursor: 'pointer', marginBottom: 4, fontSize: 13 }} onClick={() => s.setMdActiveId(f.id)}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); s.deleteMdFile(f.id) }} style={{ background: 'none', border: 'none', color: 'rgba(var(--fg-rgb),.4)', cursor: 'pointer', fontSize: 14 }}>×</button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Editor & Preview Split Pane */}
        <div style={{ flex: 1, display: 'flex', background: 'rgba(var(--bg))', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          <PanelGroup orientation="horizontal">
            
            {/* Editor Pane (Left) */}
            {(viewMode === 'split' || viewMode === 'editor') && (
              <Panel defaultSize={50} minSize={20} style={{ display: 'flex', flexDirection: 'column', background: 'transparent' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(var(--sf-rgb),.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--sf-rgb),.02)' }}>
                  <span style={{ font: "600 10px 'JetBrains Mono'", letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)' }}>Raw Markdown</span>
                </div>
                <div className="md-editor-wrap" style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
                  {activeFile ? (
                    <CodeMirror
                      value={activeFile.content}
                      theme={oneDark}
                      height="100%"
                      extensions={[search({ top: true }), markdown({ base: markdownLanguage, codeLanguages: languages }), scrollSync]}
                      onChange={(val) => {
                        if (s.mdActiveId) {
                          s.updateMdFile(s.mdActiveId, val)
                        }
                      }}
                      style={{ fontSize: 14 }}
                    />
                  ) : (
                    <div style={{ color: 'rgba(var(--fg-rgb),.4)', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Select or create a file to start editing.</div>
                  )}
                </div>
              </Panel>
            )}

            {/* Resize Handle */}
            {viewMode === 'split' && (
              <PanelResizeHandle style={{ width: 1, background: 'rgba(var(--sf-rgb),.08)', cursor: 'col-resize', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: -3, width: 7, height: 40, marginTop: -20, background: 'rgba(var(--sf-rgb),.15)', borderRadius: 4 }} />
              </PanelResizeHandle>
            )}

            {/* Preview Pane (Right) */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <Panel defaultSize={50} minSize={20} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(var(--sf-rgb),.015)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(var(--sf-rgb),.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--sf-rgb),.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ font: "600 10px 'JetBrains Mono'", letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)' }}>Preview</span>
                    <button onClick={() => setShowToc(!showToc)} style={showToc ? iconBtnActive : iconBtn} title="Toggle Outline">
                      <List size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {activeFile && (
                      <>
                        <button onClick={() => s.downloadOut(htmlContent, 'html')} className="hov-accent" style={toolBtn}>
                          <Download size={14} /> HTML
                        </button>
                        <button onClick={exportPDF} className="hov-accent" style={toolBtn}>
                          <FileText size={14} /> PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                  <div ref={previewRef} className="md-preview-container" style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                    {activeFile ? (
                      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    ) : (
                      <div style={{ color: 'rgba(var(--fg-rgb),.4)', textAlign: 'center', marginTop: 40, fontSize: 14 }}>Preview will appear here.</div>
                    )}
                  </div>
                  
                  {/* Table of Contents Sidebar */}
                  {showToc && activeFile && toc.length > 0 && (
                    <div style={{ width: 200, borderLeft: '1px solid rgba(var(--sf-rgb),.06)', padding: 16, overflowY: 'auto', background: 'rgba(var(--sf-rgb),.01)' }}>
                      <div style={{ font: "600 10px 'JetBrains Mono'", letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)', marginBottom: 12 }}>Outline</div>
                      {toc.map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => scrollToHeading(item.id)}
                          style={{ 
                            paddingLeft: (item.level - 1) * 12, 
                            fontSize: 12, 
                            color: 'rgba(var(--fg-rgb),.7)',
                            cursor: 'pointer',
                            marginBottom: 6,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          className="hov-accent"
                        >
                          {item.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>
            )}

          </PanelGroup>
        </div>
      </div>
    </div>
  )
}
