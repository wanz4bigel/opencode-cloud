#!/usr/bin/env python3
"""probe_brightdata3.py - mriksa apa halaman daftar sing diwenehi Bright Data
isih lengkap (token + bisa dipakai mutation), lan apa sticky session bisa.
"""
import json, re, sys, time, urllib.request

KUNCI = '6466e50f-1cf0-4328-8a89-34714a31f917'
API = 'https://api.brightdata.com/request'
MULAI = time.time()


def log(x):
    print('[%4.0fs] %s' % (time.time() - MULAI, x), flush=True)


def req(body, wektu=80):
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


def halaman(url, **ekstra):
    b = {'zone': 'cli_unlocker', 'url': url, 'format': 'json'}
    b.update(ekstra)
    kode, badan = req(b)
    try:
        j = json.loads(badan)
        return j.get('status_code'), (j.get('body') or ''), (j.get('headers') or {})
    except Exception:
        return kode, badan, {}


def token(isi):
    lsd = (re.search(r'name="lsd"[^>]*value="([^"]+)"', isi)
           or re.search(r'\["LSD",\[\],\{"token":"([^"]+)"\}', isi))
    jaz = (re.search(r'name="jazoest"[^>]*value="([^"]*)"', isi) or re.search(r'jazoest=(\d+)', isi))
    ins = re.search(r'"reg_instance":"([^"]+)"', isi)
    return (lsd.group(1) if lsd else '', jaz.group(1) if jaz else '', ins.group(1) if ins else '')


print('=== A. m.facebook.com/reg/ : kelengkapan token ===')
st, isi, hdr = halaman('https://m.facebook.com/reg/')
t = token(isi)
log('HTTP %s | %d byte' % (st, len(isi)))
log('  LSD        : %s' % (t[0][:26] or '-'))
log('  jazoest    : %s' % (t[1] or '-'))
log('  reg_instance: %s' % (t[2][:26] or '-'))
for penanda in ('reg_passwd__', 'reg_email__', 'name="create"', 'Submit', 'useCAARegistration',
                'birthday_day', '"__spin_r":', '"__rev":'):
    log('  %-20s %s' % (penanda, isi.count(penanda)))
log('  set-cookie : %s' % (json.dumps(hdr.get('set-cookie') or hdr.get('Set-Cookie') or '-')[:220]))
open('/tmp/opencode/bd_m.html', 'w').write(isi)

print('\n=== B. mbasic.facebook.com/reg/ : isih form klasik? ===')
st, isi2, hdr2 = halaman('https://mbasic.facebook.com/reg/')
t2 = token(isi2)
log('HTTP %s | %d byte' % (st, len(isi2)))
log('  LSD %s | jazoest %s | reg_passwd__ %d | reg_email__ %d | create %d'
    % (t2[0][:20] or '-', t2[1] or '-', isi2.count('reg_passwd__'),
       isi2.count('reg_email__'), isi2.count('name="create"')))
log('  set-cookie : %s' % (json.dumps(hdr2.get('set-cookie') or '-')[:220]))
log('  judul      : %r' % ((re.search(r'<title>([^<]{0,50})', isi2) or [None, '-'])[1]))
open('/tmp/opencode/bd_mbasic.html', 'w').write(isi2)
log('  form action: %s' % (re.findall(r'<form[^>]*action="([^"]{0,90})"', isi2)[:3]))

print('\n=== C. sticky session: 3x ipify karo brd_session_id sing padha ===')
for label, sid in (('tanpa', None), ('sid=abcd1', 'abcd1'), ('sid=abcd1', 'abcd1'), ('sid=xyz9', 'xyz9')):
    hdr3 = {}
    extra = {}
    if sid:
        hdr3['brd_session_id'] = sid
    else:
        extra = {}
    b = {'zone': 'cli_unlocker', 'url': 'https://geo.brdtest.com/mygeo.json', 'format': 'raw'}
    if hdr3:
        b['headers'] = hdr3
    kode, badan = req(b)
    kota = re.search(r'"city":"([^"]{0,20})"', badan or '')
    neg = re.search(r'"country":"([^"]{2})"', badan or '')
    org = re.search(r'"org_name":"([^"]{0,30})', badan or '')
    log('  %-12s HTTP %s | %-32s %-3s %s'
        % (label, kode, (org.group(1) if org else '-')[:32], neg.group(1) if neg else '-',
           kota.group(1) if kota else '-'))


print('\n=== D. header sing diterusake (httpbin/headers) ===')
st, isi4, hdr4 = halaman('https://httpbin.org/headers', headers={
    'user-agent': 'UA-UJI-9999', 'accept-language': 'id-ID', 'x-uji': 'abc'})
log('HTTP %s' % st)
try:
    h = json.loads(isi4).get('headers', {})
    for k in sorted(h):
        log('   %-28s %s' % (k, str(h[k])[:60]))
except Exception:
    log('  %r' % isi4[:200])
