import fs from 'node:fs';

const WD = 'http://localhost:9515';
const OUT = '/home/runner/tempmail/.impeccable/review';
fs.mkdirSync(OUT, { recursive: true });

const demo = JSON.parse(fs.readFileSync('/tmp/opencode/demo.json', 'utf8'));

const call = async (method, path, body) => {
  const response = await fetch(`${WD}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.value?.error) {
    throw new Error(`${method} ${path} failed: ${JSON.stringify(data)}`);
  }
  return data.value;
};

const session = await call('POST', '/session', {
  capabilities: {
    alwaysMatch: {
      browserName: 'chrome',
      'goog:loggingPrefs': { browser: 'ALL' },
      'goog:chromeOptions': {
        binary: '/usr/bin/chromium',
        args: [
          '--headless=new',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--hide-scrollbars',
          '--force-device-scale-factor=1',
        ],
      },
    },
  },
});
const sid = session.sessionId;
console.log('session', sid);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const exec = (script, args = []) =>
  call('POST', `/session/${sid}/execute/sync`, { script, args });

const nav = async (url, wait = 1500) => {
  await call('POST', `/session/${sid}/url`, { url });
  await sleep(wait);
};

const size = async (width, height) => {
  await call('POST', `/session/${sid}/window/rect`, { width, height, x: 0, y: 0 });
  await sleep(350);
};

const shot = async (name) => {
  const data = await call('GET', `/session/${sid}/screenshot`);
  fs.writeFileSync(`${OUT}/${name}`, Buffer.from(data, 'base64'));
  console.log('shot', name);
};

const logs = async () => {
  try {
    const entries = await call('POST', `/session/${sid}/se/log`, { type: 'browser' });
    return entries.map((entry) => `[${entry.level}] ${entry.message}`);
  } catch {
    return [];
  }
};

try {
  await size(1440, 1000);
  await nav('http://localhost:5173/', 1800);
  await exec(
    `localStorage.setItem('angin.mailboxes.v1', arguments[0]); localStorage.setItem('angin.theme','light');`,
    [JSON.stringify([{
      id: demo.mailbox.id,
      address: demo.mailbox.address,
      token: demo.token,
      domain: demo.mailbox.domain,
      isDemo: true,
      createdAt: demo.mailbox.createdAt,
      expiresAt: demo.mailbox.expiresAt,
    }])],
  );
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 2000);
  await shot('desktop-inbox.png');

  const details = await exec(`
    return {
      title: document.title,
      rows: document.querySelectorAll('.msg-row').length,
      bodyWidth: document.body.scrollWidth,
      viewport: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      lang: document.documentElement.lang,
      theme: document.documentElement.dataset.theme,
      text: document.body.innerText.slice(0, 600)
    };
  `);
  console.log('desktop', JSON.stringify(details, null, 2));

  await exec(`document.querySelector('.msg-row__main')?.click();`);
  await sleep(1800);
  await shot('desktop-reader.png');
  const reader = await exec(`
    return {
      url: location.pathname,
      otp: document.querySelector('.otp-banner__value')?.textContent?.trim() || null,
      frame: Boolean(document.querySelector('.reader__frame')),
      attachments: document.querySelectorAll('.attachment').length,
      imageNotice: Boolean(document.querySelector('.image-notice')),
      subject: document.querySelector('.reader__subject')?.textContent?.trim() || null,
    };
  `);
  console.log('reader', reader);

  await nav('http://localhost:5173/admin', 1600);
  await shot('desktop-admin-login.png');
  await exec(`
    const input = document.querySelector('#admin-password');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'angin-admin');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.admin-login__panel')?.requestSubmit();
  `);
  await sleep(2200);
  await shot('desktop-admin.png');
  const admin = await exec(`
    return {
      h1: document.querySelector('h1')?.textContent?.trim(),
      sections: [...document.querySelectorAll('.admin-tab')].map(el => el.textContent.trim()),
      stats: [...document.querySelectorAll('.stat-ledger__row')].map(el => el.textContent.trim()),
    };
  `);
  console.log('admin', admin);

  await nav('http://localhost:5173/api-docs', 1400);
  await shot('desktop-api-docs.png');

  await size(390, 844);
  await nav(`http://localhost:5173/inbox/${demo.mailbox.id}`, 1800);
  await shot('mobile-inbox.png');
  const mobile = await exec(`
    return {
      bodyWidth: document.body.scrollWidth,
      viewport: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      starOpacity: getComputedStyle(document.querySelector('.msg-row__star')).opacity,
      railVisible: getComputedStyle(document.querySelector('.rail-wrap')).display,
    };
  `);
  console.log('mobile', mobile);
  await exec(`document.querySelector('.msg-row__main')?.click();`);
  await sleep(1500);
  await shot('mobile-reader.png');

  const consoleLogs = await logs();
  if (consoleLogs.length) {
    console.log('console logs:\n' + consoleLogs.join('\n'));
  } else {
    console.log('console logs: none');
  }
} finally {
  await call('DELETE', `/session/${sid}`).catch(() => undefined);
}
