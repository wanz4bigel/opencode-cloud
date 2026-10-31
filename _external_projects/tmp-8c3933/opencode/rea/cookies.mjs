// Ambil cookie duniagames dari Chrome via CDP (cookie yang di-set challenge JS/Incapsule),
// biar bisa dipakai replay request OTP biasa.
const CDP = 'http://127.0.0.1:9222';

const list = await (await fetch(CDP + '/json')).json();
const page = list.find(t => t.type === 'page' && t.url.includes('duniagames'));
if (!page) { console.error('target duniagames tidak ketemu'); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
const send = (id, method, params = {}) => ws.send(JSON.stringify({ id, method, params }));

const out = await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('timeout CDP')), 20000);
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id === 1) {
      send(2, 'Storage.getCookies', { browserContextId: undefined });
    }
    if (msg.id === 2) {
      clearTimeout(t);
      resolve(msg.result.cookies || []);
      ws.close();
    }
  };
  ws.onerror = (e) => { clearTimeout(t); reject(new Error('ws error')); };
  ws.onopen = () => send(1, 'Network.getAllCookies');
});

const host = (c) => c.replace(/^\./, '');
const cookies = out.filter(c => /duniagames\.co\.id$/.test(host(c.domain)));
console.log('TOTAL COOKIE HOST DUNIAGAMES:', cookies.length);
for (const c of cookies) console.log(`  ${c.name} = ${String(c.value).slice(0, 70)}${String(c.value).length > 70 ? '...' : ''}  [httpOnly=${c.httpOnly} secure=${c.secure} sameSite=${c.sameSite}]`);
console.log('COOKIE_HEADER=' + cookies.map(c => `${c.name}=${c.value}`).join('; '));
console.log('UA=' + (await (await fetch(CDP + '/json/version')).json()).UserAgent);
