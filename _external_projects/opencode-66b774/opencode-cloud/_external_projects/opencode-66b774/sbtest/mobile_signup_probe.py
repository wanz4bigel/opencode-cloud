"""Cek jalur daftar via mobile/app: apakah ada opsi EMAIL, dan endpoint /sapi apa yang dipakai."""
import json
import re
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
OUT.mkdir(parents=True, exist_ok=True)
PROFILE = Path("/tmp/opencode/sbtest/profile-mobile")
PROFILE.mkdir(parents=True, exist_ok=True)

MOBILE_UA = ("Mozilla/5.0 (Linux; Android 13; SM-A525F) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36")
UA = {"User-Agent": MOBILE_UA}
URLS = [
    "https://m.shopee.co.id/",
    "https://m.shopee.co.id/buyer/login/signup",
    "https://shopee.co.id/buyer/login/signup?from=mobile",
]
RE_EP = re.compile(r"[\"'`]/(?:sapi|api|buyer_stage)/[A-Za-z0-9_./{}$-]{4,110}[\"'`]")
RE_HOT = re.compile(r"(signup|sign_up|register|email|otp|verif|login)", re.I)

JS_STATE = """() => {
  const txt = (document.body && document.body.innerText) || '';
  const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
    name: i.name || null, type: i.type || null, ph: i.placeholder || null,
    aria: i.getAttribute('aria-label')}));
  const clickables = Array.from(document.querySelectorAll('button,[role=button],a,label,span,div'))
    .map(e => (e.textContent || '').trim()).filter(t => t && t.length < 34);
  return {
    url: location.href,
    title: document.title,
    textSnippet: txt.replace(/\\s+/g,' ').slice(0, 320),
    mentionsEmail: /email/i.test(txt),
    emailInputs: inputs.filter(i => /email/i.test((i.name||'') + (i.ph||'') + (i.aria||'')) || i.type === 'email'),
    emailTexts: Array.from(new Set(clickables.filter(t => /email/i.test(t)))).slice(0, 10),
    inputs: inputs.slice(0, 12),
    clickables: Array.from(new Set(clickables)).slice(0, 18),
  };
}"""

hits = {}
with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
        user_agent=MOBILE_UA, viewport={"width": 412, "height": 915}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    for url in URLS:
        print("=" * 74)
        print("MOBILE:", url)
        try:
            resp = page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            page.wait_for_timeout(6000)
            st = page.evaluate(JS_STATE)
            print("  HTTP", resp.status if resp else "?", "->", st["url"])
            print("  title:", st["title"][:70])
            print("  ada kata email:", st["mentionsEmail"], "| input email:", json.dumps(st["emailInputs"], ensure_ascii=False)[:200])
            print("  teks email:", json.dumps(st["emailTexts"], ensure_ascii=False))
            print("  inputs:", json.dumps(st["inputs"], ensure_ascii=False)[:320])
            print("  tombol:", json.dumps(st["clickables"], ensure_ascii=False)[:340])
            print("  teks:", st["textSnippet"][:200])
            page.screenshot(path=str(OUT / f"mobile-{url.rsplit('/',1)[-1][:18] or 'home'}.png"))
        except Exception as exc:
            print("  GAGAL:", str(exc).splitlines()[0][:120])
            continue

        srcs = set(page.evaluate("() => Array.from(document.scripts).map(s => s.src).filter(Boolean)"))
        srcs |= set(page.evaluate("() => performance.getEntriesByType('resource').filter(r => r.initiatorType==='script').map(r => r.name)"))
        srcs = {s for s in srcs if s.startswith("http")}
        got = 0
        for u in list(srcs)[:45]:
            try:
                r = requests.get(u, headers=UA, timeout=30)
                if r.status_code != 200:
                    continue
                for m in RE_EP.findall(r.text):
                    ep = m.strip("\"'`")
                    if RE_HOT.search(ep):
                        hits.setdefault(ep, Path(u).name[:34])
                        got += 1
            except Exception:
                pass
        print(f"  script: {len(srcs)} | endpoint auth ditemukan bertambah: {got}")

    ctx.close()

print("=" * 74)
print(f"\nSEMUA ENDPOINT AUTH ({len(hits)}):")
for ep in sorted(hits):
    print("  ", ep)
emails = [e for e in hits if "email" in e.lower()]
print("\nENDPOINT yang menyebut EMAIL:", emails if emails else "TIDAK ADA")
Path(OUT / "mobile_endpoints.txt").write_text("\n".join(sorted(hits)), encoding="utf-8")
