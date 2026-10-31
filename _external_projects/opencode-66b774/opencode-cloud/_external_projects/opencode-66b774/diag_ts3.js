const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false, executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--lang=id-ID'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', locale: 'id-ID', timezoneId: 'Asia/Jakarta', viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://1forcrkuota.com/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => new Promise((res) => {
    const box = document.createElement('div');
    box.id = 'bot-turnstile-box';
    box.style.cssText = 'position:fixed;left:16px;top:16px;z-index:999999;width:320px;height:80px';
    document.body.appendChild(box);
    const start = () => { window.turnstile.render(box, { sitekey: '0x4AAAAAADc05hDok-Mdgmqa', theme: 'light', callback: (t) => { window.__t = t; } }); res('ok'); };
    if (window.turnstile) return start();
    window.__l = start;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__l';
    document.head.appendChild(s);
  }));
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(5000);
    const info = await page.evaluate(() => {
      const box = document.getElementById('bot-turnstile-box');
      const r = box.getBoundingClientRect();
      const frames = [...document.querySelectorAll('iframe')].map((f) => f.src.slice(0, 60));
      return { token: (window.__t || '').length, box: { x: r.x, y: r.y, w: r.width, h: r.height }, iframes: frames, hasShadow: !!box.shadowRoot, html: box.innerHTML.slice(0, 120) };
    });
    const fr = page.frames().find((f) => f.url().includes('challenges.cloudflare.com'));
    let frameInfo = 'tidak ada frame';
    if (fr) {
      try { frameInfo = JSON.stringify({ text: (await fr.evaluate(() => document.body.innerText)).slice(0, 80), inputs: await fr.evaluate(() => [...document.querySelectorAll('input,label,#challenge-stage')].map((e) => e.id || e.type || e.tagName).slice(0, 6)), html: (await fr.evaluate(() => document.body.innerHTML)).slice(0, 160) }); } catch (e) { frameInfo = 'ERR ' + e.message.slice(0, 50); }
    }
    console.log(`ronde ${i}:`, JSON.stringify(info));
    console.log('   frame:', String(frameInfo).slice(0, 260));
    if (info.token > 40) { console.log('TOKEN OK'); break; }
    // klik kotak widget
    await page.mouse.click(info.box.x + 30, info.box.y + 26);
  }
  await page.screenshot({ path: '/tmp/opencode/ts4.png' });
  await b.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
