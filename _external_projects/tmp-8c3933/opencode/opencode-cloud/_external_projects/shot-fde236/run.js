const puppeteer = require('puppeteer-core');

const URL = 'file:///home/runner/bali-wisata/index.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  await page.setViewport({ width: 1360, height: 1050, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1800));

  async function shot(name, sel) {
    if (sel) {
      await page.evaluate(s => {
        const el = document.querySelector(s);
        const top = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top, behavior: 'instant' });
      }, sel);
      await new Promise(r => setTimeout(r, 350));
    }
    await page.screenshot({ path: `/tmp/opencode/shot/${name}.png` });
  }

  await shot('01-atas');
  for (const id of ['rute', 'musim', 'biaya', 'peta', 'etika', 'makan', 'nyetir', 'checklist', 'pesan']) {
    await shot('0' + (['rute','musim','biaya','peta','etika','makan','nyetir','checklist','pesan'].indexOf(id)+2) + '-' + id, '#' + id);
  }

  // interaksi: tab rute kedua
  await page.evaluate(() => document.querySelector('#rute').scrollIntoView());
  await page.click('#tb-2');
  await new Promise(r => setTimeout(r, 250));
  await shot('11-tab2', '#rute');

  // musim: pilih Agustus
  await page.evaluate(() => document.querySelectorAll('.bulan')[7].click());
  await shot('12-agustus', '#musim');

  // kalkulator: hari 10, 4 orang, sopir, + batur + gili
  await page.evaluate(() => {
    const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); };
    set('hari', 10); set('orang', 4); set('inap', '1400000'); set('jalan', 'sopir');
    document.getElementById('addBatur').click();
    document.getElementById('addGili').click();
  });
  await shot('13-kalkulator', '#biaya');
  const total = await page.$eval('#totalAngka', e => e.textContent);
  const perOrang = await page.$eval('#totalOrang', e => e.textContent);
  const catat = await page.$eval('#biayaCatat', e => e.textContent);

  // peta: klik Amed
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('.titik')].find(b => b.getAttribute('aria-label') === 'Amed');
    t.click();
  });
  await shot('14-peta', '#peta');

  // checklist: centang 6
  await page.evaluate(() => document.querySelectorAll('#cekDaftar input').forEach((c,i) => { if (i < 6) c.click(); }));
  await shot('15-checklist', '#checklist');
  const maju = await page.$eval('#majuAngka', e => e.textContent);

  // form kosong
  await page.evaluate(() => document.querySelector('#formPesan button[type=submit]').click());
  await new Promise(r => setTimeout(r, 200));
  await shot('16-form-galat', '#pesan');
  const galat = await page.$$eval('.galat.ada', els => els.map(e => e.textContent));

  // form diisi
  await page.evaluate(() => {
    const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input', {bubbles:true})); };
    set('nama', 'Dita & Rama'); set('kontak', '0812 3456 7890'); set('tiba', '2027-05-14'); set('jumlah', '3');
    set('catat', 'Anak 9 tahun, tidak makan babi.');
    document.querySelector('#formPesan button[type=submit]').click();
  });
  await new Promise(r => setTimeout(r, 300));
  await shot('17-form-terisi', '#pesan');
  const wa = await page.$eval('.pesan-bukti a', a => a.href.slice(0, 120));

  // footer
  await shot('18-kaki', '.kaki');

  // mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1400));
  await page.screenshot({ path: '/tmp/opencode/shot/20-m-atas.png' });
  await shot('21-m-rute', '#rute');
  await shot('22-m-biaya', '#biaya');
  await shot('23-m-peta', '#peta');
  await shot('24-m-makan', '#makan');

  // tinggi dokumen & overflow
  await page.setViewport({ width: 320, height: 700, isMobile: true });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  const overflow = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
    tinggi: document.documentElement.scrollHeight,
  }));

  console.log(JSON.stringify({ total, perOrang, catat, maju, galat, wa, overflow, errors }, null, 1));
  await browser.close();
})();
