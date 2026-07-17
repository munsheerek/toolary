import { create } from 'zustand'
import { CONFIG, type Theme } from '../lib/config'
import { wsById, MODE_MAP, LANDING_TOOL, SAMPLE, SAMPLE_B } from '../lib/workspaces'
import { parseJson, prettyJson } from '../lib/json'
import { parseCSV, filterRows, colLabel, type SheetData, type Aggregate } from '../lib/table'

export type View = 'home' | 'json' | 'excel'

export interface RecentItem { name: string; wsId: string; ts: number }
export interface XFile { name: string; size: number; type: string }
export interface DistinctState { ci: number; label: string; values: { raw: string; label: string; count: number }[] }

interface AppState {
  // shell
  paletteOpen: boolean
  query: string
  active: number
  toast: string
  toastShow: boolean
  theme: Theme
  view: View

  // json
  mode: string
  jsonInput: string
  jsonB: string
  jSearch: string
  collapsed: Record<string, boolean>
  fullscreen: boolean

  // persistence
  recents: RecentItem[]
  favs: string[]

  // excel
  xFile: XFile | null
  xData: Record<string, SheetData>
  xSheets: string[]
  xActive: string
  xSearch: string
  xFilters: Record<number, string>
  xValueFilters: Record<number, string[]>
  xPage: number
  xPerPage: number
  xShowFilters: boolean
  xColMenu: number
  xFilterMenu: number
  xDistinct: DistinctState | null
  xView: 'table' | 'pivot'
  pGroups: number[]
  pValue: number
  pAgg: Aggregate

  // actions
  init: () => void
  toast_: (msg: string) => void
  toggleTheme: () => void
  openPalette: () => void
  closePalette: () => void
  setQuery: (q: string) => void
  setActive: (i: number) => void

  goHome: () => void
  setMode: (m: string) => void
  launchTool: (name: string, wsId: string) => void
  launchWorkspace: (wsId: string) => void

  setJsonInput: (v: string) => void
  setJsonB: (v: string) => void
  setJSearch: (v: string) => void
  toggleCollapse: (path: string) => void
  collapseAll: () => void
  expandAll: () => void
  formatInput: () => void
  loadSample: () => void
  clearInput: () => void
  uploadJSON: () => void
  openFullscreen: () => void
  closeFullscreen: () => void

  toggleFav: (wsId: string) => void
  clearRecents: () => void

  copyOut: (text: string) => void
  downloadOut: (text: string, ext: string) => void

  excelLoad: (file: File) => void
  excelRemove: () => void
  excelSheet: (sn: string) => void
  setXSearch: (v: string) => void
  toggleFilters: () => void
  setColFilter: (ci: number, v: string) => void
  toggleColMenu: (ci: number) => void
  toggleFilterMenu: (ci: number) => void
  closeFilterMenu: () => void
  setValueFilter: (ci: number, values: string[]) => void
  clearValueFilter: (ci: number) => void
  clearAllFilters: () => void
  copyColumn: (ci: number) => void
  showDistinct: (ci: number) => void
  closeDistinct: () => void
  copyDistinct: () => void
  filterByValue: (raw: string) => void
  setXView: (v: 'table' | 'pivot') => void
  setXPage: (fn: (p: number, pages: number) => number) => void
  setXPerPage: (n: number) => void

  addGroup: (ci: number) => void
  removeGroup: (pos: number) => void
  clearPivot: () => void
  setPValue: (ci: number) => void
  setPAgg: (a: Aggregate) => void

  excelCopy: () => void
  excelCSV: () => void
  excelJSON: () => void
}

const ns = (kind: string) => 'toolary.' + kind
const get_ = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const set_ = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } }

const initialTheme = (get_('toolary.theme') as Theme) || 'dark'

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useAppStore = create<AppState>((set, get) => ({
  paletteOpen: false,
  query: '',
  active: 0,
  toast: '',
  toastShow: false,
  theme: initialTheme,
  // Returning visits always start on the home dashboard; the last used tools
  // surface there under "Continue working" (recents). The active workspace/mode
  // is intentionally not persisted.
  view: 'home',

  mode: 'Tree View',
  jsonInput: SAMPLE,
  jsonB: SAMPLE_B,
  jSearch: '',
  collapsed: {},
  fullscreen: false,

  recents: [],
  favs: [],

  xFile: null,
  xData: {},
  xSheets: [],
  xActive: '',
  xSearch: '',
  xFilters: {},
  xValueFilters: {},
  xPage: 0,
  xPerPage: 25,
  xShowFilters: false,
  xColMenu: -1,
  xFilterMenu: -1,
  xDistinct: null,
  xView: 'table',
  pGroups: [0],
  pValue: -1,
  pAgg: 'count',

  init: () => {
    const theme = (get_('toolary.theme') as Theme) || 'dark'
    const seed = CONFIG.seedDemoData !== false
    const rk = get_(ns('recents'))
    const fk = get_(ns('favs'))
    let recents: RecentItem[]
    let favs: string[]
    if (rk === null && fk === null && seed) {
      const now = Date.now()
      recents = [
        { name: 'Validate', wsId: 'json', ts: now - 12 * 60000 },
        { name: 'CSV to JSON', wsId: 'excel', ts: now - 40 * 60000 },
        { name: 'Tree View', wsId: 'json', ts: now - 2 * 3600000 },
        { name: 'Sheet Diff', wsId: 'excel', ts: now - 26 * 3600000 },
      ]
      favs = ['json', 'excel']
    } else {
      recents = rk ? JSON.parse(rk) : []
      favs = fk ? JSON.parse(fk) : []
    }
    recents = recents.filter((r) => { const w = wsById(r.wsId); return w && w.tools.includes(r.name) })
    favs = favs.filter((id) => !!wsById(id))
    set_(ns('recents'), JSON.stringify(recents))
    set_(ns('favs'), JSON.stringify(favs))
    set({ theme, recents, favs })
  },

  toast_: (msg) => {
    set({ toast: msg, toastShow: true })
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => set({ toastShow: false }), 2200)
  },

  toggleTheme: () => {
    const t: Theme = get().theme === 'light' ? 'dark' : 'light'
    set_('toolary.theme', t)
    set({ theme: t })
    get().toast_(t === 'light' ? 'Light mode' : 'Dark mode')
  },

  openPalette: () => set({ paletteOpen: true, query: '', active: 0 }),
  closePalette: () => set({ paletteOpen: false }),
  setQuery: (q) => set({ query: q, active: 0 }),
  setActive: (i) => set({ active: i }),

  goHome: () => set({ view: 'home', fullscreen: false }),
  setMode: (m) => set({ mode: m, fullscreen: false }),

  launchTool: (name, wsId) => {
    const recents = pushRecent(get().recents, name, wsId)
    const mode = MODE_MAP[name] || 'Tree View'
    const fs = name === 'Fullscreen Tree'
    const ji = wsId === 'json' ? prettyJson(get().jsonInput) : get().jsonInput
    set({ recents, paletteOpen: false, view: wsId as View, mode: fs ? 'Tree View' : mode, fullscreen: fs, jsonInput: ji, collapsed: {} })
  },

  launchWorkspace: (wsId) => {
    const name = LANDING_TOOL[wsId] || (wsById(wsId)?.tools[0] ?? '')
    const recents = pushRecent(get().recents, name, wsId)
    const ji = wsId === 'json' ? prettyJson(get().jsonInput) : get().jsonInput
    set({ recents, paletteOpen: false, view: wsId as View, mode: 'Tree View', fullscreen: false, jsonInput: ji, collapsed: {} })
  },

  setJsonInput: (v) => set({ jsonInput: v }),
  setJsonB: (v) => set({ jsonB: v }),
  setJSearch: (v) => set({ jSearch: v }),
  toggleCollapse: (path) => set((s) => ({ collapsed: { ...s.collapsed, [path]: !s.collapsed[path] } })),

  collapseAll: () => {
    const p = parseJson(get().jsonInput)
    if (!p.ok) return
    const map: Record<string, boolean> = {}
    const walk = (v: unknown, path: string, depth: number) => {
      if (v && typeof v === 'object') {
        if (depth >= 1) map[path] = true
        ;(Array.isArray(v) ? v.map((x, i) => [i, x] as const) : Object.entries(v as object)).forEach(
          ([k, x]) => walk(x, path + '/' + k, depth + 1),
        )
      }
    }
    walk(p.value, '$', 0)
    set({ collapsed: map })
  },
  expandAll: () => set({ collapsed: {} }),

  formatInput: () => {
    const p = parseJson(get().jsonInput)
    if (p.ok) { set({ jsonInput: JSON.stringify(p.value, null, 2), collapsed: {} }); get().toast_('Formatted') }
    else get().toast_('Invalid JSON — cannot format')
  },
  loadSample: () => set({ jsonInput: SAMPLE, collapsed: {} }),
  clearInput: () => set({ jsonInput: '', collapsed: {} }),

  uploadJSON: () => {
    const inp = document.createElement('input')
    inp.type = 'file'
    inp.accept = '.json,application/json,text/plain'
    inp.onchange = () => {
      const f = inp.files && inp.files[0]
      if (!f) return
      const r = new FileReader()
      r.onload = () => { set({ jsonInput: String(r.result), collapsed: {} }); get().toast_('Loaded ' + f.name) }
      r.readAsText(f)
    }
    inp.click()
  },

  openFullscreen: () => set({ fullscreen: true }),
  closeFullscreen: () => set({ fullscreen: false }),

  toggleFav: (wsId) => {
    const cur = get().favs
    const favs = cur.includes(wsId) ? cur.filter((f) => f !== wsId) : [...cur, wsId]
    set_(ns('favs'), JSON.stringify(favs))
    set({ favs })
  },
  clearRecents: () => { set_(ns('recents'), JSON.stringify([])); set({ recents: [] }); get().toast_('Cleared recent history') },

  copyOut: (text) => { try { navigator.clipboard.writeText(text) } catch { /* ignore */ } get().toast_('Copied to clipboard') },
  downloadOut: (text, ext) => {
    try {
      const blob = new Blob([text], { type: 'text/plain' })
      const u = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = u
      a.download = 'toolary.' + (ext || 'txt')
      a.click()
      setTimeout(() => URL.revokeObjectURL(u), 1000)
    } catch { /* ignore */ }
    get().toast_('Downloaded')
  },

  excelLoad: (file) => {
    const name = file.name
    const ext = (name.split('.').pop() || '').toLowerCase()
    const meta: XFile = { name, size: file.size, type: ext.toUpperCase() }
    const r = new FileReader()
    const setExcel = (data: Record<string, SheetData>, active: string) => {
      set({ xFile: meta, xData: data, xSheets: Object.keys(data), xActive: active, xSearch: '', xFilters: {}, xValueFilters: {}, xPage: 0, xShowFilters: false, xFilterMenu: -1, xColMenu: -1 })
      get().toast_('Loaded ' + meta.name)
    }
    if (ext === 'csv') {
      r.onload = () => {
        const rows = parseCSV(String(r.result))
        const headers = rows.shift() || []
        setExcel({ Sheet1: { headers, rows } }, 'Sheet1')
      }
      r.readAsText(file)
    } else {
      r.onload = async () => {
        try {
          const XLSX = await import('xlsx')
          const wb = XLSX.read(new Uint8Array(r.result as ArrayBuffer), { type: 'array' })
          const data: Record<string, SheetData> = {}
          wb.SheetNames.forEach((sn) => {
            const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '' }) as unknown[][]
            const headers = aoa.shift() || []
            data[sn] = { headers, rows: aoa }
          })
          setExcel(data, wb.SheetNames[0])
        } catch { get().toast_('Could not read file') }
      }
      r.readAsArrayBuffer(file)
    }
  },
  excelRemove: () => set({ xFile: null, xData: {}, xSheets: [], xActive: '', xSearch: '', xFilters: {}, xValueFilters: {}, xPage: 0, xShowFilters: false, xFilterMenu: -1, xColMenu: -1 }),
  excelSheet: (sn) => set({ xActive: sn, xPage: 0, xFilters: {}, xValueFilters: {}, xSearch: '', xFilterMenu: -1, xColMenu: -1 }),
  setXSearch: (v) => set({ xSearch: v, xPage: 0 }),
  toggleFilters: () => set((s) => ({ xShowFilters: !s.xShowFilters })),
  setColFilter: (ci, v) => set((s) => ({ xFilters: { ...s.xFilters, [ci]: v }, xPage: 0 })),
  toggleColMenu: (ci) => set((s) => ({ xColMenu: s.xColMenu === ci ? -1 : ci, xFilterMenu: -1 })),
  toggleFilterMenu: (ci) => set((s) => ({ xFilterMenu: s.xFilterMenu === ci ? -1 : ci, xColMenu: -1 })),
  closeFilterMenu: () => set({ xFilterMenu: -1 }),
  setValueFilter: (ci, values) => set((s) => {
    const next = { ...s.xValueFilters }
    if (values && values.length) next[ci] = values
    else delete next[ci]
    return { xValueFilters: next, xPage: 0, xFilterMenu: -1 }
  }),
  clearValueFilter: (ci) => set((s) => {
    const next = { ...s.xValueFilters }
    delete next[ci]
    return { xValueFilters: next, xPage: 0, xFilterMenu: -1 }
  }),
  clearAllFilters: () => {
    set({ xSearch: '', xFilters: {}, xValueFilters: {}, xPage: 0, xFilterMenu: -1, xColMenu: -1 })
    get().toast_('Filters cleared')
  },

  copyColumn: (ci) => { get().copyOut(colVals(get(), ci).join('\n')); set({ xColMenu: -1 }) },
  showDistinct: (ci) => {
    const vals = colVals(get(), ci)
    const m = new Map<string, number>()
    vals.forEach((v) => m.set(v, (m.get(v) || 0) + 1))
    const values = [...m.entries()]
      .map(([raw, count]) => ({ raw, label: raw === '' ? '(empty)' : raw, count }))
      .sort((a, b) => b.count - a.count)
    const label = colLabel(get().xData[get().xActive].headers, ci)
    set({ xDistinct: { ci, label, values }, xColMenu: -1 })
  },
  closeDistinct: () => set({ xDistinct: null }),
  copyDistinct: () => { const d = get().xDistinct; if (d) get().copyOut(d.values.map((x) => x.raw).join('\n')) },
  filterByValue: (raw) => {
    const ci = get().xDistinct!.ci
    set((s) => ({ xFilters: { ...s.xFilters, [ci]: raw }, xShowFilters: true, xDistinct: null, xPage: 0 }))
  },
  setXView: (v) => set({ xView: v, xColMenu: -1, xFilterMenu: -1 }),
  setXPage: (fn) => set((s) => {
    const filt = filterRows(s.xData[s.xActive], s.xSearch, s.xFilters, s.xValueFilters)
    const pages = Math.max(1, Math.ceil(filt.rows.length / s.xPerPage))
    return { xPage: Math.min(pages - 1, Math.max(0, fn(s.xPage, pages))) }
  }),
  setXPerPage: (n) => set({ xPerPage: n || 25, xPage: 0 }),

  addGroup: (ci) => set((s) => ({ pGroups: s.pGroups.includes(ci) ? s.pGroups : [...s.pGroups, ci] })),
  removeGroup: (pos) => set((s) => ({ pGroups: s.pGroups.length > 1 ? s.pGroups.filter((_, i) => i !== pos) : s.pGroups })),
  clearPivot: () => { set({ pGroups: [0], pValue: -1, pAgg: 'count' }); get().toast_('Pivot reset') },
  setPValue: (ci) => set({ pValue: ci }),
  setPAgg: (a) => set((s) => ({ pAgg: a, pValue: a !== 'count' && s.pValue < 0 ? 0 : s.pValue })),

  excelCopy: () => {
    const { headers, rows } = filterRows(get().xData[get().xActive], get().xSearch, get().xFilters, get().xValueFilters)
    get().copyOut([headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n'))
  },
  excelCSV: () => {
    const { headers, rows } = filterRows(get().xData[get().xActive], get().xSearch, get().xFilters, get().xValueFilters)
    const esc = (v: unknown) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
    get().downloadOut([headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n'), 'csv')
  },
  excelJSON: () => {
    const { headers, rows } = filterRows(get().xData[get().xActive], get().xSearch, get().xFilters, get().xValueFilters)
    const arr = rows.map((r) => {
      const o: Record<string, unknown> = {}
      headers.forEach((h, i) => { o[String(h || 'col' + i)] = r[i] == null ? '' : r[i] })
      return o
    })
    get().downloadOut(JSON.stringify(arr, null, 2), 'json')
  },
}))

function colVals(s: AppState, ci: number): string[] {
  const { rows } = filterRows(s.xData[s.xActive], s.xSearch, s.xFilters, s.xValueFilters)
  return rows.map((r) => (r[ci] == null ? '' : String(r[ci])))
}

// Prepend a recent (deduped by name, capped at 8) and persist it.
function pushRecent(recents: RecentItem[], name: string, wsId: string): RecentItem[] {
  const next = [{ name, wsId, ts: Date.now() }, ...recents.filter((r) => r.name !== name)].slice(0, 8)
  set_(ns('recents'), JSON.stringify(next))
  return next
}
