"""Cek & coba daftar akun Shopee pakai EMAIL (inbox sementara mail.tm)."""
import json
import random
import re
import string
import sys
import time
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
OUT.mkdir(parents=True, exist_ok=True)
PROFILE = Path("/tmp/opencode/sbtest/profile-email")
PROFILE.mkdir(parents=True, exist_ok=True)

SIGNUP = "https://shopee.co.id/buyer/login/signup"
PASSWORD = "RahasiaKuat123!"
MAILTM = "https://api.mail.tm"


# ---------------------------------------------------------------- mail.tm ----
def new_mailbox() -> dict:
    domain = requests.get(f"{MAILTM}/domains", timeout=20).json()["hydra:member"][0]["domain"]
    user = "spbt" + "".join(random.choices(string.ascii_lowercase + string.digits, k=10))
    addr = f"{user}@{domain}"
    r = requests.post(f"{MAILTM}/accounts", json={"address": addr, "password": PASSWORD}, timeout=20)
    r.raise_for_status()
    tok = requests.post(f"{MAILTM}/token", json={"address": addr, "password": PASSWORD}, timeout=20).json()["token"]
    print(f"  email sementara: {addr}")
    return {"address": addr, "token": tok}


def messages(mb: dict) -> list[dict]:
    r = requests.get(f"{MAILTM}/messages", headers={"Authorization": f"Bearer {mb['token']}"}, timeout=20)
    if r.status_code != 200:
        return []
    return r.json().get("hydra:member", [])


def wait_mail(mb: dict, seconds: int = 120) -> dict | None:
    print(f"  nunggu email masuk (maks {seconds}s)…")
    t0 = time.time()
    while time.time() - t0 < seconds:
        msgs = messages(mb)
        if msgs:
            mid = msgs[0]["id"]
            body = requests.get(f"{MAILTM}/messages/{mid}", headers={"Authorization": f"Bearer {mb['token']}"}, timeout=20).json()
            print(f"  email masuk: {body.get('subject')!r}")
            return body
        time.sleep(8)
    print("  email gak masuk.")
    return None


# ------------------------------------------------------------------ probe ----
def discover(page) -> dict:
    return page.evaluate("""() => {
      const txt = (document.body.innerText || '');
      const emailInputs = Array.from(document.querySelectorAll("input")).filter(i =>
        (i.type === 'email' || /email/i.test(i.name || '') || /email/i.test(i.placeholder || '') || /email/i.test(i.getAttribute('aria-label') || '')))
        .map(i => ({name: i.name, type: i.type, ph: i.placeholder, aria: i.getAttribute('aria-label')}));
      const tabs = Array.from(document.querySelectorAll("button,[role=button],a,label,div,span"))
        .map(e => (e.textContent || '').trim())
        .filter(t => t && t.length < 40 && /email/i.test(t));
      return {
        mentionsEmail: /email/i.test(txt),
        emailInputs,
        emailTexts: Array.from(new Set(tabs)).slice(0, 12),
        url: location.href,
      };
    }""")


def api_guesses(ctx, email: str) -> list[str]:
    out = []
    tries = [
        ("POST", "/api/v4/authentication/signup", {"email": email, "password": PASSWORD, "confirm_password": PASSWORD}),
        ("POST", "/api/v4/authentication/email/signup", {"email": email, "password": PASSWORD}),
        ("POST", "/api/v4/authentication/email/verify/send", {"email": email}),
        ("GET", "/api/v4/authentication/signup/check_email", {"email": email}),
        ("POST", "/api/v2/authentication/get_active_login_page", {}),
    ]
    for method, path, payload in tries:
        try:
            url = "https://shopee.co.id" + path
            if method == "GET":
                resp = ctx.request.get(url, params=payload, timeout=25000,
                                       headers={"x-requested-with": "XMLHttpRequest"})
            else:
                resp = ctx.request.post(url, data=payload, timeout=25000,
                                        headers={"x-requested-with": "XMLHttpRequest", "Content-Type": "application/json"})
            body = resp.text()[:200].replace("\n", " ").replace("\r", " ")
            out.append(f"{resp.status} {method} {path} :: {body}")
        except Exception as exc:
            out.append(f"ERR  {method} {path} :: {str(exc).splitlines()[0][:120]}")
    return out


def main():
    mb = new_mailbox()
    email = mb["address"]
    api_log = []
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()
        page.on("response", lambda r: api_log.append(f"{r.status} {r.url.split('shopee.co.id')[-1][:110]}")
                if "/api/" in r.url and any(k in r.url for k in ("authentication", "signup", "email", "otp")) else None)
        page.goto(SIGNUP, wait_until="domcontentloaded", timeout=90_000)
        page.wait_for_timeout(4000)

        info = discover(page)
        print("\n1) HALAMAN DAFTAR")
        print("   ada kata 'email':", info["mentionsEmail"])
        print("   input email     :", json.dumps(info["emailInputs"], ensure_ascii=False))
        print("   teks/tombol email:", json.dumps(info["emailTexts"], ensure_ascii=False))

        # klik apa pun yang berbau email (tab/switch), lalu cek ulang
        clicked = False
        for sel in ("text=/daftar.*email/i", "text=/email/i"):
            try:
                loc = page.locator(sel).first
                if loc.count():
                    loc.click(timeout=3000)
                    clicked = True
                    break
            except Exception:
                continue
        if clicked:
            page.wait_for_timeout(3500)
            after = discover(page)
            print("   setelah diklik email ->", json.dumps(after["emailInputs"], ensure_ascii=False)[:220])
            page.screenshot(path=str(OUT / "signup-email-tab.png"))

        print("\n2) TEBAK ENDPOINT API (email)")
        for line in api_guesses(ctx, email):
            print("   " + line)

        print("\n3) LOG PERMINTAAN YANG KEJADIAN DI HALAMAN")
        for line in api_log[:12]:
            print("   " + line)
        page.screenshot(path=str(OUT / "signup-email-state.png"))
        ctx.close()

    print("\n4) EMAIL MASUK?", json.dumps([m.get("subject") for m in messages(mb)][:5], ensure_ascii=False))


if __name__ == "__main__":
    sys.exit(main())
