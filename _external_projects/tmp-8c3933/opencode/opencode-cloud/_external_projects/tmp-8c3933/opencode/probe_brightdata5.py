#!/usr/bin/env python3
"""probe_brightdata5.py - ngisolasi USER_REGISTER_INVALID_EMAIL:
apa sababe (a) domain email, (b) IP exit Bright Data, utawa (c) token LSD
saka IP sing beda karo IP POST-e?

Tes A: token saka IP lokal, POST saka IP lokal  -> baseline (wus dingerteni)
Tes B: token saka Bright Data, POST saka Bright Data (domain gmail / mail.tm)
Tes C: token saka Bright Data, POST saka IP lokal (domain sing padha)
"""
import json, re, sys, time, uuid, random, string, urllib.request
import urllib.parse as up
import requests

KUNCI = '6466e50f-1cf0-4328-8a89-34714a31f917'
API = 'https://api.brightdata.com/request'
DOC_ID = '27029416779977343'
NAMA_MUTASI = 'useCAARegistrationFormSubmitMutation'
MULAI = time.time()


def log(x):
    print('[%4.0fs] %s' % (time.time() - MULAI, x), flush=True)


def acak(n):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))


HDR = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                     'Chrome/126.0.0.0 Safari/537.36',
       'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       'accept-language': 'en-US,en;q=0.9', 'accept-encoding': 'gzip, deflate, br, zstd',
       'sec-ch-ua': '"Chromium";v="126", "Not:A-Brand";v="24", "Google Chrome";v="126"',
       'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': '"Windows"',
       'sec-fetch-dest': 'document', 'sec-fetch-mode': 'navigate', 'sec-fetch-site': 'none',
       'upgrade-insecure-requests': '1'}


def bd(url, metode='GET', body=None, hdr=None, wektu=80):
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
    f = {'av': '0', '__user': '0', '__a': '1', '__comet_req': '102', 'dpr': '1', '__ccg': 'EXCELLENT',
         'lsd': t['lsd'], 'jazoest': t['jazoest'], 'fb_api_caller_class': 'RelayModern',
         'fb_api_req_friendly_name': NAMA_MUTASI, 'server_timestamps': 'true', 'doc_id': DOC_ID,
         'variables': json.dumps(variabel(email), ensure_ascii=False, separators=(',', ':'))}
    for k, nama in (('rev', '__rev'), ('spin_r', '__spin_r'), ('spin_b', '__spin_b'),
                    ('spin_t', '__spin_t')):
        if t.get(k):
            f[nama] = t[k]
    return '&'.join('%s=%s' % (k, up.quote_plus(str(v))) for k, v in f.items())


def wangsulan(badan):
    b = re.sub(r'\s+', ' ', badan or '')
    uid = (re.search(r'"created_user_id":"?(\d{6,})"?', b) or [None, '-'])[1]
    kode = ','.join(re.findall(r'"code":"([A-Z_]{4,40})"', b)) or '-'
    pesen = (re.search(r'"message":"([^"]{0,90})"', b) or [None, '-'])[1]
    return uid, kode, pesen, len(b)


print('domain mail.tm:', end=' ')
try:
    dj = requests.get('https://api.mail.tm/domains', timeout=20,
                      headers={'user-agent': 'Mozilla/5.0'}).json()
    DOM = [d['domain'] for d in (dj.get('hydra:member') or []) if d.get('domain')]
except Exception as e:
    DOM = []
print(DOM or '(gagal)')

print('\n=== TES A: lokal -> lokal (kontrol) ===')
s = requests.Session(); s.headers.update(HDR)
r = s.get('https://m.facebook.com/reg/', timeout=25)
tA = token(r.text)
for d in ['gmail.com', 'outlook.com', 'yahoo.com']:
    em = 'fb' + acak(9) + '@' + d
    q = s.post('https://www.facebook.com/api/graphql/',
               data=dict(up.parse_qsl(body_post(tA, em), keep_blank_values=True)),
               timeout=30, headers={'content-type': 'application/x-www-form-urlencoded',
                                    'origin': 'https://m.facebook.com',
                                    'referer': 'https://m.facebook.com/reg/'})
    uid, kode, pesen, n = wangsulan(q.text)
    print('  %-18s uid %-12s %-32s %r' % (d, uid, kode, pesen), flush=True)

print('\n=== TES B: token BD -> POST BD (domain beda-beda) ===')
st, isi, _ = bd('https://m.facebook.com/reg/')
tB = token(isi)
print('  token BD: LSD %s | %d byte' % ((tB['lsd'][:12] + '…') if tB['lsd'] else '-', len(isi)))
for d in (DOM + ['gmail.com', 'outlook.com', 'protonmail.com']):
    em = 'fb' + acak(9) + '@' + d
    st2, isi2, _ = bd('https://www.facebook.com/api/graphql/', metode='POST',
                      body=body_post(tB, em),
                      hdr={'content-type': 'application/x-www-form-urlencoded',
                           'origin': 'https://m.facebook.com', 'referer': 'https://m.facebook.com/reg/'})
    uid, kode, pesen, n = wangsulan(isi2)
    print('  %-18s HTTP %s uid %-12s %-32s %r' % (d, st2, uid, kode, pesen), flush=True)

print('\n=== TES C: token BD -> POST lokal (isolasi IP exit) ===')
for d in (DOM + ['gmail.com']):
    em = 'fb' + acak(9) + '@' + d
    q = s.post('https://www.facebook.com/api/graphql/',
               data=dict(up.parse_qsl(body_post(tB, em), keep_blank_values=True)),
               timeout=30, headers={'content-type': 'application/x-www-form-urlencoded',
                                    'origin': 'https://m.facebook.com',
                                    'referer': 'https://m.facebook.com/reg/'})
    uid, kode, pesen, n = wangsulan(q.text)
    print('  %-18s uid %-12s %-32s %r' % (d, uid, kode, pesen), flush=True)
