const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 1050 });
  await page.goto('file:///home/runner/bali-wisata/index.html', { waitUntil: 'networkidle2' });
  let reached = false;
  for (let i = 0; i < 45 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => document.activeElement.id === 'inap');
  }
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: '/tmp/opencode/shot/31-fokus.png' });
  const st = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { id: el.id, outline: cs.outlineColor + ' ' + cs.outlineWidth + ' ' + cs.outlineStyle,
             scrollY: Math.round(window.scrollY) };
  });
  console.log(JSON.stringify(st));
  await browser.close();
})();
