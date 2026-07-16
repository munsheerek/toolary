# Toolary - Your everyday workspace for data and files.

Toolary is a privacy-first workspace application that brings together useful tools for developers, data professionals, and everyday users. All computation is run locally in the browser context; no file data, JSON code, or parsed tables are ever sent to a remote server. 

**"Your data stays on your device."**

---

## Features

### 1. JSON Formatter & Viewer
* **Monaco Editor Integration**: Loaded locally with syntax highlights, autocomplete parentheses, line numbers, error markers, search queries, and fullscreen modes.
* **Format Actions**: Format (Pretty print with 2-spaces indentation) or Minify (strip white spacing) JSON structures with instant error logs (line number, column offset, and exact parser message).
* **Custom Interactive Tree View**: Color-coded data type tags (e.g., `str`, `num`, `bool`, `null`, `keys`, `items`). Node collapse/expand switches, "Expand All" / "Collapse All" shortcuts, and key/value text searches.
* **JSON Info Panel**: Real-time summary detailing Byte Size, Character Length, Total Keys, Objects count, and Arrays count.

### 2. Excel & CSV Spreadsheet Viewer
* **High Performance File Reader**: Drop spreadsheet files (.xlsx, .xls, .csv) directly onto the grid dropzone to parse.
* **Dynamic Table Grid**: Interactive paginated grid supporting sticky headers, custom column width drags, sheet selection tabs (for multi-sheet xlsx files), and column sorting (Ascending/Descending).
* **Advanced Filters**: Standard search input filtering rows instantly, alongside column-specific toggle inputs.
* **Export Actions**: Convert and download tables directly to raw CSV or JSON format. Use **Copy Table Data** to copy content as Tab-Separated Values (TSV) to paste into Microsoft Excel, Google Sheets, or Numbers.
* **Spreadsheet Stats Panel**: Live calculations of Sheet Count, Active Sheet name, Row/Column boundaries, and Empty Cells.

### 3. Navigation & Command Palette
* **Theme Controls**: Default Dark Mode configuration, switchable to Light Theme. Stores choices directly in browser local storage.
* **VS Code-Style Command Palette**: Press `Cmd + K` (Mac) or `Ctrl + K` (Windows/Linux) to access search triggers:
  * Run "Format JSON"
  * Open "Excel Viewer" workspace
  * Trigger "Generate UUID" (creates, displays, and copies a v4 UUID to clipboard with a visual toast)
  * Toggle Color Themes or Sidebars.
* **Responsive Sidebar Layout**: Left navigation panel with tool definitions, collapsed layouts, and "Coming Soon" tool previews.

---

## Folder Structure

```text
src/
├── assets/                    # Assets and images
├── components/                # Shared layout elements
│   ├── CommandPalette/        # VS Code style fuzzy actions search
│   ├── Header/                # Breadcrumbs, theme controls, privacy dot
│   ├── HomeDashboard/         # Visual landing page cards
│   ├── Layout/                # Sidebar, header, toast layout container
│   └── Sidebar/               # Navigation collapsible sidebar
├── features/
│   ├── excel/                 # Excel uploader, grid viewer, stats
│   └── json/                  # Monaco editor, custom tree viewer, action toolbar
├── hooks/
│   └── useKeyboardShortcuts.ts # OS-aware key event handler
├── store/
│   └── useAppStore.ts         # Zustand global state (theme, sidebar, toasts)
├── utils/
│   ├── excelHelper.ts         # SheetJS parsing & format converters
│   └── jsonHelper.ts          # Stats counter & validation error extractors
├── App.tsx                    # Main tool router
├── index.css                  # Custom scrollbars, tailwind base setup
└── main.tsx                   # Render entrypoint
```

---

## Getting Started

### Prerequisites
* Node.js (version 18 or above recommended)
* npm (comes with Node)

### Installation
1. Clone the repository or navigate to the directory:
   ```bash
   cd /Users/munsheerek/Projects/hobby-projects/toolary
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Build for production compilation:
   ```bash
   npm run build
   ```

---

## Keyboard Shortcuts

| Shortcut | Action | Scope |
| --- | --- | --- |
| `Cmd/Ctrl + K` | Open Command Palette | Global |
| `Cmd/Ctrl + Enter` | Format JSON | JSON Editor |
| `Cmd/Ctrl + Shift + C` | Copy Output (JSON / TSV Table) | JSON & Excel Workspaces |
| `Escape` | Close Command Palette / Modals | Global |

---

## Deployment Instructions

### Static Site Hosting (Recommended)
Since Toolary is a client-side only SPA (Single Page Application) with no database backend, you can compile and host it on static web host platforms.

1. Generate the static folder output by running:
   ```bash
   npm run build
   ```
   This compiles all React components, Monaco libraries, Tailwind CSS, and scripts into a single optimize index bundle under the `/dist` directory.

2. Upload the `/dist` folder to your provider of choice:
   * **Vercel**: Run `npx vercel` in the project root directory.
   * **Netlify**: Drag and drop the `/dist` folder directly onto the Netlify dashboard.
   * **GitHub Pages**: Configure GitHub Actions to compile and deploy `gh-pages` branch.
   * **AWS S3 / CloudFront**: Upload to an S3 bucket configured for static site hosting and distribute via CDN.
