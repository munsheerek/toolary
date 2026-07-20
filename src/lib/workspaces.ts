// Workspace catalog + demo content, ported from the Toolary design.

export interface Workspace {
  id: 'json' | 'excel'
  name: string
  abbr: string
  color: string
  desc: string
  count: number
  tools: string[]
}

export const WS: Workspace[] = [
  {
    id: 'json', name: 'JSON', abbr: 'JSN', color: '#E8B75C',
    desc: 'Validate, minify, diff and explore JSON as a live tree.', count: 7,
    tools: ['Tree View', 'Validate', 'Minify', 'Diff Mode', 'Fullscreen Tree', 'Copy', 'Download'],
  },
  {
    id: 'excel', name: 'Excel', abbr: 'XLS', color: 'rgb(150,178,140)',
    desc: 'Convert, clean and diff CSV, XLSX and tabular data.', count: 7,
    tools: ['CSV to JSON', 'JSON to CSV', 'XLSX to CSV', 'Column Extract', 'Dedupe Rows', 'Sheet Diff', 'Table View'],
  },
]

export const wsById = (id: string) => WS.find((w) => w.id === id)

export interface ActionDef {
  name: string
  sub: string
  at: 'theme' | 'github'
  keys: string
}

export const ACTIONS: ActionDef[] = [
  { name: 'Toggle appearance', sub: 'Switch light / dark', at: 'theme', keys: 'theme appearance dark light mode day night' },
  { name: 'Contribute on GitHub', sub: 'Open source · star & fork', at: 'github', keys: 'github repo source code open star fork contribute' },
]

export const ALL_TOOLS: { name: string; ws: Workspace }[] = []
WS.forEach((w) => w.tools.forEach((t) => ALL_TOOLS.push({ name: t, ws: w })))

export const SAMPLE = `{
  "name": "Toolary",
  "type": "utility platform",
  "local": true,
  "workspaces": ["JSON", "Excel"],
  "tools": 14,
  "meta": { "version": "1.0", "stars": null, "tags": ["dev", "fast"] }
}`

export const SAMPLE_B = `{
  "name": "Toolary",
  "type": "workspace platform",
  "local": true,
  "workspaces": ["JSON", "Excel", "Text"],
  "tools": 21,
  "meta": { "version": "1.1", "stars": 1200, "tags": ["dev", "fast"] }
}`

// The JSON tool -> workspace mode map used when launching a tool.
export const MODE_MAP: Record<string, string> = {
  Minify: 'Minify',
  Validate: 'Validate',
  'Tree View': 'Tree View',
  'Diff Mode': 'Diff Mode',
}

// The tool a workspace lands on when opened directly — recorded as the recent
// entry so "opening a workspace" shows up under Continue working. Must be a real
// tool of that workspace so it survives the recents reconciliation in init().
export const LANDING_TOOL: Record<string, string> = {
  json: 'Tree View',
  excel: 'Table View',
}
