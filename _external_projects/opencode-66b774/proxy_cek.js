const { chromium } = require('playwright');
const PROXY = JSON.parse(process.argv[2]);
(async () => {
  const b = await chromium.launch({ headless: false, executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  try {
    const ctx = await b.newContext({ proxy: PROXY, locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
    const p = await ctx.newPage();
    await p.goto('https://geo.brdtest.com/mygeo.json', { timeout: 45000 });
    console.log('IP-via-proxy:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 150));
    const r = await p.goto('https://sahabatssh.com/auth/register', { timeout: 45000 });
    console.log('sahabatssh lewat proxy:', r.status());
  } catch (e) {
    console.log('GAGAL:', String(e.message).split('\n')[0].slice(0, 160));
  } finally { await b.close(); }
})();
