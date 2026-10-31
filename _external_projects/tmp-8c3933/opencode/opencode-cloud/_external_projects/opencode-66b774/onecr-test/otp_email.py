#!/usr/bin/env python3
"""Mengambil kode OTP pendaftaran 1forcrkuota.com langsung dari email (IMAP).

Dipakai bot.py supaya verifikasi akun tidak perlu diketik manual. Bisa juga
dijalankan sendiri untuk uji koneksi mailbox:

    python3 otp_email.py --host imap.gmail.com --user kamu@gmail.com --pass APP_PASSWORD
"""

import argparse
import html
import imaplib
import re
import sys
import time
import urllib.error
from datetime import datetime, timedelta, timezone
from email import message_from_bytes
from email.utils import parsedate_to_datetime

# Kode yang dicari di badan email. Pola pertama lebih ketat (ada labelnya),
# pola terakhir hanya angka 4-6 digit yang berdiri sendiri dan baru dipakai
# kalau email menyebut alamat tujuan, supaya angka lain tidak salah ambil.
LABEL_PATTERNS = (
    r"kode\s*(?:otp|verifikasi|konfirmasi)[\s\S]{0,40}?(\d{4,6})",
    r"(?:otp|verification|confirm(?:ation)?)\s*code[\s\S]{0,40}?(\d{4,6})",
    r"\botp\b[\s\S]{0,25}?(\d{4,6})",
)
BARE_CODE_PATTERN = r"(?<![\d.,])\d{4,6}(?![\d.,])"
CURRENCY_HINT = re.compile(r"(?:\brp\b|rp\.?\s|rupiah|\bidr\b)", re.IGNORECASE)


class OtpError(Exception):
    """OTP tidak ketemu atau IMAP tidak bisa dipakai."""


def to_plain_text(raw):
    """Ubah isi email (HTML atau polos) jadi teks biasa."""
    text = str(raw or "")
    text = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", text)
    if "<" in text and ">" in text:
        text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"[ \t]+", " ", text)


def bare_codes(body):
    """Angka 4-6 digit yang berdiri sendiri; harga seperti 'Rp 265000' dibuang."""
    found = []
    for match in re.finditer(BARE_CODE_PATTERN, body):
        before = body[max(0, match.start() - 10) : match.start()]
        after = body[match.end() : match.end() + 10]
        if CURRENCY_HINT.search(before) or re.match(r"\s*(?:rupiah|\brp\b)", after, re.IGNORECASE):
            continue
        found.append(match.group())
    return found


def extract_otp(text, target_email=""):
    """Cari kode OTP di teks email; mengembalikan string kode atau None."""
    body = to_plain_text(text)
    if not body.strip():
        return None

    for pattern in LABEL_PATTERNS:
        match = re.search(pattern, body, flags=re.IGNORECASE)
        if match:
            return match.group(1)

    target_email = str(target_email or "").strip().lower()
    if target_email and target_email in body.lower():
        candidates = bare_codes(body)
        if len(candidates) == 1:
            return candidates[0]
    return None


def decode_message(raw_bytes):
    """Ambil teks + header dari pesan IMAP mentah."""
    message = message_from_bytes(raw_bytes)
    parts = []
    for part in message.walk():
        if part.get_content_maintype() != "text":
            continue
        try:
            payload = part.get_payload(decode=True)
        except (AssertionError, TypeError):  # bagian rusak
            continue
        if payload:
            parts.append(payload.decode(part.get_content_charset() or "utf-8", "replace"))
    sender = str(message.get("From") or "")
    return {"sender": sender, "subject": str(message.get("Subject") or ""), "text": "\n".join(parts)}


class OtpMailbox:
    """Pembaca mailbox sederhana yang dipakai ulang, jadi tidak login tiap cek."""

    def __init__(self, host, user, password, port=993, use_ssl=True, folder="INBOX"):
        self.host, self.user, self.password = host, user, password
        self.port, self.use_ssl, self.folder = int(port), bool(use_ssl), folder or "INBOX"
        self.connection = None

    def connect(self):
        if self.connection is not None:
            return self.connection
        try:
            if self.use_ssl:
                connection = imaplib.IMAP4_SSL(self.host, self.port)
            else:
                connection = imaplib.IMAP4(self.host, self.port)
        except OSError as exc:
            raise OtpError(f"Tidak bisa menghubungi IMAP {self.host}: {exc}") from exc
        try:
            connection.login(self.user, self.password)
            connection.select(self.folder)
        except imaplib.IMAP4.error as exc:
            try:
                connection.logout()
            except Exception:
                pass
            raise OtpError(
                "Login IMAP gagal: %s (untuk Gmail pakai App Password, bukan sandi akun)" % exc
            ) from exc
        self.connection = connection
        return connection

    def disconnect(self):
        if self.connection is None:
            return
        try:
            self.connection.logout()
        except Exception:
            pass
        self.connection = None

    def unread_ids(self):
        connection = self.connect()
        try:
            status, data = connection.search(None, "UNSEEN")
        except imaplib.IMAP4.error as exc:
            raise OtpError(f"Pencarian pesan gagal: {exc}") from exc
        if status != "OK" or not data or not data[0]:
            return []
        return data[0].split()

    def read(self, message_id):
        connection = self.connect()
        try:
            status, data = connection.fetch(message_id, "(RFC822)")
        except (imaplib.IMAP4.error, TypeError, IndexError) as exc:
            raise OtpError(f"Gagal membaca pesan {message_id}: {exc}") from exc
        if status != "OK" or not data or not data[0]:
            return None
        payload = data[0][1] if isinstance(data[0], tuple) else None
        return decode_message(payload) if payload else None


def fetch_otp(imap_config, target_email="", timeout=240, poll_seconds=10, sender_contains=""):
    """Tunggu lalu ambil kode OTP dari mailbox. Mengembalikan kode atau melempar OtpError."""
    conf = imap_config or {}
    host, user, password = conf.get("host"), conf.get("user"), conf.get("password")
    if not (host and user and password):
        raise OtpError("otp_imap belum lengkap (host, user, password)")

    target_email = str(target_email or "")
    sender_contains = str(sender_contains or conf.get("sender_contains") or "").lower()
    started = datetime.now(timezone.utc) - timedelta(minutes=10)
    mailbox = OtpMailbox(host, user, password, conf.get("port", 993), conf.get("ssl", True), conf.get("folder"))
    deadline = time.time() + timeout
    seen = set()
    try:
        while time.time() < deadline:
            for message_id in reversed(mailbox.unread_ids()):
                if message_id in seen:
                    continue
                seen.add(message_id)
                message = mailbox.read(message_id)
                if not message:
                    continue
                if sender_contains and sender_contains not in message["sender"].lower():
                    continue
                code = extract_otp(message["text"], target_email)
                if code:
                    return code
            time.sleep(min(poll_seconds, max(1.0, deadline - time.time())))
    finally:
        mailbox.disconnect()
    raise OtpError(f"Kode OTP untuk {target_email or 'akun'} belum muncul di email dalam {timeout} detik")


def main():
    parser = argparse.ArgumentParser(description="Baca kode OTP dari email lewat IMAP")
    parser.add_argument("--host", required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--pass", dest="password", required=True, help="sandi atau app password")
    parser.add_argument("--port", type=int, default=993)
    parser.add_argument("--no-ssl", action="store_true")
    parser.add_argument("--folder", default="INBOX")
    parser.add_argument("--target", default="", help="email tujuan pendaftaran")
    parser.add_argument("--sender", default="", help="hanya pesan dari pengirim yang mengandung teks ini")
    parser.add_argument("--timeout", type=int, default=240)
    args = parser.parse_args()

    try:
        code = fetch_otp(
            {
                "host": args.host,
                "user": args.user,
                "password": args.password,
                "port": args.port,
                "ssl": not args.no_ssl,
                "folder": args.folder,
            },
            target_email=args.target,
            timeout=args.timeout,
            sender_contains=args.sender,
        )
    except OtpError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        return 1
    print(code)
    return 0


if __name__ == "__main__":
    sys.exit(main())
