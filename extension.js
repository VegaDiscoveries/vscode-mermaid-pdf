'use strict';

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.mermaid-pdf.pdf', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('[Mermaid PDF] No active editor.');
                return;
            }
            convertToPdf(editor.document);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(document => {
            const config = vscode.workspace.getConfiguration('mermaid-pdf');
            if (!config.get('convertOnSave')) return;
            if (!document.fileName.endsWith('.mermaid')) return;
            const excludes = config.get('convertOnSaveExclude') || [];
            const base = path.basename(document.fileName);
            if (excludes.some(p => base.includes(p))) return;
            convertToPdf(document);
        })
    );
}

function getMmdcPath() {
    const configured = (vscode.workspace.getConfiguration('mermaid-pdf').get('mmdcPath') || '').trim();
    if (configured) return configured;
    if (process.platform === 'win32') {
        const winPath = path.join(process.env.APPDATA || '', 'npm', 'mmdc.cmd');
        if (fs.existsSync(winPath)) return winPath;
    }
    return 'mmdc';
}

function getOutputPath(srcPath) {
    const outputDir = (vscode.workspace.getConfiguration('mermaid-pdf').get('outputDirectory') || '').trim();
    const baseName = path.basename(srcPath, '.mermaid') + '.pdf';

    let resolvedDir;
    if (!outputDir) {
        resolvedDir = path.join(path.dirname(srcPath), 'Mermaid-to-PDF');
    } else if (path.isAbsolute(outputDir)) {
        resolvedDir = outputDir;
    } else {
        const ws = vscode.workspace.workspaceFolders;
        const root = ws && ws.length > 0 ? ws[0].uri.fsPath : path.dirname(srcPath);
        resolvedDir = path.join(root, outputDir);
    }

    if (!fs.existsSync(resolvedDir)) fs.mkdirSync(resolvedDir, { recursive: true });
    return path.join(resolvedDir, baseName);
}

function preprocessToTemp(srcPath) {
    const tmpPath = srcPath.replace(/\.mermaid$/, '_no-comments.mermaid');
    const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);
    const stripped = [];
    for (const ln of lines) {
        if (/^\s*%%/.test(ln) && !/^\s*%%\{/.test(ln)) continue;  // pure comment — skip
        if (/%%/.test(ln) && !/^\s*%%\{/.test(ln)) {               // inline comment — strip
            stripped.push(ln.replace(/%%.*$/, '').trimEnd());
        } else {
            stripped.push(ln);                                       // directive or non-comment — keep
        }
    }
    fs.writeFileSync(tmpPath, stripped.join('\n'), 'utf8');
    return tmpPath;
}

async function convertToPdf(document) {
    const srcPath = document.fileName;
    if (!srcPath.endsWith('.mermaid')) {
        vscode.window.showWarningMessage('[Mermaid PDF] Active file is not a .mermaid file.');
        return;
    }

    const baseName = path.basename(srcPath, '.mermaid');
    const statusBar = vscode.window.setStatusBarMessage('$(sync~spin) [Mermaid PDF] Converting...');
    let tmpPath;

    try {
        const outputPath = getOutputPath(srcPath);
        tmpPath = preprocessToTemp(srcPath);
        const mmdcPath = getMmdcPath();

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `[Mermaid PDF] Exporting ${baseName}.pdf ...`,
            cancellable: false
        }, () => new Promise((resolve, reject) => {
            execFile(mmdcPath, ['-i', tmpPath, '-o', outputPath], { shell: true }, (err, _stdout, stderr) => {
                if (err) reject(new Error(stderr || err.message));
                else resolve();
            });
        }));

        statusBar.dispose();
        const timeout = vscode.workspace.getConfiguration('mermaid-pdf').get('StatusbarMessageTimeout');
        vscode.window.setStatusBarMessage(`$(file-pdf) [Mermaid PDF] ${baseName}.pdf`, timeout);

    } catch (err) {
        statusBar.dispose();
        vscode.window.showErrorMessage(`[Mermaid PDF] Export failed: ${err.message}`);
    } finally {
        if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
}

function deactivate() {}

module.exports = { activate, deactivate };
