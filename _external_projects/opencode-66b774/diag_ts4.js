const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false, executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
  const page = await ctx.newPage();
  page.on('response', (r) => { const u = r.url(); if (u.includes('challenges.cloudflare.com') || u.includes('turnstile')) console.log('HTTP', r.status(), u.slice(0, 110)); });
  page.on('requestfailed', (r) => { if (r.url().includes('challenges.cloudflare.com')) console.log('FAILED', r.url().slice(0, 110), r.failure() && r.failure().errorText); });
  await page.goto('https://1forcrkuota.com/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => new Promise((res) => {
    const box = document.createElement('div'); box.id = 'tsbox'; box.style.cssText = 'position:fixed;left:16px;top:16px;z-index:999999;width:320px;height:120px'; document.body.appendChild(box);
    const start = () => { window.turnstile.render(box, { sitekey: '0x4AAAAAADc05hDok-Mdgmqa', execution: 'always', appearance: 'interaction-only', callback: (t) => { window.__t = t; }, 'error-callback': () => { window.__e = 'err'; } }); res('ok'); };
    if (window.turnstile) return start();
    window.__l = start; const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__l'; document.head.appendChild(s);
  }));
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(4000);
    const s = await page.evaluate(() => ({ token: (window.__t || '').length, err: window.__e || null, html: document.getElementById('tsbox').innerHTML.slice(0, 90) }));
    console.log('ronde', i, JSON.stringify(s));
    const box = await page.evaluate(() => { const r = document.getElementById('tsbox').getBoundingClientRect(); return { x: r.x, y: r.y }; });
    await page.mouse.click(box.x + 30, box.y + 26);
    if (s.token > 40) { console.log('TOKEN OK'); break; }
  }
  await page.screenshot({ path: '/tmp/opencode/ts5.png' });
  await b.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
