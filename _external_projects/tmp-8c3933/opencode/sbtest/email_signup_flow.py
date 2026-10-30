"""Tes jalur DAFTAR PAKAI EMAIL ala aplikasi Shopee:
   check_account_exist -> init_email_otp -> send_email_otp -> verify_email_otp
inbox pakai mail.tm."""
import json
import random
import re
import string
import time
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-email-signup")
PROFILE.mkdir(parents=True, exist_ok=True)
HOME = "https://shopee.co.id/"
MAILTM = "https://api.mail.tm"
PASSWORD = "RahasiaKuat123!"


def new_mailbox() -> dict:
    domain = requests.get(f"{MAILTM}/domains", timeout=20).json()["hydra:member"][0]["domain"]
    user = "spbt" + "".join(random.choices(string.ascii_lowercase + string.digits, k=10))
    addr = f"{user}@{domain}"
    requests.post(f"{MAILTM}/accounts", json={"address": addr, "password": PASSWORD}, timeout=20).raise_for_status()
    tok = requests.post(f"{MAILTM}/token", json={"address": addr, "password": PASSWORD}, timeout=20).json()["token"]
    print(f"  inbox  : {addr}")
    return {"address": addr, "token": tok, "seen": set()}


def mails(mb: dict) -> list[dict]:
    r = requests.get(f"{MAILTM}/messages", headers={"Authorization": f"Bearer {mb['token']}"}, timeout=20)
    return r.json().get("hydra:member", []) if r.status_code == 200 else []


def wait_new_mail(mb: dict, seconds=100) -> dict | None:
    print(f"  nunggu email (maks {seconds}s)…")
    t0 = time.time()
    while time.time() - t0 < seconds:
        for m in mails(mb):
            if m["id"] not in mb["seen"]:
                mb["seen"].add(m["id"])
                body = requests.get(f"{MAILTM}/messages/{m['id']}",
                                    headers={"Authorization": f"Bearer {mb['token']}"}, timeout=20).json()
                txt = (body.get("subject") or "") + "\n" + (body.get("text") or "") + "\n" + (body.get("html") or [""])[0] if isinstance(body.get("html"), list) else str(body)
                print(f"  email masuk: {body.get('subject')!r}")
                return {"html": str(txt)}
        time.sleep(8)
    return None


def main():
    mb = new_mailbox()
    email = mb["address"]
    log = []

    def api(ctx, method, path, payload=None, referer=HOME):
        url = "https://shopee.co.id" + path
        headers = {"x-requested-with": "XMLHttpRequest", "Content-Type": "application/json", "Referer": referer}
        try:
            if method == "GET":
                r = ctx.request.get(url, params=payload or {}, timeout=25000, headers=headers)
            else:
                r = ctx.request.post(url, data=json.dumps(payload or {}), timeout=25000, headers=headers)
            line = f"{r.status} {method} {path} :: {r.text()[:200]}".replace("\n", " ")
        except Exception as exc:
            line = f"ERR {method} {path} :: {str(exc).splitlines()[0][:120]}"
        print("  " + line)
        log.append(line)
        try:
            return json.loads(r.text())
        except Exception:
            return {}

    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()
        page.goto(HOME, wait_until="domcontentloaded", timeout=90_000)
        page.wait_for_timeout(4000)

        print("\n[1] check_account_exist (email belum terdaftar?)")
        for key in ("email", "login_key"):
            d = api(ctx, "POST", "/api/v4/account/basic/check_account_exist", {key: email, "type": 1})
            if d:
                break

        print("\n[2] init_email_otp")
        tok = ""
        for payload in ({"email": email}, {"email": email, "scene": "signup"}, {"email": email, "type": 1}):
            d = api(ctx, "POST", "/api/v4/otp/init_email_otp", payload)
            data = d.get("data") or {}
            tok = data.get("email_otp_token") or data.get("token") or ""
            if tok:
                print("   token:", str(tok)[:48])
                break
        if not tok:
            print("   (token kosong — cobaGET)")
            d = api(ctx, "GET", "/api/v4/otp/init_email_otp", {"email": email})

        print("\n[3] send_email_otp")
        for payload in ({"email": email, "email_otp_token": tok},
                        {"email": email, "email_otp_token": tok, "language": "id"},
                        {"email": email, "email_otp_token": tok, "type": 1, "language": "id"}):
            d = api(ctx, "POST", "/api/v4/otp/send_email_otp", payload)
            data = d.get("data") or {}
            tok = data.get("email_otp_token") or data.get("vcode_token") or tok
            if d.get("error") == 0:
                print("   OTP email terkirim!")
                break

        print("\n[4] nunggu OTP di inbox")
        got = wait_new_mail(mb)
        code = ""
        if got:
            body = got["html"]
            cands = re.findall(r"(?<!\d)(\d{4,6})(?!\d)", body)
            print("   kandidat kode:", cands[:8])
            # buang angka yang kemungkinan bukan kode (tahun, warna html)
            code = next((c for c in cands if len(c) in (4, 6) and not re.search(r"[a-fA-F]", c)), "")
            print("   pakai kode  :", code)
        else:
            print("   tidak ada email masuk")

        print("\n[5] verify_email_otp")
        if code:
            for payload in ({"email": email, "vcode": code, "email_otp_token": tok},
                            {"email": email, "vcode": code, "vcode_token": tok},
                            {"email": email, "vcode": code}):
                d = api(ctx, "POST", "/api/v4/otp/verify_email_otp", payload)
                if d.get("error") == 0:
                    print("   VERIFY OK ->", json.dumps(d.get("data"))[:200])
                    break

        print("\n[6] status login setelah verify")
        d = api(ctx, "GET", "/api/v4/session/get_login_status")
        page.screenshot(path=str(OUT / "email-signup-state.png"))
        ctx.close()

    print("\n=== RINGKASAN PERMINTAAN ===")
    for l in log:
        print(" ", l)
    (OUT / "email_signup_log.txt").write_text("\n".join(log), encoding="utf-8")


if __name__ == "__main__":
    main()
