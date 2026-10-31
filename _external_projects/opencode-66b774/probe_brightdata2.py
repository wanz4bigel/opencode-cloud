#!/usr/bin/env python3
"""probe_brightdata2.py - isolasi: apa body kosong kuwi amarga compression?

Cara ngisolasi: njaluk url sing WESENTUNE gzip (httpbin/gzip) lan url sing
wesentune brotli/chunked, banjur bandingake. Yen httpbin/gzip isine ADA nanging
facebook 0 byte -> sababe dudu compression, nanging Facebook-e pancet nganggep
bot / mbutuhake JS. Yen loro-lorone kosong -> API-e ora decode gzip/br.
"""
import json, re, sys, time, urllib.request

KUNCI = '6466e50f-1cf0-4328-8a89-34714a31f917'
API = 'https://api.brightdata.com/request'
MULAI = time.time()
PULET = 0


def log(x):
    print('[%4.0fs] %s' % (time.time() - MULAI, x), flush=True)


def req(body, wektu=75):
    global PULET
    PULET += 1
    data = json.dumps(body).encode()
    rq = urllib.request.Request(API, data=data, method='POST', headers={
        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KUNCI})
    try:
        with urllib.request.urlopen(rq, timeout=wektu) as r:
            return r.status, r.read().decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'ignore')
    except Exception as e:
        return 0, '%s: %s' % (type(e).__name__, str(e)[:160])


def coba(label, url, **ekstra):
    b = {'zone': 'cli_unlocker', 'url': url, 'format': 'json'}
    b.update(ekstra)
    kode, badan = req(b)
    isi = ''
    ket = {}
    try:
        j = json.loads(badan)
        ket = {'status': j.get('status_code'), 'header': sorted((j.get('headers') or {}).keys())}
        isi = j.get('body') or ''
        hdr = j.get('headers') or {}
        cek = {k: v for k, v in hdr.items() if k.lower() in
               ('content-encoding', 'set-cookie', 'content-length', 'content-type')}
        if cek:
            ket['enc'] = cek
    except Exception:
        isi = badan
    log('%-30s api=%s %s' % (label, kode, json.dumps(ket, ensure_ascii=False)[:250]))
    log('   body %5d byte | %r' % (len(isi), re.sub(r'\s+', ' ', isi)[:150]))
    return isi


print('=== A. bukti compression: httpbin /gzip (wangsulane gzip sakjane) ===')
coba('httpbin/gzip', 'https://httpbin.org/gzip')
coba('httpbin/brotli', 'https://httpbin.org/brotli')
coba('httpbin/html', 'https://httpbin.org/html')

print('\n=== B. facebook reg: raw vs json, www vs m, noscript ===')
for label, url in (('www /reg/', 'https://www.facebook.com/reg/'),
                   ('m /reg/', 'https://m.facebook.com/reg/'),
                   ('www ?_fb_noscript', 'https://www.facebook.com/reg/?_fb_noscript=1'),
                   ('mbasic /reg/', 'https://mbasic.facebook.com/reg/')):
    coba(label, url)

print('\n=== C. jumlah request sing kagem: %d ===' % PULET)
