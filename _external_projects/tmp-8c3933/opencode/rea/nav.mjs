// Navigate tab yang sudah ada ke URL API, kasih waktu buat nyelesaiin Cloudflare challenge,
// lalu baca judul/body + cookie yang dihasilkan.
const CDP = 'http://127.0.0.1:9222';
const list = await (await fetch(CDP + '/json')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);

let nextId = 1;
const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('timeout ' + method)); } }, 30000);
});
const evaluate = async (expression) => {
  const m = await call('Runtime.evaluate', { expression, returnByValue: true });
  return m.result?.result?.value;
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await new Promise(r => { ws.onopen = r; });
await call('Runtime.enable');
await call('Page.enable');
await call('Page.navigate', { url: 'https://api.duniagames.co.id/api/user/api/v2/user/send-otp' });

for (let i = 1; i <= 8; i++) {
  await sleep(4000);
  const title = await evaluate('document.title');
  const body = (await evaluate('document.body ? document.body.innerText.slice(0,120) : ""')) || '';
  console.log(`[${i * 4}s] title="${title}" body="${String(body).replace(/\n/g, ' ').slice(0, 90)}"`);
  if (title && !/just a moment|attention/i.test(String(title))) { console.log('=> challenge keliatan selesai'); break; }
}
const cookies = await call('Storage.getCookies');
const dg = (cookies.result.cookies || []).filter(c => /duniagames/.test(c.domain));
console.log('COOKIE DUNIAGAMES:', dg.length ? dg.map(c => c.name + '=' + String(c.value).slice(0, 24)).join(' | ') : '(tidak ada)');
ws.close();
