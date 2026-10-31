const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false, executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', locale: 'id-ID', timezoneId: 'Asia/Jakarta', viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://1forcrkuota.com/login.html?daftar=1', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);
  const frameText = async () => {
    const fr = page.frames().find((f) => f.url().includes('challenges.cloudflare.com'));
    if (!fr) return 'tidak ada frame';
    try { return (await fr.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 160); } catch (e) { return 'gagal baca: ' + e.message.slice(0, 60); }
  };
  console.log('frame awal:', await frameText());
  const handle = await page.$('iframe[src*="challenges.cloudflare.com"]');
  if (!handle) { console.log('iframe tidak ada'); await b.close(); return; }
  const box = await handle.boundingBox();
  console.log('box iframe:', JSON.stringify(box));
  for (const [dx, dy] of [[30, 26], [20, 20], [45, 30], [15, 30]]) {
    await page.mouse.click(box.x + dx, box.y + dy);
    await page.waitForTimeout(5000);
    const t = await page.evaluate(() => (document.getElementById('turnstileToken') || {}).value || '');
    console.log(`klik ${dx},${dy} -> token len ${t.length} | frame: ${await frameText()}`);
    if (t.length > 40) { console.log('TOKEN OK:', t.slice(0, 45) + '...' + t.slice(-8)); break; }
  }
  await page.screenshot({ path: '/tmp/opencode/ts3.png' });
  await b.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
