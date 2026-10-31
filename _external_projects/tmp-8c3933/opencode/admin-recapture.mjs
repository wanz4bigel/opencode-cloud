import fs from 'node:fs';
const WD = 'http://localhost:9515';
const call = async (method, path, body) => {
  const r = await fetch(`${WD}${path}`, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok || d.value?.error) throw new Error(JSON.stringify(d));
  return d.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const s = await call('POST', '/session', { capabilities: { alwaysMatch: { browserName: 'chrome', 'goog:chromeOptions': { binary: '/usr/bin/chromium', args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'] } } } });
const sid = s.sessionId;
const exec = (script) => call('POST', `/session/${sid}/execute/sync`, { script, args: [] });
const shot = async (name) => {
  const data = await call('GET', `/session/${sid}/screenshot`);
  fs.writeFileSync(`/home/runner/tempmail/.impeccable/review/${name}`, Buffer.from(data, 'base64'));
  console.log('shot', name);
};
try {
  await call('POST', `/session/${sid}/window/rect`, { width: 1440, height: 1143, x: 0, y: 0 });
  await call('POST', `/session/${sid}/url`, { url: 'http://localhost:5173/admin' });
  await sleep(1300);
  await exec(`
    const input = document.querySelector('#admin-password');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'angin-admin');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('.admin-login__panel')?.requestSubmit();
    }
  `);
  await sleep(1800);
  await shot('desktop-admin.png');
  await exec(`document.querySelectorAll('.admin-tab')[3]?.click();`);
  await sleep(700);
  await shot('desktop-admin-settings.png');
  const status = await exec(`return document.querySelector('.status-chip')?.textContent.trim();`);
  console.log('status chip', status);
} finally {
  await call('DELETE', `/session/${sid}`).catch(() => undefined);
}
