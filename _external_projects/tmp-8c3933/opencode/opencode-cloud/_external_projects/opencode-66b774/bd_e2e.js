// Uji akhir-ujung: token Turnstile dari browser remote Bright Data, lalu dipakai
// POST /api/auth/register di sesi browser yang sama (IP-nya sama dengan yang
// menerbitkan token).
//   node bd_e2e.js [zona] [sandi]
const { chromium } = require('playwright');
const ZONE = process.argv[2] || 'cli_browser';
const PASS = process.argv[3] || 'cff9o5yuv8lp';
const SITE_KEY = '0x4AAAAAADc05hDok-Mdgmqa';
const WAIT = (Number(process.env.TS_TIMEOUT) || 150) * 1000;
const log = (m) => process.stderr.write(`[e2e] ${m}\n`);
const EMAIL = `bde2e.${Date.now().toString(36)}@mailinator.com`;

function renderWidget(key) {
  return new Promise((resolve, reject) => {
    const box = document.createElement('div');
    box.id = 'tsbox';
    box.style.cssText = 'position:fixed;left:16px;top:16px;z-index:999999;width:320px;height:120px';
    document.body.appendChild(box);
    window.__done = false;
    window.__res = resolve;
    window.__rej = reject;
    const start = () => {
      window.turnstile.render(box, {
        sitekey: key,
        appearance: 'always',
        execution: 'always',
        callback: (t) => {
          if (window.__done) return;
          window.__done = true;
          window.__res(t);
        },
        'error-callback': () => {
          if (window.__done) return;
          window.__done = true;
          window.__rej(new Error('error-callback'));
        },
        'timeout-callback': () => {
          if (window.__done) return;
          window.__done = true;
          window.__rej(new Error('timeout-callback'));
        },
      });
    };
    if (window.turnstile) return start();
    window.__l = start;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__l';
    s.onerror = () => reject(new Error('api.js gagal dimuat'));
    document.head.appendChild(s);
  });
}

(async () => {
  const browser = await chromium.connectOverCDP(
    `wss://brd-customer-hl_3276ef8f-zone-${ZONE}:${PASS}@brd.superproxy.io:9222`,
  );
  log('terhubung ' + ZONE);
  const ctx = await browser.newContext({ locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
  await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  try {
    await page.goto('https://1forcrkuota.com/', { waitUntil: 'domcontentloaded' });
    log('situs termuat, email uji: ' + EMAIL);

    const janji = page.evaluate(renderWidget, SITE_KEY);
    const dibatalkan = () => page.evaluate(() => window.__rej && window.__rej('berhenti')).catch(() => {});
    const deadline = Date.now() + WAIT;
    let token = null;
    for (let ronde = 0; ronde < 60; ronde++) {
      const balapan = await Promise.race([
        janji.then((t) => ({ ok: t })).catch((e) => ({ gagal: e.message })),
        new Promise((r) => setTimeout(() => r({ jalan: true }), 4000)),
      ]);
      if (balapan.ok) {
        token = balapan.ok;
        break;
      }
      if (balapan.gagal) throw new Error('Turnstile: ' + balapan.gagal);
      if (Date.now() > deadline) {
        await dibatalkan();
        throw new Error('widget membeku, tidak ada token');
      }
      const kotak = await page.evaluate(() => {
        const el = document.getElementById('tsbox');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y };
      });
      if (kotak) {
        const pts = [[30, 26], [24, 22], [36, 30]];
        const [dx, dy] = pts[ronde % pts.length];
        await page.mouse.move(kotak.x + dx, kotak.y + dy).catch(() => {});
        await page.mouse.click(kotak.x + dx, kotak.y + dy).catch(() => {});
      }
      if (ronde % 4 === 3) log('ronde ' + (ronde + 1) + ': menunggu token...');
    }
    if (!token) throw new Error('waktu habis');
    log('TOKEN didapat, panjang ' + token.length);

    const csrf = await page.evaluate(async () => (await fetch('/api/auth/csrf', { credentials: 'include' })).json());
    const hasil = await page.evaluate(
      async ({ csrfToken, payload }) => {
        const r = await fetch('/api/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
          body: JSON.stringify(payload),
        });
        return { status: r.status, text: (await r.text()).slice(0, 300) };
      },
      { csrfToken: csrf.csrfToken, payload: { username: 'bde2e', email: EMAIL, password: 'Coba12345!', turnstileToken: token } },
    );
    log('register ' + hasil.status + ' -> ' + hasil.text);
    process.stdout.write(JSON.stringify({ email: EMAIL, token_panjang: token.length, register: hasil }));
  } finally {
    await browser.close().catch(() => {});
  }
})().catch((e) => {
  log('ERROR ' + String(e.message).split('\n')[0].slice(0, 150));
  process.exit(1);
});
