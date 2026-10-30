"""Cek bot langsung ke https://shopee.co.id (tanpa login, IP datacenter)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, "/home/runner/shopee-bot")
from playwright.sync_api import sync_playwright

import shopee_bot

PROFILE = Path.home() / ".shopee-bot" / "profile"
OUT = Path("/tmp/opencode/shopee-real")
OUT.mkdir(parents=True, exist_ok=True)
URL = "https://shopee.co.id/"

pw = sync_playwright().start()
ctx = pw.chromium.launch_persistent_context(user_data_dir=str(PROFILE), headless=True, locale="id-ID",
                                            timezone_id="Asia/Jakarta")
ctx.add_init_script(shopee_bot.userscript_source())
page = ctx.new_page()
logs = []
page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
page.on("pageerror", lambda e: logs.append(f"[pageerror] {e}"))

resp = page.goto(URL, wait_until="domcontentloaded", timeout=90_000)
print("HTTP:", resp.status if resp else "?", "| URL akhir:", page.url)
print("Title:", page.title())
try:
    page.wait_for_function("() => !!window.SHOPEE_BOT", timeout=15_000)
    print("Userscript ter-inject: YA")
except Exception as exc:
    print("Userscript ter-inject: TIDAK ->", exc)

# jalanin misi seperti perintah `once`
try:
    page.evaluate("() => window.SHOPEE_BOT.run('missions')")
except Exception as exc:
    print("run('missions') gagal:", exc)

page.wait_for_timeout(12000)
try:
    st = page.evaluate("() => (window.SHOPEE_BOT && window.SHOPEE_BOT.status()) || null")
    print("STATUS:", json.dumps(st, indent=2, ensure_ascii=False))
except Exception as exc:
    print("status() gagal:", exc)
    st = None

body = page.evaluate("() => (document.body && document.body.innerText || '').replace(/\\s+/g,' ').slice(0, 400)")
print("TEKS HALAMAN:", body or "(kosong)")
print("COOKIES:", sorted({c["name"] for c in ctx.cookies()})[:15])
page.screenshot(path=str(OUT / "shopee-home.png"), full_page=False)

# coba halaman misi juga (halaman yang dituju bot)
try:
    page.goto("https://shopee.co.id/m/rewards", wait_until="domcontentloaded", timeout=60_000)
    page.wait_for_timeout(8000)
    print("MISI title:", page.title(), "| url:", page.url)
    print("MISI teks:", page.evaluate("() => (document.body && document.body.innerText || '').replace(/\\s+/g,' ').slice(0, 300)"))
    print("MISI tombol Klaim/Check:", page.evaluate(
        "() => Array.from(document.querySelectorAll('button,[role=button]')).map(b => (b.textContent||'').trim()).filter(t => t && t.length < 30).slice(0, 25)"
    ))
    page.screenshot(path=str(OUT / "shopee-missions.png"), full_page=False)
except Exception as exc:
    print("halaman misi gagal:", exc)

print("\n--- LOG BOT (ShopeeAutoBot saja) ---")
(OUT / "probe-console.log").write_text("\n".join(logs), encoding="utf-8")
mine = [l for l in logs if "ShopeeAutoBot" in l or "[pageerror]" in l]
for line in mine[:40]:
    print(line[:300])
print("(log lengkap:", OUT / "probe-console.log", ")")

ctx.close()
pw.stop()
