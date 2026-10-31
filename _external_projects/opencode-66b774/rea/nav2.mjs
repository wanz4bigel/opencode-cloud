// Navigasi tab Chrome ke URL, tunggu render, lapor judul + URL akhir.
const [,, URL_ARG] = process.argv;
const CDP = 'http://127.0.0.1:9222';
const list = await (await fetch(CDP + '/json')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 1; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++; pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('timeout ' + method)); } }, 25000);
});
const evaluate = async (e) => (await call('Runtime.evaluate', { expression: e, returnByValue: true })).result?.result?.value;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await new Promise(r => { ws.onopen = r; });
await call('Page.enable');
await call('Runtime.enable');
try { await call('Page.navigate', { url: URL_ARG }); } catch (e) { console.log('NAV ERR', e.message); }
for (let i = 0; i < 14; i++) {
  await sleep(2000);
  const t = await evaluate('document.title');
  const ready = await evaluate('document.readyState');
  if (ready === 'complete' && t) { console.log('TITLE:', String(t).slice(0, 90)); console.log('URL:', await evaluate('location.href')); break; }
}
ws.close();
