// ---------------------------------------------------------------------------
// Appearance & behavior configuration (ported from the Toolary design system).
// Tweak these to change the default look and starting behavior of the app.
// ---------------------------------------------------------------------------

export type PaletteName = 'Amber' | 'Terracotta' | 'Citron'
export type BackgroundName = 'Obsidian' | 'Espresso' | 'Pine'
export type GreetingMode = 'Time of day' | 'Focus' | 'None'

export const CONFIG = {
  palette: 'Amber' as PaletteName,
  background: 'Obsidian' as BackgroundName,
  // First visit starts empty: no favourites, no fabricated "recent" history.
  // Flip to true only for demo/screenshot builds that want the home pre-filled.
  seedDemoData: false,
  greetingMode: 'Time of day' as GreetingMode,
}

export const GITHUB_URL = 'https://github.com/munsheerek/toolary'

interface Tone {
  bg: string
  panel: string
  toast: string
  fg: string
  sf: string
}

interface Palette {
  accent: string
  accentD: string
  accentRgb: string
  accent2Rgb: string
  dark: Tone
  light: Tone
}

export const PALETTES: Record<PaletteName, Palette> = {
  Amber: {
    accent: '#E8B75C', accentD: '#c9954a', accentRgb: '232,183,92', accent2Rgb: '150,178,140',
    dark: { bg: '#131211', panel: '#1b1917', toast: '#22201d', fg: '236,232,225', sf: '255,255,255' },
    light: { bg: '#F3EEE3', panel: '#FBF8F1', toast: '#2a241b', fg: '40,33,24', sf: '34,26,14' },
  },
  Terracotta: {
    accent: '#C96F4A', accentD: '#a85636', accentRgb: '201,111,74', accent2Rgb: '122,152,138',
    dark: { bg: '#17120F', panel: '#201812', toast: '#2a2019', fg: '240,230,222', sf: '255,250,245' },
    light: { bg: '#F1E7DE', panel: '#FBF3EC', toast: '#2a1f18', fg: '46,32,24', sf: '40,26,16' },
  },
  Citron: {
    accent: '#C6D04E', accentD: '#a6b03a', accentRgb: '198,208,78', accent2Rgb: '120,158,150',
    dark: { bg: '#14150F', panel: '#1b1d14', toast: '#23261a', fg: '233,235,222', sf: '255,255,245' },
    light: { bg: '#EEF0E2', panel: '#F8FAEE', toast: '#23261a', fg: '38,40,28', sf: '32,34,18' },
  },
}

export const BGS: Record<BackgroundName, { dark: Partial<Tone>; light: Partial<Tone> }> = {
  Obsidian: { dark: { bg: '#100F11', panel: '#18171B', toast: '#201f23' }, light: { bg: '#ECEBE8', panel: '#FBFAF8', toast: '#201f23' } },
  Espresso: { dark: { bg: '#17110C', panel: '#201811', toast: '#271d14' }, light: { bg: '#E9E6DF', panel: '#F6F3EC', toast: '#271d14' } },
  Pine: { dark: { bg: '#0E1411', panel: '#161d18', toast: '#1c2420' }, light: { bg: '#E5EBE6', panel: '#F3F7F2', toast: '#1c2420' } },
}

export type Theme = 'dark' | 'light'

export interface Appearance {
  cssVars: string
  accentRgb: string
  accent2Rgb: string
  accent: string
}

export function buildAppearance(theme: Theme): Appearance {
  const pal = PALETTES[CONFIG.palette] || PALETTES.Amber
  let tone: Tone = pal[theme === 'light' ? 'light' : 'dark']
  const bgSet = BGS[CONFIG.background]
  if (bgSet) {
    const b = bgSet[theme === 'light' ? 'light' : 'dark']
    tone = { ...tone, bg: b.bg || tone.bg, panel: b.panel || tone.panel, toast: b.toast || tone.toast }
  }
  const cssVars =
    `--bg:${tone.bg};--panel:${tone.panel};--toast:${tone.toast};` +
    `--fg-rgb:${tone.fg};--sf-rgb:${tone.sf};` +
    `--accent:${pal.accent};--accent-d:${pal.accentD};--accent-rgb:${pal.accentRgb};`
  return { cssVars, accentRgb: pal.accentRgb, accent2Rgb: pal.accent2Rgb, accent: pal.accent }
}

// Per-workspace accent rgb (JSON uses the primary accent, Excel the secondary).
export function rgbOf(wsId: string): string {
  const pal = PALETTES[CONFIG.palette] || PALETTES.Amber
  return wsId === 'excel' ? pal.accent2Rgb : pal.accentRgb
}
export const colOf = (wsId: string) => `rgb(${rgbOf(wsId)})`
export const tintOf = (wsId: string, a: number) => `rgba(${rgbOf(wsId)},${a})`
