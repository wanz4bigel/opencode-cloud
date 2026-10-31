#!/usr/bin/env python3
"""probe_brightdata7.py - HIPOTESIS: daftar akun gagal amarga IP exit-e AMD
(regulation_jurisdiction US_MD/US_CA + youth_regulation_enabled:true).

Coba maneh karo `country: "id"` (exit Indonesia) kanggo GET + POST.
Yen regulation_jurisdiction dadi "ID" lan created_user_id metu -> masalah selesai.
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


def bd(url, metode='GET', body=None, hdr=None, wektu=85, **extra):
    global PULET
    PULET += 1
    b = {'zone': 'cli_unlocker', 'url': url, 'format': 'json'}
    if metode != 'GET':
        b['method'] = metode
    if body is not None:
        b['body'] = body
    if hdr:
        b['headers'] = hdr
    b.update(extra)
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


DEPAN = ['Adit', 'Dimas', 'Rico', 'Bagas', 'Rizky', 'Citra', 'Andi']
BLKG = ['Kusuma', 'Hidayat', 'Nugroho', 'Wijaya', 'Pratama', 'Santoso']


def variabel(email, umur=25):
    thn = int(time.strftime('%Y')) - umur
    return {"input": {
        "actor_id": "0", "client_mutation_id": str(uuid.uuid4()), "machine_id": "",
        "next_uri": "undefined",
        "reg_data": {
            "birthday_day": random.randint(2, 27), "birthday_month": random.randint(1, 12),
            "birthday_year": thn,
            "contactpoint": {"sensitive_string_value": email}, "contactpoint_type": "EMAIL",
            "custom_gender": "", "did_use_age": True,
            "firstname": {"sensitive_string_value": random.choice(DEPAN)},
            "fullname": {"sensitive_string_value": ""}, "ig_age_block_data": None,
            "lastname": {"sensitive_string_value": random.choice(BLKG)},
            "preferred_pronoun": None,
            "reg_passwd__": {"sensitive_string_value": 'Aa' + acak(9) + '1!'},
            "sex": "MALE", "use_custom_gender": False,
            "username": {"sensitive_string_value": ""}},
        "sk_pipa_consent_given": None, "waterfall_id": str(uuid.uuid4())}}


def body_post(t, email, umur=25):
    f = [('av', '0'), ('__user', '0'), ('__a', '1'), ('__comet_req', '102'), ('dpr', '1'),
         ('__ccg', 'EXCELLENT'), ('lsd', t['lsd']), ('jazoest', t['jazoest']),
         ('fb_api_caller_class', 'RelayModern'), ('fb_api_req_friendly_name', NAMA_MUTASI),
         ('server_timestamps', 'true'), ('doc_id', DOC_ID),
         ('variables', json.dumps(variabel(email, umur), ensure_ascii=False, separators=(',', ':')))]
    for k, n in (('rev', '__rev'), ('spin_r', '__spin_r'), ('spin_b', '__spin_b'), ('spin_t', '__spin_t')):
        if t.get(k):
            f.append((n, t[k]))
    return '&'.join('%s=%s' % (k, up.quote_plus(str(v))) for k, v in f)


HDR_BD = {'content-type': 'application/x-www-form-urlencoded', 'origin': 'https://m.facebook.com',
          'referer': 'https://m.facebook.com/reg/'}
REG = 'https://m.facebook.com/reg/'
APIURL = 'https://www.facebook.com/api/graphql/'


def ringkes(badan):
    b = re.sub(r'\s+', ' ', badan or '')
    uid = (re.search(r'"created_user_id":"?(\d{6,})"?', b) or [None, '-'])[1]
    m2 = re.search(r'"regulation_jurisdiction":(?:"([A-Z_]{0,8})"|(null))', b)
    juris = (m2.group(1) or m2.group(2)) if m2 else '-'
    youth = (re.search(r'"youth_regulation_enabled":(\w+)', b) or [None, '-'])[1]
    umur = (re.search(r'"age_range":"([^"]{0,6})"', b) or [None, '-'])[1]
    kode = ','.join(re.findall(r'"code":"([A-Z_]{4,40})"', b)) or '-'
    return uid, juris, youth, umur, kode


print('=== 0. ASN exit saben negara (AMD dudu residential = masalahe?) ===')
for n in ('id', 'de', 'sg', 'in'):
    st, g, _ = bd('https://geo.brdtest.com/mygeo.json', country=n)
    org = (re.search(r'"org_name":"([^"]{0,34})', g or '') or [None, '-'])[1]
    asn = (re.search(r'"asnum":(\d+)', g or '') or [None, '-'])[1]
    log('  %-3s HTTP %s | ASN %-8s %s' % (n, st, asn, org))

for negara in ('de', 'sg', 'in'):
    label = 'exit=%s' % (negara or 'otomatis')
    print('\n=== %s ===' % label)
    extra = {'country': negara} if negara else {}
    st1, isi_t, _ = bd(REG, **extra)
    t = token(isi_t)
    log('  GET /reg/  HTTP %s | %d byte | LSD %s' %
        (st1, len(isi_t), (t['lsd'][:14] + '…') if t['lsd'] else '-'))
    if not t['lsd']:
        continue
    for d, umur in (('gmail.com', 25), ('gmail.com', 41)):
        em = 'fb' + acak(9) + '@' + d
        st2, isi2, _ = bd(APIURL, metode='POST', body=body_post(t, em, umur), hdr=HDR_BD, **extra)
        uid, juris, youth, umur, kode = ringkes(isi2)
        log('  %-15s POST HTTP %s | uid %-14s juris %-6s youth %-5s umur %-4s %s'
            % (d, st2, uid, juris, youth, umur, kode))
        if uid != '-':
            log('     >>> SUKSES: %s  (%s)' % (uid, em))
            json.dump({'uid': uid, 'email': em, 'negara': negara},
                      open('/tmp/opencode/bd_sukses.json', 'w'), ensure_ascii=False)

log('total request Bright Data: %d' % PULET)
