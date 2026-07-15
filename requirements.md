Build a modern developer utility application called "DevBox".

## Product Overview

DevBox is a privacy-first developer toolbox that provides commonly used developer utilities in one place.

The first release should include:

1. JSON Formatter & Viewer
2. Excel / CSV Viewer

The application should be designed as an extensible platform where more developer tools can be added later:
- API Tester
- JWT Decoder
- Regex Tester
- SQL Formatter
- Password Generator
- Base64 Encoder/Decoder
- Timestamp Converter
- Code Formatter

---

# Tech Stack

## Frontend

Use:
- React
- TypeScript
- Vite
- Tailwind CSS
- Modern component architecture

UI requirements:
- Clean developer-focused interface
- Similar feel to VS Code / Linear
- Responsive design
- Dark mode by default
- Keyboard shortcuts
- Fast interactions

Recommended libraries:
- Monaco Editor or CodeMirror for JSON editor
- SheetJS (xlsx) for Excel parsing
- Zustand or Context API for state management
- Lucide icons

---

# Core Principle

Privacy first.

All file processing should happen locally in the browser.

No uploaded JSON or Excel files should be sent to a backend.

Display:

"Your data stays on your device."

---

# Application Structure

Create a dashboard layout.

## Sidebar

Logo:
DevBox

Navigation:

Tools:
- JSON Formatter
- Excel Viewer

Coming Soon:
- API Tester
- SQL Tools
- Security Tools

Sidebar features:
- Collapsible
- Active tool highlighting
- Tool icons

---

# Home Dashboard

Create a landing dashboard showing:

Title:
"Developer tools, packed in one box."

Cards:

JSON Formatter
- Format, validate and explore JSON

Excel Viewer
- View and analyze spreadsheet files

Coming Soon cards:
- API Tester
- JWT Tools
- Regex Tester

---

# Feature 1: JSON Formatter

Create a complete JSON workspace.

## Editor

Use Monaco Editor.

Features:
- JSON syntax highlighting
- Line numbers
- Error highlighting
- Auto indentation
- Search
- Full screen mode

Input methods:
- Paste JSON
- Upload .json file
- Load sample JSON

---

## JSON Actions

Buttons:

Format JSON
- Pretty print JSON

Minify JSON
- Remove unnecessary spaces

Validate JSON
- Check JSON syntax

Copy JSON

Download JSON

Clear

---

## JSON Viewer

Display formatted JSON.

Features:
- Tree view
- Expand all
- Collapse all
- Search keys
- Search values
- Show data types

Example:

Object
 ├── user
 │    ├── name: String
 │    └── age: Number

---

## JSON Information Panel

Display:

- File size
- Character count
- Number of keys
- Object count
- Array count

---

## Error Handling

When invalid JSON is entered:

Show:

Invalid JSON

Details:
- Error message
- Line number
- Column number

Example:

"Expected property name at line 5 column 3"

---

# Feature 2: Excel Viewer

Create an Excel processing workspace.

Supported formats:

- .xlsx
- .xls
- .csv

---

## Upload

Support:

- Drag and drop
- File picker

Display:

- File name
- File size
- File type

---

## Spreadsheet Viewer

Display Excel data in a table.

Features:

- Multiple sheet tabs
- Table pagination
- Column resizing
- Search
- Sorting
- Filtering
- Sticky headers

---

## Excel Information Panel

Show:

- Number of sheets
- Current sheet name
- Rows count
- Columns count
- Empty cells count

---

## Export Options

Allow:

Export to:
- CSV
- JSON

Actions:
- Copy table data
- Download converted file

---

# UX Features

Implement:

## Theme

- Dark mode
- Light mode
- Save preference in local storage

---

## Keyboard Shortcuts

Implement:

Ctrl + K:
Open command palette

Ctrl + Enter:
Format JSON

Ctrl + Shift + C:
Copy output

---

## Command Palette

Create a VS Code style command menu:

Commands:

> Format JSON
> Open Excel Viewer
> Generate UUID
> Open Settings

---

# Architecture

Use a scalable folder structure:

src/

components/
- Layout
- Sidebar
- Header
- CommandPalette

features/

json/
- JsonEditor
- JsonViewer
- JsonActions

excel/
- ExcelUploader
- SpreadsheetViewer
- ExportActions

hooks/

utils/

types/

---

# Code Quality Requirements

Follow:

- TypeScript strict mode
- Reusable components
- Clean naming conventions
- Proper error handling
- Loading states
- Empty states
- Responsive design

---

# Future Ready

Prepare architecture for adding:

- User accounts
- Saved history
- Favorites
- Cloud sync
- Plugin system
- More developer tools

---

# Deliverables

Provide:

1. Complete project setup
2. Folder structure
3. UI implementation
4. JSON formatter implementation
5. Excel viewer implementation
6. Dark mode
7. Keyboard shortcuts
8. README.md
9. Deployment instructions

Build DevBox as a production-quality developer tool, not a demo.
Focus on excellent UX, speed, and extensibility.