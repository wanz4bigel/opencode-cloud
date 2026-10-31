"""Tanya langsung ke API OTP Shopee: apa bisa pakai EMAIL, bukan nomor HP?"""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

PROFILE = Path("/tmp/opencode/sbtest/profile-email")
SIGNUP = "https://shopee.co.id/buyer/login/signup"
EMAIL = "spbt.probe.test@mail.tm"
PHONE = "628818524515"

PAYLOADS = [
    ("kosongan", {}),
    ("email saja", {"email": EMAIL}),
    ("email + type", {"email": EMAIL, "type": 2, "language": "id"}),
    ("email + phone_type", {"email": EMAIL, "phone": PHONE, "type": 1}),
    ("nomor saja", {"phone_number": PHONE}),
    ("nomor + type (pembanding)", {"phone_number": PHONE, "type": 0, "language": "id", "is_silent": False}),
]

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(user_data_dir=str(PROFILE), headless=True, locale="id-ID",
                                                timezone_id="Asia/Jakarta")
    page = ctx.new_page()
    page.goto(SIGNUP, wait_until="domcontentloaded", timeout=90_000)
    page.wait_for_timeout(5000)
    print("cookie anti-bot:", "shopee_webUnique_ccd" in {c["name"] for c in ctx.cookies()})

    print("\nPOST /api/v4/otp/send_vcode")
    for label, payload in PAYLOADS:
        try:
            r = ctx.request.post("https://shopee.co.id/api/v4/otp/send_vcode",
                                 data=json.dumps(payload), timeout=25000,
                                 headers={"Content-Type": "application/json",
                                          "x-requested-with": "XMLHttpRequest",
                                          "Referer": SIGNUP})
            body = r.text()[:220].replace("\n", " ")
            print(f"  {label:28} -> {r.status} {body}")
        except Exception as exc:
            print(f"  {label:28} -> ERR {str(exc).splitlines()[0][:90]}")

    print("\nPOST /api/v4/otp/verify_vcode (cek pesan error)")
    for label, payload in (("email", {"email": EMAIL, "vcode": "123456"}),
                           ("nomor", {"phone_number": PHONE, "vcode": "123456"})):
        try:
            r = ctx.request.post("https://shopee.co.id/api/v4/otp/verify_vcode",
                                 data=json.dumps(payload), timeout=25000,
                                 headers={"Content-Type": "application/json",
                                          "x-requested-with": "XMLHttpRequest",
                                          "Referer": SIGNUP})
            print(f"  {label:28} -> {r.status} {r.text()[:200]}")
        except Exception as exc:
            print(f"  {label:28} -> ERR {str(exc).splitlines()[0][:90]}")
    ctx.close()
