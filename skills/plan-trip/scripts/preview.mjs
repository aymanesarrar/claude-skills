#!/usr/bin/env node
// Render a trip-plan Markdown file to a styled standalone HTML page next to it,
// then open it in the default browser. No npm dependencies.
//
// Usage: node preview.mjs <plan.md> [--no-open]

import { readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const mdPath = args.find((a) => !a.startsWith('--'));
if (!mdPath) {
  console.error('Usage: node preview.mjs <plan.md> [--no-open]');
  process.exit(1);
}

const abs = resolve(mdPath);
const markdown = readFileSync(abs, 'utf8');
const title = (markdown.match(/^#\s+(.+)$/m)?.[1] ?? basename(abs, '.md')).trim();

// JSON-encode and neutralise "<" so the plan can never close the <script> tag.
const payload = JSON.stringify(markdown).replace(/</g, '\\u003c');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root { --bg:#fafaf9; --card:#fff; --text:#1c1917; --muted:#57534e; --line:#e7e5e4; --accent:#047857; --warn-bg:#fffbeb; --warn-line:#f59e0b; --code:#f5f5f4; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#0c0a09; --card:#1c1917; --text:#f5f5f4; --muted:#a8a29e; --line:#292524; --accent:#34d399; --warn-bg:#292012; --warn-line:#b45309; --code:#292524; }
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  .bar { position:sticky; top:0; z-index:1; display:flex; gap:8px; justify-content:flex-end; padding:10px 16px; background:color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter:blur(8px); border-bottom:1px solid var(--line); }
  .bar button { font:inherit; font-size:14px; padding:6px 12px; border-radius:8px; border:1px solid var(--line); background:var(--card); color:var(--text); cursor:pointer; }
  .bar button:hover { border-color:var(--muted); }
  main { max-width:860px; margin:24px auto 64px; padding:32px clamp(16px, 4vw, 48px); background:var(--card); border:1px solid var(--line); border-radius:16px; }
  h1 { font-size:clamp(1.6rem, 4vw, 2.2rem); line-height:1.2; margin:0 0 .5em; text-wrap:balance; }
  h2 { margin-top:2em; padding-bottom:.3em; border-bottom:1px solid var(--line); }
  h3 { margin-top:1.6em; }
  a { color:var(--accent); text-underline-offset:2px; overflow-wrap:anywhere; }
  blockquote { margin:1em 0; padding:.6em 1em; background:var(--warn-bg); border-left:4px solid var(--warn-line); border-radius:6px; }
  blockquote p { margin:.3em 0; }
  .table-wrap { overflow-x:auto; margin:1em 0; }
  table { border-collapse:collapse; width:100%; font-size:14px; }
  th, td { padding:8px 10px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }
  th { color:var(--muted); font-weight:600; white-space:nowrap; }
  td { font-variant-numeric:tabular-nums; }
  code { background:var(--code); padding:.1em .35em; border-radius:4px; font-size:.9em; }
  li { margin:.25em 0; }
  @media print { .bar { display:none; } body { background:#fff; } main { border:0; margin:0; max-width:none; } }
</style>
</head>
<body>
<div class="bar">
  <button onclick="window.print()">Print / Save as PDF</button>
  <button id="dl">Download .md</button>
</div>
<main id="content"><p>Loading…</p></main>
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js"></script>
<script>
  const md = ${payload};
  const el = document.getElementById('content');
  try {
    el.innerHTML = DOMPurify.sanitize(marked.parse(md, { breaks: true }));
    el.querySelectorAll('table').forEach((t) => { const w = document.createElement('div'); w.className = 'table-wrap'; t.replaceWith(w); w.appendChild(t); });
    el.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  } catch (e) {
    // Offline or CDN blocked: show the raw Markdown instead of a blank page.
    const pre = document.createElement('pre'); pre.style.whiteSpace = 'pre-wrap'; pre.textContent = md; el.replaceChildren(pre);
  }
  document.getElementById('dl').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    a.download = ${JSON.stringify(basename(abs))};
    a.click();
  };
</script>
</body>
</html>
`;

const htmlPath = abs.replace(/\.md$/i, '') + '.html';
writeFileSync(htmlPath, html);
console.log(htmlPath);

if (!args.includes('--no-open')) {
  const url = pathToFileURL(htmlPath).href;
  const [cmd, cmdArgs] =
    process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]]
    : ['xdg-open', [url]];
  const child = spawn(cmd, cmdArgs, { detached: true, stdio: 'ignore' });
  child.on('error', () => console.error(`Could not open a browser — open this file manually: ${htmlPath}`));
  child.unref();
}
