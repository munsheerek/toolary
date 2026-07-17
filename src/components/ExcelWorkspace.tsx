import { useAppStore } from '../store/useAppStore'
import { WorkspaceHeader } from './WorkspaceHeader'
import { filterRows, colLabel, pivot, fileSizeText } from '../lib/table'
import { highlight } from '../lib/highlight'
import { ColumnFilterPopover } from './ColumnFilterPopover'

const chip = { padding: '5px 10px', borderRadius: 8, background: 'rgba(var(--sf-rgb),.05)' } as const
const barBtn = { display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', fontSize: 12.5, padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.7)', cursor: 'pointer' } as const
const accentBtn = { display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', fontSize: 12.5, padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(var(--accent-rgb),.4)', background: 'rgba(var(--accent-rgb),.14)', color: 'rgb(var(--accent-rgb))', cursor: 'pointer' } as const
const pageBtn = { width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.6)', cursor: 'pointer' } as const
const selStyle = { background: 'rgba(var(--sf-rgb),.05)', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 9, padding: '8px 10px', color: 'rgb(var(--fg-rgb))', fontFamily: 'inherit', fontSize: 13, outline: 'none', cursor: 'pointer' } as const

function Dropzone() {
  const excelLoad = useAppStore((s) => s.excelLoad)
  const pick = () => {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = '.csv,.xls,.xlsx,text/csv'
    inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) excelLoad(f) }
    inp.click()
  }
  return (
    <div onClick={pick} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) excelLoad(f) }} className="hov-drop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 300, border: '1.5px dashed rgba(var(--sf-rgb),.16)', borderRadius: 18, cursor: 'pointer', textAlign: 'center', padding: 40 }}>
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--fg-rgb),.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 17a4 4 0 0 0 .5-8 6 6 0 0 0-11.6-1.5A3.5 3.5 0 0 0 6.5 17" /><path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" /></svg>
      <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>Drag &amp; drop spreadsheet here, or click to browse</div>
      <div style={{ fontSize: 12.5, color: 'rgba(var(--fg-rgb),.42)' }}>Supports .xlsx, .xls and .csv files</div>
    </div>
  )
}

export function ExcelWorkspace() {
  const s = useAppStore()
  const xHasFile = !!s.xFile
  const xd = s.xData[s.xActive]
  const xHeaders = xd ? xd.headers : []
  let xEmpty = 0
  if (xd) xd.rows.forEach((r) => { for (let i = 0; i < xHeaders.length; i++) { const c = r[i]; if (c === '' || c == null) xEmpty++ } })

  const filt = filterRows(xd, s.xSearch, s.xFilters, s.xValueFilters)
  const filterActive =
    !!s.xSearch.trim() ||
    Object.values(s.xFilters).some((v) => (v || '').trim()) ||
    Object.keys(s.xValueFilters).length > 0
  const xTotal = filt.rows.length
  const xPages = Math.max(1, Math.ceil(xTotal / s.xPerPage))
  const xPageIdx = Math.min(s.xPage, xPages - 1)
  const xStart = xPageIdx * s.xPerPage
  const searchTerms = s.xSearch.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const xPaged = filt.rows.slice(xStart, xStart + s.xPerPage).map((r, ri) => ({
    num: xStart + ri + 1,
    cells: xHeaders.map((_h, ci) => {
      const st = [...searchTerms]
      const cf = (s.xFilters[ci] || '').trim().toLowerCase()
      if (cf) st.push(cf)
      return highlight(r[ci] == null ? '' : String(r[ci]), st)
    }),
  }))
  const xRangeText = xTotal ? 'Showing ' + (xStart + 1) + ' – ' + Math.min(xStart + s.xPerPage, xTotal) + ' of ' + xTotal + ' rows' : '0 rows'
  const isPivot = s.xView === 'pivot'
  const pv = xHasFile && isPivot ? pivot(filt, s.pGroups, s.pValue, s.pAgg) : null
  const pAddCols = xHeaders.map((_h, ci) => ci).filter((ci) => !s.pGroups.includes(ci))

  return (
    <div style={{ padding: '6px 0 0' }}>
      <WorkspaceHeader view="excel" name="Excel" subtitle="view, filter & convert spreadsheets" compactSearch />

      {!xHasFile ? (
        <Dropzone />
      ) : (
        <>
          {/* File info bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '13px 16px', marginBottom: 16, background: 'rgba(var(--sf-rgb),.026)', border: '1px solid rgba(var(--sf-rgb),.07)', borderRadius: 14 }}>
            <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 11, background: 'rgba(var(--accent-rgb),.14)', color: 'rgb(var(--accent-rgb))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{s.xFile!.name}</div>
              <div style={{ font: "400 11.5px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.42)', marginTop: 2 }}>{s.xFile!.type + ' · ' + fileSizeText(s.xFile!.size) + ' · ' + (s.xActive || '—')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: "400 12px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.48)', flexWrap: 'wrap' }}>
              <span style={chip}><b style={{ color: 'rgb(var(--fg-rgb))', fontWeight: 600 }}>{xd ? xd.rows.length : 0}</b> rows</span>
              <span style={chip}><b style={{ color: 'rgb(var(--fg-rgb))', fontWeight: 600 }}>{xHeaders.length}</b> cols</span>
              <span style={chip}><b style={{ color: 'rgb(var(--fg-rgb))', fontWeight: 600 }}>{s.xSheets.length}</b> sheets</span>
              <span style={chip}><b style={{ color: 'rgb(var(--fg-rgb))', fontWeight: 600 }}>{xEmpty}</b> empty</span>
            </div>
            <div style={{ flex: 1, minWidth: 8 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <button onClick={s.excelCopy} title="Copy table data (TSV)" className="hov-fg" style={barBtn}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>Copy
              </button>
              <button onClick={s.excelCSV} title="Export to CSV" className="hov-fg" style={barBtn}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>CSV
              </button>
              <button onClick={s.excelJSON} title="Export to JSON" style={accentBtn}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4" /></svg>JSON
              </button>
              <div style={{ width: 1, height: 22, background: 'rgba(var(--sf-rgb),.1)', margin: '0 2px' }} />
              <button onClick={s.excelRemove} title="Remove file" className="hov-danger" style={{ flex: 'none', width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.5)', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          </div>

          {/* Table / pivot container */}
          <div style={{ background: 'rgba(var(--sf-rgb),.026)', border: '1px solid rgba(var(--sf-rgb),.07)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 2, padding: 3, background: 'rgba(var(--sf-rgb),.05)', borderRadius: 10 }}>
                <button onClick={() => s.setXView('table')} style={{ fontFamily: 'inherit', fontSize: 12.5, padding: '6px 14px', borderRadius: 8, border: 'none', background: !isPivot ? 'rgba(var(--accent-rgb),.14)' : 'transparent', color: !isPivot ? 'rgb(var(--accent-rgb))' : 'rgba(var(--fg-rgb),.55)', cursor: 'pointer' }}>Table</button>
                <button onClick={() => s.setXView('pivot')} style={{ fontFamily: 'inherit', fontSize: 12.5, padding: '6px 14px', borderRadius: 8, border: 'none', background: isPivot ? 'rgba(var(--accent-rgb),.14)' : 'transparent', color: isPivot ? 'rgb(var(--accent-rgb))' : 'rgba(var(--fg-rgb),.55)', cursor: 'pointer' }}>Pivot</button>
              </div>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', background: 'rgba(var(--sf-rgb),.04)', border: '1px solid rgba(var(--sf-rgb),.08)', borderRadius: 10 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--fg-rgb),.45)" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input value={s.xSearch} onChange={(e) => s.setXSearch(e.target.value)} placeholder="Search — space-separated terms all match…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'rgb(var(--fg-rgb))', fontSize: 13.5 }} />
              </div>
              <button onClick={s.toggleFilters} className="hov-fg" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 10, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.6)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16l-6 7v6l-4 2v-8z" /></svg>Column Filters
              </button>
              {filterActive && (
                <button onClick={s.clearAllFilters} title="Clear search, column filters and value filters" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 10, border: '1px solid rgba(var(--accent-rgb),.35)', background: 'rgba(var(--accent-rgb),.1)', color: 'rgb(var(--accent-rgb))', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>Clear filters
                </button>
              )}
              <span style={{ font: "400 12px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.4)' }}>{xRangeText}</span>
            </div>

            {!isPivot ? (
              <div style={{ overflow: 'auto', maxHeight: '56vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--panel)', textAlign: 'left', padding: '12px 14px', font: "600 11px 'JetBrains Mono'", letterSpacing: '.05em', color: 'rgba(var(--fg-rgb),.4)', borderBottom: '1px solid rgba(var(--sf-rgb),.09)', width: 56 }}>#</th>
                      {xHeaders.map((_h, ci) => (
                        <th key={ci} style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--panel)', textAlign: 'left', padding: '8px 16px', fontWeight: 600, color: 'rgba(var(--fg-rgb),.85)', borderBottom: '1px solid rgba(var(--sf-rgb),.09)', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                            <span>{colLabel(xHeaders, ci)}</span>
                            {(() => { const active = !!s.xValueFilters[ci]; return (
                              <button onClick={(e) => { e.stopPropagation(); s.toggleFilterMenu(ci) }} title={active ? 'Filtered — edit values' : 'Filter by values'} className={active ? undefined : 'hov-soft hov-fg'} style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: active ? 'rgba(var(--accent-rgb),.16)' : 'none', color: active ? 'rgb(var(--accent-rgb))' : 'rgba(var(--fg-rgb),.32)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16l-6 7v6l-4 2v-8z" /></svg>
                              </button>
                            ) })()}
                            {s.xFilterMenu === ci && <ColumnFilterPopover ci={ci} />}
                            <button onClick={(e) => { e.stopPropagation(); s.toggleColMenu(ci) }} title="Column actions" className="hov-soft hov-fg" style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'none', color: 'rgba(var(--fg-rgb),.32)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, lineHeight: 1 }}>⋯</button>
                            {s.xColMenu === ci && (
                              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 30, width: 196, background: 'var(--panel)', border: '1px solid rgba(var(--sf-rgb),.11)', borderRadius: 11, padding: 5, boxShadow: '0 22px 55px -20px rgba(0,0,0,.7)', animation: 'menuIn .12s ease' }}>
                                <button onClick={() => s.copyColumn(ci)} className="hov-bg" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8, color: 'rgb(var(--fg-rgb))', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 400, cursor: 'pointer', textAlign: 'left' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>Copy column values
                                </button>
                                <button onClick={() => s.showDistinct(ci)} className="hov-bg" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8, color: 'rgb(var(--fg-rgb))', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 400, cursor: 'pointer', textAlign: 'left' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M6 12h12M9 18h6" /></svg>Distinct values
                                </button>
                              </div>
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                    {s.xShowFilters && (
                      <tr>
                        <th style={{ padding: '8px 14px', borderBottom: '1px solid rgba(var(--sf-rgb),.07)', background: 'var(--panel)' }} />
                        {xHeaders.map((_h, ci) => (
                          <th key={ci} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(var(--sf-rgb),.07)', background: 'var(--panel)' }}>
                            <input value={s.xFilters[ci] || ''} onChange={(e) => s.setColFilter(ci, e.target.value)} placeholder="Filter…" style={{ width: '100%', background: 'rgba(var(--sf-rgb),.05)', border: '1px solid rgba(var(--sf-rgb),.09)', borderRadius: 7, padding: '6px 9px', color: 'rgb(var(--fg-rgb))', fontFamily: 'inherit', fontSize: 12.5, outline: 'none' }} />
                          </th>
                        ))}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {xPaged.map((row) => (
                      <tr key={row.num} className="hov-row" style={{ borderBottom: '1px solid rgba(var(--sf-rgb),.05)' }}>
                        <td style={{ padding: '11px 14px', color: 'rgba(var(--fg-rgb),.35)', fontFamily: "'JetBrains Mono'", fontSize: 12 }}>{row.num}</td>
                        {row.cells.map((cell, ci) => (
                          <td key={ci} style={{ padding: '11px 16px', color: 'rgba(var(--fg-rgb),.8)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <PivotView pv={pv!} pAddCols={pAddCols} xHeaders={xHeaders} />
            )}

            {/* Footer: sheet tabs + pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '12px 16px', borderTop: '1px solid rgba(var(--sf-rgb),.07)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: '1 1 auto', minWidth: 0, overflowX: 'auto' }}>
                <span style={{ font: "400 11px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.4)', flex: 'none' }}>Sheets:</span>
                {s.xSheets.map((sn) => {
                  const on = sn === s.xActive
                  return <button key={sn} onClick={() => s.excelSheet(sn)} title={sn} style={{ flex: 'none', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'inherit', fontSize: 12.5, padding: '5px 12px', borderRadius: 8, border: '1px solid ' + (on ? 'rgba(var(--accent-rgb),.45)' : 'rgba(var(--sf-rgb),.09)'), background: on ? 'rgba(var(--accent-rgb),.14)' : 'rgba(var(--sf-rgb),.04)', color: on ? 'rgb(var(--accent-rgb))' : 'rgba(var(--fg-rgb),.6)', cursor: 'pointer' }}>{sn}</button>
                })}
              </div>
              {!isPivot && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ font: "400 12px/1 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.4)' }}>Rows:</span>
                  <select value={s.xPerPage} onChange={(e) => s.setXPerPage(parseInt(e.target.value, 10))} style={{ ...selStyle, padding: '6px 8px', borderRadius: 8, fontSize: 12.5 }}>
                    <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => s.setXPage(() => 0)} title="First" style={pageBtn}>«</button>
                    <button onClick={() => s.setXPage((p) => p - 1)} title="Previous" style={pageBtn}>‹</button>
                    <span style={{ font: "400 12.5px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.55)', padding: '0 8px', whiteSpace: 'nowrap' }}>{'Page ' + (xPageIdx + 1) + ' of ' + xPages}</span>
                    <button onClick={() => s.setXPage((p) => p + 1)} title="Next" style={pageBtn}>›</button>
                    <button onClick={() => s.setXPage(() => xPages - 1)} title="Last" style={pageBtn}>»</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PivotView({ pv, pAddCols, xHeaders }: { pv: ReturnType<typeof pivot>; pAddCols: number[]; xHeaders: unknown[] }) {
  const s = useAppStore()
  const pShowValue = s.pAgg !== 'count'
  const pCanAdd = s.pGroups.length < xHeaders.length
  return (
    <div style={{ padding: '4px 16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', padding: 14, background: 'rgba(var(--sf-rgb),.03)', border: '1px solid rgba(var(--sf-rgb),.07)', borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: "600 9.5px 'JetBrains Mono'", letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)' }}>Group by</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {s.pGroups.map((gi, pos) => (
              <span key={pos} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 8px 7px 11px', background: 'rgba(var(--accent-rgb),.14)', border: '1px solid rgba(var(--accent-rgb),.3)', borderRadius: 9, color: 'rgb(var(--accent-rgb))', fontSize: 12.5 }}>
                {colLabel(xHeaders, gi)}
                {s.pGroups.length > 1 && <button onClick={() => s.removeGroup(pos)} title="Remove" style={{ width: 16, height: 16, border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', fontSize: 12, lineHeight: 1, opacity: 0.7, padding: 0 }}>✕</button>}
              </span>
            ))}
            {pCanAdd && (
              <select value="" onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) s.addGroup(v) }} style={{ background: 'rgba(var(--sf-rgb),.05)', border: '1px dashed rgba(var(--sf-rgb),.18)', borderRadius: 9, padding: '8px 10px', color: 'rgba(var(--fg-rgb),.6)', fontFamily: 'inherit', fontSize: 12.5, outline: 'none', cursor: 'pointer' }}>
                <option value="">+ Add level</option>
                {pAddCols.map((ci) => <option key={ci} value={ci}>{colLabel(xHeaders, ci)}</option>)}
              </select>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: "600 9.5px 'JetBrains Mono'", letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)' }}>Aggregate</span>
          <select value={s.pAgg} onChange={(e) => s.setPAgg(e.target.value as 'count')} style={selStyle}>
            <option value="count">Count</option><option value="sum">Sum</option><option value="avg">Average</option><option value="min">Min</option><option value="max">Max</option>
          </select>
        </div>
        {s.pAgg === 'count' && <div style={{ font: "400 12px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.35)', paddingBottom: 9 }}>counts rows per group</div>}
        {pShowValue && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: "600 9.5px 'JetBrains Mono'", letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),.4)' }}>Of column</span>
            <select value={s.pValue < 0 ? 0 : s.pValue} onChange={(e) => s.setPValue(parseInt(e.target.value, 10) || 0)} style={{ ...selStyle, minWidth: 150 }}>
              {xHeaders.map((_h, ci) => <option key={ci} value={ci}>{colLabel(xHeaders, ci)}</option>)}
            </select>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 7, paddingBottom: 2 }}>
          <button onClick={s.clearPivot} title="Reset grouping & aggregation" className="hov-danger" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', fontSize: 12.5, padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.6)', cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-4v4h4" /></svg>Reset
          </button>
          <button onClick={() => s.copyOut([[...pv.groupLabels, pv.valLabel].join('\t'), ...pv.rows.map((r) => [...r.cells.map((c) => c.v), r.val].join('\t'))].join('\n'))} className="hov-fg" style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', fontSize: 12.5, padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(var(--sf-rgb),.09)', background: 'rgba(var(--sf-rgb),.04)', color: 'rgba(var(--fg-rgb),.7)', cursor: 'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>Copy
          </button>
          <button onClick={() => { const esc = (v: unknown) => { const t = String(v == null ? '' : v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t }; s.downloadOut([[...pv.groupLabels, pv.valLabel].map(esc).join(','), ...pv.rows.map((r) => [...r.cells.map((c) => c.v), r.val].map(esc).join(','))].join('\n'), 'csv') }} style={accentBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>CSV
          </button>
        </div>
      </div>
      <div style={{ overflow: 'auto', maxHeight: '48vh', border: '1px solid rgba(var(--sf-rgb),.07)', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {pv.groupLabels.map((gl, i) => <th key={i} style={{ position: 'sticky', top: 0, background: 'var(--panel)', textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'rgba(var(--fg-rgb),.85)', borderBottom: '1px solid rgba(var(--sf-rgb),.09)', whiteSpace: 'nowrap' }}>{gl}</th>)}
              <th style={{ position: 'sticky', top: 0, background: 'var(--panel)', textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'rgb(var(--accent-rgb))', borderBottom: '1px solid rgba(var(--sf-rgb),.09)' }}>{pv.valLabel}</th>
            </tr>
          </thead>
          <tbody>
            {pv.rows.map((pr, i) => (
              <tr key={i} className="hov-row" style={{ borderBottom: '1px solid rgba(var(--sf-rgb),.05)' }}>
                {pr.cells.map((pc, j) => <td key={j} style={{ padding: '11px 16px', color: 'rgba(var(--fg-rgb),.82)' }}>{pc.v}</td>)}
                <td style={{ padding: '11px 16px', textAlign: 'right', color: 'rgb(var(--fg-rgb))', fontFamily: "'JetBrains Mono'", fontVariantNumeric: 'tabular-nums' }}>{pr.val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, font: "400 11.5px 'JetBrains Mono'", color: 'rgba(var(--fg-rgb),.4)' }}>{pv.rows.length + ' groups'}</div>
    </div>
  )
}
