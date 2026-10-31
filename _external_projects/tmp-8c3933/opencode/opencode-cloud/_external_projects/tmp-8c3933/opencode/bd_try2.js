// Uji cepat: browser Bright Data (zona + negara dari argumen) -> token Turnstile.
//   node bd_try2.js [zona] [kata-sandi] [negara]
const { chromium } = require('playwright');
const ZONE = process.argv[2] || 'cli_browser';
const PASS = process.argv[3] || 'cff9o5yuv8lp';
const COUNTRY = process.argv[4] || '';
const KEY_SITE = '0x4AAAAAADc05hDok-Mdgmqa';
const TIMEOUT = (Number(process.env.TS_TIMEOUT) || 110) * 1000;
const log = (m) => process.stderr.write(`[coba] ${m}\n`);

(async () => {
  const suffix = COUNTRY ? `-country-${COUNTRY}` : '';
  const browser = await chromium.connectOverCDP(
    `wss://brd-customer-hl_3276ef8f-zone-${ZONE}${suffix}:${PASS}@brd.superproxy.io:9222`,
  );
  log('terhubung ' + ZONE + suffix);
  const context = await browser.newContext({ locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  const page = await context.newPage();
  page.on('response', (r) => {
    if (r.url().includes('challenges.cloudflare.com')) log('HTTP ' + r.status() + ' ' + r.url().slice(0, 90));
  });
  try {
    await page.goto('https://1forcrkuota.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    log('halaman situs termuat; judul: ' + (await page.title()));
    await page.evaluate((key) => new Promise((res) => {
      const box = document.createElement('div');
      box.id = 'tsbox';
      box.style.cssText = 'position:fixed;left:16px;top:16px;z-index:999999;width:320px;height:120px';
      document.body.appendChild(box);
      const start = () => {
        window.turnstile.render(box, {
          sitekey: key,
          appearance: 'always',
          execution: 'always',
          callback: (t) => (window.__t = t),
          'error-callback': () => (window.__e = 'error-callback'),
          'expired-callback': () => (window.__x = 'expired'),
        });
        res('ok');
      };
      if (window.turnstile) return start();
      window.__l = start;
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__l';
      document.head.appendChild(s);
    }), KEY_SITE);
    const deadline = Date.now() + TIMEOUT;
    let round = 0;
    while (Date.now() < deadline) {
      await page.waitForTimeout(3000);
      const st = await page.evaluate(() => ({
        t: (window.__t || '').length,
        e: window.__e || null,
        box: (() => {
          const el = document.getElementById('tsbox');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y };
        })(),
      }));
      if (st.e) throw new Error('Turnstile: ' + st.e);
      if (st.t > 40) {
        const token = await page.evaluate(() => window.__t);
        log('TOKEN OK panjang=' + token.length);
        process.stdout.write(token);
        break;
      }
      if (st.box) {
        const pts = [[30, 26], [24, 22], [36, 30]];
        const [dx, dy] = pts[round % pts.length];
        await page.mouse.move(st.box.x + dx, st.box.y + dy).catch(() => {});
        await page.mouse.click(st.box.x + dx, st.box.y + dy).catch(() => {});
      }
      round += 1;
      if (round % 3 === 1) log('ronde ' + round + ' belum ada token');
    }
  } finally {
    await browser.close().catch(() => {});
  }
})().catch((e) => {
  log('ERROR ' + String(e.message).split('\n')[0].slice(0, 140));
  process.exit(1);
});
