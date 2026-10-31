#!/usr/bin/env python3
"""probe_brightdata4.py - TES PENENTU: daftar akun Facebook beneran liwat
Bright Data Web Unlocker (rotation IP saben request = 1 akun per IP).

Alur:
  1) GET https://m.facebook.com/reg/  -> token LSD + jazoest  (IP A)
  2) POST https://www.facebook.com/api/graphql/ mutation pendaftaran (IP B)
  3) yen uid metu -> cek email sementara (mail.tm) -> kode -> konfirmasi (IP C)

Kagem ~4 request Bright Data saben akun.
"""
import json, re, sys, os, time, uuid, random, string, urllib.request

def _mailbox_mailtm():
    """mail.tm mandiri (folder Haki-Fb ilang, dadi API-e ditandur ing kene)."""
    import urllib.request as u, urllib.error
    D = json.loads(_http('GET', 'https://api.mail.tm/domains').read().decode()).get('hydra:member') or []
    if not D:
        return None
    domein = D[0]['domain']
    email = 'fb%s@%s' % (acak(9), domein)
    pw = 'Kotak' + acak(6) + '!'
    badan = json.dumps({'address': email, 'password': pw}).encode()
    try:
        r = u.urlopen(u.Request('https://api.mail.tm/accounts', data=badan, method='POST',
                                headers={'Content-Type': 'application/json',
                                         'user-agent': 'Mozilla/5.0'}), timeout=25)
        j = json.loads(r.read().decode())
        tok = (j.get('token') or '')
    except Exception as e:
        log('   mailbox gagal: %s %s' % (type(e).__name__, str(e)[:90]))
        return None
    if not tok:
        try:
            r = u.urlopen(u.Request('https://api.mail.tm/token', data=badan, method='POST',
                                    headers={'Content-Type': 'application/json'}), timeout=25)
            tok = json.loads(r.read().decode()).get('token', '')
        except Exception:
            return None
    return {'email': email, 'token': tok, 'sandi': pw, 'provider': 'mailtm'}


def _http(metode, url, data=None, hdr=None):
    import urllib.request as u
    return u.urlopen(u.Request(url, data=data, method=metode,
                               headers=hdr or {'user-agent': 'Mozilla/5.0'}), timeout=25)


def _inbox(mail):
    import urllib.request as u
    try:
        r = u.urlopen(u.Request('https://api.mail.tm/messages',
                                headers={'user-agent': 'Mozilla/5.0',
                                         'authorization': 'Bearer ' + mail['token']}), timeout=25)
        j = json.loads(r.read().decode())
        return j.get('hydra:member') or j.get('member') or []
    except Exception:
        return []


def _kode_link(mail):
    import urllib.request as u
    kode, link = '', []
    for m in _inbox(mail)[:5]:
        try:
            r = u.urlopen(u.Request('https://api.mail.tm/messages/%s' % m.get('id'),
                                    headers={'user-agent': 'Mozilla/5.0',
                                             'authorization': 'Bearer ' + mail['token']}), timeout=25)
            j = json.loads(r.read().decode())
        except Exception:
            continue
        teks = (j.get('text') or '') + (j.get('html') or [''] if isinstance(j.get('html'), list) else [j.get('html') or ''])
        teks = ' '.join(teks)
        kirim = (m.get('from') or {}).get('address', '')
        if 'facebook' not in kirim.lower():
            continue
        k = re.search(r'\b(\d{5})\b', teks)
        if k and not kode:
            kode = k.group(1)
        link += re.findall(r'https?://[^\s"\'<>]*(?:confirm|reg/confirm|contactpoint)[^\s"\'<>]*', teks)
    return kode, link, ''


NAMA_DEPAN = ['Adit', 'Dimas', 'Rico', 'Bagas', 'Doni', 'Citra', 'Andi', 'Rizky']
NAMA_BLKG = ['Kusuma', 'Hidayat', 'Nugroho', 'Wijaya', 'Pratama', 'Lestari', 'Santoso', 'Hakim']


class _Haki:
    bikin_mailbox_mailtm = staticmethod(lambda: _mailbox_mailtm())
    bikin_mailbox_guerrilla = staticmethod(lambda: None)
    nama_baru = staticmethod(lambda: (random.choice(NAMA_DEPAN), random.choice(NAMA_BLKG)))
    baca_inbox = staticmethod(lambda mail: _inbox(mail))
    ambil_kode_dan_link = staticmethod(lambda mail: _kode_link(mail))


haki = _Haki()

KUNCI = '6466e50f-1cf0-4328-8a89-34714a31f917'
API = 'https://api.brightdata.com/request'
ZONE = 'cli_unlocker'
DOC_ID = '27029416779977343'
NAMA_MUTASI = 'useCAARegistrationFormSubmitMutation'
MULAI = time.time()
PULET = 0


def log(x):
    print('[%4.0fs] %s' % (time.time() - MULAI, x), flush=True)


def bd(url, metode='GET', body=None, hdr=None, wektu=80, **extra):
    """siji request liwat Bright Data; bali (status, body, headers)."""
    global PULET
    PULET += 1
    b = {'zone': ZONE, 'url': url, 'format': 'json'}
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
        return 0, '%s: %s' % (type(e).__name__, str(e)[:180]), {}
    try:
        j = json.loads(mentah)
        return j.get('status_code'), (j.get('body') or ''), (j.get('headers') or {})
    except Exception:
        return 0, mentah, {}


def acak(n):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))


import urllib.parse as up

print('=' * 66)
print('DAFTAR AKUN FB LIWAT BRIGHT DATA (%s)' % ZONE)
print('=' * 66)

# ---- 1. halaman daftar ----
st, isi, hdr = bd('https://m.facebook.com/reg/')
lsd = (re.search(r'\["LSD",\[\],\{"token":"([^"]+)"\}', isi)
       or re.search(r'name="lsd"[^>]*value="([^"]+)"', isi))
jaz = re.search(r'jazoest=(\d+)', isi)
ins = re.search(r'"reg_instance":"([^"]+)"', isi)
g = lambda pola, cad='': (re.search(pola, isi).group(1) if re.search(pola, isi) else cad)
spin_r = g(r'"__spin_r":"?(\d+)"?')
spin_rev = g(r'"__rev":"?(\d+)"?')
spin_t = g(r'"__spin_t":"?(\d+)"?', str(int(time.time())))
spin_b = g(r'"__spin_b":"([^"]+)"', 'trunk')
log('1) GET /reg/        HTTP %s | %d byte | LSD %s | jazoest %s' %
    (st, len(isi), (lsd.group(1)[:12] + '…') if lsd else '-', jaz.group(1) if jaz else '-'))
if not lsd:
    log('   token ilang -> mandheg. cuplikan: %r' % re.sub(r'\s+', ' ', isi)[:160])
    sys.exit(1)

# ---- 2. mailbox + data akun ----
kotak = haki.bikin_mailbox_mailtm() or haki.bikin_mailbox_guerrilla()
if not kotak:
    sys.exit('mailbox gagal')
email = kotak['email']
depan, belakang = haki.nama_baru()
sandi = 'Aa' + acak(9) + '1!'
bln, hr, thn = random.randint(1, 12), random.randint(2, 27), random.randint(1988, 2003)
log('2) mailbox          %s | %s %s | %d/%d/%d' % (email, depan, belakang, hr, bln, thn))

var = {"input": {
    "actor_id": "0", "client_mutation_id": str(uuid.uuid4()), "machine_id": "",
    "next_uri": "undefined",
    "reg_data": {
        "birthday_day": hr, "birthday_month": bln, "birthday_year": thn,
        "contactpoint": {"sensitive_string_value": email}, "contactpoint_type": "EMAIL",
        "custom_gender": "", "did_use_age": False,
        "firstname": {"sensitive_string_value": depan},
        "fullname": {"sensitive_string_value": ""}, "ig_age_block_data": None,
        "lastname": {"sensitive_string_value": belakang}, "preferred_pronoun": None,
        "reg_passwd__": {"sensitive_string_value": sandi},
        "sex": "MALE", "use_custom_gender": False,
        "username": {"sensitive_string_value": ""}},
    "sk_pipa_consent_given": None, "waterfall_id": str(uuid.uuid4())}}
form = {'av': '0', '__user': '0', '__a': '1', '__comet_req': '102', 'dpr': '1',
        '__ccg': 'EXCELLENT', 'lsd': lsd.group(1), 'jazoest': jaz.group(1) if jaz else '',
        'fb_api_caller_class': 'RelayModern', 'fb_api_req_friendly_name': NAMA_MUTASI,
        'server_timestamps': 'true', 'doc_id': DOC_ID,
        'variables': json.dumps(var, ensure_ascii=False, separators=(',', ':'))}
if spin_r:
    form.update({'__spin_r': spin_r, '__spin_b': spin_b, '__spin_t': spin_t})
if spin_rev:
    form['__rev'] = spin_rev
badan_post = '&'.join('%s=%s' % (k, up.quote_plus(str(v))) for k, v in form.items())

st2, isi2, hdr2 = bd('https://www.facebook.com/api/graphql/', metode='POST', body=badan_post,
                     hdr={'content-type': 'application/x-www-form-urlencoded',
                          'referer': 'https://m.facebook.com/reg/',
                          'origin': 'https://m.facebook.com'})
bersih = re.sub(r'\s+', ' ', isi2)
uid = (re.search(r'"created_user_id":"?(\d{6,})"?', bersih) or [None, ''])[1]
kode_err = ','.join(re.findall(r'"code":"([A-Z_]{4,40})"', bersih)) or '-'
pesan = (re.search(r'"message":"([^"]{0,110})"', bersih) or [None, '-'])[1]
log('3) POST mutation    HTTP %s | %d byte' % (st2, len(isi2)))
log('   uid      : %s' % (uid or '-'))
log('   kode     : %s' % kode_err)
log('   pesen    : %r' % pesan)
if uid == '' and len(bersih) < 500:
    log('   wangsulan mentah: %r' % bersih[:400])

asil = {'email': email, 'sandi': sandi, 'nama': '%s %s' % (depan, belakang),
        'uid': uid, 'kode': kode_err, 'pesan': pesan, 'request_bd': PULET}

# ---- 3. email verifikasi ----
if uid:
    log('4) nunggu email verifikasi...')
    akhir = time.time() + 120
    kode, link, pengirim = '', [], ''
    while time.time() < akhir:
        pesan_masuk = haki.baca_inbox(kotak)
        if pesan_masuk:
            kode, link, pengirim = haki.ambil_kode_dan_link(kotak)
            if kode or link:
                break
        time.sleep(6)
    log('   pengirim=%s kode=%s link=%d' % (pengirim or '-', kode or '-', len(link)))
    asil['kode_email'] = kode
    for l in link[:2]:
        st3, isi3, _ = bd(l)
        log('   buka link -> HTTP %s | %r' % (st3, re.sub(r'\s+', ' ', isi3)[:130]))
        asil['link_status'] = st3
        asil['link_teks'] = re.sub(r'\s+', ' ', isi3)[:200]

print('\nHASIL: %s' % json.dumps(asil, ensure_ascii=False))
open('/tmp/opencode/bd_hasil.json', 'w').write(json.dumps(asil, ensure_ascii=False, indent=1))
log('total request Bright Data: %d' % PULET)
