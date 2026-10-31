const puppeteer = require('puppeteer-core');
const URL = 'file:///home/runner/bali-wisata/index.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  // 1. ukur posisi bagian saat JS hidup (pendekatan posisi untuk halaman tanpa JS)
  const p1 = await browser.newPage();
  await p1.setViewport({ width: 1360, height: 1050 });
  await p1.goto(URL, { waitUntil: 'networkidle2' });
  const posisi = await p1.evaluate(() => {
    const o = {};
    ['musim', 'biaya', 'peta', 'etika'].forEach(id => {
      o[id] = Math.round(document.getElementById(id).getBoundingClientRect().top + window.scrollY);
    });
    o.tinggi = document.documentElement.scrollHeight;
    return o;
  });
  await p1.close();

  // 2. halaman tanpa JavaScript: motong per bagian lewat CDP clip
  const p2 = await browser.newPage();
  await p2.setJavaScriptEnabled(false);
  await p2.setViewport({ width: 1360, height: 1050 });
  await p2.goto(URL, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1600));
  await p2.screenshot({ path: '/tmp/opencode/shot/40-nojs-atas.png' });

  async function clip(name, y) {
    await p2.screenshot({
      path: `/tmp/opencode/shot/${name}.png`,
      clip: { x: 0, y: Math.max(0, y - 110), width: 1360, height: 1050, scale: 1 },
    });
  }
  await clip('41-nojs-musim', posisi.musim);
  await clip('42-nojs-biaya', posisi.biaya);
  await clip('43-nojs-peta', posisi.peta);
  await clip('44-nojs-etika', posisi.etika);

  console.log(JSON.stringify(posisi, null, 1));
  await browser.close();
})();
