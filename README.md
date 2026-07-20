# Toolary — your everyday workspace for data and files

Toolary is a **privacy-first** workspace that brings useful data and file tools together in one place. Every byte is processed **locally in your browser** — no file, no JSON, no parsed table is ever uploaded to a server. There is no account and no sync.

> **Your data stays on your device.**

Today Toolary ships two workspaces — **JSON** and **Excel** — reachable from a home dashboard and a `⌘K` command palette.

---

## Highlights

- 🔒 **100% local** — files are read with the browser `FileReader`; spreadsheets are parsed client-side with [SheetJS](https://sheetjs.com/) (loaded on demand).
- ⌘ **Command palette** — `⌘K` / `Ctrl+K` to search tools, workspaces and actions, with keyboard navigation.
- 🏠 **Home dashboard** — greeting, recent tools ("Continue working"), favourite workspaces, and a browsable workspace grid.
- 🎨 **Theme-aware** — warm dark/light themes; your choice is remembered in `localStorage`.
- ⭐ **Recents & favourites** — opening a workspace or launching a tool is remembered locally; star the workspaces you use most.

---

## Workspaces

### JSON

A two-pane editor (input ↔ output) with four modes:

| Mode | What it does |
| --- | --- |
| **Tree View** | Interactive, color-coded tree (strings, numbers, booleans, `null`, keys). Collapse/expand nodes, **Expand all** / **Collapse all**, and a **fullscreen** tree. |
| **Validate** | Confirms valid JSON and reports node count, depth and size — or shows the exact parser error. |
| **Minify** | Strips whitespace to the most compact form and reports character count. |
| **Diff Mode** | Line-by-line diff (LCS-based) between two JSON sources, with added/removed lines highlighted and an `+add / −remove` summary. |

Plus: a **Find in JSON** search that highlights matching keys/values across the tree and counts matches, **Format** (pretty-print), **Upload** a `.json` file, load a **Sample**, **Clear**, and **Copy** / **Download** of the output.

### Excel & CSV

Drag & drop (or browse for) `.xlsx`, `.xls`, or `.csv` files.

- **Stats bar** — rows, columns, sheets, empty cells, file type/size and active sheet.
- **Table view** — paginated grid with sticky headers, multi-sheet tabs, and adjustable page size.
- **Filtering** (three ways, combined with AND):
  - **Global search** — space-separated terms that must all match somewhere in a row.
  - **Column Filters** — a per-column "contains" input row.
  - **Autofilter** — a funnel on each header opens an Excel-style checklist of that column's distinct values (with counts + search); pick the values to keep. The funnel highlights while active.
  - **Clear filters** — one button resets the search, column filters and autofilters at once.
- **Column menu** (`⋯`) — copy a column's values, or open a **Distinct values** picker (click a value to filter by it).
- **Pivot view** — group by one or more columns, aggregate with **Count / Sum / Average / Min / Max**, then copy or export the result as CSV.
- **Export** — **Copy** the table as TSV (paste straight into Excel / Sheets / Numbers), or download as **CSV** / **JSON**.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (dev server & build)
- **Zustand** for global state
- **Tailwind CSS v4** base layer; component styling is inline, themed via CSS custom properties
- **SheetJS (`xlsx`)** for spreadsheet parsing — dynamically imported so it stays out of the initial bundle
- **JetBrains Mono** for monospaced UI

---

## Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (Vite)
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build
npm run lint     # run oxlint
```

---

## Keyboard shortcuts

| Shortcut | Action | Scope |
| --- | --- | --- |
| `⌘K` / `Ctrl+K` | Open / close the command palette | Global |
| `↑` / `↓` | Move between results | Command palette |
| `↵` | Open the highlighted result | Command palette |
| `Esc` | Close the palette, a modal, or the fullscreen tree | Global |

---

## Project structure

```text
src/
├── components/
│   ├── Header.tsx              # Logo + theme toggle (shared top bar)
│   ├── HomeView.tsx            # Greeting, search, recents, favourites, browse grid
│   ├── WorkspaceHeader.tsx     # Back / title / search / favourite bar for a workspace
│   ├── JsonWorkspace.tsx       # JSON input/output panes + modes
│   ├── JsonTree.tsx            # Recursive, collapsible JSON tree renderer
│   ├── ExcelWorkspace.tsx      # File info, table, pivot, pagination, filters
│   ├── ColumnFilterPopover.tsx # Excel-style per-column value autofilter
│   ├── CommandPalette.tsx      # ⌘K search over tools / workspaces / actions
│   ├── Overlays.tsx            # Distinct-values modal + fullscreen JSON tree
│   └── Toast.tsx               # Transient status toast
├── lib/
│   ├── config.ts               # Palettes, backgrounds, theming, app config
│   ├── workspaces.ts           # Workspace catalog, tools, samples
│   ├── json.ts                 # parse / pretty / stats / diff / match-count
│   ├── table.ts                # CSV parse, row filtering, pivot, distinct
│   ├── highlight.tsx           # Search-term highlighting + time-ago helpers
│   └── icons.tsx               # Workspace & action SVG glyphs
├── store/
│   └── useAppStore.ts          # Zustand store — all app state & actions
├── App.tsx                     # Theming wrapper, global keys, view routing
├── index.css                   # CSS variables, fonts, keyframes, hover states
└── main.tsx                    # Render entrypoint
```

### Configuring appearance

Defaults live in `src/lib/config.ts`:

- `palette` — `Amber` (default), `Terracotta`, or `Citron`
- `background` — `Obsidian` (default), `Espresso`, or `Pine`
- `greetingMode` — `Time of day` (default), `Focus`, or `None`
- `seedDemoData` — `false`; set `true` to pre-fill the home with sample recents/favourites (useful for demos/screenshots)

---

## Deployment

Toolary is a static, client-side SPA — no backend required. Build and host the `dist/` folder anywhere:

```bash
npm run build
```

- **Vercel** — `npx vercel` from the project root
- **Netlify** — drag `dist/` onto the Netlify dashboard
- **GitHub Pages** — deploy `dist/` via GitHub Actions
- **AWS S3 / CloudFront** — upload `dist/` to a static-hosting bucket behind a CDN

---

## Privacy

No account. No sync. Your **files, JSON and parsed tables never leave the browser tab** — they are read locally and stored only in memory, and your preferences (theme, recents, favourites) live only in your browser's `localStorage`.

The hosted build includes [Vercel Analytics](https://vercel.com/analytics), which records anonymous page-level usage metrics — never the contents of your files or inputs. Remove `<Analytics />` from `src/main.tsx` (and the `@vercel/analytics` dependency) to drop it entirely.
