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
const login = async () => {
  await nav('http://localhost:5173/admin', 1400);
  await exec(`
    const input = document.querySelector('#admin-password');
    if (!input) return 'already';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'angin-admin');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.admin-login__panel')?.requestSubmit();
    return 'submitted';
  `);
  await sleep(1800);
};

let empty = null;
try {
  await size(1440, 1000);
  await nav('http://localhost:5173/', 1500);
  await exec(`localStorage.setItem('angin.mailboxes.v1', arguments[0]); localStorage.setItem('angin.theme','light');`, [
    JSON.stringify([{ id: demo.mailbox.id, address: demo.mailbox.address, token: demo.token,
      domain: demo.mailbox.domain, isDemo: true, createdAt: demo.mailbox.createdAt, expiresAt: demo.mailbox.expiresAt }]),
  ]);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1800);

  await login();
  await exec(`document.querySelectorAll('.admin-tab')[1]?.click();`);
  await sleep(800);
  await shot('desktop-admin-domains.png');
  const domains = await exec(`return { meta: [...document.querySelectorAll('.domain-card__meta')].map(el => el.textContent.trim()), flags: [...document.querySelectorAll('.check-flag')].map(el => ({ text: el.textContent.trim(), cls: el.className })) };`);
  console.log('domains', domains);

  await exec(`document.querySelectorAll('.admin-tab')[3]?.click();`);
  await sleep(600);
  await shot('desktop-admin-settings.png');
  const settingsBody = await exec(`return document.querySelector('.admin-main__head p')?.textContent;`);
  console.log('settings body', settingsBody);

  // Mobile admin shell.
  await size(390, 844);
  await nav('http://localhost:5173/admin', 1600);
  await shot('mobile-admin.png');
  const mobileAdmin = await exec(`return {
    overflow: document.documentElement.scrollWidth > innerWidth,
    actions: [...document.querySelectorAll('.admin-main__actions button, .admin-main__actions a')].map(el => ({ label: el.getAttribute('aria-label'), display: getComputedStyle(el).display })),
    tabs: [...document.querySelectorAll('.admin-tab')].map(el => el.textContent.trim()),
  };`);
  console.log('mobile admin', mobileAdmin);

  // Empty state on desktop.
  await size(1440, 1000);
  const response = await fetch('http://localhost:3000/api/mailboxes', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ localPart: 'kosong' }),
  });
  empty = await response.json();
  await exec(`localStorage.setItem('angin.mailboxes.v1', arguments[0]);`, [JSON.stringify([{
    id: empty.mailbox.id, address: empty.mailbox.address, token: empty.token,
    domain: empty.mailbox.domain, isDemo: false, createdAt: empty.mailbox.createdAt, expiresAt: empty.mailbox.expiresAt }])]);
  await nav(`http://localhost:5173/inbox/${empty.mailbox.id}`, 1400);
  await shot('desktop-empty.png');

  // Mobile drawer.
  await size(390, 844);
  await exec(`localStorage.setItem('angin.mailboxes.v1', arguments[0]);`, [JSON.stringify([{
    id: demo.mailbox.id, address: demo.mailbox.address, token: demo.token,
    domain: demo.mailbox.domain, isDemo: true, createdAt: demo.mailbox.createdAt, expiresAt: demo.mailbox.expiresAt }])]);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1400);
  await exec(`document.querySelector('.mail-list__menu')?.click();`);
  await sleep(600);
  await shot('mobile-drawer.png');

  const logs = await call('POST', `/session/${sid}/se/log`, { type: 'browser' }).catch(() => []);
  console.log('severe', logs.filter((l) => l.level === 'SEVERE').map((l) => l.message));
} finally {
  await call('DELETE', `/session/${sid}`).catch(() => undefined);
  if (empty) {
    await fetch(`http://localhost:3000/api/mailboxes/${empty.mailbox.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${empty.token}` },
    }).catch(() => undefined);
  }
}
