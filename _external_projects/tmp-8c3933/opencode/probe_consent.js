const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.dw.com/id/berita-utama/headlines-id', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 3500)));
  const info = await page.evaluate(() => {
    // cari elemen yg punya teks consent, tembus shadow DOM, laporkan jalurnya
    function walk(root, path, out) {
      root.querySelectorAll('*').forEach(el => {
        const p = path + ' > ' + el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '');
        if (el.shadowRoot) walk(el.shadowRoot, p + '~SHADOW~', out);
        if (el.shadowRoot ? false : (el.textContent || '').includes('Kendali di tangan Anda')) {
          if (el.children.length < 3) out.push(p + (el.shadowRoot ? ' [SHADOW]' : ''));
        }
      });
      return out;
    }
    const hosts = [];
    document.querySelectorAll('*').forEach(el => { if (el.shadowRoot) hosts.push(el.tagName + (el.id ? '#' + el.id : '') + ' .' + String(el.className).split(' ')[0]); });
    const dialogs = [...document.querySelectorAll('dialog')].map(d => ({ open: d.open, outer: d.outerHTML.slice(0, 120) }));
    return { shadowHosts: hosts, nativeDialogs: dialogs, hits: walk(document, 'html', []).slice(-5) };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
