"""Probe alur registrasi akun Shopee (halaman + API yang dipakai)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, "/home/runner/shopee-bot")
from playwright.sync_api import sync_playwright

import shopee_bot

PROFILE = Path("/tmp/opencode/sbtest/profile-signup")
OUT = Path("/tmp/opencode/shopee-real")
OUT.mkdir(parents=True, exist_ok=True)
PROFILE.mkdir(parents=True, exist_ok=True)

TARGETS = [
    "https://shopee.co.id/buyer/login/signup",
    "https://shopee.co.id/buyer/login",
]

pw = sync_playwright().start()
ctx = pw.chromium.launch_persistent_context(
    user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta")
# jangan inject bot di probe ini, kita mau lihat perilaku murni Shopee
page = ctx.new_page()
api_calls = []
page.on("request", lambda r: api_calls.append((r.method, r.url)) if "/api/" in r.url else None)

for url in TARGETS:
    api_calls.clear()
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        page.wait_for_timeout(6000)
        print("=" * 70)
        print("URL:", url, "->", resp.status if resp else "?", "| akhir:", page.url)
        print("TITLE:", page.title())
        txt = page.evaluate("() => (document.body && document.body.innerText || '').replace(/\\s+/g,' ').slice(0, 300)")
        print("TEKS:", txt)
        fields = page.evaluate("""() => Array.from(document.querySelectorAll('input,select')).map(i => ({
            name: i.name || null, id: i.id || null, type: i.type || null,
            ph: i.placeholder || null, aria: i.getAttribute('aria-label')}))""")
        print("FIELD:", json.dumps(fields, ensure_ascii=False)[:600])
        btns = page.evaluate("() => Array.from(document.querySelectorAll('button,[role=button],a')).map(b => (b.textContent||'').trim()).filter(t => t && t.length < 28).slice(0, 25)")
        print("TOMBOL:", json.dumps(btns, ensure_ascii=False)[:500])
        print("API:", "\n     ".join(f"{m} {u.split('shopee.co.id')[-1][:110]}" for m, u in api_calls[:18]))
        page.screenshot(path=str(OUT / f"signup-{url.rsplit('/', 1)[-1]}.png"))
    except Exception as exc:
        print("=" * 70)
        print("GAGAL", url, "->", exc)

print("\nCOOKIES:", sorted({c["name"] for c in ctx.cookies()})[:14])
ctx.close()
pw.stop()
