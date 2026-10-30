"""Cari endpoint auth yang dipakai halaman Daftar Shopee dengan nge-grep JS bundle-nya."""
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

import requests
from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-email")
SIGNUP = "https://shopee.co.id/buyer/login/signup"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"}

RE_EP = re.compile(r"[\"'`]/(?:s?api|api)/[A-Za-z0-9_./{}$-]{6,110}[\"'`]")
RE_HOT = re.compile(r"(signup|sign_up|email|otp|verif|register|password)", re.I)

scripts, hits = set(), {}

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(user_data_dir=str(PROFILE), headless=True, locale="id-ID")
    page = ctx.new_page()
    page.goto(SIGNUP, wait_until="networkidle", timeout=90_000)
    page.wait_for_timeout(3000)
    for url in page.evaluate("() => Array.from(document.scripts).map(s => s.src).filter(Boolean)"):
        scripts.add(url)
    for req in page.evaluate("""() => performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').map(r => r.name)"""):
        scripts.add(req)
    ctx.close()

scripts = {s for s in scripts if s.startswith("http")}
print(f"script ketemu: {len(scripts)}")

interesting = [s for s in scripts if RE_HOT.search(s)] or list(scripts)
print(f"diproses (cocok kata kunci auth): {len(interesting)}")

for url in interesting[:40]:
    try:
        r = requests.get(url, headers=UA, timeout=30)
        if r.status_code != 200 or len(r.text) > 6_000_000:
            continue
        for m in RE_EP.findall(r.text):
            ep = m.strip("\"'`")
            if RE_HOT.search(ep) and "v4/account" not in ep:
                hits.setdefault(ep, Path(url).name[:40])
    except Exception as exc:
        print("  skip", url[:80], str(exc)[:60])

print(f"\nENDPOINT auth yang dipakai JS ({len(hits)}):")
for ep in sorted(hits):
    print("  ", ep)

mailish = [e for e in hits if "email" in e.lower()]
print("\nyang menyebut EMAIL:", mailish if mailish else "TIDAK ADA")
Path(OUT / "signup_endpoints.txt").write_text("\n".join(sorted(hits)), encoding="utf-8")
