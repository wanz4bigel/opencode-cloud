#!/usr/bin/env python3
"""Ekstrak string asli dari classes*.dex lewat tabel string_ids (bukan regex mentah)."""
import re
import struct
import sys
import zipfile
from pathlib import Path

WORK = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/opencode/shopee-apk/work")


def uleb(data: bytes, off: int) -> tuple[int, int]:
    val = shift = 0
    while True:
        b = data[off]
        off += 1
        val |= (b & 0x7F) << shift
        if not (b & 0x80):
            return val, off
        shift += 7


def strings_of(blob: bytes):
    if blob[:4] != b"dex\n":
        return []
    string_ids_size, string_ids_off = struct.unpack_from("<II", blob, 0x38)
    out = []
    for i in range(string_ids_size):
        off = struct.unpack_from("<I", blob, string_ids_off + i * 4)[0]
        if off >= len(blob):
            continue
        _len, off = uleb(blob, off)
        end = blob.find(b"\0", off)
        if end < 0:
            continue
        try:
            out.append(blob[off:end].decode("utf-8", "replace"))
        except Exception:
            pass
    return out


allstr: set[str] = set()
count = 0
for f in sorted(WORK.iterdir()):
    if f.suffix.lower() == ".apk":
        with zipfile.ZipFile(f) as z:
            blobs = [(n, z.read(n)) for n in z.namelist() if n.endswith(".dex")]
    elif f.suffix.lower() == ".dex":
        blobs = [(f.name, f.read_bytes())]
    else:
        continue
    for name, blob in blobs:
        count += 1
        allstr.update(strings_of(blob))

print(f"dex: {count} | string unik: {len(allstr)}")

PATHISH = re.compile(r"^(?:/?(?:sapi|api|buyer_stage)/|/)[A-Za-z0-9_./{}\-]{4,120}$")
paths = sorted(s for s in allstr if PATHISH.match(s))
print(f"string berbentuk path: {len(paths)}")

HOT = re.compile(r"(auth|login|signup|sign_up|regist|email|otp|vcode|password|sso|guest|account|session|nonce)", re.I)
hot = [p for p in paths if HOT.search(p)]
print(f"\n=== PATH auth/akun ({len(hot)}) ===")
for p in hot:
    print("  ", p)

print("\n=== string persis soal signup/email (bukan path) ===")
kw = sorted(s for s in allstr if re.search(r"signup|sign_up|email_otp|emailSignup|emailLogin|with_email|by_email|new_account", s, re.I))
for s in kw[:120]:
    print("  ", repr(s[:150]))

out = WORK.parent / "dex_real_strings.txt"
out.write_text("\n".join(sorted(allstr)), encoding="utf-8")
print("\nsimpan:", out)
