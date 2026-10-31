"""Rekam request asli (body + header) yang dikirim halaman Daftar Shopee waktu isi nomor,
pakai intercept fetch/XHR dari dalam halaman. Control: get_settings_v2."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("/tmp/opencode/sbtest")
PROFILE = Path("/tmp/opencode/sbtest/profile-email-signup")
SIGNUP = "https://shopee.co.id/buyer/login/signup"
PHONE = "8818524515"

RECORD = """
window.__cap = [];
const of = window.fetch;
window.fetch = function(u, o) {
  try {
    const url = (typeof u === 'string') ? u : (u && u.url) || '';
    if (/api\\/v[24]/.test(url)) window.__cap.push({t:'fetch', url, method:(o&&o.method)||'GET',
      body: o && o.body ? String(o.body).slice(0,900) : null,
      headers: o && o.headers ? Object.fromEntries(Object.entries(o.headers)) : null});
  } catch (e) {}
  return of.apply(this, arguments);
};
const ox = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send, osh = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function(k, v) { (this.__h ||= {})[k] = v; return osh.apply(this, arguments); };
XMLHttpRequest.prototype.open = function(m, u) { this.__m = m; this.__u = u; return ox.apply(this, arguments); };
XMLHttpRequest.prototype.send = function(b) {
  try { if (/api\\/v[24]/.test(this.__u || '')) window.__cap.push({t:'xhr', url:String(this.__u).slice(0,150),
    method:this.__m, body: b ? String(b).slice(0,900) : null, headers: this.__h || null}); } catch (e) {}
  return os.apply(this, arguments);
};
"""


def main():
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE), headless=True, locale="id-ID", timezone_id="Asia/Jakarta",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        page = ctx.new_page()
        page.goto(SIGNUP, wait_until="domcontentloaded", timeout=90_000)
        page.wait_for_timeout(5000)

        # control: endpoint yg pasti jalan anonim
        ctrl = ctx.request.get("https://shopee.co.id/api/v4/otp/get_settings_v2",
                               params={"phone_number": PHONE, "country_code": "62", "type": "0"},
                               timeout=25000, headers={"x-requested-with": "XMLHttpRequest", "Referer": SIGNUP})
        print("CONTROL get_settings_v2 ->", ctrl.status, ctrl.text()[:160].replace("\n", " "))

        # tutup modal bahasa / popup apa pun
        for _ in range(3):
            closed = False
            for sel in ("#modal button:has-text('Oke')", "#modal button:has-text('OK')",
                        "#modal [aria-label*=close i]", "#modal button"):
                try:
                    b = page.locator(sel).first
                    if b.count() and b.is_visible():
                        b.click(timeout=2500)
                        closed = True
                        break
                except Exception:
                    continue
            if not closed:
                break
            page.wait_for_timeout(1200)
        try:
            page.evaluate("() => { const m = document.getElementById('modal'); if (m) m.remove(); }")
        except Exception:
            pass

        page.evaluate(RECORD)
        page.wait_for_timeout(500)
        filled = page.evaluate("""(phone) => {
          const inp = document.querySelector('input[name=phone], input[type=tel]');
          if (!inp) return 'no-input';
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, phone);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          const btn = Array.from(document.querySelectorAll('button')).find(b => /berikutnya|kirim|lanjut/i.test(b.textContent || ''));
          if (!btn) return 'no-button';
          const agree = document.querySelector('input[type=checkbox]');
          if (agree && !agree.checked) { try { agree.click(); } catch (e) {} }
          btn.click();
          return 'clicked:' + (btn.textContent || '').trim();
        }""", PHONE)
        print("aksi form:", filled)
        page.wait_for_timeout(9000)
        print("URL sekarang:", page.url[:120])

        caps = page.evaluate("() => window.__cap || []")
        print(f"\n{len(caps)} request terekam:")
        for c in caps:
            print("-", c.get("method"), c.get("url", "")[:120])
            if c.get("body"):
                print("   body:", c["body"][:400])
            if c.get("headers"):
                interesting = {k: v for k, v in c["headers"].items()
                               if k.lower() in ("content-type", "x-requested-with", "x-shopee-language",
                                                "x-api-source", "accept", "x-csrftoken", "referer")}
                if interesting:
                    print("   hdr :", json.dumps(interesting)[:220])
        Path(OUT / "signup_page_requests.json").write_text(json.dumps(caps, indent=1), encoding="utf-8")

        body = page.evaluate("() => (document.body && document.body.innerText || '').replace(/\\s+/g,' ').slice(0,300)")
        print("\nteks halaman sekarang:", body[:280])
        ctx.close()


if __name__ == "__main__":
    main()
