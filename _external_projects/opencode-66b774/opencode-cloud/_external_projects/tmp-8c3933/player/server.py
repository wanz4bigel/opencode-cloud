#!/usr/bin/env python3
import re, json, time, hashlib, random, string, html
import urllib.request, urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

UK, SHAREID, SURL = 81365714511198, 320998351762, "gXsxIflLphVN7DsSmyQgPg"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

# ---- load video list from catalog file (name | size | fid) ----
VIDEOS = []
folder = "Lainnya"
for line in open('/tmp/allvids.txt', encoding='utf-8'):
    line = line.rstrip('\n')
    if line.startswith('📁'):
        folder = line[2:].split('  (')[0].strip()
    if line.startswith('▶️'):
        folder = 'Video Umum'
    m = re.search(r'fid=(\d+)', line)
    if m:
        name_part = line.lstrip(' •▶️')
        size = ''
        ms = re.search(r'\|\s*([\d.]+)MB', line)
        if ms:
            size = ms.group(1) + ' MB'
        name = name_part.split(' | ')[0].strip()
        if not re.search(r'\.(mp4|mkv|mov|avi|webm)$', name, re.I):
            continue
        name = re.sub(r'(\.mp4)+$', '', name, flags=re.I)
        VIDEOS.append({"fid": m.group(1), "folder": folder, "name": name, "size": size})

def stream_url(fid):
    bid = ''.join(random.choices(string.hexdigits.lower(), k=32))
    ts = int(time.time()) + 86400
    sign = hashlib.md5(f"0chunlei{bid}{ts}".encode()).hexdigest()
    return (f"https://www.terabox.app/share/streaming.m3u8?uk={UK}&shareid={SHAREID}"
            f"&type=M3U8_FLV_264_480&fid={fid}&sign={sign}&timestamp={ts}&esl=1&isplayer=1"
            f"&ehps=1&clienttype=8&app_id=250528&web=1&channel=chunlei&share_exp_num=a"
            f"&play_from=&short_link={SURL}")

def fetch(url, headers=None):
    h = {"User-Agent": UA}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, headers=h)
    return urllib.request.urlopen(req, timeout=30)

PAGE = """<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Asupan Malam — 223 Video</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
<style>
:root{
  --bg:#120e17; --surface:#1c1624; --surface2:#241c2e; --line:#322740;
  --ink:#f3ecdf; --dim:#a89bb5; --pink:#ff2e88; --gold:#ffd23f;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font-family:"Archivo",system-ui,sans-serif;font-size:15px;line-height:1.5;
  background-image:radial-gradient(120% 60% at 50% -10%, #2a1636 0%, var(--bg) 60%)}
.led{overflow:hidden;border-bottom:1px solid var(--line);background:#0c0912;padding:7px 0}
.ticker{display:inline-block;white-space:nowrap;font:400 13px/1 "Anton",sans-serif;letter-spacing:.14em;
  color:var(--pink);text-shadow:0 0 8px rgba(255,46,136,.7);animation:mar 26s linear infinite;will-change:transform}
.ticker span{margin:0 26px;color:var(--dim);text-shadow:none}
@keyframes mar{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.wrap{max-width:760px;margin:0 auto;padding:22px 16px 80px}
header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
h1{margin:0;font:400 clamp(38px,9vw,64px)/.95 "Anton",sans-serif;letter-spacing:.02em;color:var(--ink)}
h1 b{color:var(--pink);text-shadow:0 0 22px rgba(255,46,136,.55),0 0 60px rgba(255,46,136,.25);font-weight:400}
.tag{flex:none;margin-top:10px;font:400 13px/1 "Anton",sans-serif;letter-spacing:.08em;color:#120e17;
  background:var(--gold);padding:8px 10px;border-radius:4px;transform:rotate(4deg);box-shadow:2px 2px 0 #00000055}
.sub{color:var(--dim);margin:12px 0 20px;font-size:14px}
.sub b{color:var(--ink);font-weight:600}
.searchbox{position:sticky;top:0;z-index:5;background:var(--bg);padding:6px 0 10px;margin-bottom:4px}
input{width:100%;padding:14px 16px;border-radius:12px;border:1px solid var(--line);
  background:var(--surface);color:var(--ink);font-size:16px}
input:focus{outline:2px solid var(--pink);outline-offset:1px}
input::placeholder{color:#7c6f8e}
.count{color:var(--dim);font-size:13px;margin:0 2px 14px}
details{margin:0 0 10px;border:1px solid var(--line);border-radius:14px;background:var(--surface);overflow:hidden}
details[open]{border-color:#4a3560}
summary{padding:15px 16px;cursor:pointer;list-style:none;display:flex;align-items:baseline;gap:10px}
summary::-webkit-details-marker{display:none}
summary::after{content:"▾";margin-left:auto;color:var(--dim);transition:transform .18s}
details[open] summary::after{transform:rotate(180deg)}
.f{font:400 17px/1.1 "Anton",sans-serif;letter-spacing:.03em;text-transform:uppercase}
.c{font-size:12px;color:var(--gold);border:1px solid #5a4b1e;border-radius:99px;padding:3px 9px;white-space:nowrap}
a.v{display:flex;gap:12px;align-items:center;padding:13px 16px;border-top:1px solid var(--line);
  color:var(--ink);text-decoration:none;min-height:52px}
a.v:active{background:var(--surface2)}
a.v:focus-visible{outline:2px solid var(--pink);outline-offset:-2px}
a.v.on{color:var(--pink);background:#2a1a33}
a.v.on::before{content:"";width:8px;height:8px;flex:none;border-radius:50%;background:var(--pink);
  box-shadow:0 0 10px var(--pink)}
.nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sz{flex:none;font-size:12px;color:var(--dim)}
.empty{display:none;color:var(--dim);padding:26px 4px;text-align:center}
#pl{position:fixed;inset:0;background:#000;display:none;flex-direction:column;z-index:9}
#bar{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;background:#150f1d;border-bottom:1px solid var(--line)}
#t{flex:1;min-width:0;font:400 15px/1.25 "Anton",sans-serif;letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#bar button{font-family:inherit;font-size:14px;border:0;border-radius:9px;padding:9px 13px;cursor:pointer;color:var(--ink);background:var(--surface2)}
#x{background:var(--pink);color:#120e17;font-weight:600}
video{width:100%;flex:1;background:#000;touch-action:initial}
@media (prefers-reduced-motion:reduce){.ticker{animation:none}}
</style></head><body>
<div class="led"><div class="ticker">223 VIDEO <span>•</span> FULL <span>•</span> TANPA LOGIN <span>•</span> TANPA DOWNLOAD <span>•</span> KLIK LANGSUNG MUTER <span>•</span> 223 VIDEO <span>•</span> FULL <span>•</span> TANPA LOGIN <span>•</span> TANPA DOWNLOAD <span>•</span> KLIK LANGSUNG MUTER <span>•</span></div></div>
<div class="wrap">
<header><h1>ASUPAN<b> MALAM</b></h1><div class="tag">DEWASA 21+</div></header>
<p class="sub"><b>223 video full</b> — tanpa login, tanpa download. Abis satu video, lanjut otomatis.</p>
<div class="searchbox"><input id="q" placeholder="Cari video... (zaza, suki, hotel...)" autocomplete="off"></div>
<p class="count" id="cnt"></p>
<div id="list"></div>
<p class="empty" id="empty">Gak ada yang cocok. Coba kata lain — misalnya nama folder atau tokohnya.</p>
</div>
<div id="pl">
<div id="bar"><button id="p">‹ Prev</button><span id="t"></span><button id="n">Next ›</button><button id="x">✕</button></div>
<video id="vd" controls autoplay playsinline></video>
</div>
<script>
var DATA = __DATA__;
var hls = null, cur = -1;
var v = document.getElementById('vd');

function render(){
  var groups = {}, order = [];
  DATA.forEach(function(x, i){
    if(!groups[x.folder]){ groups[x.folder] = []; order.push(x.folder); }
    groups[x.folder].push(i);
  });
  document.getElementById('list').innerHTML = order.map(function(f){
    var rows = groups[f].map(function(i){
      var x = DATA[i];
      return '<a class="v" data-i="'+i+'" href="#" role="button"><span class="nm">'+esc(x.name)+
             '</span><span class="sz">'+(x.size||'')+'</span></a>';
    }).join('');
    return '<details '+(f==='Lainnya'?'':'open')+'><summary><span class="f">'+esc(f)+
           '</span><span class="c">'+groups[f].length+' video</span></summary>'+rows+'</details>';
  }).join('');
  document.getElementById('list').addEventListener('click', function(e){
    var a = e.target.closest('a.v'); if(!a) return; e.preventDefault(); play(+a.dataset.i);
  });
}
function esc(s){ return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function play(i){
  cur = i; var x = DATA[i];
  document.getElementById('pl').style.display = 'flex';
  document.getElementById('t').textContent = x.folder + ' — ' + x.name;
  document.querySelectorAll('a.v').forEach(function(a){ a.classList.toggle('on', +a.dataset.i === i); });
  var u = '/m3u8?fid=' + x.fid;
  if(hls){ hls.destroy(); hls = null; }
  if(Hls.isSupported()){
    hls = new Hls(); hls.loadSource(u); hls.attachMedia(v);
    hls.on(Hls.Events.MANIFEST_PARSED, function(){ v.play(); });
    hls.on(Hls.Events.ERROR, function(_, err){ if(err.fatal){ setTimeout(function(){ play(i); }, 1500); } });
  } else { v.src = u; v.play(); }
}
function closev(){
  if(hls){ hls.destroy(); hls = null; }
  v.pause(); document.getElementById('pl').style.display = 'none';
  document.querySelectorAll('a.v.on').forEach(function(a){ a.classList.remove('on'); });
  var a = document.querySelector('a.v[data-i="'+cur+'"]'); if(a) a.scrollIntoView({block:'center'});
}
v.addEventListener('ended', function(){ if(cur < DATA.length-1) play(cur+1); });
document.getElementById('x').onclick = closev;
document.getElementById('p').onclick = function(){ if(cur>0) play(cur-1); };
document.getElementById('n').onclick = function(){ if(cur<DATA.length-1) play(cur+1); };
document.addEventListener('keydown', function(e){
  if(document.getElementById('pl').style.display !== 'flex') return;
  if(e.key === 'Escape') closev();
  if(e.key === 'ArrowRight' && cur<DATA.length-1) play(cur+1);
  if(e.key === 'ArrowLeft' && cur>0) play(cur-1);
});

var q = document.getElementById('q');
q.addEventListener('input', function(){
  var s = q.value.toLowerCase().trim(), hit = 0;
  document.querySelectorAll('details').forEach(function(d){
    var n = 0;
    d.querySelectorAll('a.v').forEach(function(a){
      var ok = !s || DATA[+a.dataset.i].name.toLowerCase().indexOf(s) > -1 ||
               DATA[+a.dataset.i].folder.toLowerCase().indexOf(s) > -1;
      a.style.display = ok ? '' : 'none'; if(ok) n++;
    });
    d.style.display = n ? '' : 'none';
    if(n && s) d.open = true;
  });
  hit = document.querySelectorAll('a.v:not([style*="none"])').length;
  document.getElementById('cnt').textContent = s ? hit+' video cocok' : '';
  document.getElementById('empty').style.display = hit ? 'none' : 'block';
});
render();
</script></body></html>"""

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _send(self, code, ctype, body, extra=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Access-Control-Allow-Origin", "*")
        if extra:
            for k, v in extra.items():
                self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == "/":
            page = PAGE.replace("__DATA__", json.dumps(VIDEOS, ensure_ascii=False))
            self._send(200, "text/html; charset=utf-8", page.encode())
        elif u.path == "/m3u8":
            q = urllib.parse.parse_qs(u.query)
            fid = q.get("fid", [""])[0]
            try:
                body = fetch(stream_url(fid)).read().decode("utf-8", "replace")
                if "#EXTM3U" not in body:
                    self._send(502, "text/plain", ("TeraBox: " + body[:80]).encode()); return
                body = re.sub(r'(https://\S+)',
                              lambda m: "/seg?u=" + urllib.parse.quote(m.group(1), safe=""),
                              body)
                self._send(200, "application/vnd.apple.mpegurl", body.encode())
            except Exception as e:
                self._send(502, "text/plain", str(e).encode())
        elif u.path == "/seg":
            q = urllib.parse.parse_qs(u.query)
            url = q.get("u", [""])[0]
            if not url.startswith("https://"):
                self._send(400, "text/plain", b"bad url"); return
            try:
                hdr = {}
                r = self.headers.get("Range")
                if r:
                    hdr["Range"] = r
                resp = fetch(url, hdr)
                body = resp.read()
                extra = {"Cache-Control": "no-store"}
                cr = resp.headers.get("Content-Range")
                if cr:
                    extra["Content-Range"] = cr
                    self.send_response(206)
                else:
                    self.send_response(200)
                self.send_header("Content-Type", "video/mp2t")
                self.send_header("Access-Control-Allow-Origin", "*")
                for k, v in extra.items():
                    self.send_header(k, v)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                self._send(502, "text/plain", str(e).encode())
        else:
            self._send(404, "text/plain", b"not found")

if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8770), H).serve_forever()
