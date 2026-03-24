# Mermaid PDF

Export `.mermaid` diagram files to PDF via the [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) (`mmdc`).

## Requirements

- **Node.js** (LTS) must be installed.
- **Mermaid CLI** must be installed globally:
  ```
  npm install -g @mermaid-js/mermaid-cli
  ```
  Verify with `mmdc --version`.

## Usage

- **On save** — PDF is generated automatically each time a `.mermaid` file is saved (enabled by default).
- **Command Palette** — `Mermaid PDF: Export (pdf)`
- **Right-click context menu** — Available when a `.mermaid` file is active.

Output is written to a `Mermaid-to-PDF` subfolder alongside the source file.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `mermaid-pdf.convertOnSave` | `true` | Auto-export on save |
| `mermaid-pdf.convertOnSaveExclude` | `[]` | Filename patterns to exclude from on-save |
| `mermaid-pdf.outputDirectory` | `""` | Output directory (empty = `Mermaid-to-PDF` subfolder) |
| `mermaid-pdf.mmdcPath` | `""` | Full path to mmdc executable (auto-detected if empty) |
| `mermaid-pdf.StatusbarMessageTimeout` | `10000` | Status bar display duration (ms) after export |

## Notes

- `%%` comment lines are stripped before rendering to work around a Mermaid CLI parse bug with files containing more than ~16 comment lines. Source `.mermaid` files are never modified.
- `%%{...}` init/config directive lines are preserved and passed through to `mmdc` intact.
