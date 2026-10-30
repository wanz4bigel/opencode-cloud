"""Probe akhir: header x-app-type + payload lengkap utk jalur email OTP."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

PROFILE = Path("/tmp/opencode/sbtest/profile-email-signup")
HOME = "https://shopee.co.id/"
EMAIL = "spbt.apptype@mail.tm"


def main():
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()
        page.goto(HOME, wait_until="domcontentloaded", timeout=90_000)
        page.wait_for_timeout(4000)
        csrf = next((c["value"] for c in ctx.cookies() if c["name"] == "csrftoken"), "")

        def call(path, body, app_type=None, extra=None):
            hdr = {"Content-Type": "application/json", "x-requested-with": "XMLHttpRequest",
                   "x-shopee-language": "id", "x-api-source": "pc", "x-csrf-token": csrf,
                   "x-sz-sdk-version": "1.12.45", "Referer": HOME}
            if app_type is not None:
                hdr["x-app-type"] = str(app_type)
            if extra:
                hdr.update(extra)
            r = ctx.request.post("https://shopee.co.id" + path, data=json.dumps(body), timeout=25000, headers=hdr)
            print(f"  {path.split('/')[-1]:26} app_type={app_type} :: {r.status} {r.text()[:150]}".replace("\n", " "))

        print("== init_email_otp (matriks app-type + body) ==")
        call("/api/v4/otp/init_email_otp", {"email": EMAIL, "language": "id"}, None)
        call("/api/v4/otp/init_email_otp", {"email": EMAIL, "language": "id"}, 1)
        call("/api/v4/otp/init_email_otp", {"email": EMAIL, "language": "id", "operation": "sign_up"}, 1)
        call("/api/v4/otp/init_email_otp", {"email": EMAIL, "language": "id", "first_otp": True,
                                            "supported_channels": [1]}, 1)

        print("\n== send_email_otp ==")
        call("/api/v4/otp/send_email_otp", {"email": EMAIL, "language": "id"}, 1)
        call("/api/v4/otp/send_email_otp", {"email": EMAIL, "language": "id", "operation": "sign_up",
                                            "channel": 1, "force_channel": False}, 1)

        print("\n== login_by_email_otp_token (body minim) ==")
        call("/api/v4/basic/login_by_email_otp_token",
             {"email": EMAIL, "encrypted_email": "", "email_otp_token": "x", "stay_logged_in": True}, 1)
        call("/api/v4/basic/login_by_email_otp_token",
             {"email": EMAIL, "encrypted_email": "", "email_otp_token": "x",
              "third_party_signup_method": "none", "stay_logged_in": True}, 1)

        print("\n== login_by_password (password harus RSA) ==")
        call("/api/v4/account/login_by_password",
             {"login_key": EMAIL, "password": "SalahPwd123!", "stay_logged_in": True}, 1)
        call("/api/v4/account/login_by_password",
             {"login_key": EMAIL, "password": "SalahPwd123!", "encrypted_password": "SalahPwd123!",
              "stay_logged_in": True}, 1)
        ctx.close()


if __name__ == "__main__":
    main()
