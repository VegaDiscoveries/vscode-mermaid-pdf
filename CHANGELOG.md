# Mermaid PDF — Changelog

## v1.0.0 — 2026-03-23
- Initial release.
- Export `.mermaid` files to PDF via the Mermaid CLI (`mmdc`).
- Supports on-save auto-export (`mermaid-pdf.convertOnSave`).
- Supports manual export via Command Palette and editor right-click context menu.
- `%%` comment lines are stripped before rendering to work around an mmdc parse bug with files containing more than ~16 comment lines.
- `%%{...}` init/config directive lines are preserved through preprocessing.
- Output written to a `Mermaid-to-PDF` subfolder alongside the source file by default.
- Auto-detects mmdc from PATH or npm global bin (`%APPDATA%\npm\mmdc.cmd`) on Windows.
- Progress notification shown during export; status bar shows output filename on success.
