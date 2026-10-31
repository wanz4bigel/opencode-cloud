const fs = require('fs');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,800'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36');

  console.log('-> membuka DW live...');
  await page.goto('https://www.dw.com/id/berita-utama/headlines-id', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 2500))); // biar React selesai render

  const style = fs.readFileSync('/tmp/opencode/deface_style.html', 'utf8');
  const ovl = fs.readFileSync('/tmp/opencode/deface_overlay.html', 'utf8');
  const htmlPart = ovl.split('<script>')[0];
  const jsPart = ovl.split('<script>')[1].replace('</script>', '');

  await page.addStyleTag({ content: style });
  await page.evaluate((h) => document.body.insertAdjacentHTML('beforeend', h), htmlPart);
  await page.addScriptTag({ content: jsPart });

  await page.evaluate(() => new Promise(r => setTimeout(r, 4200))); // ngetik terminal + matrix
  const info = await page.evaluate(() => ({
    title: document.title,
    url: location.href,
    banner: !!document.getElementById('deface-banner'),
    headlines: [...document.querySelectorAll('#root .title')].slice(0, 3).map(e => e.textContent.trim()),
  }));
  console.log('-> status:', JSON.stringify(info, null, 2));

  await page.screenshot({ path: '/tmp/opencode/live_deface.png' });
  console.log('-> screenshot: /tmp/opencode/live_deface.png');
  await browser.close();
})();
