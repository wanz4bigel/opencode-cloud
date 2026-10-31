// Kumpulin SEMUA JavaScript yang dieksekusi sebuah halaman, lewat CDP Debugger API.
// Bedanya dengan fetch biasa: ini sumber yang BENERAN dipake browser (termasuk yang
// ke-load sebelum kita attach), plus URL asli per script.
//   node collectjs.mjs <url> <dirDepan> [durasiMs]
const [,, URL_ARG, OUT_DIR, WAIT_ARG] = process.argv;
const WAIT = Number(WAIT_ARG || 9000);
import fs from 'fs';
import path from 'path';
if (!OUT_DIR) { console.error('butuh direktori output'); process.exit(2); }
fs.mkdirSync(OUT_DIR, { recursive: true });

const CDP = 'http://127.0.0.1:9222';
const list = await (await fetch(CDP + '/json')).json();
const page = list.find(t => t.type === 'page');
if (!page) { console.error('nggak ada target page'); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);

let nextId = 1;
const pending = new Map();
const parsed = new Map(); // scriptId -> {url, start}
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Debugger.scriptParsed') {
    const p = m.params;
    if (!parsed.has(p.scriptId)) parsed.set(p.scriptId, { url: p.url, start: p.startLine });
  }
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('timeout ' + method)); } }, 25000);
});
const evaluate = async (expression) => {
  const m = await call('Runtime.evaluate', { expression, returnByValue: true });
  return m.result && m.result.result ? m.result.result.value : undefined;
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
await new Promise(r => { ws.onopen = r; });

await call('Page.enable');
await call('Runtime.enable');
await call('Debugger.enable');
try { await call('Page.navigate', { url: URL_ARG }); } catch (e) { console.error('navigate:', e.message); }
await sleep(WAIT);

// Klik tautan login/daftar buat mancing chunk OTP di-load (SPA, tanpa reload)
if (process.env.CLICK) {
  await evaluate(`(function(){
    const sel = ${JSON.stringify(process.env.CLICK)};
    const els = [...document.querySelectorAll('a,button,[role=button]')];
    const el = els.find(e => sel.split('|').some(k => (e.textContent || '').toLowerCase().includes(k)));
    if (el) el.click();
    return !!el;
  })()`);
  await sleep(Math.min(WAIT, 6000));
}

const origin = (await evaluate('location.origin')) || 'unknown';
let saved = 0, skipped = 0;
const manifest = [];
for (const [id, info] of parsed) {
  const u = info.url || '';
  if (u && !/^https?:\/\//.test(u)) { skipped++; continue; }
  if (u && !/\.js(\?|$)/.test(u) && !/\/(static|js|assets|_next|build|chunk|src)\//.test(u) && !/\bapp|main|bundle|index/i.test(u)) { skipped++; continue; }
  let src;
  try {
    const r = await call('Debugger.getScriptSource', { scriptId: id });
    src = r.result && r.result.scriptSource;
  } catch (e) { /* script sudah di-unload */ }
  if (!src || src.length < 120) { skipped++; continue; }
  const key = u.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-90);
  const file = path.join(OUT_DIR, (origin.replace(/^https?:\/\//, '') || 'x') + '__' + key + '.js');
  fs.writeFileSync(file, src);
  manifest.push({ url: u, file: path.basename(file), bytes: src.length });
  saved++;
}
fs.writeFileSync(path.join(OUT_DIR, '_manifest.json'), JSON.stringify({ url: URL_ARG, origin, saved, skipped, scripts: manifest }, null, 1));
console.log(`script disimpan: ${saved} | dilewati: ${skipped} | total parsed: ${parsed.size} | origin: ${origin}`);
ws.close();
process.exit(0);
