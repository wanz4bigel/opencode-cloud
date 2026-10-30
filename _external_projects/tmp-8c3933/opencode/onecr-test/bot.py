#!/usr/bin/env python3
"""Bot Telegram untuk klaim otomatis akun VPN/SSH gratis 1 jam di 1forcrkuota.com.

Cara pakai singkat:
    python3 bot.py --once            # klaim sekali, cocok buat cron
    python3 bot.py --servers         # daftar server VPN (tanpa login)
    python3 bot.py                   # jalankan bot Telegram + jadwal harian

Bot ini hanya memakai pustaka bawaan Python, jadi tidak perlu pip install.
"""

import argparse
import json
import logging
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from html import escape, unescape
from http import cookiejar

try:  # dua modul pendamping, bot tetap jalan kalau salah satunya tidak ikut disalin
    import otp_email
except ImportError:  # pragma: no cover
    otp_email = None

try:
    import solve_turnstile as turnstile
except ImportError:  # pragma: no cover
    turnstile = None

BASE_DEFAULT = "https://1forcrkuota.com"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) OneCRVpnBot/1.0"
WIB = timezone(timedelta(hours=7))  # Asia/Jakarta, tanpa butuh paket tzdata
DATA_DIR_DEFAULT = "data"
ACCOUNT_TYPES = ("ssh", "zivpn", "vmess", "vless", "trojan")

# Label port SSH yang sama dengan yang dipakai dashboard pembeli, supaya hasil
# dari bot bisa dibaca sama seperti di website.
SSH_PORT_LABELS = (
    ("tls", "Port TLS"),
    ("none", "Port non-TLS"),
    ("ovpntcp", "OpenVPN TCP"),
    ("ovpnudp", "OpenVPN UDP"),
    ("sshohp", "SSH OHP"),
    ("udpcustom", "UDP Custom"),
)

LOG = logging.getLogger("onecr-bot")


# ----------------------------------------------------------------------------- config


def load_config(path="config.json"):
    """Baca config.json lalu timpa dengan isi environment variable."""
    cfg = {
        "telegram_token": "",
        "telegram_user_id": 0,
        "site_base": BASE_DEFAULT,
        "site_email": "",
        "site_password": "",
        "account_type": "ssh",
        "server_id": "",
        "claim_time": "07:00",
        "schedule_enabled": True,
        "retry_minutes": 30,
        "data_dir": DATA_DIR_DEFAULT,
        # Pendaftaran akun baru butuh token Turnstile.Mode yang tersedia:
        # auto (coba api -> browser -> minta token manual), api, browser, manual, off.
        "turnstile_mode": "auto",
        "turnstile_solver": "2captcha",
        "turnstile_api_key": "",
        "turnstile_script": "solve_turnstile.js",
        # OTP: manual (diketik lewat /otp) atau imap (dibaca otomatis dari email).
        "otp_source": "manual",
        "otp_imap": {"host": "", "port": 993, "user": "", "password": "", "folder": "INBOX"},
        "otp_wait_seconds": 240,
    }

    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as fh:
            cfg.update(json.load(fh))

    env_map = {
        "TELEGRAM_BOT_TOKEN": "telegram_token",
        "TELEGRAM_USER_ID": "telegram_user_id",
        "SITE_BASE": "site_base",
        "SITE_EMAIL": "site_email",
        "SITE_PASSWORD": "site_password",
        "VPN_ACCOUNT_TYPE": "account_type",
        "VPN_SERVER_ID": "server_id",
        "CLAIM_TIME": "claim_time",
        "SCHEDULE_ENABLED": "schedule_enabled",
        "RETRY_MINUTES": "retry_minutes",
        "DATA_DIR": "data_dir",
        "TURNSTILE_MODE": "turnstile_mode",
        "TURNSTILE_SOLVER": "turnstile_solver",
        "TURNSTILE_API_KEY": "turnstile_api_key",
        "OTP_SOURCE": "otp_source",
        "OTP_WAIT_SECONDS": "otp_wait_seconds",
    }
    int_keys = ("telegram_user_id", "retry_minutes", "otp_wait_seconds")
    for env_key, cfg_key in env_map.items():
        raw = os.environ.get(env_key)
        if raw is None or raw == "":
            continue
        if cfg_key in int_keys:
            cfg[cfg_key] = int(raw)
        elif cfg_key == "schedule_enabled":
            cfg[cfg_key] = raw.strip().lower() in ("1", "true", "yes", "ya")
        else:
            cfg[cfg_key] = raw

    imap_env = {
        "OTP_IMAP_HOST": "host",
        "OTP_IMAP_USER": "user",
        "OTP_IMAP_PASSWORD": "password",
        "OTP_IMAP_PORT": "port",
        "OTP_IMAP_FOLDER": "folder",
    }
    for env_key, key in imap_env.items():
        raw = os.environ.get(env_key)
        if not raw:
            continue
        cfg["otp_imap"][key] = int(raw) if key == "port" else raw

    cfg["site_base"] = cfg["site_base"].rstrip("/")
    cfg["account_type"] = str(cfg["account_type"] or "ssh").strip().lower()
    if cfg["account_type"] not in ACCOUNT_TYPES:
        cfg["account_type"] = "ssh"
    if str(cfg.get("turnstile_mode")) not in ("auto", "api", "browser", "manual", "off"):
        cfg["turnstile_mode"] = "auto"
    if str(cfg.get("otp_source")) not in ("manual", "imap"):
        cfg["otp_source"] = "manual"
    if not isinstance(cfg.get("otp_imap"), dict):
        cfg["otp_imap"] = {"host": "", "port": 993, "user": "", "password": "", "folder": "INBOX"}
    return cfg


class StateStore:
    """Menyimpan status terakhir (kapan terakhir klaim, offset Telegram, pilihan user)."""

    def __init__(self, data_dir):
        os.makedirs(data_dir, exist_ok=True)
        self.path = os.path.join(data_dir, "state.json")
        try:
            with open(self.path, "r", encoding="utf-8") as fh:
                self.data = json.load(fh)
        except (FileNotFoundError, json.JSONDecodeError):
            self.data = {}
        self.data.setdefault("prefs", {})
        self.data.setdefault("telegram_offset", 0)

    def save(self):
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(self.data, fh, indent=2, ensure_ascii=False)
        os.replace(tmp, self.path)

    def set_pref(self, key, value):
        self.data["prefs"][key] = value
        self.save()

    def get_pref(self, key, default=None):
        return self.data["prefs"].get(key, default)


# ----------------------------------------------------------------------------- API situs


class SiteError(Exception):
    def __init__(self, message, status=0, require_turnstile=False):
        super().__init__(message)
        self.message = message
        self.status = status
        self.require_turnstile = require_turnstile


class SiteClient:
    """Pembungkus API 1forcrkuota.com: sesi cookie + token CSRF."""

    def __init__(self, base=BASE_DEFAULT, data_dir=DATA_DIR_DEFAULT):
        self.base = base.rstrip("/")
        self.jar = cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
        self.csrf_token = ""
        self.csrf_header = "x-csrf-token"
        self.session_file = os.path.join(data_dir, "site_session.json")
        self._lock = threading.Lock()
        self.load_session()

    # ----- penyimpanan cookie, biar tidak perlu login ulang setiap restart
    def save_session(self):
        items = []
        for c in self.jar:
            items.append(
                {
                    "name": c.name,
                    "value": c.value,
                    "domain": c.domain,
                    "path": c.path,
                    "secure": bool(c.secure),
                    "expires": int(c.expires) if c.expires else None,
                }
            )
        payload = {
            "cookies": items,
            "csrf_token": self.csrf_token,
            "csrf_header": self.csrf_header,
            "base": self.base,
        }
        tmp = self.session_file + ".tmp"
        try:
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump(payload, fh, ensure_ascii=False)
            os.replace(tmp, self.session_file)
        except OSError as exc:  # simpan sesi bukan hal penting, cukup dicatat
            LOG.debug("Gagal menyimpan sesi: %s", exc)

    def load_session(self):
        try:
            with open(self.session_file, "r", encoding="utf-8") as fh:
                payload = json.load(fh)
        except (FileNotFoundError, json.JSONDecodeError):
            return
        if payload.get("base") and payload["base"] != self.base:
            return
        for item in payload.get("cookies", []):
            if item.get("expires") and item["expires"] < time.time():
                continue
            try:
                self.jar.set_cookie(
                    cookiejar.Cookie(
                        version=0,
                        name=item["name"],
                        value=item["value"],
                        port=None,
                        port_specified=False,
                        domain=item["domain"],
                        domain_specified=True,
                        domain_initial_dot=item["domain"].startswith("."),
                        path=item.get("path", "/"),
                        path_specified=True,
                        secure=bool(item.get("secure")),
                        expires=item.get("expires"),
                        discard=not item.get("expires"),
                        comment=None,
                        comment_url=None,
                        rest={},
                    )
                )
            except (TypeError, KeyError):
                continue
        self.csrf_token = payload.get("csrf_token", "")
        self.csrf_header = payload.get("csrf_header", "x-csrf-token")

    # ----- HTTP
    def _request(self, method, path, payload=None, with_csrf=False, retry=True):
        url = self.base + path
        body = None
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Origin": self.base,
            "Referer": self.base + "/user.html",
        }
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        if with_csrf:
            headers[self.csrf_header] = self.get_csrf()

        request = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=30) as response:
                status = response.status
                raw = response.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as exc:
            status = exc.code
            raw = exc.read().decode("utf-8", "replace")
        except urllib.error.URLError as exc:
            raise SiteError(f"Tidak bisa menghubungi situs: {exc.reason}", status=0) from exc

        try:
            data = json.loads(raw) if raw.strip() else {}
        except json.JSONDecodeError:
            data = {"error": raw[:200]}

        if 200 <= status < 300:
            self.save_session()
            return data

        message = data.get("error") or data.get("message") or f"HTTP {status}"
        # Token CSRF kedaluwarsa: ambil lagi lalu ulangi sekali.
        if with_csrf and status == 403 and retry:
            self.csrf_token = ""
            return self._request(method, path, payload, with_csrf=True, retry=False)
        raise SiteError(
            message,
            status=status,
            require_turnstile=bool(data.get("requireTurnstile")),
        )

    def get(self, path):
        return self._request("GET", path)

    def post(self, path, payload=None, with_csrf=True):
        return self._request("POST", path, payload if payload is not None else {}, with_csrf=with_csrf)

    def get_csrf(self, force=False):
        if self.csrf_token and not force:
            return self.csrf_token
        with self._lock:
            if self.csrf_token and not force:
                return self.csrf_token
            data = self.get("/api/auth/csrf")
            self.csrf_token = data.get("csrfToken", "")
            self.csrf_header = data.get("headerName", "x-csrf-token")
            if not self.csrf_token:
                raise SiteError("Token CSRF tidak diberikan server", status=500)
            return self.csrf_token

    # ----- auth
    def login(self, email, password):
        data = self.post("/api/auth/login", {"email": email, "password": password, "turnstileToken": ""})
        self.save_session()
        return data

    def me(self):
        return self.get("/api/auth/me")

    def logged_in(self):
        try:
            self.me()
            return True
        except SiteError:
            return False

    def logout(self):
        try:
            self.post("/api/auth/logout")
        finally:
            self.csrf_token = ""
            self.jar.clear()
            if os.path.exists(self.session_file):
                os.remove(self.session_file)

    def captcha_config(self):
        """Kabar dari situs soal captcha: provider 'turnstile' atau 'local'."""
        return (self.get("/api/auth/captcha-config") or {}).get("data") or {}

    def local_captcha(self):
        return (self.get("/api/auth/captcha") or {}).get("data") or {}

    def register(self, username, email, password, turnstile_token=""):
        """Daftar akun baru.

        Captcha lokal selalu ikut dikirim, dan token Turnstile disertakan kalau
        situs sedang memakainya (provider dari /api/auth/captcha-config).
        """
        try:
            captcha = self.local_captcha()
        except SiteError:
            captcha = {}
        payload = {
            "username": username,
            "email": email,
            "password": password,
            "captchaId": captcha.get("id", ""),
            "captchaAnswer": captcha.get("code", ""),
            "turnstileToken": str(turnstile_token or ""),
        }
        return self.post("/api/auth/register", payload)

    def verify_otp(self, email, otp):
        return self.post("/api/auth/verify-otp", {"email": email, "otp": otp})

    # ----- VPN
    def public_servers(self):
        return (self.get("/api/public/vpn-servers") or {}).get("data") or []

    def overview(self):
        return (self.get("/api/vpn/overview") or {}).get("data") or {}

    def claim_trial(self, server_id, account_type="ssh"):
        data = self.post("/api/vpn/trial", {"serverId": server_id, "accountType": account_type})
        return (data or {}).get("data") or {}

    def account_config(self, account_id):
        path = "/api/vpn/accounts/%s/config" % urllib.parse.quote(str(account_id), safe="")
        return (self.get(path) or {}).get("data") or {}


# ----------------------------------------------------------------------------- Telegram


class Telegram:
    def __init__(self, token):
        self.token = token
        self.api = "https://api.telegram.org/bot%s/" % token

    def call(self, method, **params):
        url = self.api + method
        body = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None}).encode("utf-8")
        request = urllib.request.Request(url, data=body, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = json.loads(response.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as exc:
            LOG.warning("Telegram %s gagal: %s", method, exc.code)
            return {"ok": False, "description": str(exc.code)}
        except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as exc:
            LOG.warning("Telegram %s gagal: %s", method, exc)
            return {"ok": False, "description": str(exc)}
        if not data.get("ok"):
            LOG.warning("Telegram %s: %s", method, data.get("description"))
        return data

    def send(self, chat_id, text, reply_to=None):
        """Kirim pesan HTML, dipecah kalau lebih panjang dari batas Telegram."""
        chunks = split_text(text, 3900)
        result = {"ok": True}
        message_id = None
        for chunk in chunks:
            params = {
                "chat_id": chat_id,
                "text": chunk,
                "parse_mode": "HTML",
                "disable_web_page_preview": "true",
            }
            if reply_to:
                params["reply_to_message_id"] = reply_to
            result = self.call("sendMessage", **params)
            if message_id is None:
                message_id = (result.get("result") or {}).get("message_id")
            reply_to = message_id
        return result


def strip_html(text):
    """Buang tag HTML (dan kembalikan entitas seperti &lt;), untuk output terminal."""
    return unescape(re.sub(r"</?(b|i|u|code|pre|a[^>]*)>", "", text or ""))


def split_text(text, limit):
    text = text or ""
    if len(text) <= limit:
        return [text]
    parts, current = [], ""
    for line in text.split("\n"):
        if len(line) > limit:
            for i in range(0, len(line), limit):
                parts.append(line[i : i + limit])
            continue
        if len(current) + len(line) + 1 > limit:
            parts.append(current)
            current = line
        else:
            current = f"{current}\n{line}" if current else line
    if current:
        parts.append(current)
    return parts


# ----------------------------------------------------------------------------- bantuan


def fmt_time(value):
    """Format waktu dari API (ISO) ke tanggal jam WIB yang mudah dibaca."""
    if not value:
        return "-"
    text = str(value).strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    for candidate in (text, text.replace(" ", "T")):
        try:
            stamp = datetime.fromisoformat(candidate)
        except ValueError:
            continue
        if stamp.tzinfo is None:
            stamp = stamp.replace(tzinfo=timezone.utc)
        return stamp.astimezone(WIB).strftime("%d-%m-%Y %H:%M WIB")
    return str(value)


def server_supports(server, account_type):
    """Cek apakah server melayani tipe akun. Server ZiVPN ditulis 'UDP ZiVPN' oleh situs."""
    protocols = " ".join(str(p).lower() for p in (server.get("protocols") or []))
    wanted = str(account_type).lower()
    if wanted == "zivpn":
        return "zivpn" in protocols or bool(server.get("isUdpZivpnOnly"))
    return wanted in protocols


def server_id_of(server):
    """Ambil ID server. Daftar publik hanya mengirim nama, jadi beberapa kunci dicoba."""
    for key in ("id", "serverId", "_id", "slug"):
        value = server.get(key)
        if value:
            return str(value)
    return ""


def choose_server(servers, prefs):
    """Pilih server trial: ikut pilihan user, kalau kosong ambil server Indonesia yang masih ada slot."""
    wanted_id = str(prefs.get("server_id") or "").strip()
    account_type = prefs.get("account_type", "ssh")
    pool = [s for s in servers if server_supports(s, account_type)]
    pool = [s for s in pool if not s.get("isFull")]

    if wanted_id:
        needle = wanted_id.lower()
        for server in pool:
            if server_id_of(server).lower() == needle:
                return server
        for server in pool:
            if needle in str(server.get("name", "")).lower():
                return server
        # Pilihan user tidak tersedia; tetap dipakai supaya server yang membalas error jelas.
        return {"id": wanted_id, "name": wanted_id, "protocols": [account_type]}

    with_slot = [s for s in pool if int(s.get("slotLeft") or 0) > 0]
    candidates = with_slot or pool
    indo = [s for s in candidates if "id" in str(s.get("name", "")).lower()[:4] or "🇮🇩" in str(s.get("name", ""))]
    if indo:
        indo.sort(key=lambda s: -int(s.get("slotLeft") or 0))
        return indo[0]
    if candidates:
        candidates.sort(key=lambda s: -int(s.get("slotLeft") or 0))
        return candidates[0]
    return None


def format_account_text(account, title):
    """Susun pesan berisi kredensial akun, sama lengkapnya dengan panel detail di situs."""
    if not account:
        return f"{title}\n(pengaturan akun tidak dikembalikan server)"

    lines = [title]
    username = account.get("username")
    if username:
        lines.append(f"Username: <code>{escape(str(username))}</code>")
    password = account.get("password")
    if password:
        lines.append(f"Password: <code>{escape(str(password))}</code>")
    if account.get("udpPassword"):
        lines.append(f"Password UDP: <code>{escape(str(account['udpPassword']))}</code>")
    if account.get("serverName"):
        lines.append(f"Server: {escape(str(account['serverName']))}")
    if account.get("serverDomain"):
        lines.append(f"Host: <code>{escape(str(account['serverDomain']))}</code>")

    ports = account.get("sshPorts") or {}
    for key, label in SSH_PORT_LABELS:
        if ports.get(key):
            lines.append(f"{label}: <code>{escape(str(ports[key]))}</code>")

    if account.get("ipPackage"):
        lines.append(f"Limit perangkat: {account['ipPackage']}")
    if account.get("quota"):
        lines.append(f"Kuota: {account['quota']} MB")
    lines.append(f"Aktif sampai: {fmt_time(account.get('expiredAt'))}")

    for item in account.get("sshAccountLines") or []:
        label = item.get("label") or "Config"
        text = item.get("text") or ""
        if text:
            lines.append(f"{escape(str(label))}:\n<code>{escape(str(text))}</code>")

    links = account.get("links") or {}
    for key, value in links.items():
        if value:
            lines.append(f"{escape(str(key))}:\n<code>{escape(str(value))}</code>")

    return "\n".join(lines)


def format_server_list(servers):
    if not servers:
        return "Server VPN tidak ada yang kembali dari server."
    rows = ["<b>Daftar server VPN</b>"]
    for index, server in enumerate(servers, 1):
        protocols = ", ".join(server.get("protocols") or []) or "-"
        server_id = server_id_of(server) or "pakai nama server"
        rows.append(
            "%d. %s\n   id: <code>%s</code> | protokol: %s | slot sisa: %s | Rp%s/hari"
            % (
                index,
                escape(str(server.get("name") or "-")),
                escape(str(server_id)),
                escape(protocols),
                server.get("slotLeft", "-"),
                server.get("pricePerDay", "-"),
            )
        )
    rows.append("Catatan: daftar tanpa login tidak mengirim ID server. Kirim /accounts setelah login untuk ID aslinya.")
    return "\n\n".join(rows)


def parse_clock(value):
    """Validasi 'HH:MM' dan kembalikan menit sejak tengah malam, atau None."""
    try:
        hour, minute = str(value).strip().split(":")
        hour, minute = int(hour), int(minute)
    except (ValueError, AttributeError):
        return None
    if 0 <= hour <= 23 and 0 <= minute <= 59:
        return hour * 60 + minute
    return None


def next_run_at(claim_time, now=None):
    minutes = parse_clock(claim_time)
    if minutes is None:
        minutes = 7 * 60
    now = now or datetime.now(WIB)
    target = now.replace(hour=minutes // 60, minute=minutes % 60, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    return target


# ----------------------------------------------------------------------------- bot


class ClaimBot:
    def __init__(self, config, config_path=None):
        self.config = config
        self.config_path = config_path
        self.state = StateStore(config["data_dir"])
        self.client = SiteClient(config["site_base"], config["data_dir"])
        self.telegram = Telegram(config["telegram_token"]) if config["telegram_token"] else None
        self.chat_id = config["telegram_user_id"] or None
        self.running = True

    # ----- preferensi gabungan config + simpanan dari perintah Telegram
    def prefs(self):
        return {
            "account_type": self.state.get_pref("account_type", self.config["account_type"]),
            "server_id": self.state.get_pref("server_id", self.config["server_id"]),
            "claim_time": self.state.get_pref("claim_time", self.config["claim_time"]),
            "schedule_enabled": self.state.get_pref("schedule_enabled", self.config["schedule_enabled"]),
        }

    def notify(self, text, reply_to=None):
        LOG.info(text.replace("\n", " | "))
        if self.telegram and self.chat_id:
            self.telegram.send(self.chat_id, text, reply_to=reply_to)
        elif not self.telegram:
            print(strip_html(text))

    def ensure_login(self):
        if self.client.logged_in():
            return
        email, password = self.config["site_email"], self.config["site_password"]
        if not email or not password:
            raise SiteError("SITE_EMAIL / SITE_PASSWORD belum diisi di config.json", status=0)
        try:
            self.client.login(email, password)
        except SiteError as exc:
            if exc.require_turnstile:
                raise SiteError(
                    "Login dari bot ditolak dan butuh verifikasi Turnstile. Buka "
                    f"{self.config['site_base']} di browser, login manual satu kali, lalu coba lagi.",
                    status=exc.status,
                    require_turnstile=True,
                ) from exc
            raise

    # ----- inti: klaim trial
    def claim(self, source="manual", reply_to=None):
        self.state.data["last_attempt_at"] = datetime.now(WIB).isoformat()
        try:
            self.ensure_login()
            overview = self.client.overview()
            servers = overview.get("servers") or self.client.public_servers()
            server = choose_server(servers, self.prefs())
            if not server:
                raise SiteError("Tidak ada server yang mendukung tipe akun ini.", status=400)
            server_id = server_id_of(server)
            if not server_id:
                # Daftar server publik tidak mengirim ID, jadi server seperti ini
                # tidak bisa dipakai POST /api/vpn/trial.
                raise SiteError(
                    "Server %s tidak punya ID dari situs. Pastikan login berhasil "
                    "(sesi kedaluwarsa biasanya bikin daftar server jadi tidak lengkap)."
                    % escape(str(server.get("name") or "-")),
                    status=400,
                )
            LOG.info("Server dipilih: %s (%s)", server.get("name"), server_id)

            result = self.client.claim_trial(server_id, self.prefs()["account_type"])
            account = result.get("account") or {}
            detail = {}
            if account.get("id"):
                try:
                    detail = self.client.account_config(account["id"])
                except SiteError:
                    detail = {}
            merged = {**account, **{k: v for k, v in detail.items() if v not in (None, "")}}
            title = f"✅ Akun trial 1 jam dibuat ({'cron harian' if source == 'cron' else 'perintah /claim'})"
            self.state.data["last_claim_at"] = datetime.now(WIB).isoformat()
            self.state.data["last_claim_date"] = datetime.now(WIB).strftime("%Y-%m-%d")
            self.state.data["last_status"] = "ok"
            self.state.data["last_error"] = None
            self.state.data["next_retry_at"] = None
            self.state.save()
            self.notify(format_account_text(merged, title), reply_to=reply_to)
            return True
        except SiteError as exc:
            retry_minutes = max(int(self.config.get("retry_minutes") or 0), 0)
            if retry_minutes:
                self.state.data["next_retry_at"] = (datetime.now(WIB) + timedelta(minutes=retry_minutes)).isoformat()
            self.state.data["last_status"] = "gagal"
            self.state.data["last_error"] = exc.message
            self.state.save()
            note = f"\n\nCoba lagi sekitar {retry_minutes} menit lagi." if retry_minutes and source == "cron" else ""
            self.notify(
                f"❌ Klaim trial gagal: {escape(exc.message)}{note}",
                reply_to=reply_to,
            )
            return False

    def claim_due(self):
        """Dipanggil thread jadwal: klaim kalau sudah waktunya dan belum diklaim hari ini."""
        if not self.prefs()["schedule_enabled"]:
            return
        today = datetime.now(WIB).strftime("%Y-%m-%d")
        if self.state.data.get("last_claim_date") == today:
            return
        due = self.state.data.get("next_retry_at")
        if due:
            try:
                if datetime.fromisoformat(due) > datetime.now(WIB):
                    return
            except ValueError:
                pass
        self.claim(source="cron")

    # ----- perintah
    def help_text(self):
        prefs = self.prefs()
        return (
            "<b>Bot klaim VPN 1forcrkuota.com</b>\n\n"
            "/claim - klaim akun trial sekarang\n"
            "/status - status akun, jadwal, dan klaim terakhir\n"
            "/servers - daftar server VPN\n"
            "/accounts - daftar akun VPN kamu\n"
            "/config [nomor] - detail konfigurasi satu akun\n"
            "/type &lt;ssh|vmess|vless|trojan|zivpn&gt; - ganti tipe akun (kini: %s)\n"
            "/server &lt;id atau nama&gt; - patok server (kini: %s)\n"
            "/time HH:MM - jam klaim harian WIB (kini: %s)\n"
            "/on /off - nyalakan atau matikan jadwal harian\n"
            "/login email sandi - login dan simpan kredensial ke config.json\n"
            "/register nama email sandi [token] - daftar akun baru lewat bot\n"
            "/turnstile &lt;token&gt; - token manual kalau solver tidak ada\n"
            "/otp kode - masukkan kode OTP dari email\n"
            "/logout - hapus sesi login di bot\n"
            "/ping - cek bot hidup"
            % (
                escape(str(prefs["account_type"])),
                escape(str(prefs["server_id"] or "otomatis")),
                escape(str(prefs["claim_time"])),
            )
        )

    def status_text(self):
        prefs = self.prefs()
        rows = ["<b>Status bot</b>"]
        rows.append(f"Jadwal harian: {'aktif' if prefs['schedule_enabled'] else 'mati'} pada jam {prefs['claim_time']} WIB")
        rows.append(f"Tipe akun: {prefs['account_type']} | Server: {prefs['server_id'] or 'otomatis (ID, slot terbanyak)'}")
        rows.append(f"Klaim terakhir: {self.state.data.get('last_claim_at') or 'belum pernah'}")
        rows.append(f"Percobaan terakhir: {self.state.data.get('last_attempt_at') or '-'} ({self.state.data.get('last_status') or 'belum ada'})")
        if self.state.data.get("last_error"):
            rows.append(f"Error terakhir: {self.state.data['last_error']}")
        rows.append(f"Jadwal berikutnya: {next_run_at(prefs['claim_time']).strftime('%d-%m-%Y %H:%M WIB')}")

        if self.config["site_email"]:
            rows.append(f"Login sebagai: {self.config['site_email']}")
            if self.client.logged_in():
                try:
                    user = self.client.me().get("user") or {}
                    rows.append(f"Sesi login: aktif ({user.get('username') or user.get('email') or 'user'})")
                    overview = self.client.overview()
                    profile = overview.get("profile") or {}
                    if profile.get("saldo") is not None:
                        rows.append(f"Saldo: Rp{profile['saldo']}")
                    accounts = overview.get("accounts") or []
                    active = [a for a in accounts if a.get("isActive")]
                    rows.append(f"Akun aktif: {len(active)}")
                except SiteError as exc:
                    rows.append(f"Sesi login: gagal ({exc.message})")
            else:
                rows.append("Sesi login: belum ada / kedaluwarsa")
        else:
            rows.append("Login: belum diatur (isi site_email dan site_password)")

        token_ready = bool(self.stored_turnstile_token())
        rows.append(
            "Turnstile untuk daftar akun: mode %s, solver %s, token %s"
            % (
                escape(str(self.config.get("turnstile_mode"))),
                escape(str(self.config.get("turnstile_solver"))),
                "siap" if token_ready else "belum ada",
            )
        )
        imap_host = str((self.config.get("otp_imap") or {}).get("host") or "")
        otp_note = f" ({imap_host or 'IMAP belum diisi'})" if self.config.get("otp_source") == "imap" else ""
        rows.append(f"Sumber OTP: {self.config.get('otp_source')}{otp_note}")
        pending = self.state.data.get("pending_register") or {}
        if pending.get("email"):
            rows.append(f"Pendaftaran menunggu OTP: {escape(str(pending['email']))}")
        return "\n".join(rows)

    def accounts_text(self):
        try:
            self.ensure_login()
            accounts = self.client.overview().get("accounts") or []
        except SiteError as exc:
            return f"❌ {escape(exc.message)}"
        if not accounts:
            return "Belum ada akun VPN di akun kamu."
        self.state.data["accounts_cache"] = [
            {"id": a.get("id"), "username": a.get("username"), "serverName": a.get("serverName"), "expiredAt": a.get("expiredAt")}
            for a in accounts
        ]
        self.state.save()
        rows = ["<b>Daftar akun VPN</b>"]
        for index, account in enumerate(accounts, 1):
            flag = "aktif" if account.get("isActive") else "habis"
            trial = "trial" if account.get("isTrial") else "berbayar"
            rows.append(
                "%d. %s | %s | %s | sampai %s\n   id: <code>%s</code>"
                % (
                    index,
                    escape(str(account.get("username") or "-")),
                    escape(str(account.get("serverName") or "-")),
                    f"{trial}, {flag}",
                    fmt_time(account.get("expiredAt")),
                    escape(str(account.get("id") or "-")),
                )
            )
        rows.append("Pakai /config nomor atau /config id untuk detail.")
        return "\n\n".join(rows)

    def config_text(self, arg):
        try:
            self.ensure_login()
            account_id = arg
            if arg and arg.isdigit():
                cached = self.state.data.get("accounts_cache") or []
                index = int(arg) - 1
                if 0 <= index < len(cached):
                    account_id = cached[index].get("id")
            if not account_id:
                accounts = self.client.overview().get("accounts") or []
                if not accounts:
                    return "Belum ada akun. Kirim /claim dulu."
                self.state.data["accounts_cache"] = [
                    {
                        "id": a.get("id"),
                        "username": a.get("username"),
                        "serverName": a.get("serverName"),
                        "expiredAt": a.get("expiredAt"),
                    }
                    for a in accounts
                ]
                self.state.save()
                account_id = accounts[0].get("id")
            detail = self.client.account_config(account_id)
        except SiteError as exc:
            return f"❌ {escape(exc.message)}"
        return format_account_text(detail, "<b>Konfigurasi akun</b>")

    def handle(self, message):
        text = (message.get("text") or "").strip()
        chat_id = (message.get("from") or {}).get("id")
        message_id = message.get("message_id")
        if not text.startswith("/"):
            return
        if self.chat_id and chat_id != self.chat_id:
            LOG.info("Pesan dari chat lain diabaikan: %s", chat_id)
            return

        command, _, arg = text.partition(" ")
        command = command.split("@")[0].lower()
        arg = arg.strip()

        if command in ("/start", "/help"):
            self.notify(self.help_text(), reply_to=message_id)
        elif command == "/ping":
            self.notify("Pong. Bot hidup, WIB %s." % datetime.now(WIB).strftime("%H:%M"))
        elif command == "/claim":
            threading.Thread(target=self.claim, kwargs={"reply_to": message_id}, daemon=True).start()
            self.notify("Menjalankan klaim trial...", reply_to=message_id)
        elif command == "/status":
            self.notify(self.status_text(), reply_to=message_id)
        elif command == "/servers":
            try:
                self.notify(format_server_list(self.client.public_servers()), reply_to=message_id)
            except SiteError as exc:
                self.notify(f"❌ {escape(exc.message)}", reply_to=message_id)
        elif command == "/accounts":
            self.notify(self.accounts_text(), reply_to=message_id)
        elif command == "/config":
            self.notify(self.config_text(arg), reply_to=message_id)
        elif command == "/type":
            choice = arg.lower()
            if choice in ACCOUNT_TYPES:
                self.state.set_pref("account_type", choice)
                self.notify(f"Tipe akun diganti ke {choice}.", reply_to=message_id)
            else:
                self.notify("Pilih salah satu: " + ", ".join(ACCOUNT_TYPES), reply_to=message_id)
        elif command == "/server":
            self.state.set_pref("server_id", arg)
            self.notify(f"Server dipatok ke: {arg or 'otomatis'}", reply_to=message_id)
        elif command == "/time":
            if parse_clock(arg) is None:
                self.notify("Format jam salah. Contoh: /time 07:00", reply_to=message_id)
            else:
                self.state.set_pref("claim_time", arg)
                self.notify(f"Jadwal klaim diubah ke {arg} WIB.", reply_to=message_id)
        elif command == "/on":
            self.state.set_pref("schedule_enabled", True)
            self.notify("Jadwal harian dinyalakan.", reply_to=message_id)
        elif command == "/off":
            self.state.set_pref("schedule_enabled", False)
            self.notify("Jadwal harian dimatikan.", reply_to=message_id)
        elif command == "/login":
            parts = arg.split()
            if len(parts) < 2:
                self.notify("Contoh: /login kamu@email.com sandi123", reply_to=message_id)
            else:
                threading.Thread(target=self._login_worker, args=(parts[0], " ".join(parts[1:])), daemon=True).start()
                self.notify("Mencoba login...", reply_to=message_id)
        elif command == "/register":
            parts = arg.split()
            token = ""
            # Argumen terakhir dianggap token Turnstile kalau bentuknya panjang,
            # supaya "/register nama email sandi" tetap jalan seperti dulu.
            if len(parts) >= 4 and turnstile is not None and turnstile.looks_like_token(parts[-1]):
                token = parts.pop()
            if len(parts) < 3:
                self.notify(
                    "Contoh: /register username kamu@email.com sandi123 [token]\n"
                    "Token Turnstile boleh ditempel di ujung (atau /turnstile dulu). "
                    "Situs kirim kode OTP ke email; setelah masuk kirim /otp kodenya.",
                    reply_to=message_id,
                )
            else:
                threading.Thread(
                    target=self._register_worker,
                    args=(parts[0], parts[1], " ".join(parts[2:]), token),
                    daemon=True,
                ).start()
                self.notify("Mendaftarkan akun baru (mengurus token Turnstile dulu)...", reply_to=message_id)
        elif command == "/turnstile":
            if not arg:
                still_valid = bool(self.stored_turnstile_token())
                self.notify(
                    "Token tersimpan: %s" % ("masih berlaku" if still_valid else "kosong atau sudah kedaluwarsa"),
                    reply_to=message_id,
                )
            elif turnstile is not None and not turnstile.looks_like_token(arg):
                self.notify("Token terlihat terlalu pendek atau ada spasi. Salin seluruh nilai token.", reply_to=message_id)
            else:
                self.set_turnstile_token(arg)
                self.notify("Token Turnstile disimpan (pakai segera, umur token sekitar 5 menit).\nKirim: /register nama email sandi", reply_to=message_id)
        elif command == "/otp":
            if not arg:
                self.notify("Contoh: /otp 123456", reply_to=message_id)
            else:
                pending = self.state.data.get("pending_register") or {}
                email = pending.get("email") or ""
                threading.Thread(target=self._otp_worker, args=(email, arg), daemon=True).start()
                self.notify("Mengirim OTP...", reply_to=message_id)
        elif command == "/logout":
            try:
                self.client.logout()
                self.notify("Sesi login di bot dihapus.", reply_to=message_id)
            except SiteError as exc:
                self.notify(f"Logout gagal: {escape(exc.message)}", reply_to=message_id)
        else:
            self.notify("Perintah tidak dikenal. Kirim /help.", reply_to=message_id)

    # ----- login, token Turnstile, dan pendaftaran akun baru
    def save_credentials(self, email=None, password=None):
        """Simpan email/sandi ke config.json supaya tidak diketik ulang setelah restart."""
        changed = False
        if email:
            self.config["site_email"] = email
            changed = True
        if password:
            self.config["site_password"] = password
            changed = True
        if not changed or not self.config_path:
            return
        try:
            with open(self.config_path, "w", encoding="utf-8") as fh:
                json.dump(self.config, fh, indent=2, ensure_ascii=False)
            LOG.info("Kredensial situs diperbarui di %s", self.config_path)
        except OSError as exc:
            LOG.warning("Gagal menulis %s: %s", self.config_path, exc)

    def set_turnstile_token(self, token):
        """Simpan token Turnstile yang disalin manual (umur token hanya sekitar 5 menit)."""
        now = datetime.now(WIB)
        self.state.data["turnstile_token"] = {
            "token": str(token).strip(),
            "saved_at": now.isoformat(),
            "expires_at": (now + timedelta(minutes=5)).isoformat(),
        }
        self.state.save()

    def turnstile_token(self, manual=""):
        """Cari token Turnstile: manual dari Telegram, lalu solver API, lalu browser."""
        token = str(manual or "").strip() or self.stored_turnstile_token()
        if token:
            return token
        if turnstile is None:
            raise SiteError("solve_turnstile.py tidak ada di folder bot, tidak bisa ambil token", status=0)

        sitekey = turnstile.SITE_KEY
        try:
            captcha_conf = self.client.captcha_config()
        except SiteError as exc:
            raise SiteError(f"Gagal cek kebutuhan captcha: {exc.message}", status=0) from exc
        sitekey = str(captcha_conf.get("turnstileSiteKey") or sitekey)
        if str(captcha_conf.get("provider")) != "turnstile":
            return ""  # situs sedang memakai captcha lokal, token tidak diminta

        try:
            token = turnstile.get_token(self.config, sitekey=sitekey, url=self.config["site_base"] + "/")
        except turnstile.SolverError as exc:
            raise SiteError(str(exc), status=0) from exc
        self.set_turnstile_token(token)
        return token

    def stored_turnstile_token(self):
        """Token manual yang masih berlaku."""
        saved = self.state.data.get("turnstile_token") or {}
        token = str(saved.get("token") or "").strip()
        if not token:
            return ""
        try:
            if datetime.fromisoformat(saved.get("expires_at")) < datetime.now(WIB):
                self.state.data.pop("turnstile_token", None)
                self.state.save()
                return ""
        except (TypeError, ValueError):
            return ""
        return token

    def register_new(self, username, email, password, turnstile_token=""):
        """Daftar akun 1forcrkuota.com lewat bot, lalu verifikasi OTP."""
        self.state.data["pending_register"] = {
            "username": username,
            "email": email,
            "password": password,
            "at": datetime.now(WIB).isoformat(),
        }
        self.state.save()

        try:
            token = self.turnstile_token(turnstile_token)
        except SiteError as exc:
            self.notify(f"Kebutuhan Turnstile: {escape(exc.message)}")
            return False

        try:
            self.client.register(username, email, password, turnstile_token=token)
        except SiteError as exc:
            ditolak = "verifikasi keamanan" in str(exc.message).lower()
            if ditolak:
                # Token lama biasanya sudah terpakai atau kedaluwarsa, buang saja.
                self.state.data.pop("turnstile_token", None)
                self.state.save()
            hint = ""
            if ditolak:
                hint = "\nToken Turnstile tadi ditolak. Kirim /turnstile <token baru> lalu ulangi /register."
            elif not token:
                hint = "\nBot juga sudah mencoba semua jalur Turnstile yang ada."
            self.notify(f"Pendaftaran gagal: {escape(exc.message)}{hint}")
            return False

        self.state.data.pop("turnstile_token", None)
        self.state.save()
        self.notify(f"Pendaftaran {email} diterima situs. Sekarang menunggu kode OTP.")

        otp = ""
        if str(self.config.get("otp_source")) == "imap":
            if otp_email is None:
                self.notify("Modul otp_email.py tidak ada, kirim /otp kodenya manual ya.")
            else:
                try:
                    self.notify("Mengambil kode OTP dari email lewat IMAP...")
                    otp = otp_email.fetch_otp(
                        self.config.get("otp_imap"),
                        target_email=email,
                        timeout=int(self.config.get("otp_wait_seconds") or 240),
                    )
                except otp_email.OtpError as exc:
                    self.notify(
                        "OTP otomatis gagal: %s\nCek email (termasuk folder spam), lalu kirim /otp kodenya."
                        % escape(str(exc))
                    )
        else:
            self.notify("Buka email %s (cek juga folder spam) lalu kirim: /otp kodenya" % escape(email))

        if not otp:
            return False
        self.notify(f"Kode OTP otomatis terbaca: {escape(otp)}")
        return self.verify_otp_and_login(email, otp)

    def verify_otp_and_login(self, email, otp):
        """Verifikasi kode OTP lalu langsung login pakai sandi pendaftaran."""
        pending = self.state.data.get("pending_register") or {}
        password = str(pending.get("password") or "")
        try:
            self.client.verify_otp(email, otp)
        except SiteError as exc:
            self.notify(f"OTP gagal: {escape(exc.message)}")
            return False

        self.state.data.pop("pending_register", None)
        self.state.save()
        self.notify(f"OTP benar. Akun {email} sudah aktif di situs.")
        if password:
            self.login_and_report(email, password, note="Login otomatis setelah verifikasi.")
        else:
            self.notify(f"Kirim /login {email} <sandi> supaya bot bisa masuk.")
        return True

    def login_and_report(self, email, password, note=""):
        try:
            self.client.login(email, password)
        except SiteError as exc:
            extra = "\nLogin dari bot butuh Turnstile: masuk manual sekali di browser, lalu kirim /login lagi." if exc.require_turnstile else ""
            self.notify(f"Login gagal: {escape(exc.message)}{extra}")
            return False
        self.save_credentials(email, password)
        prefix = f"{note} " if note else ""
        self.notify(f"{prefix}Login berhasil sebagai {escape(email)}. Kirim /claim untuk coba klaim VPN.")
        return True

    def _login_worker(self, email, password):
        self.login_and_report(email, password)

    def _register_worker(self, username, email, password, turnstile_token=""):
        self.register_new(username, email, password, turnstile_token=turnstile_token)

    def _otp_worker(self, email, otp):
        pending = self.state.data.get("pending_register") or {}
        email = email or pending.get("email") or self.config.get("site_email")
        if not email:
            self.notify("Tidak ada pendaftaran yang menunggu. Contoh: /register nama email sandi")
            return
        self.verify_otp_and_login(email, otp)

    # ----- loop utama
    def poll_updates(self):
        offset = self.state.data.get("telegram_offset", 0)
        while self.running:
            data = self.telegram.call(
                "getUpdates", offset=offset, timeout=25, allowed_updates='["message"]'
            )
            updates = data.get("result")
            if updates is None:
                # Token salah atau Telegram sedang bermasalah; jangan berputar cepat.
                time.sleep(15)
                continue
            for update in updates:
                offset = max(offset, update.get("update_id", 0) + 1)
                self.state.data["telegram_offset"] = offset
                self.state.save()
                message = update.get("message")
                if message:
                    try:
                        self.handle(message)
                    except Exception:  # satu pesan rusak tidak boleh mematikan bot
                        LOG.exception("Gagal memproses pesan")
            time.sleep(1)

    def scheduler(self):
        while self.running:
            try:
                now = datetime.now(WIB)
                minutes = parse_clock(self.prefs()["claim_time"]) or 7 * 60
                target = now.replace(hour=minutes // 60, minute=minutes % 60, second=0, microsecond=0)
                if target <= now:
                    target += timedelta(days=1)
                wait = (target - now).total_seconds()
                LOG.info("Klaim berikutnya pada %s", target.strftime("%d-%m-%Y %H:%M WIB"))
                slept = 0.0
                while self.running and slept < wait:
                    time.sleep(min(30, wait - slept))
                    slept += 30
                if not self.running:
                    break
                self.claim_due()
                # Jaga-jaga kalau klaim gagal: coba lagi tiap retry_minutes.
                retry = int(self.config.get("retry_minutes") or 0)
                if retry and self.state.data.get("last_status") == "gagal":
                    for _ in range(int((24 * 60) / max(retry, 5))):
                        if not self.running:
                            break
                        time.sleep(min(retry * 60, 1800))
                        if self.state.data.get("last_status") == "ok":
                            break
                        self.claim_due()
            except Exception:
                LOG.exception("Gagal pada thread jadwal")
                time.sleep(300)

    def run(self):
        if not self.telegram:
            raise SystemExit("Telegram token kosong. Isi telegram_token di config.json atau env TELEGRAM_BOT_TOKEN.")
        if not self.chat_id:
            LOG.warning("telegram_user_id belum diisi: siapa pun yang tahu token bisa memerintah bot ini.")
        threading.Thread(target=self.scheduler, daemon=True).start()
        LOG.info("Bot siap. Token Telegram dan sesi situs dimuat.")
        self.poll_updates()


def run_once(config, config_path=None):
    """Klaim sekali tanpa Telegram, untuk cron."""
    bot_instance = ClaimBot(config, config_path)
    ok = bot_instance.claim(source="once")
    state = bot_instance.state.data
    if not bot_instance.telegram:
        detail = state.get("last_error") or "kredensial dikirim ke Telegram (isi telegram_user_id)"
        print(f"Klaim {'berhasil' if ok else 'gagal'}: {detail}")
    return 0 if ok else 1


def build_parser():
    parser = argparse.ArgumentParser(description="Bot klaim VPN/SSH gratis 1forcrkuota.com")
    parser.add_argument("--config", default="config.json", help="lokasi file config (default config.json)")
    parser.add_argument("--once", action="store_true", help="klaim sekali lalu keluar (untuk cron)")
    parser.add_argument("--servers", action="store_true", help="cetak daftar server VPN lalu keluar")
    parser.add_argument("--login-test", action="store_true", help="coba login dan cetak info akun")
    parser.add_argument("--register", nargs="+", metavar="ARG", help="daftar akun baru: nama email sandi [token-turnstile]")
    parser.add_argument("--otp", metavar="KODE", default="", help="kirim kode OTP untuk pendaftaran terakhir")
    parser.add_argument("--turnstile", metavar="TOKEN", default="", help="simpan token Turnstile manual")
    parser.add_argument("--debug", action="store_true", help="log lebih detail")
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.debug else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    config = load_config(args.config)

    if args.servers:
        print(strip_html(format_server_list(SiteClient(config["site_base"], config["data_dir"]).public_servers())))
        return 0
    if args.login_test:
        client = SiteClient(config["site_base"], config["data_dir"])
        client.login(config["site_email"], config["site_password"])
        print(json.dumps(client.me(), ensure_ascii=False, indent=2))
        return 0
    if args.turnstile:
        bot_instance = ClaimBot(config, args.config)
        bot_instance.set_turnstile_token(args.turnstile)
        print("Token Turnstile disimpan (pakai dalam ~5 menit).")
        return 0
    if args.register:
        parts = list(args.register)
        token = ""
        if len(parts) >= 4 and turnstile is not None and turnstile.looks_like_token(parts[-1]):
            token = parts.pop()
        if len(parts) < 3:
            print("Pakai: --register username email sandi [token-turnstile]")
            return 2
        return 0 if ClaimBot(config, args.config).register_new(*parts, turnstile_token=token) else 1
    if args.otp:
        bot_instance = ClaimBot(config, args.config)
        pending = bot_instance.state.data.get("pending_register") or {}
        email = pending.get("email") or config["site_email"]
        return 0 if bot_instance.verify_otp_and_login(email, args.otp) else 1
    if args.once:
        return run_once(config, args.config)

    ClaimBot(config, args.config).run()
    return 0


if __name__ == "__main__":
    sys.exit(main())
