"""Grep endpoint login dari JS halaman Login, lalu tes login pakai EMAIL."""
import json
import re
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-email")
LOGIN = "https://shopee.co.id/buyer/login"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"}
RE_EP = re.compile(r"[\"'`]/(?:s?api)/[A-Za-z0-9_./{}$-]{6,110}[\"'`]")
RE_HOT = re.compile(r"(login|authentication|password|email)", re.I)
EMAIL, PHONE = "spbt.probe.test@mail.tm", "8818524515"

endpoints = set()
with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(user_data_dir=str(PROFILE), headless=True, locale="id-ID")
    page = ctx.new_page()
    page.goto(LOGIN, wait_until="networkidle", timeout=90_000)
    page.wait_for_timeout(3000)
    srcs = set(page.evaluate("() => Array.from(document.scripts).map(s => s.src).filter(Boolean)"))
    srcs |= set(page.evaluate("() => performance.getEntriesByType('resource').filter(r => r.initiatorType==='script').map(r => r.name)"))
    srcs = {s for s in srcs if s.startswith("http") and RE_HOT.search(s)}
    print("script login dianalisis:", len(srcs))
    for url in list(srcs)[:25]:
        try:
            r = requests.get(url, headers=UA, timeout=30)
            if r.status_code == 200:
                for m in RE_EP.findall(r.text):
                    ep = m.strip("\"'`")
                    if RE_HOT.search(ep):
                        endpoints.add(ep)
        except Exception:
            pass

    # field apa saja yang diminta form login
    fields = page.evaluate("""() => Array.from(document.querySelectorAll('input')).map(i => ({
        name: i.name, type: i.type, ph: i.placeholder}))""")
    print("field form login:", json.dumps(fields, ensure_ascii=False))

    print("\nENDPOINT login dari JS:")
    for ep in sorted(endpoints):
        print("  ", ep)

    print("\nTES login pakai EMAIL (endpoint kandidat):")
    cands = [e for e in endpoints if "login" in e and "page" not in e] or ["/api/v4/authentication/login"]
    for ep in cands[:6]:
        for label, payload in (("email", {"login_key": EMAIL, "password": "RahasiaKuat123!"}),
                               ("nomor", {"login_key": PHONE, "password": "RahasiaKuat123!"})):
            try:
                r = ctx.request.post("https://shopee.co.id" + ep, data=json.dumps(payload), timeout=25000,
                                     headers={"Content-Type": "application/json",
                                              "x-requested-with": "XMLHttpRequest", "Referer": LOGIN})
                print(f"  {ep} [{label}] -> {r.status} {r.text()[:170]}".replace("\n", " "))
            except Exception as exc:
                print(f"  {ep} [{label}] -> ERR {str(exc).splitlines()[0][:80]}")
    ctx.close()
