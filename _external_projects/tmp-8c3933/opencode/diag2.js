const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false, executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
  const p = await ctx.newPage();
  await p.goto('https://sahabatssh.com/auth/register', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(8000);
  const kotak = await p.$('.cf-turnstile');
  const bb = await kotak.boundingBox();
  console.log('widget box:', JSON.stringify(bb));
  await p.mouse.click(bb.x + 30, bb.y + 26);
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(6000);
    const fr = p.frames().find((f) => f.url().includes('challenges.cloudflare.com'));
    let detail = 'tanpa frame';
    if (fr) {
      detail = await fr.evaluate(() => JSON.stringify({
        teks: document.body.innerText.replace(/\s+/g, ' ').slice(0, 100),
        html: document.body.innerHTML.length,
        input: (document.querySelector('input[name*=response i]') || {}).value ? 'ada-response' : 'tidak',
        label: !!document.querySelector('label,#challenge-stage,.cb-canvas-container,.captcha-puzzle'),
      })).catch(() => 'frame tak terbaca');
    }
    const resp = await p.evaluate(() => (window.turnstile && window.turnstile.getResponse && String(window.turnstile.getResponse() || '').length) || 0);
    console.log(`ronde ${i}: resp=${resp} ${detail}`);
    if (resp > 40) { console.log('TOKEN OK'); break; }
  }
  const el = await p.$('.cf-turnstile');
  await el.screenshot({ path: '/tmp/opencode/widget.png' }).catch(() => {});
  await b.close();
})().catch((e) => console.log('ERR', String(e.message).slice(0, 120)));
