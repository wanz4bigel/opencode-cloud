const { chromium } = require('playwright');
const auths = [
  'brd-customer-hl_3276ef8f-zone-cli_browser:cff9o5yuv8lp',
  'brd-customer-hl_3276ef8f_zone_cli_browser:cff9o5yuv8lp',
];
(async () => {
  for (const auth of auths) {
    try {
      const b = await chromium.connectOverCDP(`wss://${auth}@brd.superproxy.io:9222`);
      console.log('OK    ', auth);
      const ctx = b.contexts()[0] || (await b.newContext());
      const p = await ctx.newPage();
      await p.goto('https://geo.brdtest.com/mygeo.json', { timeout: 60000 });
      console.log('  geo:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 200));
      await b.close();
      break;
    } catch (e) {
      console.log('GAGAL ', auth, '|', String(e.message).split('\n')[0].slice(0, 120));
    }
  }
})();
