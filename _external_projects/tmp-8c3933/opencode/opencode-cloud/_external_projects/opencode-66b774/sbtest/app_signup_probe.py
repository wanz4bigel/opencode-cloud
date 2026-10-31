"""Mobile web signup (host yang bener) + endpoint gaya aplikasi, cari jalur EMAIL."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-mobile")
PROFILE.mkdir(parents=True, exist_ok=True)
SIGNUP = "https://shopee.co.id/buyer/login/signup"
MOBILE_UA = ("Mozilla/5.0 (Linux; Android 13; SM-A525F) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36")
EMAIL, PHONE = "spbt.mailprobe@mail.tm", "8818524515"

APP_HEADERS = {
    "Content-Type": "application/json",
    "x-requested-with": "XMLHttpRequest",
    "x-api-source": "rn",
    "x-app-version": "2.24.01",
    "x-shopee-language": "id",
    "x-os": "android",
    "Referer": SIGNUP,
}

STATE = """() => {
  const txt = (document.body && document.body.innerText) || '';
  const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
    name: i.name || null, type: i.type || null, ph: i.placeholder || null}));
  const click = Array.from(document.querySelectorAll('button,[role=button],a,label,span,div'))
    .map(e => (e.textContent||'').trim()).filter(t => t && t.length < 34);
  return {
    url: location.href, title: document.title,
    mentionsEmail: /email/i.test(txt),
    emailInputs: inputs.filter(i => /email/i.test((i.name||'')+(i.ph||'')) || i.type === 'email'),
    emailTexts: Array.from(new Set(click.filter(t => /email/i.test(t)))).slice(0, 10),
    inputs, clickables: Array.from(new Set(click)).slice(0, 16),
    snippet: txt.replace(/\\s+/g,' ').slice(0, 260),
  };
}"""

ENDPOINTS = [
    ("/api/v4/authentication/signup", {"email": EMAIL, "password": "RahasiaKuat123!", "confirm_password": "RahasiaKuat123!"}),
    ("/api/v4/authentication/signup", {"phone_number": PHONE, "password": "RahasiaKuat123!", "confirm_password": "RahasiaKuat123!"}),
    ("/api/v4/authentication/signup", {}),
    ("/api/v4/authentication/email_signup", {"email": EMAIL, "password": "RahasiaKuat123!"}),
    ("/api/v4/authentication/signup_by_email", {"email": EMAIL, "password": "RahasiaKuat123!"}),
    ("/api/v4/authentication/email/verify/send", {"email": EMAIL}),
    ("/api/v4/authentication/signup/send_email", {"email": EMAIL}),
    ("/api/v4/otp/send_vcode", {"email": EMAIL, "type": 1}),
    ("/api/v4/otp/send_vcode", {"phone_number": PHONE, "type": 0}),
    ("/sapi/buyer_stage/authentication/signup", {"email": EMAIL, "password": "RahasiaKuat123!"}),
    ("/sapi/buyer_stage/otp/send_vcode", {"email": EMAIL, "type": 1}),
]

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
        user_agent=MOBILE_UA, viewport={"width": 412, "height": 915}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    try:
        page.goto(SIGNUP, wait_until="domcontentloaded", timeout=60_000)
    except Exception as exc:
        print("goto (redirect wajar):", str(exc).splitlines()[0][:100])
    page.wait_for_timeout(7000)
    st = page.evaluate(STATE)
    print("URL:", st["url"], "| title:", st["title"][:60])
    print("ada kata 'email' di halaman:", st["mentionsEmail"])
    print("input email:", json.dumps(st["emailInputs"], ensure_ascii=False))
    print("teks email  :", json.dumps(st["emailTexts"], ensure_ascii=False))
    print("semua input :", json.dumps(st["inputs"], ensure_ascii=False)[:300])
    print("tombol      :", json.dumps(st["clickables"], ensure_ascii=False)[:340])
    print("teks        :", st["snippet"][:200])
    page.screenshot(path=str(OUT / "mobile-signup-state.png"))

    print("\nENDPOINT gaya aplikasi (x-api-source: rn):")
    for path, payload in ENDPOINTS:
        label = f"{path.split('/')[-1]} [{list(payload)[0] if payload else '-'}]"
        try:
            r = ctx.request.post("https://shopee.co.id" + path, data=json.dumps(payload),
                                 timeout=25000, headers=APP_HEADERS)
            print(f"  {label:34} -> {r.status} {r.text()[:150]}".replace("\n", " "))
        except Exception as exc:
            print(f"  {label:34} -> ERR {str(exc).splitlines()[0][:70]}")
    ctx.close()
