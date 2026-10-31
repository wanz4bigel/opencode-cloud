const puppeteer = require('puppeteer-core');
const URL = 'file:///home/runner/bali-wisata/index.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  // 1. reduced motion: elemen tetap terlihat tanpa animasi
  const a = await browser.newPage();
  await a.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await a.setViewport({ width: 1360, height: 1050 });
  await a.goto(URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 700));
  await a.screenshot({ path: '/tmp/opencode/shot/30-reduced-motion.png' });
  const terlihat = await a.evaluate(() => {
    const q = s => getComputedStyle(document.querySelector(s));
    return {
      matahari: q('.poster-matahari').opacity,
      seam: q('.hero-sambungan path').strokeDashoffset,
      judul: q('.hero-kiri h1').opacity,
      scroll: q('html').scrollBehavior,
    };
  });

  // 2. fokus keyboard: tabulasi dari atas
  const b = await browser.newPage();
  await b.setViewport({ width: 1360, height: 1050 });
  await b.goto(URL, { waitUntil: 'networkidle2' });
  const urutan = [];
  for (let i = 0; i < 14; i++) {
    await b.keyboard.press('Tab');
    urutan.push(await b.evaluate(() => {
      const el = document.activeElement;
      const t = (el.textContent || '').trim().slice(0, 26);
      return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (t ? ' “' + t + '”' : '');
    }));
  }
  await b.evaluate(() => document.getElementById('biaya').scrollIntoView());
  await b.focus('#inap');
  await b.screenshot({ path: '/tmp/opencode/shot/31-fokus.png' });

  // 3. keyboard tab rute
  await b.evaluate(() => document.getElementById('rute').scrollIntoView());
  await b.focus('#tb-1');
  await b.keyboard.press('ArrowRight');
  const tab2 = await b.evaluate(() => document.getElementById('tb-2').getAttribute('aria-selected'));
  const panel1 = await b.evaluate(() => document.getElementById('tp-1').hidden);

  console.log(JSON.stringify({ terlihat, urutan, tab2, panel1 }, null, 1));
  await browser.close();
})();
