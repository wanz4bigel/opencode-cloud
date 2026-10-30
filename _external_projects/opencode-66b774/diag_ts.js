const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: process.env.HEADED !== '1', executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', locale: 'id-ID', timezoneId: 'Asia/Jakarta', viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  let token = null;
  page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 120)));
  await page.goto('https://1forcrkuota.com/login.html?daftar=1', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  const frames = page.frames().map((f) => f.url());
  console.log('turnstile api ada:', await page.evaluate(() => typeof window.turnstile));
  console.log('frames:', frames.filter((u) => u.includes('cloudflare') || u.includes('challenges')));
  const info = await page.evaluate(() => {
    const box = document.querySelector('[id*=turnstile i], .cf-turnstile, input[name*=turnstile i]');
    return { box: box ? box.outerHTML.slice(0, 200) : null, iframes: [...document.querySelectorAll('iframe')].map((i) => i.src).slice(0, 5) };
  });
  console.log('info:', JSON.stringify(info));
  await page.screenshot({ path: '/tmp/opencode/ts.png', fullPage: false });
  // tunggu token di hidden input milik situs
  for (let i = 0; i < 30; i++) {
    const t = await page.evaluate(() => {
      const el = document.querySelector('#turnstileToken, input[name*=turnstile i], input[id*=turnstile i]');
      return el ? el.value : null;
    });
    if (t && t.length > 40) { token = t; break; }
    await page.waitForTimeout(2000);
  }
  console.log('TOKEN:', token ? token.slice(0, 60) + '...' + token.slice(-10) + ' len=' + token.length : 'tidak ada');
  await page.screenshot({ path: '/tmp/opencode/ts2.png', fullPage: false });
  await b.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
