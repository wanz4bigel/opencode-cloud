#!/usr/bin/env python3
"""Penghasil token Cloudflare Turnstile untuk 1forcrkuota.com.

Situs memakai widget Turnstile biasa (sitekey saja, tanpa action), jadi token
bisa diperoleh dari tiga jalur:

1. layanan pencari captcha (2captcha / YesCaptcha / CapMonster / Anti-Captcha),
2. browser sungguhan lewat skrip Node + Playwright (solve_turnstile.js),
3. token yang disalin manual dari browser (paling murah, tanpa layanan).

Dipakai bot.py lewat import, dan bisa dijalankan sendiri untuk uji coba:

    python3 solve_turnstile.py --mode api --solver 2captcha --key KUNCI
    python3 solve_turnstile.py --mode browser
    python3 solve_turnstile.py --token "<token hasil salin>" --check
"""

import argparse
import json
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

SITE_URL = "https://1forcrkuota.com/"
SITE_KEY = "0x4AAAAAADc05hDok-Mdgmqa"  # dari GET /api/auth/captcha-config
WAIT_SECONDS = 180
POLL_SECONDS = 4
# Setelah browser ditolak Cloudflare, jangan coba lagi terus-menerus (masing-masing
# percobaan makan waktu sampai 2 menit).
BROWSER_COOLDOWN_SECONDS = 600
_browser_failure = {"at": 0.0, "reason": ""}

# Layanan dengan API createTask/getTask (bentuk 2captcha).
CREATE_TASK_API = {
    "2captcha": "https://api.2captcha.com",
    "yescaptcha": "https://api.yescaptcha.com",
    "capmonster": "https://api.capmonster.cloud",
    "1captcha": "https://api.1captcha.top",
}


class SolverError(Exception):
    """Gagal mendapat token Turnstile."""


def http_json(url, payload=None, timeout=40):
    """POST JSON/URL-encoded sederhana, balasannya JSON."""
    if payload is None:
        data = None
        headers = {"User-Agent": "OneCRVpnBot/1.0"}
    else:
        data = json.dumps(payload).encode("utf-8")
        headers = {"User-Agent": "OneCRVpnBot/1.0", "Content-Type": "application/json"}
    request = urllib.request.Request(url, data=data, headers=headers, method="POST" if payload is not None else "GET")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
    except urllib.error.URLError as exc:
        raise SolverError(f"Solver {url} tidak bisa dihubungi: {exc.reason}") from exc
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise SolverError(f"Balasan solver bukan JSON: {raw[:160]}") from None


def submit_task(base, api_key, sitekey, url):
    result = http_json(f"{base}/createTask", {"clientKey": api_key, "task": {"type": "TurnstileTaskProxyless", "websiteURL": url, "websiteKey": sitekey}})
    if result.get("errorId"):
        raise SolverError(f"{base}: {result.get('errorDescription') or result}")
    task_id = result.get("taskId")
    if not task_id:
        raise SolverError(f"{base} tidak mengirim taskId: {result}")
    return task_id


def wait_task(base, api_key, task_id, timeout=WAIT_SECONDS):
    deadline = time.time() + timeout
    while time.time() < deadline:
        result = http_json(f"{base}/getTask", {"clientKey": api_key, "taskId": task_id})
        status = result.get("status")
        if result.get("errorId"):
            raise SolverError(f"{base}: {result.get('errorDescription') or result}")
        if status == "ready":
            token = (result.get("solution") or {}).get("token")
            if not token:
                raise SolverError(f"{base} selesai tapi tanpa token: {result}")
            return token
        time.sleep(POLL_SECONDS)
    raise SolverError(f"Solver {base} melewati {timeout} detik tanpa hasil")


def solve_with_api(solver, api_key, sitekey=SITE_KEY, url=SITE_URL, timeout=WAIT_SECONDS):
    """Ambil token memakai layanan pencari captcha."""
    key = str(solver or "").strip().lower()
    api_key = str(api_key or "").strip()
    if not api_key:
        raise SolverError("turnstile_api_key kosong")

    if key in ("anticaptcha", "antigate"):
        base = "https://api.anticaptcha.com"
        created = http_json(
            f"{base}/v1/tasks.create",
            {"clientKey": api_key, "task": {"type": "TurnstileTaskProxyless", "websiteURL": url, "websiteKey": sitekey}},
        )
        if created.get("errorId"):
            raise SolverError(f"anticaptcha: {created.get('errorDescription') or created}")
        task_id = created.get("taskId")
        deadline = time.time() + timeout
        while time.time() < deadline:
            result = http_json(f"{base}/v1/tasks.get", {"clientKey": api_key, "taskId": task_id})
            if (result.get("status") or "").lower() == "ready":
                token = (result.get("solution") or {}).get("token")
                if not token:
                    raise SolverError(f"anticaptcha selesai tanpa token: {result}")
                return token
            time.sleep(POLL_SECONDS)
        raise SolverError(f"anticaptcha melewati {timeout} detik tanpa hasil")

    base = CREATE_TASK_API.get(key)
    if not base:
        raise SolverError("Solver tidak dikenal: %s (pilih: %s)" % (solver, ", ".join(sorted(CREATE_TASK_API) + ["anticaptcha"])))
    task_id = submit_task(base, api_key, sitekey, url)
    return wait_task(base, api_key, task_id, timeout)


def solve_with_browser(sitekey=SITE_KEY, url=SITE_URL, script="solve_turnstile.js", timeout=WAIT_SECONDS):
    """Ambil token dengan Chromium (Playwright). Butuh node + playwright terpasang."""
    if not shutil.which("node"):
        raise SolverError("node tidak ditemukan, jalur browser tidak bisa dipakai")
    command = ["node", script, sitekey, url]
    try:
        finished = subprocess.run(command, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise SolverError(f"Browser solver melewati {timeout} detik") from None
    token = (finished.stdout or "").strip().splitlines()[-1].strip() if (finished.stdout or "").strip() else ""
    if finished.returncode != 0 or not token:
        lines = [line.strip() for line in (finished.stderr or finished.stdout or "").splitlines() if line.strip()]
        error_line = next((line for line in reversed(lines) if "ERROR" in line), None)
        detail = error_line or (lines[0] if lines else "tanpa keluaran")
        detail = detail.replace("[turnstile] ERROR", "").strip()[:180]
        if "Cannot find module" in detail or "MODULE_NOT_FOUND" in (finished.stderr or ""):
            detail = "Playwright belum terpasang (jalankan: npm install playwright && npx playwright install chromium)"
        elif "error-callback" in detail or "tidak dapat token" in detail:
            detail += ". Cloudflare menolak browser/IP ini (umum di VPS/datacenter); pakai solver API atau token manual."
        raise SolverError("Browser solver gagal: %s" % detail)
    return token


def get_token(config, sitekey=SITE_KEY, url=SITE_URL, manual_token=""):
    """Ikuti turnstile_mode dari config: api | browser | auto | manual | off.

    'auto' mencoba solver API (kalau api key diisi), lalu browser, dan terakhir
    menyuruh user menempel token manual.
    """
    mode = str(config.get("turnstile_mode") or "auto").strip().lower()
    if mode not in ("auto", "api", "browser", "manual", "off"):
        raise SolverError(
            "turnstile_mode tidak dikenal: %s (pilih auto, api, browser, manual, atau off)" % mode
        )
    if mode == "off":
        raise SolverError("turnstile_mode = off, padahal situs butuh token Turnstile")

    token = str(manual_token or "").strip()
    if token:
        return token

    manual_hint = (
        "Butuh token Turnstile manual: buka %s di browser, jalankan bookmarklet di README, "
        "lalu kirim /turnstile <token> ke bot (token berlaku sekitar 5 menit)." % url
    )

    if mode == "api":
        return solve_with_api(config.get("turnstile_solver", "2captcha"), config.get("turnstile_api_key", ""), sitekey=sitekey, url=url)
    if mode == "browser":
        return solve_with_browser(sitekey=sitekey, url=url, script=config.get("turnstile_script", "solve_turnstile.js"))

    errors = []
    if str(config.get("turnstile_api_key") or "").strip():
        try:
            return solve_with_api(config.get("turnstile_solver", "2captcha"), config.get("turnstile_api_key"), sitekey=sitekey, url=url)
        except SolverError as exc:
            errors.append("solver api: %s" % exc)
    else:
        errors.append("solver api: api key kosong")
    cooldown_left = BROWSER_COOLDOWN_SECONDS - (time.time() - _browser_failure["at"])
    if _browser_failure["at"] and cooldown_left > 0:
        errors.append(
            "solver browser: dilewati, percobaan %.0f detik lalu gagal (%s)"
            % (time.time() - _browser_failure["at"], _browser_failure["reason"][:70])
        )
    else:
        try:
            return solve_with_browser(sitekey=sitekey, url=url, script=config.get("turnstile_script", "solve_turnstile.js"))
        except SolverError as exc:
            _browser_failure.update(at=time.time(), reason=str(exc))
            errors.append("solver browser: %s" % exc)

    raise SolverError("%s (%s)" % (manual_hint, " | ".join(errors)))


def looks_like_token(token):
    """Cek kasar bentuk token Turnstile (rantai panjang tanpa spasi)."""
    value = str(token or "").strip()
    return len(value) >= 60 and " " not in value


def main():
    parser = argparse.ArgumentParser(description="Ambil token Turnstile 1forcrkuota.com")
    parser.add_argument("--mode", choices=("api", "browser", "auto", "manual"), default="auto")
    parser.add_argument("--solver", default="2captcha", help="2captcha | yescaptcha | capmonster | anticaptcha")
    parser.add_argument("--key", default="", help="api key layanan solver")
    parser.add_argument("--sitekey", default=SITE_KEY)
    parser.add_argument("--url", default=SITE_URL)
    parser.add_argument("--token", default="", help="token manual, dicetak kembali untuk dicek")
    parser.add_argument("--check", action="store_true", help="cek bentuk token manual")
    args = parser.parse_args()

    if args.token:
        ok = looks_like_token(args.token)
        print("token terlihat valid" if ok else "token terlalu pendek / ada spasi")
        if not args.check:
            print(args.token)
        return 0 if ok else 1

    token = get_token(
        {"turnstile_mode": args.mode, "turnstile_solver": args.solver, "turnstile_api_key": args.key},
        sitekey=args.sitekey,
        url=args.url,
    )
    print(token)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SolverError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        sys.exit(1)
