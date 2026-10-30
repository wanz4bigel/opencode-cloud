"""Tes endpoint email OTP dgn header lengkap ala web (X-CSRFToken, x-api-source, x-sz-sdk-version)."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

PROFILE = Path("/tmp/opencode/sbtest/profile-email-signup")
HOME = "https://shopee.co.id/"
EMAIL = "spbt.csrf.probe@mail.tm"

ENDPOINTS = [
    ("POST", "/api/v4/otp/init_email_otp", {"email": EMAIL, "language": "id", "scene": "email_otp"}),
    ("POST", "/api/v4/otp/send_email_otp", {"email": EMAIL, "language": "id", "scene": "email_otp"}),
    ("POST", "/api/v4/otp/verify_email_otp", {"email": EMAIL, "vcode": "123456"}),
    ("POST", "/api/v4/basic/login_by_email_otp_token", {"email": EMAIL, "email_otp_token": "", "stay_logged_in": True}),
    ("POST", "/api/v4/account/signup_by_otp", {"otp_token": "", "username": "spbtprobe", "stay_logged_in": True}),
    ("GET", "/api/v4/otp/get_settings_v2", {"phone_number": "8818524515", "country_code": "62", "vcode_type": "0"}),
    ("GET", "/api/v4/otp/get_settings", {"phone_number": "8818524515", "country_code": "62", "type": "0"}),
]


def main():
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()
        page.goto(HOME, wait_until="domcontentloaded", timeout=90_000)
        page.wait_for_timeout(4000)
        csrf = ""
        for c in ctx.cookies():
            if c["name"] == "csrftoken":
                csrf = c["value"]
        print("csrf:", csrf[:24] or "(kosong)")

        hdr = {"Content-Type": "application/json", "x-requested-with": "XMLHttpRequest",
               "x-shopee-language": "id", "x-api-source": "pc", "x-sz-sdk-version": "1.12.45",
               "Referer": HOME}
        if csrf:
            hdr["x-csrf-token"] = csrf

        for method, path, payload in ENDPOINTS:
            try:
                if method == "GET":
                    r = ctx.request.get("https://shopee.co.id" + path, params=payload, timeout=25000, headers=hdr)
                else:
                    r = ctx.request.post("https://shopee.co.id" + path, data=json.dumps(payload), timeout=25000, headers=hdr)
                print(f"{r.status} {method} {path.split('/')[-1]:26} :: {r.text()[:170]}".replace("\n", " "))
            except Exception as exc:
                print(f"ERR {method} {path} :: {str(exc).splitlines()[0][:90]}")

        print("\n-- varian scene utk init_email_otp --")
        for scene in ("email_otp", "signup", "login", "email_signup", "register", ""):
            body = {"email": EMAIL, "language": "id"} | ({"scene": scene} if scene else {})
            r = ctx.request.post("https://shopee.co.id/api/v4/otp/init_email_otp", data=json.dumps(body),
                                 timeout=25000, headers=hdr)
            print(f"  scene={scene or '-':12} -> {r.text()[:120]}".replace("\n", " "))
        ctx.close()


if __name__ == "__main__":
    main()
