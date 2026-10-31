const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const mod = require('./deface_payload.js');

const FFMPEG = '/home/runner/.local/lib/python3.14/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
const REC = '/tmp/opencode/rec2';
const URL_TARGET = 'https://www.dw.com/id/beranda/s-11546';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PARODI = [
  'BREAKING: nginx Minta Naik Gaji, Demo di Port 443',
  'admin/admin Berhasil Login, Satu Redaksi Panik',
  'Password Terkuat Nasional Ternyata "123456"',
  'Beranda Ini Ternyata Halaman /dev/null yang Disamarkan',
  'Menkominfo: Mulai Hari Ini Semua Log Harus Puisi',
  'SQL Injection Dibisikkan ke Kolom Komentar, Server Melayang',
  'Root Ditemukan di Bawah Karpet Server, Langsung Diduduki',
  '404 Not Found Menang Undian, Ditunjuk Jadi Redaktur',
];

(async () => {
  fs.rmSync(REC, { recursive: true, force: true });
  fs.mkdirSync(REC, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36');

  console.log('-> membuka beranda DW live...');
  await page.goto(URL_TARGET, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.teaser', { timeout: 20000 });
  await sleep(2000);

  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      const w = document.getElementById('cmpwrapper');
      if (w) {
        if (w.shadowRoot) {
          const b = [...w.shadowRoot.querySelectorAll('button,a,[role=button]')].find(x => /setuju|accept|terima/i.test(x.textContent));
          if (b) b.click();
        }
        w.remove();
      }
      document.querySelectorAll('dialog').forEach(d => { try { d.close(); } catch (e) {} d.remove(); });
      document.body.style.removeProperty('overflow');
    });
    await sleep(700);
  }

  const cdp = await page.createCDPSession();
  const frames = [];
  cdp.on('Page.screencastFrame', async (f) => {
    frames.push({ t: Date.now(), data: f.data });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {}
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 });

  console.log('-> scene 1: beranda normal (1.2s)');
  await sleep(1200);

  console.log('-> scene 2: terminal exploit ngetik...');
  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = '#xterm{position:fixed;top:14px;right:14px;z-index:99999;width:430px;background:rgba(0,8,0,.88);border:1px solid #1e7a1e;box-shadow:0 0 30px rgba(57,255,20,.35);color:#39ff14;font:12.5px "Courier New",monospace;padding:12px 14px;white-space:pre-wrap;text-align:left}#xterm .cur{animation:xb 1s steps(1) infinite}@keyframes xb{50%{opacity:0}}';
    document.head.appendChild(s);
    const box = document.createElement('div');
    box.id = 'xterm';
    document.body.appendChild(box);
    const lines = [
      '┌──(n30-b0t\ka\u327fk)\u3011localhost\u3011\u3010~/dw/beranda\u3011',
      '\u2514\u2500$ curl -sI dw.com/id/beranda/s-11546',
      'HTTP/2 200 — header Server disembunyiin (Akamai sok misterius)',
      '\u2514\u2500$ curl -s dw.com/robots.txt | grep Disallow',
      'Disallow: /popups/    Disallow: /*/user/account$',
      '[i] dia nyembunyiin pintu. Nyembunyiin != ngunci.',
      '\u2514\u2500$ curl -s dw.com/graph-api/id/road/translations',
      '{"data":{"i18n":{...}}}  <-- API DALAM NEGERI. TANPA TOKEN.',
      '[+] semua label situs ("Berita Utama", dll) dibaca dr sini',
      '\u2514\u2500$ PUT /graph-api/id/road/translations {headline:"SURAT"}',
      '[+] 204 No Content — terjemahan situs telah saya edit',
      '>> situsnya bakal nulis ulang kata-katanya sendiri. Kocak.',
    ];
    let li = 0, ci = 0, txt = '';
    (function type() {
      if (li >= lines.length) return;
      if (ci < lines[li].length) txt += lines[li][ci++];
      else { txt += '\n'; li++; ci = 0; }
      box.innerHTML = txt + '<span class="cur">\u2588</span>';
      setTimeout(type, 16);
    })();
  });
  await sleep(2900);

  console.log('-> scene 3: judul berita BERGANTI-GANTI...');
  await page.evaluate((PARODI) => {
    const titles = [...document.querySelectorAll('#root .title')].slice(0, 8);
    const glyphs = '#$%&@01xX*/\\<>|▓▒░';
    titles.forEach((el, n) => {
      const target = PARODI[n % PARODI.length];
      let frame = 0;
      const total = target.length + 8;
      (function step() {
        let out = '';
        for (let i = 0; i < target.length; i++) {
          if (i < frame - 4) out += target[i];
          else if (i < frame) out += glyphs[Math.floor(Math.random() * glyphs.length)];
          else break;
        }
        el.textContent = out || ' ';
        el.style.color = Math.random() < 0.3 ? '#39ff14' : '';
        if (frame++ < total) setTimeout(step, 28);
      })();
    });
  }, PARODI);
  await sleep(2300);

  console.log('-> scene 4: gempa + invert...');
  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = '@keyframes shake{0%,100%{transform:translate(0)}10%{transform:translate(-8px,4px) rotate(.4deg)}30%{transform:translate(7px,-6px) rotate(-.5deg)}50%{transform:translate(-5px,7px)}70%{transform:translate(6px,-4px) rotate(.3deg)}90%{transform:translate(-3px,2px)}}#root{animation:shake .35s infinite}#root img,#root figure{filter:invert(1) hue-rotate(90deg);transition:filter .6s}#root{transition:opacity .9s, filter .9s}';
    document.head.appendChild(s);
  });
  await sleep(1500);

  console.log('-> scene 5: fade to black...');
  await page.evaluate(() => {
    const r = document.getElementById('root');
    if (r) { r.style.opacity = '0'; r.style.filter = 'blur(6px)'; }
    const x = document.getElementById('xterm');
    if (x) { const k = document.createElement('div'); k.textContent = '[+] RUMAH DIGANTI PEMILIK. — n30-b0t'; k.style.color = '#ff2d2d'; x.appendChild(k); }
  });
  await sleep(1300);

  console.log('-> scene 6: BANNER slam-in!');
  await page.evaluate(() => {
    const r = document.getElementById('root'); if (r) r.remove();
    const x = document.getElementById('xterm'); if (x) x.remove();
    document.body.innerHTML += '<div id="flash" style="position:fixed;inset:0;background:#fff;z-index:99999;transition:opacity .45s"></div>';
    requestAnimationFrame(() => { const f = document.getElementById('flash'); f.style.opacity = '0'; setTimeout(() => f.remove(), 500); });
  });
  await page.addStyleTag({ content: mod.CSS });
  await page.evaluate((h) => document.body.insertAdjacentHTML('beforeend', h), mod.HTML);
  await page.addScriptTag({ content: mod.JS });

  // personalisasi banner untuk beranda
  await page.evaluate(() => {
    const h1 = document.querySelector('.df-wrap h1');
    if (h1) h1.innerHTML = 'DW BERANDA <b>DIBOBOL</b> OLEH N30-B0T';
    const st = document.querySelector('.df-stamp');
    if (st) st.textContent = '[root@n30-b0t dw.com/id/beranda/s-11546]$ _';
    const sub = document.querySelector('.df-sub');
    if (sub) sub.innerHTML = '31 Oktober 2026 &bull; 09:41 WIB &bull; halaman depan <u>gak dikunci</u>, ya udah';
    const h2 = document.querySelector('.df-box h2');
    if (h2) h2.textContent = 'Beranda Utama (Edisi Dijarah)';
  });
  await sleep(4600);

  await page.screenshot({ path: '/home/runner/deface-dw/beranda_bukti.png' });
  fs.mkdirSync('/home/runner/deface-dw/site/beranda', { recursive: true });
  fs.writeFileSync('/home/runner/deface-dw/site/beranda/index.html', await page.content());
  await cdp.send('Page.stopScreencast');
  await browser.close();

  console.log('-> ' + frames.length + ' frame, merakit video...');
  frames.forEach((f, i) => fs.writeFileSync(path.join(REC, 'f' + String(i).padStart(5, '0') + '.jpg'), Buffer.from(f.data, 'base64')));
  const list = frames.map((f, i) => {
    const dur = (i < frames.length - 1 ? frames[i + 1].t - f.t : 600) / 1000;
    return `file 'f${String(i).padStart(5, '0')}.jpg'\nduration ${Math.min(Math.max(dur, 0.04), 1.2)}`;
  }).join('\n') + `\nfile 'f${String(frames.length - 1).padStart(5, '0')}.jpg'`;
  fs.writeFileSync(path.join(REC, 'list.txt'), list);

  const mp4 = '/home/runner/deface-dw/dw_beranda_dibobol.mp4';
  execFileSync(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', path.join(REC, 'list.txt'), '-vf', 'fps=24,scale=1280:800', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-b:v', '2500k', mp4], { stdio: 'pipe' });
  execFileSync(FFMPEG, ['-y', '-i', mp4, '-filter:v', 'setpts=0.45*PTS', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-b:v', '2500k', mp4 + '.tmp.mp4'], { stdio: 'pipe' });
  fs.renameSync(mp4 + '.tmp.mp4', mp4);
  const pal = path.join(REC, 'pal.png');
  execFileSync(FFMPEG, ['-y', '-i', mp4, '-vf', 'fps=8,scale=800:-1:flags=lanczos,palettegen', pal], { stdio: 'pipe' });
  execFileSync(FFMPEG, ['-y', '-i', mp4, '-i', pal, '-lavfi', 'fps=8,scale=800:-1:flags=lanczos [x]; [x][1:v] paletteuse', '/home/runner/deface-dw/dw_beranda_dibobol.gif'], { stdio: 'pipe' });
  console.log('-> VIDEO : ' + mp4);
  console.log('-> GIF   : /home/runner/deface-dw/dw_beranda_dibobol.gif');
  console.log('-> SITE  : /home/runner/deface-dw/site/beranda/index.html');
})();
