#!/usr/bin/env python3
"""probe_brightdata6.py - cetak WANGSULAN MENTAH mutation liwat Bright Data,
dibandhingake karo jalur lokal. Sing tak goleki: apa Bright Data beneran ngirim
POST (utawa malah GET), lan apa Facebook mangsuli GraphQL utawa HTML.
"""
import json, re, sys, time, uuid, random, string, urllib.request
import urllib.parse as up
import requests

KUNCI = '6466e50f-1cf0-4328-8a89-34714a31f917'
API = 'https://api.brightdata.com/request'
DOC_ID = '27029416779977343'
NAMA_MUTASI = 'useCAARegistrationFormSubmitMutation'
MULAI = time.time()
PULET = 0


def log(x):
    print('[%4.0fs] %s' % (time.time() - MULAI, x), flush=True)


def acak(n):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))


def bd(url, metode='GET', body=None, hdr=None, wektu=80):
    global PULET
    PULET += 1
    b = {'zone': 'cli_unlocker', 'url': url, 'format': 'json'}
    if metode != 'GET':
        b['method'] = metode
    if body is not None:
        b['body'] = body
    if hdr:
        b['headers'] = hdr
    data = json.dumps(b).encode()
    rq = urllib.request.Request(API, data=data, method='POST', headers={
        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KUNCI})
    try:
        with urllib.request.urlopen(rq, timeout=wektu) as r:
            mentah = r.read().decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'ignore'), {}
    except Exception as e:
        return 0, '%s: %s' % (type(e).__name__, str(e)[:150]), {}
    try:
        j = json.loads(mentah)
        return j.get('status_code'), (j.get('body') or ''), (j.get('headers') or {})
    except Exception:
        return 0, mentah, {}


HDR = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                     'Chrome/126.0.0.0 Safari/537.36',
       'accept-language': 'en-US,en;q=0.9', 'accept-encoding': 'gzip, deflate, br, zstd',
       'sec-ch-ua': '"Chromium";v="126", "Not:A-Brand";v="24"', 'sec-ch-ua-mobile': '?0',
       'sec-ch-ua-platform': '"Windows"', 'sec-fetch-dest': 'document', 'sec-fetch-mode': 'navigate',
       'sec-fetch-site': 'none', 'upgrade-insecure-requests': '1',
       'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}


def token(isi):
    lsd = (re.search(r'\["LSD",\[\],\{"token":"([^"]+)"\}', isi)
           or re.search(r'name="lsd"[^>]*value="([^"]+)"', isi))
    jaz = re.search(r'jazoest=(\d+)', isi)
    g = lambda p, c='': (re.search(p, isi).group(1) if re.search(p, isi) else c)
    return {'lsd': lsd.group(1) if lsd else '', 'jazoest': jaz.group(1) if jaz else '',
            'rev': g(r'"__rev":"?(\d+)"?'), 'spin_r': g(r'"__spin_r":"?(\d+)"?'),
            'spin_b': g(r'"__spin_b":"([^"]+)"', 'trunk'),
            'spin_t': g(r'"__spin_t":"?(\d+)"?', str(int(time.time())))}


def variabel(email):
    return {"input": {
        "actor_id": "0", "client_mutation_id": str(uuid.uuid4()), "machine_id": "",
        "next_uri": "undefined",
        "reg_data": {
            "birthday_day": random.randint(2, 27), "birthday_month": random.randint(1, 12),
            "birthday_year": random.randint(1988, 2003),
            "contactpoint": {"sensitive_string_value": email}, "contactpoint_type": "EMAIL",
            "custom_gender": "", "did_use_age": False,
            "firstname": {"sensitive_string_value": 'Rizky'}, "fullname": {"sensitive_string_value": ""},
            "ig_age_block_data": None, "lastname": {"sensitive_string_value": 'Kusuma'},
            "preferred_pronoun": None,
            "reg_passwd__": {"sensitive_string_value": 'Aa' + acak(9) + '1!'},
            "sex": "MALE", "use_custom_gender": False,
            "username": {"sensitive_string_value": ""}},
        "sk_pipa_consent_given": None, "waterfall_id": str(uuid.uuid4())}}


def body_post(t, email):
    f = [('av', '0'), ('__user', '0'), ('__a', '1'), ('__comet_req', '102'), ('dpr', '1'),
         ('__ccg', 'EXCELLENT'), ('lsd', t['lsd']), ('jazoest', t['jazoest']),
         ('fb_api_caller_class', 'RelayModern'), ('fb_api_req_friendly_name', NAMA_MUTASI),
         ('server_timestamps', 'true'), ('doc_id', DOC_ID),
         ('variables', json.dumps(variabel(email), ensure_ascii=False, separators=(',', ':')))]
    for k, n in (('rev', '__rev'), ('spin_r', '__spin_r'), ('spin_b', '__spin_b'), ('spin_t', '__spin_t')):
        if t.get(k):
            f.append((n, t[k]))
    return '&'.join('%s=%s' % (k, up.quote_plus(str(v))) for k, v in f)


HDR_BD = {'content-type': 'application/x-www-form-urlencoded', 'origin': 'https://m.facebook.com',
          'referer': 'https://m.facebook.com/reg/'}

print('=' * 70)
print('1) ECHO: ngramu apa POST lan body-e tekan target (httpbin/post)')
st, isi, _ = bd('https://httpbin.org/post', metode='POST', body='A=1&B=2', hdr=HDR_BD)
log('HTTP %s | %d byte' % (st, len(isi)))
try:
    j = json.loads(isi)
    log('   method=%s json=%s form=%s data=%r' % (j.get('method'), j.get('json'), j.get('form'),
                                                  (j.get('data') or '')[:80]))
    log('   header: %s' % json.dumps({k: v for k, v in (j.get('headers') or {}).items()
                                      if k.lower() in ('content-type', 'content-length',
                                                       'origin', 'referer')})[:220])
except Exception:
    log('   mentah: %r' % isi[:200])

print('\n2) TOKEN saka Bright Data')
st, isi_t, _ = bd('https://m.facebook.com/reg/')
tB = token(isi_t)
log('HTTP %s | LSD %s | jazoest %s | spin_r %s' %
    (st, (tB['lsd'][:14] + '…') if tB['lsd'] else '-', tB['jazoest'] or '-', tB['spin_r'] or '-'))

print('\n3) MUTASI liwat Bright Data - wangsulan MENTAH')
for d in ['gmail.com', 'maxxspace.com']:
    em = 'fb' + acak(9) + '@' + d
    st2, isi2, h2 = bd('https://www.facebook.com/api/graphql/', metode='POST',
                       body=body_post(tB, em), hdr=HDR_BD)
    log('%-16s HTTP %s | %d byte | ct=%s' % (d, st2, len(isi2), json.dumps(h2.get('content-type'))[:60]))
    log('   >> %r' % re.sub(r'\s+', ' ', isi2)[:520])

print('\n4) KONTROL lokal (IP iki, token lokal, domain sing padha)')
s = requests.Session(); s.headers.update(HDR)
r = s.get('https://m.facebook.com/reg/', timeout=25)
tA = token(r.text)
log('token lokal HTTP %s | LSD %s' % (r.status_code, (tA['lsd'][:14] + '…') if tA['lsd'] else '-'))
for d in ['gmail.com', 'maxxspace.com']:
    em = 'fb' + acak(9) + '@' + d
    q = s.post('https://www.facebook.com/api/graphql/', data=body_post(tA, em), timeout=30,
               headers={'content-type': 'application/x-www-form-urlencoded',
                        'origin': 'https://m.facebook.com', 'referer': 'https://m.facebook.com/reg/'})
    log('%-16s HTTP %s | %d byte' % (d, q.status_code, len(q.text)))
    log('   >> %r' % re.sub(r'\s+', ' ', q.text)[:520])

log('total request Bright Data: %d' % PULET)
