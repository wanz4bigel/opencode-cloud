const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false, executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
  await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
  const p = await ctx.newPage();
  p.on('response', (r) => { if (r.url().includes('challenges.cloudflare.com')) console.log('HTTP', r.status(), r.url().slice(0, 90)); });
  await p.goto('https://sahabatssh.com/auth/register', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(9000);
  const info = await p.evaluate(() => ({
    turnstile: typeof window.turnstile,
    widget: !!document.querySelector('.cf-turnstile'),
    iframe: [...document.querySelectorAll('iframe')].map((f) => f.src.slice(0, 70)),
  }));
  console.log('info:', JSON.stringify(info));
  for (const kotak of ['.cf-turnstile', 'body']) {
    const el = await p.$(kotak);
    if (el) { const bb = await el.boundingBox(); if (bb) { await p.mouse.click(bb.x + 30, bb.y + 26); break; } }
  }
  for (let i = 0; i < 5; i++) {
    await p.waitForTimeout(5000);
    const fr = p.frames().find((f) => f.url().includes('challenges.cloudflare.com'));
    let teks = 'tidak ada frame turnstile';
    if (fr) { try { teks = (await fr.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 130); } catch (e) { teks = 'tidak terbaca'; } }
    const resp = await p.evaluate(() => (window.turnstile && window.turnstile.getResponse && window.turnstile.getResponse()) || '');
    console.log(`ronde ${i}: frame="${teks}" response=${String(resp).length} char`);
    if (String(resp).length > 40) { console.log('TOKEN OK'); break; }
  }
  await p.screenshot({ path: '/tmp/opencode/sbs_ts.png' });
  await b.close();
})().catch((e) => { console.log('ERR', String(e.message).slice(0, 140)); process.exit(1); });
