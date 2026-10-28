#!/usr/bin/env python3
import re, json, time, hashlib, random, string, html
import urllib.request, urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

UK, SHAREID, SURL = 81365714511198, 320998351762, "gXsxIflLphVN7DsSmyQgPg"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

# ---- load video list from generated playlist ----
VIDEOS = []
lines = open('/tmp/asupan.m3u').read().splitlines()
i = 0
while i < len(lines):
    if lines[i].startswith('#EXTINF:'):
        title = lines[i].split(',', 1)[1]
        url = lines[i+1]
        fid = re.search(r'fid=(\d+)', url).group(1)
        folder, _, name = title.partition(' — ')
        if not name:
            folder, name = 'Lainnya', title
        VIDEOS.append({"fid": fid, "folder": folder, "name": name})
        i += 2
    else:
        i += 1

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
<title>Asupan Bebas Viral</title>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
<style>
body{background:#0e0f13;color:#e8e8ea;font-family:system-ui,sans-serif;margin:0;padding:16px}
h1{font-size:20px} .s{color:#9aa0a6;font-size:13px}
input{width:100%;padding:10px;border-radius:8px;border:1px solid #333;background:#1a1c22;color:#fff;font-size:15px;margin:12px 0;box-sizing:border-box}
details{margin:6px 0;border:1px solid #26282f;border-radius:10px;overflow:hidden}
summary{padding:12px;background:#1a1c22;cursor:pointer;font-weight:600;position:sticky;top:0}
a.v{display:block;padding:11px 14px;border-top:1px solid #22242b;color:#7ab8ff;text-decoration:none;font-size:14px}
a.v:active{background:#23252d}
.sz{color:#9aa0a6;font-size:12px;float:right;margin-left:8px}
#pl{position:fixed;inset:0;background:#000;display:none;z-index:9;flex-direction:column}
video{width:100%;height:100%}
#bar{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#111;font-size:13px}
#x{background:#d33;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-size:14px}
</style></head><body>
<h1>🔥 Asupan Bebas Viral</h1><div class="s">223 video &middot; tanpa login &middot; klik = langsung muter</div>
<input id="q" placeholder="cari video..." oninput="flt()">
<div id="list">__LIST__</div>
<div id="pl"><div id="bar"><span id="t"></span><button id="x" onclick="closev()">✕ Tutup</button></div>
<video id="vd" controls autoplay playsinline></video></div>
<script>
var hls=null;
function play(fid,name){document.getElementById('pl').style.display='flex';
document.getElementById('t').textContent=name;
var v=document.getElementById('vd'),u='/m3u8?fid='+fid;
if(hls)hls.destroy();
if(Hls.isSupported()){hls=new Hls();hls.loadSource(u);hls.attachMedia(v);hls.on(Hls.Events.MANIFEST_PARSED,function(){v.play()});}
else if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=u;v.play();}}
function closev(){if(hls)hls.destroy();var v=document.getElementById('vd');v.pause();document.getElementById('pl').style.display='none';}
function flt(){var q=document.getElementById('q').value.toLowerCase();
document.querySelectorAll('details').forEach(function(d){var hit=0;
d.querySelectorAll('a.v').forEach(function(a){var ok=a.textContent.toLowerCase().indexOf(q)>-1;a.style.display=ok?'':'none';if(ok)hit=1;});
d.style.display=hit?'':'none';});}
</script></body></html>"""

def build_list():
    groups = {}
    for v in VIDEOS:
        groups.setdefault(v["folder"], []).append(v)
    out = []
    for folder, vids in groups.items():
        items = "".join(
            f'<a class="v" href="#" onclick="play(\'{v["fid"]}\',\'{html.escape(v["name"])}\');return false">'
            f'{html.escape(v["name"])}</a>' for v in vids)
        out.append(f'<details><summary>📁 {html.escape(folder)} ({len(vids)})</summary>{items}</details>')
    return "".join(out)

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
            self._send(200, "text/html; charset=utf-8", PAGE.replace("__LIST__", build_list()).encode())
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
