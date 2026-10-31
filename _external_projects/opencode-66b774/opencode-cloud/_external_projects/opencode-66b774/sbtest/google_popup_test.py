"""Pastikan klik 'Daftar dengan Google' beneran membuka popup OAuth (bukti jalur email bisa diotomasi)."""
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-google")
SIGNUP = "https://shopee.co.id/buyer/login/signup"

popup_urls, net_urls = [], []

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE), headless=True, locale="en-US",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
    ctx.on("page", lambda p: popup_urls.append(p.url))
    page = ctx.new_page()
    page.on("request", lambda r: net_urls.append(r.url) if re.search(r"accounts\.google|oauth|facebook\.com/.*dialog", r.url) else None)

    try:
        page.goto(SIGNUP, wait_until="domcontentloaded", timeout=60_000)
    except Exception as exc:
        print("goto:", str(exc).splitlines()[0][:80])
    page.wait_for_timeout(5000)

    btn = page.locator("button:has-text('Google')").first
    print("tombol:", btn.count(), "| visible:", btn.is_visible() if btn.count() else "-")
    try:
        btn.scroll_into_view_if_needed()
    except Exception:
        pass

    # klik beneran (mouse move + click), lalu klik via JS sebagai pembanding
    try:
        btn.click(timeout=5000, delay=120)
    except Exception as exc:
        print("click biasa gagal:", str(exc).splitlines()[0][:80])
    page.wait_for_timeout(6000)
    if not popup_urls:
        try:
            btn.dispatch_event("click")
            print("dispatch_event click dikirim")
        except Exception as exc:
            print("dispatch gagal:", str(exc).splitlines()[0][:80])
        page.wait_for_timeout(6000)

    print("POPUP yang terbuka:", popup_urls or "tidak ada")
    print("REQUEST oauth terdeteksi:")
    for u in net_urls[:6]:
        print("  ", u[:170])

    for p in list(popup_urls):
        pass
    for p in ctx.pages[1:]:
        p.wait_for_timeout(4000)
        print("  popup URL:", p.url[:150], "| title:", p.title()[:60])
        fields = p.evaluate("() => Array.from(document.querySelectorAll('input')).map(i => ({n:i.name,t:i.type,id:i.id}))")
        print("  field:", json.dumps(fields)[:220])
        txt = p.evaluate("() => (document.body && document.body.innerText || '').replace(/\\s+/g,' ').slice(0,260)")
        print("  teks:", txt[:220])
        p.screenshot(path=str(OUT / "google-popup.png"))

    page.screenshot(path=str(OUT / "after-google-click.png"))
    ctx.close()
