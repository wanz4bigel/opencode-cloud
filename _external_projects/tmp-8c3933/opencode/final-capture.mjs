import fs from 'node:fs';

const WD = 'http://localhost:9515';
const OUT = '/home/runner/tempmail/.impeccable/review';
const demo = JSON.parse(fs.readFileSync('/tmp/opencode/demo.json', 'utf8'));

const call = async (method, path, body) => {
  const response = await fetch(`${WD}${path}`, {
    method, headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.value?.error) throw new Error(`${method} ${path}: ${JSON.stringify(data)}`);
  return data.value;
};
const session = await call('POST', '/session', {
  capabilities: { alwaysMatch: { browserName: 'chrome', 'goog:loggingPrefs': { browser: 'ALL' },
    'goog:chromeOptions': { binary: '/usr/bin/chromium', args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'] } } },
});
const sid = session.sessionId;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exec = (script, args = []) => call('POST', `/session/${sid}/execute/sync`, { script, args });
const nav = async (url, wait = 1500) => { await call('POST', `/session/${sid}/url`, { url }); await sleep(wait); };
const size = async (width, height) => { await call('POST', `/session/${sid}/window/rect`, { width, height, x: 0, y: 0 }); await sleep(300); };
const shot = async (name) => {
  const data = await call('GET', `/session/${sid}/screenshot`);
  fs.writeFileSync(`${OUT}/${name}`, Buffer.from(data, 'base64'));
  console.log('shot', name);
};

try {
  await size(1440, 1143);
  // Load a same-origin page first so localStorage can be seeded without creating a throwaway mailbox.
  await nav('http://localhost:5173/api-docs', 1200);
  await exec(`localStorage.setItem('angin.mailboxes.v1', arguments[0]); localStorage.setItem('angin.theme','light');`, [
    JSON.stringify([{ id: demo.mailbox.id, address: demo.mailbox.address, token: demo.token,
      domain: demo.mailbox.domain, isDemo: true, createdAt: demo.mailbox.createdAt, expiresAt: demo.mailbox.expiresAt }]),
  ]);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1800);
  await shot('desktop-inbox.png');

  const base = await exec(`return { overflow: document.documentElement.scrollWidth > innerWidth, w: innerWidth, h: innerHeight, sh: document.documentElement.scrollHeight, rows: document.querySelectorAll('.msg-row').length };`);
  console.log('desktop base', base);

  await size(390, 987);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1500);
  await shot('mobile.png');
  await shot('mobile-inbox.png');
  const mobile = await exec(`return { overflow: document.documentElement.scrollWidth > innerWidth, w: innerWidth, h: innerHeight, sh: document.documentElement.scrollHeight, rows: document.querySelectorAll('.msg-row').length, copy: Boolean(document.querySelector('.mail-list__copy')), copyDisplay: getComputedStyle(document.querySelector('.mail-list__copy')).display };`);
  console.log('mobile base', mobile);

  await size(1440, 1143);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1400);
  await exec(`document.querySelector('.msg-row__main')?.click();`);
  await sleep(1700);
  await shot('desktop.png');
  await shot('desktop-reader.png');
  const reader = await exec(`return { url: location.pathname, otp: document.querySelector('.otp-banner__value')?.textContent.trim(), frame: Boolean(document.querySelector('.reader__frame')), overflow: document.documentElement.scrollWidth > innerWidth };`);
  console.log('desktop reader', reader);

  await size(390, 987);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}/${document.querySelector('.msg-row__main') ? '' : ''}`, 400).catch(() => undefined);
  await exec(`document.querySelector('.msg-row__main')?.click();`);
  await sleep(1400);
  await shot('mobile-reader.png');
  const mobileReader = await exec(`return { overflow: document.documentElement.scrollWidth > innerWidth, otp: document.querySelector('.otp-banner__value')?.textContent.trim() };`);
  console.log('mobile reader', mobileReader);

  const logs = await call('POST', `/session/${sid}/se/log`, { type: 'browser' }).catch(() => []);
  console.log('severe', logs.filter((l) => l.level === 'SEVERE').map((l) => l.message));
} finally {
  await call('DELETE', `/session/${sid}`).catch(() => undefined);
}
