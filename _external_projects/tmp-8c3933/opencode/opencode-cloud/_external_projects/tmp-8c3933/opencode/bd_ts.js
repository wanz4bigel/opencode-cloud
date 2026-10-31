// Uji: bisa tidaknya browser jarak jauh Bright Data menghasilkan token Turnstile.
const { chromium } = require('playwright');

const BD_KEY = process.env.BD_KEY || '6466e50f-1cf0-4328-8a89-34714a31f917';
const ZONE = process.env.BD_ZONE || 'cli_browser';
const PASS = process.env.BD_PASS || 'cff9o5yuv8lp';
const CUSTOMER = process.env.BD_CUSTOMER || 'hl_3276ef8f';
const COUNTRY = process.env.BD_COUNTRY || '';
const SITE_KEY = '0x4AAAAAADc05hDok-Mdgmqa';
const URL_ = process.env.TS_URL || 'https://1forcrkuota.com/';
const TIMEOUT = (Number(process.env.TS_TIMEOUT) || 120) * 1000;
const log = (m) => process.stderr.write(`[bd] ${m}\n`);

function stealth() {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'languages', { get: () => ['id-ID', 'en-US'] });
}

function render(key) {
  return new Promise((resolve, reject) => {
    const box = document.createElement('div');
    box.id = 'tsbox';
    box.style.cssText = 'position:fixed;left:16px;top:16px;z-index:999999;width:320px;height:80px';
    document.body.appendChild(box);
    const start = () => {
      try {
        window.turnstile.render(box, {
          sitekey: key,
          theme: 'light',
          callback: (t) => (window.__t = t),
          'error-callback': () => (window.__e = 'error-callback'),
        });
        resolve('widget dirender');
      } catch (e) {
        reject(new Error(String(e && e.message ? e.message : e)));
      }
    };
    if (window.turnstile) return start();
    window.__l = start;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__l';
    s.onerror = () => reject(new Error('api.js tidak bisa dimuat'));
    document.head.appendChild(s);
  });
}

(async () => {
  const suffix = COUNTRY ? `-country-${COUNTRY}` : '';
  const endpoint = `wss://brd-customer-${CUSTOMER}-zone-${ZONE}${suffix}:${PASS}@brd.superproxy.io:9222`;
  log(`connect ${endpoint.replace(PASS, '***')}`);
  const browser = await chromium.connectOverCDP(endpoint);
  log('terhubung');
  const context = browser.contexts()[0] || (await browser.newContext());
  await context.addInitScript(stealth);
  const page = await context.newPage();
  try {
    await page.goto(URL_, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const ip = await page.evaluate(async () => {
      try {
        const r = await fetch('https://geo.brdtest.com/mygeo.json');
        const j = await r.json();
        return (j.asn && j.asn.org_name) + ' / ' + j.geo.city;
      } catch (e) {
        return 'tak terukur';
      }
    });
    log('ip browser: ' + ip);
    log(await page.evaluate(render, SITE_KEY));
    const deadline = Date.now() + TIMEOUT;
    let round = 0;
    while (Date.now() < deadline) {
      await page.waitForTimeout(2500);
      const st = await page.evaluate(() => ({
        token: window.__t || '',
        error: window.__e || '',
        box: (() => {
          const el = document.getElementById('tsbox');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y };
        })(),
      }));
      if (st.error) throw new Error('Turnstile ' + st.error);
      if (st.token && st.token.length > 40) {
        log(`TOKEN OK panjang=${st.token.length} setelah ${Math.round((TIMEOUT - (deadline - Date.now())) / 1000)}s`);
        process.stdout.write(st.token);
        break;
      }
      if (st.box) {
        const pts = [[30, 26], [24, 22], [36, 30]];
        const [dx, dy] = pts[round % pts.length];
        await page.mouse.move(st.box.x + dx, st.box.y + dy).catch(() => {});
        await page.mouse.click(st.box.x + dx, st.box.y + dy).catch(() => {});
        round += 1;
        log(`ronde ${round}: belum ada token, klik (${dx},${dy})`);
      } else {
        log(`ronde ${round}: widget belum muncul`);
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
})().catch((e) => {
  log('ERROR ' + String(e && e.message ? e.message : e).split('\n')[0]);
  process.exit(1);
});
