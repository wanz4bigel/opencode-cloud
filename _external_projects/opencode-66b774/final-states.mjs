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
const nav = async (url, wait = 1400) => { await call('POST', `/session/${sid}/url`, { url }); await sleep(wait); };
const size = async (width, height) => { await call('POST', `/session/${sid}/window/rect`, { width, height, x: 0, y: 0 }); await sleep(300); };
const shot = async (name) => {
  const data = await call('GET', `/session/${sid}/screenshot`);
  fs.writeFileSync(`${OUT}/${name}`, Buffer.from(data, 'base64'));
  console.log('shot', name);
};
const setDemo = () => exec(`localStorage.setItem('angin.mailboxes.v1', arguments[0]); localStorage.setItem('angin.theme','light');`, [
  JSON.stringify([{ id: demo.mailbox.id, address: demo.mailbox.address, token: demo.token,
    domain: demo.mailbox.domain, isDemo: true, createdAt: demo.mailbox.createdAt, expiresAt: demo.mailbox.expiresAt }]),
]);
const clickTab = async (index) => { await exec(`document.querySelectorAll('.admin-tab')[${index}]?.click();`); await sleep(650); };
const login = async () => {
  await nav('http://localhost:5173/admin', 1300);
  await shot('desktop-admin-login.png');
  await exec(`
    const input = document.querySelector('#admin-password');
    if (!input) return 'already';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'angin-admin');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.admin-login__panel')?.requestSubmit();
    return 'submitted';
  `);
  await sleep(1700);
};

let empty = null;
try {
  await size(1440, 1143);
  await nav('http://localhost:5173/api-docs', 1000);
  await setDemo();
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1600);

  // New address dialog
  await exec(`[...document.querySelectorAll('button')].find(el => el.textContent.includes('Alamat baru'))?.click();`);
  await sleep(450);
  await shot('desktop-new-address.png');
  await exec(`document.querySelector('.dialog__head .icon-btn')?.click();`);
  await sleep(350);

  // Attachment reader
  await exec(`document.querySelectorAll('.msg-row__main')[1]?.click();`);
  await sleep(1400);
  await shot('desktop-attachment.png');
  const attachment = await exec(`return { attachments: document.querySelectorAll('.attachment').length, name: document.querySelector('.attachment__name')?.textContent, subject: document.querySelector('.reader__subject')?.textContent, overflow: document.documentElement.scrollWidth > innerWidth };`);
  console.log('attachment', attachment);

  // Search empty state
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1000);
  await exec(`
    const input = document.querySelector('.search input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'tidak-ada-hasil');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  `);
  await sleep(700);
  await shot('desktop-search-empty.png');
  const searchState = await exec(`return { empty: document.querySelector('.mail-empty__title')?.textContent, rows: document.querySelectorAll('.msg-row').length };`);
  console.log('search empty', searchState);

  // Dark theme
  await exec(`localStorage.setItem('angin.theme','dark');`);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1000);
  await shot('desktop-dark.png');
  await exec(`localStorage.setItem('angin.theme','light');`);

  // Admin
  await login();
  await shot('desktop-admin.png');
  await clickTab(1);
  await shot('desktop-admin-domains.png');
  await clickTab(2);
  await shot('desktop-admin-keys.png');
  await clickTab(3);
  await shot('desktop-admin-settings.png');

  // API docs
  await nav('http://localhost:5173/api-docs', 1100);
  await shot('desktop-api-docs.png');

  // Empty locker state
  await size(1440, 1143);
  const response = await fetch('http://localhost:3000/api/mailboxes', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ localPart: 'kosong' }),
  });
  empty = await response.json();
  await exec(`localStorage.setItem('angin.mailboxes.v1', arguments[0]);`, [JSON.stringify([{
    id: empty.mailbox.id, address: empty.mailbox.address, token: empty.token,
    domain: empty.mailbox.domain, isDemo: false, createdAt: empty.mailbox.createdAt, expiresAt: empty.mailbox.expiresAt }])]);
  await nav(`http://localhost:5173/inbox/${empty.mailbox.id}`, 1100);
  await shot('desktop-empty.png');

  // Mobile states
  await size(390, 987);
  await setDemo();
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1300);
  await exec(`document.querySelector('.mail-list__menu')?.click();`);
  await sleep(550);
  await shot('mobile-drawer.png');
  await exec(`document.querySelector('.rail-scrim')?.click();`);
  await sleep(350);
  await nav('http://localhost:5173/admin', 1400);
  await shot('mobile-admin.png');
  const mobile = await exec(`return { overflow: document.documentElement.scrollWidth > innerWidth, w: innerWidth, h: innerHeight };`);
  console.log('mobile', mobile);

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
