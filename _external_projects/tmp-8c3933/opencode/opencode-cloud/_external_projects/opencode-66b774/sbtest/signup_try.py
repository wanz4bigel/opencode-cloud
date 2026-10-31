"""Coba bikin akun Shopee beneran: isi nomor -> minta OTP -> baca SMS publik -> isi kode.

Pakai nomor publik smsdock.net (inbox terbuka). Nomor publik sering udah kepake,
makanya script ini nyoba beberapa nomor sekaligus dan nyetak response API Shopee
biar kelihatan alasan penolakannya.
"""
import json
import re
import sys
import time
from pathlib import Path

import requests
from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
OUT.mkdir(parents=True, exist_ok=True)
PROFILE = Path("/tmp/opencode/sbtest/profile-signup")
PROFILE.mkdir(parents=True, exist_ok=True)

SIGNUP_URL = "https://shopee.co.id/buyer/login/signup"
PASSWORD = "RahasiaKuat123!"
NUMBERS = [  # nomor publik Indonesia (format lokal tanpa 0 di depan)
    "8818524515", "8771536805", "8137091780", "8577757747", "8213555334",
]
API_KEYS = ("authentication", "otp", "signup", "signup_otp", "captcha", "sift")


def inbox_texts(number: str) -> list[str]:
    """Daftar teks pesan yang kelihatan di inbox smsdock buat nomor tsb."""
    try:
        r = requests.get(f"https://smsdock.net/number/62{number}", timeout=20,
                         headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code != 200:
            return []
        chunks = re.findall(r">([^<>]{10,240})<", r.text)
        out, seen = [], set()
        for c in chunks:
            t = re.sub(r"\s+", " ", c).strip()
            if len(t) < 10 or t in seen:
                continue
            seen.add(t)
            out.append(t)
        return out
    except Exception as exc:
        print("  inbox error:", exc)
        return []


def pick_code(texts: list[str]) -> str | None:
    """Ambil kode OTP dari teks; utamakan yang berbau Shopee."""
    shopee = [t for t in texts if re.search(r"shopee", t, re.I)]
    for pool in (shopee, texts):
        for t in pool:
            m = re.search(r"(?:kode|code|verif)[^\d]{0,20}(\d{4,8})", t, re.I) or re.search(r"\b(\d{4,8})\b", t)
            if m:
                print(f"  SMS: {t[:120]}")
                return m.group(1)
    return None


def wait_code(number: str, baseline: set, seconds: int = 150) -> str | None:
    """Tunggu pesan BARU (bukan kode lama) lalu ambil kodenya."""
    print(f"  nunggu SMS baru ke {number} (maks {seconds}s)…")
    t0 = time.time()
    while time.time() - t0 < seconds:
        fresh = [t for t in inbox_texts(number) if t not in baseline]
        if fresh:
            code = pick_code(fresh)
            if code:
                return code
            print(f"  pesan baru tapi bukan kode OTP: {fresh[0][:90]}")
        time.sleep(10)
    print("  SMS gak masuk.")
    return None


def run(number: str) -> tuple[bool, str]:
    api_log = []
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE / number), headless=True, locale="id-ID",
            timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()

        def on_response(resp):
            u = resp.url
            if not any(k in u for k in API_KEYS):
                return
            try:
                body = resp.text()[:400]
            except Exception:
                body = "(tak terbaca)"
            api_log.append(f"{resp.status} {u.split('shopee.co.id')[-1][:110]} :: {body}")

        page.on("response", on_response)
        try:
            page.goto(SIGNUP_URL, wait_until="domcontentloaded", timeout=90_000)
            page.wait_for_timeout(4000)

            box = page.locator("input[name='phone']")
            if not box.count():
                return False, "input[name=phone] tidak muncul (halaman diblokir?)"
            box.first.click()
            box.first.type(number, delay=90)
            # centang persetujuan kalau ada
            for cb in page.locator("input[type=checkbox]").all():
                try:
                    if not cb.is_checked():
                        cb.check(force=True)
                except Exception:
                    pass
            baseline = set(inbox_texts(number))   # biar kode lama gak ketarik
            page.get_by_role("button", name=re.compile("berikut|next|daftar", re.I)).first.click()
            page.wait_for_timeout(6000)

            # OTP: Shopee kirim SMS, inbox publik di-refresh tiap beberapa menit
            code = wait_code(number, baseline, 150)
            if not code:
                txt = page.evaluate("() => (document.body.innerText||'').replace(/\\s+/g,' ').slice(0,260)")
                err = next((l for l in api_log if any(k in l.lower() for k in ("error", "sudah", "terdaftar", "invalid"))), "")
                return False, f"OTP tidak diterima. Layar: {txt[:150]} | API: {err[:220]}"

            otp_sel = "input[name*='otp'], input[name*='code'], input[placeholder*='kode'], input[placeholder*='OTP'], input[inputmode='numeric']"
            otp = page.locator(otp_sel).first
            otp.fill(code)
            page.wait_for_timeout(1500)
            for name in ("Konfirmasi", "Kirim", "Verifikasi", "Berikutnya", "Submit"):
                try:
                    page.get_by_role("button", name=re.compile(name, re.I)).first.click(timeout=2500)
                    break
                except Exception:
                    pass
            page.wait_for_timeout(7000)

            # kalau diminta password / nama, isi
            for pwd in page.locator("input[type=password]").all():
                try:
                    pwd.fill(PASSWORD)
                except Exception:
                    pass
            for nm in page.locator("input[name*='name'], input[placeholder*='nama']").all():
                try:
                    nm.fill("Test Bot Shopee")
                except Exception:
                    pass
            for name in ("Selesai", "Simpan", "Lanjutkan", "Daftar", "Konfirmasi"):
                try:
                    page.get_by_role("button", name=re.compile(name, re.I)).first.click(timeout=2000)
                    break
                except Exception:
                    pass
            page.wait_for_timeout(7000)

            page.screenshot(path=str(OUT / f"signup-{number}.png"))
            txt = page.evaluate("() => (document.body.innerText||'').replace(/\\s+/g,' ').slice(0, 300)")
            cookies = {c["name"] for c in ctx.cookies()}
            ok = bool({"sessid", "SPC_R_T_ID"} & cookies) and "Log In" not in txt[:120]
            state = f"url={page.url} | cookies_login={'YA' if {'sessid'} & cookies else 'belum'} | teks: {txt[:160]}"
            (OUT / f"signup-{number}.api.txt").write_text("\n".join(api_log), encoding="utf-8")
            return ok, state + "\n  API:\n    " + "\n    ".join(api_log[-6:])
        except Exception as exc:
            return False, f"exception: {exc}"
        finally:
            ctx.close()


def main():
    for n in NUMBERS:
        print("=" * 72)
        print("COBA NOMOR +62", n)
        ok, msg = run(n)
        print("HASIL:", "SUKSES ✅" if ok else "GAGAL ❌")
        print(" ", msg)
        if ok:
            break
    print("=" * 72)


if __name__ == "__main__":
    sys.exit(main())
