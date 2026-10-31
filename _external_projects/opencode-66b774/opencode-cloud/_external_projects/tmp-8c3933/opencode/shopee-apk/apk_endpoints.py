#!/usr/bin/env python3
"""Bedah APK/XAPK Shopee: tarik endpoint API asli dari classes*.dex.

Gak butuh jadx/apktool — string literal di dex bisa dibaca mentah, dan itu
cukup buat ngungkep path endpoint + nama field payload.
"""
import json
import re
import sys
import zipfile
from pathlib import Path

XAPK = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/opencode/shopee-apk/Shopee.xapk")
OUT = XAPK.parent
WORK = OUT / "work"
WORK.mkdir(parents=True, exist_ok=True)

RE_PATH = re.compile(rb"(?:/sapi|/api|/buyer_stage|sapi|api)/[A-Za-z0-9_./{}\-]{4,120}")
RE_HOT = re.compile(r"(signup|sign_up|register|email|otp|vcode|login|password|verif|social|google|facebook|guest)", re.I)
RE_FIELD = re.compile(rb"[a-z][a-z0-9_]{3,40}")
FIELDS_HOT = re.compile(r"(email|phone|password|signup|vcode|otp|salt|sift|captcha|guest|social|token)", re.I)

MAX_DPI = 8 * 1024 * 1024  # satu dex mentah bisa 100+ MB, baca utuh aman (RAM lega)


def apk_entries(z: zipfile.ZipFile):
    for n in z.namelist():
        if n.lower().endswith((".apk", ".dex")):
            yield n


def dex_blobs(path: Path):
    if path.suffix.lower() == ".dex":
        yield path.name, path.read_bytes()
        return
    with zipfile.ZipFile(path) as z:
        for n in z.namelist():
            if n.endswith(".dex"):
                try:
                    yield n, z.read(n)
                except Exception:
                    pass


def scan(blob: bytes, found: dict, src: str):
    for m in RE_PATH.finditer(blob):
        ep = m.group(0).decode("latin1").rstrip("/.,")
        if RE_HOT.search(ep):
            found.setdefault(ep, set()).add(src)


def context_samples(blob: bytes, needle: bytes, limit: int = 14) -> list[str]:
    out, start = [], 0
    while len(out) < limit:
        i = blob.find(needle, start)
        if i < 0:
            break
        seg = blob[max(0, i - 70): i + 90]
        clean = re.sub(rb"[^\x20-\x7e]", b" ", seg).decode("latin1")
        clean = re.sub(r"\s+", " ", clean).strip()
        if len(clean) > 20:
            out.append(clean)
        start = i + len(needle)
    return out


def main():
    if not XAPK.exists():
        sys.exit(f"belum ada {XAPK}")
    print(f"berkas: {XAPK} ({XAPK.stat().st_size/1e6:.1f} MB)")
    with zipfile.ZipFile(XAPK) as z:
        names = z.namelist()
        print(f"isi xapk: {len(names)} entri")
        for n in names:
            if n.lower().endswith(".json"):
                try:
                    meta = json.loads(z.read(n))
                    info = meta.get("info", meta)
                    print("  metadata:", {k: info.get(k) for k in ("name", "versionName", "versionCode") if isinstance(info, dict)})
                except Exception:
                    pass
        targets = list(apk_entries(z))
        print(f"apk/dex di dalam xapk: {len(targets)}")
        extracted = []
        for n in targets:
            dest = WORK / Path(n).name
            with z.open(n) as src, open(dest, "wb") as dst:
                while True:
                    chunk = src.read(1 << 20)
                    if not chunk:
                        break
                    dst.write(chunk)
            extracted.append(dest)

    found: dict = {}
    samples: dict = {}
    dex_count = 0
    for f in extracted:
        for name, blob in dex_blobs(f):
            dex_count += 1
            scan(blob, found, f"{f.name}:{name}")
            for needle in (b"signup", b"email_signup", b"send_vcode", b"verify_vcode"):
                if needle not in samples:
                    s = context_samples(blob, needle)
                    if s:
                        samples[needle.decode()] = s
            # kumpulin nama field di sekitar 'signup'
            for i in [m.start() for m in re.finditer(rb"signup", blob)][:400]:
                seg = blob[max(0, i - 400): i + 400]
                for fm in RE_FIELD.finditer(seg):
                    w = fm.group(0).decode("latin1")
                    if FIELDS_HOT.search(w) and len(w) > 4:
                        found.setdefault("FIELD:" + w, set()).add("field")

    eps = sorted(k for k in found if not k.startswith("FIELD:"))
    fields = sorted(k[6:] for k in found if k.startswith("FIELD:"))
    auth_eps = [e for e in eps if re.search(r"(auth|login|signup|otp|vcode|email|password|user|account|session|token)", e, re.I)]

    print(f"\ndex discan: {dex_count} | path unik cocok kata kunci auth: {len(auth_eps)}")
    print("\n=== ENDPOINT AUTH DARI DALAM APK ===")
    for e in auth_eps[:400]:
        print("  ", e)

    print("\n=== ENDPOINT YANG NYEBUT EMAIL / SIGNUP ===")
    hot = [e for e in auth_eps if re.search(r"(email|signup|sign_up|vcode|otp)", e, re.I)]
    for e in hot:
        print("  ", e, "<-", sorted(found[e])[:1])

    print("\n=== KONTEKS STRING DI SEKITAR 'signup' / 'send_vcode' ===")
    for k, vals in samples.items():
        print(f"\n[{k}]")
        for v in vals[:6]:
            print("   ", v[:170])

    print(f"\n=== NAMA FIELD DI SEKITAR 'signup' ({len(fields)}) ===")
    print("  ", ", ".join(fields[:160]))

    (OUT / "apk_endpoints.txt").write_text("\n".join(eps), encoding="utf-8")
    (OUT / "apk_auth_endpoints.txt").write_text("\n".join(auth_eps), encoding="utf-8")
    (OUT / "apk_fields.txt").write_text("\n".join(fields), encoding="utf-8")
    print("\ndisimpan:", OUT / "apk_auth_endpoints.txt")


if __name__ == "__main__":
    main()
