import fs from 'node:fs';
const WD = 'http://localhost:9515';
const demo = JSON.parse(fs.readFileSync('/tmp/opencode/demo.json', 'utf8'));
const call = async (method, path, body) => {
  const r = await fetch(`${WD}${path}`, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok || d.value?.error) throw new Error(JSON.stringify(d));
  return d.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = await (await fetch(`http://localhost:3000/api/mailboxes/${demo.mailbox.id}/messages`, { headers: { Authorization: `Bearer ${demo.token}` } })).json();
const messageId = list.messages[0].id;
const s = await call('POST', '/session', { capabilities: { alwaysMatch: { browserName: 'chrome', 'goog:chromeOptions': { binary: '/usr/bin/chromium', args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'] } } } });
const sid = s.sessionId;
try {
  await call('POST', `/session/${sid}/window/rect`, { width: 390, height: 987, x: 0, y: 0 });
  await call('POST', `/session/${sid}/url`, { url: 'http://localhost:5173/api-docs' });
  await sleep(900);
  await call('POST', `/session/${sid}/execute/sync`, { script: `localStorage.setItem('angin.mailboxes.v1', arguments[0]); localStorage.setItem('angin.theme','light');`, args: [JSON.stringify([{ id: demo.mailbox.id, address: demo.mailbox.address, token: demo.token, domain: demo.mailbox.domain, isDemo: true, createdAt: demo.mailbox.createdAt, expiresAt: demo.mailbox.expiresAt }])] });
  await call('POST', `/session/${sid}/url`, { url: `http://localhost:5173/inbox/${demo.mailbox.id}/${messageId}` });
  await sleep(1800);
  const data = await call('GET', `/session/${sid}/screenshot`);
  fs.writeFileSync('/home/runner/tempmail/.impeccable/review/mobile-reader.png', Buffer.from(data, 'base64'));
  const metrics = await call('POST', `/session/${sid}/execute/sync`, { script: `return { w: innerWidth, h: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth, otp: document.querySelector('.otp-banner__value')?.textContent.trim() };`, args: [] });
  console.log(metrics);
} finally {
  await call('DELETE', `/session/${sid}`).catch(() => undefined);
}
