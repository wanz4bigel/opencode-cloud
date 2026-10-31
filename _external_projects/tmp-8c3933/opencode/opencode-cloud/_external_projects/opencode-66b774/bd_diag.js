// Diagnosa browser jarak jauh Bright Data: apakah sanggup menjalani challenge Turnstile.
const { chromium } = require('playwright');
const KEY = '6466e50f-1cf0-4328-8a89-34714a31f917';
const ZONE = process.env.BD_ZONE || 'cli_browser';
const PASS = process.env.BD_PASS || 'cff9o5yuv8lp';
const COUNTRY = process.env.BD_COUNTRY || '';
const log = (m) => process.stderr.write(`[diag] ${m}\n`);

(async () => {
  const suffix = COUNTRY ? `-country-${COUNTRY}` : '';
  const browser = await chromium.connectOverCDP(
    `wss://brd-customer-hl_3276ef8f-zone-${ZONE}${suffix}:${PASS}@brd.superproxy.io:9222`,
  );
  log('terhubung ke ' + ZONE + suffix);
  const context = await browser.newContext({ locale: 'id-ID', timezoneId: 'Asia/Jakarta', viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  page.on('response', (r) => {
    if (r.url().includes('challenges.cloudflare.com')) log('HTTP ' + r.status() + ' ' + r.url().slice(0, 96));
  });
  page.on('requestfailed', (r) => {
    if (r.url().includes('cloudflare')) log('FAILED ' + r.url().slice(0, 96) + ' ' + ((r.failure() || {}).errorText || ''));
  });
  const ip = await page.goto('https://geo.brdtest.com/mygeo.json').then(() => page.evaluate(() => document.body.innerText)).catch((e) => 'gagal: ' + e.message.slice(0, 60));
  log('ip: ' + String(ip).replace(/\s+/g, ' ').slice(0, 190));
  await page.goto('https://1forcrkuota.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  const fp = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl');
    return {
      webdriver: navigator.webdriver,
      ua: navigator.userAgent,
      langs: navigator.languages,
      webgl: gl ? (gl.getParameter(gl.VERSION) || '') : 'tanpa webgl',
      cores: navigator.hardwareConcurrency,
      plugins: navigator.plugins.length,
    };
  }).catch((e) => ({ err: e.message.slice(0, 80) }));
  log('fingerprint: ' + JSON.stringify(fp));
  await page.evaluate(() => new Promise((res, rej) => {
    const box = document.createElement('div');
    box.id = 'tsbox';
    box.style.cssText = 'position:fixed;left:16px;top:16px;z-index:999999;width:320px;height:120px';
    document.body.appendChild(box);
    const start = () => {
      window.turnstile.render(box, {
        sitekey: '0x4AAAAAADc05hDok-Mdgmqa',
        appearance: 'always',
        execution: 'always',
        callback: (t) => (window.__t = t),
        'error-callback': () => (window.__e = 'err'),
        'expired-callback': () => (window.__x = 'x'),
        'timeout-callback': () => (window.__to = 'to'),
      });
      res('ok');
    };
    if (window.turnstile) return start();
    window.__l = start;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__l';
    s.onerror = () => rej(new Error('api.js gagal'));
    document.head.appendChild(s);
  })).catch((e) => log('render gagal: ' + e.message.slice(0, 80)));
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(4000);
    const st = await page.evaluate(() => ({
      t: (window.__t || '').length,
      e: window.__e || null,
      x: window.__x || null,
      to: window.__to || null,
      html: (document.getElementById('tsbox') || { innerHTML: '' }).innerHTML.slice(0, 120),
    }));
    log('ronde ' + i + ' ' + JSON.stringify(st));
    if (st.t > 40) { log('TOKEN OK'); break; }
    const b = await page.evaluate(() => { const r = document.getElementById('tsbox').getBoundingClientRect(); return { x: r.x, y: r.y }; });
    await page.mouse.click(b.x + 30, b.y + 26).catch(() => {});
  }
  await browser.close().catch(() => {});
})().catch((e) => {
  log('ERROR ' + String(e.message).split('\n')[0]);
  process.exit(1);
});
