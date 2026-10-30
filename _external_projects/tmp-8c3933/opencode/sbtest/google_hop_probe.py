"""Tes jalur 'Daftar dengan Google' (email-based): sampai mana otomasinya jalan?"""
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-google")
PROFILE.mkdir(parents=True, exist_ok=True)
SIGNUP = "https://shopee.co.id/buyer/login/signup"
EMAIL = "spbt.mailprobe@gmail.com"

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE), headless=True, locale="en-US", timezone_id="Asia/Jakarta",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
    page = ctx.new_page()
    try:
        page.goto(SIGNUP, wait_until="domcontentloaded", timeout=60_000)
    except Exception as exc:
        print("goto:", str(exc).splitlines()[0][:90])
    page.wait_for_timeout(5000)

    btn = page.get_by_role("button", name=re.compile("google", re.I)).first
    if not btn.count():
        btn = page.locator("a:has-text('Google'), [role=button]:has-text('Google')").first
    print("tombol Google ketemu:", bool(btn.count()))

    try:
        with ctx.expect_page(timeout=15000) as pop_info:
            btn.click(timeout=5000)
        gpage = pop_info.value
    except Exception:
        gpage = page  # navigasi di tab yang sama
    gpage.wait_for_timeout(6000)

    print("URL Google:", gpage.url[:150])
    print("Title:", gpage.title()[:80])
    fields = gpage.evaluate("""() => Array.from(document.querySelectorAll('input')).map(i => ({
        name: i.name || null, type: i.type || null, id: i.id || null, ph: i.placeholder || null}))""")
    print("Field:", json.dumps(fields, ensure_ascii=False)[:400])
    txt = gpage.evaluate("() => (document.body && document.body.innerText || '').replace(/\\s+/g,' ').slice(0,300)")
    print("Teks:", txt[:260])

    # coba isi email dan lanjut (kalau form-nya terbuka)
    email_box = gpage.locator("input[type=email], input[name=identifier], input#identifierId").first
    if email_box.count():
        email_box.fill(EMAIL)
        try:
            gpage.get_by_role("button", name=re.compile("next|berikut|lanjut", re.I)).first.click(timeout=4000)
        except Exception:
            try:
                email_box.press("Enter")
            except Exception:
                pass
        gpage.wait_for_timeout(8000)
        print("Setelah isi email -> URL:", gpage.url[:150])
        t2 = gpage.evaluate("() => (document.body && document.body.innerText || '').replace(/\\s+/g,' ').slice(0,300)")
        print("Setelah isi email -> Teks:", t2[:260])
    else:
        print("Form email Google gak muncul (blocked / langsung minta consent / popup beda).")
    gpage.screenshot(path=str(OUT / "google-oauth-hop.png"))
    ctx.close()
