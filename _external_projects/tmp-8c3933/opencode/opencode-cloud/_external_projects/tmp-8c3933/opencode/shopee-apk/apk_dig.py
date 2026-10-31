#!/usr/bin/env python3
"""Dig lanjutan: cari nama field payload & jalur email/registrasi di dex yang udah diekstrak."""
import re
import sys
import zipfile
from pathlib import Path

WORK = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/opencode/shopee-apk/work")
OUT = WORK.parent

NEEDLES = [b"email_signup", b"email_otp", b"email_verified", b"send_vcode", b"verify_vcode",
           b"vcode_type", b"phone_number", b"bind_phone", b"registration_status",
           b"get_login_nonce", b"social_binding", b"guest_account"]
RE_PRINT = re.compile(rb"[\x20-\x7e]{4,}")

files = []
for f in sorted(WORK.iterdir()):
    if f.suffix.lower() == ".apk":
        with zipfile.ZipFile(f) as z:
            for n in z.namelist():
                if n.endswith(".dex"):
                    files.append((f"{f.name}:{n}", z.read(n)))
    elif f.suffix.lower() == ".dex":
        files.append((f.name, f.read_bytes()))

print(f"dex siap discan: {len(files)}")

found = {}
for src, blob in files:
    for needle in NEEDLES:
        start, hits = 0, found.setdefault(needle.decode(), [])
        while len(hits) < 6:
            i = blob.find(needle, start)
            if i < 0:
                break
            seg = blob[max(0, i - 260): i + 300]
            clean = " ".join(m.group(0).decode("latin1") for m in RE_PRINT.finditer(seg))
            clean = re.sub(r"\s+", " ", clean).strip()
            if len(clean) > 40 and clean not in hits:
                hits.append(clean)
            start = i + len(needle)

for k in [n.decode() for n in NEEDLES]:
    hits = found.get(k, [])
    print(f"\n{'='*72}\n### {k} ({len(hits)} cuplikan)")
    for h in hits[:4]:
        print("  ", h[:430])

# daftar SEMUA path api/sapi yang ada, baru disaring manual
paths = set()
RE_P = re.compile(rb"(?:api|sapi|buyer_stage)/[A-Za-z0-9_./{}\-]{4,120}")
for src, blob in files:
    for m in RE_P.finditer(blob):
        paths.add(m.group(0).decode("latin1").rstrip("/."))
print(f"\n{'='*72}\nTOTAL path api/sapi unik: {len(paths)}")
REG = re.compile(r"(regist|signup|sign_up|create|activate|bind|email|otp|vcode|guest|social|login|password|session|sso)", re.I)
reg = sorted(p for p in paths if REG.search(p))
print(f"yang terkait akun/registrasi: {len(reg)}")
for p in reg:
    print("  ", p)
OUT.joinpath("apk_all_api_paths.txt").write_text("\n".join(sorted(paths)), encoding="utf-8")
print("\nsimpan:", OUT / "apk_all_api_paths.txt")
