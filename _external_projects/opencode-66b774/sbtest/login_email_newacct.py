"""UI login pakai email belum terdaftar: cek respons halaman (mungkin muncul jalur
'buat akun baru' / email-otp). Sekalian rekam semua request + tangkap screenshot."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/shopee-real")
PROFILE = Path("/tmp/opencode/sbtest/profile-email-signup")
LOGIN = "https://shopee.co.id/buyer/login"
EMAIL = "spbt.newacct@mail.tm"


def main():
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()
        reqs = []
        page.on("response", lambda r: reqs.append(f"{r.status} {r.url.split('shopee.co.id')[-1][:120]}")
                if "/api/" in r.url and any(k in r.url for k in ("login", "otp", "email", "account", "authentication")) else None)
        page.goto(LOGIN, wait_until="domcontentloaded", timeout=90_000)
        page.wait_for_timeout(4500)
        page.evaluate("""() => { for (const m of document.querySelectorAll('#modal,[role=dialog]'))
            if (/pilih bahasa/i.test(m.textContent||'')) m.style.display='none'; }""")

        # isi form login pakai EMAIL
        ok = page.evaluate("""(email) => {
          const k = document.querySelector('input[name=loginKey]');
          const p = document.querySelector('input[type=password]');
          if (!k || !p) return 'no-form';
          const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          set.call(k, email); k.dispatchEvent(new Event('input', {bubbles:true}));
          set.call(p, 'SalahPwd123!'); p.dispatchEvent(new Event('input', {bubbles:true}));
          const b = Array.from(document.querySelectorAll('button')).find(x => /log ?in\\b/i.test((x.textContent||'').trim()));
          if (!b) return 'no-btn'; b.click(); return 'clicked';
        }""", EMAIL)
        print("aksi:", ok)
        page.wait_for_timeout(9000)
        txt = page.evaluate("() => (document.body?document.body.innerText:'').replace(/\\s+/g,' ')")
        print("URL:", page.url[:120])
        print("TEKS:", txt[:420])
        low = txt.lower()
        for kw in ("buat akun", "daftar", "akun baru", "tidak ditemukan", "email", "otp"):
            if kw in low:
                i = low.find(kw)
                print(f"  ~{kw}~ -> ...{txt[max(0,i-60):i+90]}...")
        print("\nrequest terkait:")
        for r in reqs[:12]:
            print("  ", r)
        page.screenshot(path=str(OUT / "login-email-newacct.png"))

        # klik link 'Daftar' kalau muncul di area popup/error
        reg = page.evaluate("""() => {
          const els = Array.from(document.querySelectorAll('a,button,[role=button]'));
          const hit = els.find(e => /daftar|buat akun/i.test((e.textContent||'').trim()) && (e.textContent||'').trim().length < 30);
          if (!hit) return null;
          hit.click(); return (hit.textContent||'').trim();
        }""")
        if reg:
            print("\nklik:", reg)
            page.wait_for_timeout(6000)
            print("URL setelah klik:", page.url[:120])
            t2 = page.evaluate("() => (document.body?document.body.innerText:'').replace(/\\s+/g,' ').slice(0,300)")
            print("TEKS2:", t2)
            page.screenshot(path=str(OUT / "login-email-after-daftar.png"))
        ctx.close()


if __name__ == "__main__":
    main()
