// Tembak endpoint OTP dari dalam browser; simpan hasil ke window, lalu baca terpisah.
const CDP = 'http://127.0.0.1:9222';
const list = await (await fetch(CDP + '/json')).json();
const page = list.find(t => t.type === 'page' && t.url.includes('duniagames'));
const ws = new WebSocket(page.webSocketDebuggerUrl);

let nextId = 1;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('timeout ' + method)); } }, 25000);
});
const evaluate = async (expression) => {
  const m = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: false });
  if (m.exceptionDetails) return 'EXC: ' + JSON.stringify(m.exceptionDetails).slice(0, 250);
  return JSON.stringify(m.result?.result?.value ?? m.result);
};

await new Promise(r => { ws.onopen = r; });
await call('Runtime.enable');

const KICK = `
window.__otp = 'pending';
fetch('https://api.duniagames.co.id/api/user/api/v2/user/send-otp', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'accept': 'application/json, text/plain, */*', 'ciam-type': 'FR', 'x-device': '1b5707e3-7789-4a46-b55a-a0c7eddf91c5' },
  body: JSON.stringify({ phoneNumber: '+6283822461998', userName: '083822461998' })
}).then(async r => { const t = await r.text(); window.__otp = 'HTTP ' + r.status + ' :: ' + t.slice(0, 220); })
  .catch(e => { window.__otp = 'FETCH ERROR: ' + e.message; });
'kick';`;

await evaluate(KICK);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 10; i++) {
  await sleep(1500);
  const v = JSON.parse(await evaluate('window.__otp'));
  if (v !== 'pending') { console.log('HASIL DARI BROWSER:', v); break; }
  if (i === 9) console.log('HASIL DARI BROWSER: (masih pending)');
}

// pembanding: HEAD ke root API yang kemarin 403 buat curl
await evaluate(`window.__get = 'pending'; fetch('https://api.duniagames.co.id/api/user/api/v2/user/send-otp', {method:'GET'}).then(r=>r.text().then(t=>window.__get='HTTP '+r.status+' :: '+t.slice(0,150))).catch(e=>window.__get='ERR '+e.message); 'k';`);
await sleep(4000);
console.log('GET VIA BROWSER:', JSON.parse(await evaluate('window.__get')));
ws.close();
