#!/usr/bin/env python3
"""probe_brightdata.py - njajal Bright Data (Web Unlocker API) kanggo jalur daftar FB.

Pitakonan sing kudu wangsul:
  1. GET https://www.facebook.com/reg/ liwat zone -> HTTP pira? token LSD ana?
  2. IP exit-e ganti-ganti saben request? (kuwi sing dibutuhake: 1 akun = 1 IP)
  3. Respon bisa diwaca (format json vs raw)? header cookie (set-cookie) kebukani?
  4. POST bisa (dibutuhake mutation)? body urlencoded ditampa?
  5. reg_instance/LSD siji sesi kudu karo IP sing padha -> apa ana session affinity?
"""
import json, sys, time, urllib.request

KUNCI = '6466e50f-1cf0-4328-8a89-34714a31f917'
API = 'https://api.brightdata.com/request'
MULAI = time.time()


def log(x):
    print('[%4.0fs] %s' % (time.time() - MULAI, x), flush=True)


def req(body, wektu=70):
    data = json.dumps(body).encode()
    rq = urllib.request.Request(API, data=data, method='POST', headers={
        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KUNCI})
    try:
        with urllib.request.urlopen(rq, timeout=wektu) as r:
            return r.status, r.read().decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'ignore')
    except Exception as e:
        return 0, '%s: %s' % (type(e).__name__, str(e)[:200])


print('=== 1. GET facebook.com/reg/ (format raw) ===')
kode, badan = req({'zone': 'cli_unlocker', 'url': 'https://www.facebook.com/reg/', 'format': 'raw'})
log('HTTP %s | %d byte' % (kode, len(badan)))
import re
lsd = re.search(r'\["LSD",\[\],\{"token":"([^"]+)"\}', badan)
jaz = re.search(r'jazoest=(\d+)', badan)
ins = re.search(r'"reg_instance":"([^"]+)"', badan)
judul = re.search(r'<title>([^<]{0,60})', badan)
log('LSD=%s jazoest=%s reg_instance=%s judul=%r'
    % (bool(lsd), jaz.group(1) if jaz else '-', bool(ins), (judul.group(1).strip() if judul else '-')))
log('cuplikan: %r' % re.sub(r'\s+', ' ', badan)[:220])

print('\n=== 2. format=json (deleng metadata brd_*) ===')
kode, badan = req({'zone': 'cli_unlocker', 'url': 'https://geo.brdtest.com/mygeo.json', 'format': 'json'})
log('HTTP %s' % kode)
try:
    j = json.loads(badan)
    log('key: %s' % sorted(j.keys()))
    for k in ('brd_prxip', 'brd_verdict', 'brd_cch', 'country_code', 'status_code', 'headers'):
        if k in j:
            log('  %-14s %s' % (k, json.dumps(j[k])[:300]))
except Exception:
    log('dudu JSON: %r' % badan[:200])

print('\n=== 3. IP exit 3x (format raw, ipify) ===')
for i in range(3):
    kode, badan = req({'zone': 'cli_unlocker', 'url': 'https://api.ipify.org?format=json', 'format': 'raw'})
    log('  %d: HTTP %s %s' % (i + 1, kode, badan[:80]))

print('\n=== 4. set-cookie kebukani ora (perlu kanggo datr/sb) ===')
kode, badan = req({'zone': 'cli_unlocker', 'url': 'https://www.facebook.com/login/', 'format': 'json'})
try:
    j = json.loads(badan)
    hdr = j.get('headers') or {}
    log('HTTP %s | header keys: %s' % (j.get('status_code'), sorted(k for k in hdr if 'cookie' in k.lower())))
    for k, v in hdr.items():
        if 'cookie' in k.lower():
            log('  %s: %s' % (k, json.dumps(v)[:260]))
except Exception:
    log('dudu JSON (%d byte): %r' % (len(badan), badan[:160]))

print('\n=== 5. POST urlencoded (simulasi mutation) ===')
body = 'av=0&doc_id=27029416779977343&variables=%7B%22input%22%3A%7B%7D%7D'
kode, badan = req({'zone': 'cli_unlocker', 'url': 'https://www.facebook.com/api/graphql/',
                   'method': 'POST', 'format': 'raw', 'body': body,
                   'headers': {'content-type': 'application/x-www-form-urlencoded',
                               'referer': 'https://www.facebook.com/reg/',
                               'origin': 'https://www.facebook.com',
                               'x-fb-friendly-name': 'useCAARegistrationFormSubmitMutation'}})
log('HTTP %s | %d byte' % (kode, len(badan)))
log('wangsulan: %r' % re.sub(r'\s+', ' ', badan)[:400])

print('\n=== 6. apa bisa milih negara / session sticky ===')
for extra in ({'country': 'id'}, {'country': 'us'}, {'headers': {'brd-session-id': 'uji123'}}):
    b = {'zone': 'cli_unlocker', 'url': 'https://geo.brdtest.com/mygeo.json', 'format': 'raw'}
    b.update(extra)
    kode, badan = req(b)
    log('  %-34s HTTP %s | %s' % (json.dumps(extra)[:32], kode, badan[:120]))
