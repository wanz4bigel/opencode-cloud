"""Ambil URL OAuth Google/Facebook dari DOM halaman daftar, lalu buka langsung."""
import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-google")
SIGNUP = "https://shopee.co.id/buyer/login/signup"
EMAIL = "spbt.mailprobe@gmail.com"

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE), headless=True, locale="en-US",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
    page = ctx.new_page()
    try:
        page.goto(SIGNUP, wait_until="domcontentloaded", timeout=60_000)
    except Exception as exc:
        print("goto:", str(exc).splitlines()[0][:80])
    page.wait_for_timeout(5000)

    info = page.evaluate("""() => {
      const out = {anchors: [], social: []};
      for (const a of document.querySelectorAll('a[href]')) {
        const h = a.href;
        if (/google|facebook|oauth|auth_client|accounts\\./i.test(h)) out.anchors.push({t: (a.textContent||'').trim().slice(0,20), h: h.slice(0, 220)});
      }
      for (const el of document.querySelectorAll('button,[role=button]')) {
        const t = (el.textContent||'').trim();
        if (/google|facebook/i.test(t)) out.social.push({t: t.slice(0,20), tag: el.tagName,
            href: el.getAttribute('href'), outer: el.outerHTML.slice(0, 200)});
      }
      return out;
    }""")
    print("ANCHOR oauth:", json.dumps(info["anchors"], ensure_ascii=False)[:900])
    print("SOCIAL btn :", json.dumps(info["social"], ensure_ascii=False)[:900])

    oauth = next((a["h"] for a in info["anchors"] if "google" in a["h"]), None)
    if oauth:
        print("\nBUKA LANGSUNG:", oauth[:150], "...")
        try:
            r = ctx.request.get(oauth, timeout=30000, max_redirects=5)
            print("status:", r.status, "final:", r.url[:120])
            body = r.text()
            print("ada form email:", bool(re.search(r'input[^>]+(type="email"|name="identifier")', body)))
            print("teks:", re.sub(r"<[^>]+>", " ", body).replace("\n", " ")[:200])
        except Exception as exc:
            print("gagal:", str(exc).splitlines()[0][:100])
    else:
        print("\nGak ada anchor OAuth di DOM -> tombol diproses lewat JS (butuh klik beneran + popup).")
    ctx.close()
