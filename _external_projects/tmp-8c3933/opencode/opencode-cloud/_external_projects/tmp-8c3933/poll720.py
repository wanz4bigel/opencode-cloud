import re, hashlib, time, random, string, urllib.request
UK, SHAREID, SURL = 81365714511198, 320998351762, "gXsxIflLphVN7DsSmyQgPg"
FID = 136311564232077
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"}), timeout=25).read().decode('utf-8','replace')
def mk(ct, type_, extra=""):
    bid = ''.join(random.choices(string.hexdigits.lower(), k=32))
    ts = int(time.time()) + 600
    sign = hashlib.md5(f"0chunlei{bid}{ts}".encode()).hexdigest()
    return (f"https://www.terabox.app/share/streaming.m3u8?uk={UK}&shareid={SHAREID}&type={type_}"
            f"&fid={FID}&sign={sign}&timestamp={ts}&clienttype={ct}&app_id=250528&web=1&channel=chunlei"
            f"&short_link={SURL}&share_exp_num=a&play_from={extra}")
log = open('/tmp/poll720.log','w')
# trigger transcode berkali-kali, poll 6 menit
for r in range(9):
    for ct, t in [("8","M3U8_FLV_264_720"),("8","M3U8_AUTO_720")]:
        try:
            b = get(mk(ct,t))
            n = len(re.findall(r'#EXTINF', b))
            line = f"[{time.strftime('%H:%M:%S')}] round{r} ct={ct} {t}: " + (f"OK {n} segmen" if "#EXTM3U" in b else b[:44].strip())
        except Exception as e:
            line = f"[{time.strftime('%H:%M:%S')}] round{r} ERR {e}"
        log.write(line+"\n"); log.flush(); print(line)
    time.sleep(40)
