const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CSS = `
@keyframes df-glitch { 0%{text-shadow:3px 0 #ff00c1,-3px 0 #00fff9;transform:translate(0)}
25%{text-shadow:-3px 2px #ff00c1,3px -2px #00fff9;transform:translate(2px,-1px) skewX(2deg)}
50%{text-shadow:3px -3px #ff00c1,-3px 3px #00fff9;transform:translate(-2px,1px)}
75%{text-shadow:-2px 0 #ff00c1,2px 0 #00fff9;transform:translate(1px,2px) skewX(-3deg)}
100%{text-shadow:3px 0 #ff00c1,-3px 0 #00fff9;transform:translate(0)}}
@keyframes df-blink { 50%{opacity:0} }
@keyframes df-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-100%)} }
*{box-sizing:border-box}
html,body{background:#030303!important;color:#39ff14!important;filter:none!important;margin:0;height:100%}
body{font-family:"Courier New",monospace!important}
#df-bg{position:fixed;inset:0;opacity:.28}
.df-wrap{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;
padding:30px 20px 70px;max-width:980px;margin:0 auto}
.df-wrap pre.ascii{font-size:clamp(6px,1.5vw,13px);line-height:1.15;margin:0 0 14px;
text-shadow:0 0 8px rgba(57,255,20,.8);text-align:center}
.df-wrap h1{font-size:clamp(26px,6.5vw,64px);letter-spacing:.1em;color:#eee;margin:0 0 8px;
text-transform:uppercase;animation:df-glitch .9s infinite steps(2)}
.df-wrap h1 b{color:#ff2d2d}
.df-sub{color:#9cffab;font-size:clamp(11px,2.2vw,16px);letter-spacing:.05em;margin:0 0 24px;text-align:center}
.df-col{display:flex;gap:18px;flex-wrap:wrap;width:100%;justify-content:center}
.df-box{flex:1 1 340px;background:rgba(0,18,0,.8);border:1px solid #1e7a1e;padding:14px 16px;
font-size:clamp(11px,1.8vw,13.5px);box-shadow:0 0 20px rgba(57,255,20,.2) inset}
.df-box h2{font-size:13px;color:#ff2d2d;letter-spacing:.12em;margin:0 0 10px;border-bottom:1px dashed #1e7a1e;padding-bottom:6px}
.df-box ul{margin:0;padding-left:18px;line-height:1.9}
.df-box .t{color:#777}
#df-term{min-height:170px;white-space:pre-wrap}
#df-term .cur{animation:df-blink 1s steps(1) infinite}
.df-greetz{margin:22px 0 0;font-size:12px;color:#0f9f0f;text-align:center;letter-spacing:.04em}
.df-marquee{position:fixed;bottom:0;left:0;right:0;background:#0a0a0a;border-top:1px solid #39ff14;
color:#39ff14;font-size:13px;padding:8px 0;white-space:nowrap;overflow:hidden;z-index:3}
.df-marquee span{display:inline-block;padding-left:100%;animation:df-scroll 16s linear infinite}
.df-stamp{position:fixed;top:10px;left:12px;z-index:3;font-size:11px;color:#0f9f0f}
dialog,dialog::backdrop,[id*=cmp],[class*=cmp],[id*=consent],[class*=consent],[id*=privacy],[class*=privacy]{display:none!important}
html:has(dialog[open]:modal){overflow:auto!important}
`;

const HTML = `
<canvas id="df-bg"></canvas>
<div class="df-stamp">[root@n30-b0t dw.com/id]$ _</div>
<div class="df-wrap">
<pre class="ascii">     .-"""--.
    /        |   ___   _   _ ___ ___ ___
    |.-----.  |  | __| /_\\ | _ / __| __|
    ||  |  |  |  | _| / _ \\| _ \\__ \\ _||
    |'-'|'-''  /  |___/_/ \\_\\___/___/___|
 ___/  /V  \\  \\___   S Y S T E M   C O M P R O M I S E D
/ _ \\_ /\\__ \\_______\\
</pre>
<h1>DW.COM <b>DIBOBOL</b> OLEH N30-B0T</h1>
<p class="df-sub">31 Oktober 2026 &bull; 09:31 WIB &bull; vektor masuk: <u>default credentials + nginx ngambek</u></p>
<div class="df-col">
  <div class="df-box">
    <h2>Berita Utama (Edisi Hacked)</h2>
    <ul>
      <li>Mahfud MD Temukan <b>backdoor</b> di /etc/passwd Negara <span class="t">09:31</span></li>
      <li>Menkominfo Baru Wajibkan Semua Server Berasa Kecap <span class="t">09:30</span></li>
      <li>22 Perusahaan Karhutla Diganti Nama Jadi "22 rootkit" <span class="t">09:29</span></li>
      <li>Prabowo Ngamuk, Firewall Dibobol Pakai Sandi "prabowo123" <span class="t">09:28</span></li>
      <li>Penerbangan Ramah Iklim Kalah Laga Melawan 404 Not Found <span class="t">09:27</span></li>
      <li>IP 127.0.0.1 Ditahan, Didalaminya Tinggal Seorang n30-b0t <span class="t">09:26</span></li>
      <li>Dolar Stabil, Bitcoin Malah <span class="t">ping</span> kelocalhost <span class="t">09:25</span></li>
      <li>Kanselir Merz: Keamanan Eropa Bergantung UPDATE nginx <span class="t">09:24</span></li>
    </ul>
  </div>
  <div class="df-box">
    <h2>Bukti Penetrasi</h2>
    <div id="df-term"></div>
  </div>
</div>
<p class="df-greetz">greetz: gnsyhfirt | mbah google | Pak RT Cyber | 127.0.0.1 (home sweet home)<br>
"Kami tidak mencuri data. Kami cuma... membacanya pelan-pelan."</p>
</div>
<div class="df-marquee"><span>*** DW DIHACK *** 0 tabel di-dump, 1 harga diri hilang *** we are legion, kami 1 (self) *** patch your server *** exit(0) ***</span></div>
`;

const JS = `
(function(){
  // bungkam React: kosongkan #root selamanya
  var root = document.getElementById('root');
  if (root) root.remove();
  var kill = setInterval(function(){ var r = document.getElementById('root'); if (r) r.remove(); }, 150);

  // terus usir dialog consent (termasuk yang ngumpet di shadow DOM #cmpwrapper)
  var usir = setInterval(function(){
    var w = document.getElementById('cmpwrapper');
    if (w) {
      if (w.shadowRoot) {
        var btn = [...w.shadowRoot.querySelectorAll('button,a,[role=button]')].find(function(x){ return /setuju|accept|terima/i.test(x.textContent); });
        if (btn) btn.click();
      }
      w.remove();
    }
    document.querySelectorAll('dialog,[id*=cmp],[id*=consent]').forEach(function(d){ try{d.close&&d.close();}catch(e){} d.remove(); });
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    document.body.style.filter = 'none';
  }, 300);

  var t = '\\u26A0 DW DIBOBOL N30-B0T \\u26A0';
  var st = function(){ if (document.title !== t) document.title = t; };
  st(); setInterval(st, 300);

  // matrix rain full-screen
  var cv = document.getElementById('df-bg'), ctx = cv.getContext('2d'), fs_ = 14, cols, drops;
  var rs = function(){ cv.width = innerWidth; cv.height = innerHeight;
    cols = Math.floor(cv.width/fs_); drops = Array(cols).fill(0).map(function(){return Math.random()*-50;}); };
  rs(); addEventListener('resize', rs);
  var ch = 'アイウエオ0123456789ABCDEF$#@%&<>/\\\\{}[]';
  setInterval(function(){
    ctx.fillStyle='rgba(0,0,0,.07)'; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.fillStyle='#39ff14'; ctx.font=fs_+'px monospace';
    for(var i=0;i<cols;i++){ ctx.fillText(ch[Math.floor(Math.random()*ch.length)], i*fs_, drops[i]*fs_);
      if(drops[i]*fs_>cv.height && Math.random()>.975) drops[i]=0; drops[i]++; }
  }, 55);

  // terminal proof
  var term = document.getElementById('df-term');
  var lines = [
    '$ nmap -p- --min-rate 5000 dw.com',
    'PORT     STATE    SERVICE',
    '443/tcp  open     https   (nginx, telat update 3 versi)',
    '8080/tcp filtered http-alt',
    '$ echo "admin:admin" | http-login /admin',
    '[+] 200 OK  -> welcome, admin',
    '$ cat /var/www/victory.txt',
    'pwned oleh n30-b0t — 31.10.2026',
    '> semua redaksi kini berbahasa biner'
  ];
  var li=0, ci=0, txt='';
  (function type(){
    if(li>=lines.length){ term.innerHTML = txt+'<span class="cur">\\u2588</span>'; return; }
    if(ci<lines[li].length){ txt+=lines[li][ci++]; } else { txt+='\\n'; li++; ci=0; }
    term.innerHTML = txt+'<span class="cur">\\u2588</span>';
    setTimeout(type, 20);
  })();
})();
`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium', headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36');

  console.log('-> membuka DW live...');
  await page.goto('https://www.dw.com/id/berita-utama/headlines-id', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 2500)));

  // usir banner cookie consent DW biar nggak ngehalangin deface
  await page.evaluate(() => {
    document.querySelectorAll('dialog').forEach(d => { try { d.close(); } catch (e) {} d.remove(); });
    const btn = [...document.querySelectorAll('button,a')].find(b => /setuju|accept|terima/i.test(b.textContent));
    if (btn) btn.click();
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.evaluate(() => {
    document.querySelectorAll('dialog,[class*=consent],[id*=consent],[class*=privacy]').forEach(e => e.remove());
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
  });

  await page.addStyleTag({ content: CSS });
  await page.evaluate((h) => document.body.insertAdjacentHTML('beforeend', h), HTML);
  await page.addScriptTag({ content: JS });

  await page.evaluate(() => new Promise(r => setTimeout(r, 4500)));
  const info = await page.evaluate(() => ({
    url: location.href, title: document.title,
    rootMasihAda: !!document.getElementById('root'),
    teaserAsliSisa: document.querySelectorAll('.teaser').length,
  }));
  console.log('-> status:', JSON.stringify(info));

  // simpan snapshot hasil deface jadi file standalone
  const snapshot = await page.content();
  fs.writeFileSync('/home/runner/deface-dw/dw_hacked.html', snapshot);
  await page.screenshot({ path: '/tmp/opencode/live_full_deface.png' });
  await page.screenshot({ path: '/tmp/opencode/live_full_deface_full.png', fullPage: true });
  console.log('-> snapshot: /home/runner/deface-dw/dw_hacked.html');
  await browser.close();
})();
