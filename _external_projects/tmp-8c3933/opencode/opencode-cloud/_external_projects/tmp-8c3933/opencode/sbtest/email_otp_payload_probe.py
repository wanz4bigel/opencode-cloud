"""Cari bentuk payload init/send/verify_email_otp yang bener dengan brute-force kombinasi field."""
import json
import random
import string
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright

PROFILE = Path("/tmp/opencode/sbtest/profile-email-signup")
HOME = "https://shopee.co.id/"
MAILTM = "https://api.mail.tm"
PASSWORD = "RahasiaKuat123!"

domain = requests.get(f"{MAILTM}/domains", timeout=20).json()["hydra:member"][0]["domain"]
user = "spbt" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
EMAIL = f"{user}@{domain}"
requests.post(f"{MAILTM}/accounts", json={"address": EMAIL, "password": PASSWORD}, timeout=20)
print("email:", EMAIL)

BASE = {"email": EMAIL}
FULL = {"email": EMAIL, "language": "id", "password": PASSWORD, "confirm_password": PASSWORD,
        "scene": "signup", "token": "", "is_strict": False, "is_silent": False}

CASES_INIT = [
    ("basic", {"email": EMAIL}),
    ("+language", {"email": EMAIL, "language": "id"}),
    ("+password", {"email": EMAIL, "language": "id", "password": PASSWORD, "confirm_password": PASSWORD}),
    ("+scene", {"email": EMAIL, "language": "id", "scene": "signup"}),
    ("+type2", {"email": EMAIL, "language": "id", "type": 2}),
    ("+flow", {"email": EMAIL, "language": "id", "flow": "signup"}),
    ("+account_type", {"email": EMAIL, "language": "id", "account_type": "email_signup"}),
    ("full", FULL),
]
CASES_SEND = [
    ("basic", {"email": EMAIL}),
    ("+language", {"email": EMAIL, "language": "id"}),
    ("+no token", {"email": EMAIL, "language": "id", "password": PASSWORD, "confirm_password": PASSWORD}),
    ("+empty token", {"email": EMAIL, "language": "id", "email_otp_token": ""}),
    ("+type", {"email": EMAIL, "language": "id", "type": 2, "email_otp_token": ""}),
    ("full", dict(FULL, email_otp_token="")),
]

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
    page = ctx.new_page()
    page.goto(HOME, wait_until="domcontentloaded", timeout=90_000)
    page.wait_for_timeout(4000)

    def post(path, payload):
        r = ctx.request.post("https://shopee.co.id" + path, data=json.dumps(payload), timeout=25000,
                             headers={"Content-Type": "application/json",
                                      "x-requested-with": "XMLHttpRequest", "Referer": HOME})
        return r.status, r.text()[:220].replace("\n", " ")

    for path, cases in (("/api/v4/otp/init_email_otp", CASES_INIT), ("/api/v4/otp/send_email_otp", CASES_SEND)):
        print("\n###", path)
        for label, payload in cases:
            st, body = post(path, payload)
            print(f"  {label:15} -> {st} {body}")

    print("\n### bandingkan: send_vcode (jalur nomor) dengan payload lengkap ala web")
    for label, payload in (
        ("phone lengkap", {"phone": "8818524515", "country_region": "ID", "language": "id",
                           "password": PASSWORD, "confirm_password": PASSWORD, "skip_if_bound": False, "token": ""}),
        ("phone mini", {"phone": "8818524515", "country_phone_code": "62", "language": "id"}),
        ("email di send_vcode", {"email": EMAIL, "country_region": "ID", "language": "id",
                                 "password": PASSWORD, "confirm_password": PASSWORD}),
    ):
        st, body = post("/api/v4/otp/send_vcode", payload)
        print(f"  {label:20} -> {st} {body}")
    ctx.close()
