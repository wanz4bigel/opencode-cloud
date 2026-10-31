#!/usr/bin/env python3
"""Minimal marimo pair client: run code in a live notebook kernel."""
from __future__ import annotations

import argparse
import http.client
import json
import os
import sys
from urllib.parse import urlsplit

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0 Safari/537.36")


def endpoint(url: str, path: str) -> str:
    p = urlsplit(url)
    return p._replace(path=f"{p.path.rstrip('/')}{path}", fragment="").geturl()


def request(url: str, method: str, headers: dict, body: bytes | None):
    p = urlsplit(url)
    cls = http.client.HTTPSConnection if p.scheme == "https" else http.client.HTTPConnection
    conn = cls(p.hostname, p.port, timeout=float(os.environ.get("MARIMO_TIMEOUT", "900")))
    conn.request(method, p.path or "/", body=body, headers=headers)
    return conn, conn.getresponse()


def sessions(url: str, token: str | None) -> dict:
    headers = {"User-Agent": UA, "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    conn, resp = request(endpoint(url, "/api/sessions"), "GET", headers, None)
    try:
        raw = resp.read()
    finally:
        conn.close()
    if resp.status in (401, 403):
        sys.exit(f"auth gagal (HTTP {resp.status}) — token salah/kurang")
    if resp.status != 200:
        sys.exit(f"/api/sessions -> HTTP {resp.status}: {raw[:200]!r}")
    payload = json.loads(raw)
    if not isinstance(payload, dict):
        sys.exit("format /api/sessions tak dikenal")
    return payload


def pick(payload: dict, key: str | None) -> str:
    if not payload:
        sys.exit("tidak ada sesi notebook yang hidup di server ini")
    items = [(c, s.get("session_id"), s.get("filename"), s.get("path")) for c, s in payload.items()]
    if key:
        for c, sid, fname, path in items:
            if key in (c, sid, fname, path):
                return sid
        sys.exit(f"sesi '{key}' tidak ditemukan; kandidat: " + ", ".join(str(i[1]) for i in items))
    if len(items) == 1:
        return items[0][1]
    sys.exit("lebih dari satu sesi; pakai --file. kandidat: "
             + ", ".join(f"{i[2] or i[0]}" for i in items))


def iter_sse(fp):
    name, data = "message", []
    for raw in fp:
        line = raw.decode("utf-8", "replace").rstrip("\r\n")
        if not line:
            if data:
                yield name, "\n".join(data)
            name, data = "message", []
            continue
        if line.startswith(":"):
            continue
        field, sep, value = line.partition(":")
        if sep and value.startswith(" "):
            value = value[1:]
        if field == "event":
            name = value
        elif field == "data":
            data.append(value)
    if data:
        yield name, "\n".join(data)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--token")
    ap.add_argument("--file")
    ap.add_argument("-c", "--code")
    ap.add_argument("target", nargs="?")
    a = ap.parse_args()

    if a.code is not None:
        code = a.code
    elif a.target in (None, "-"):
        code = sys.stdin.read()
    else:
        code = open(a.target, encoding="utf-8").read()

    sid = pick(sessions(a.url, a.token), a.file)
    headers = {"Content-Type": "application/json", "Marimo-Stable-Session-Id": sid,
               "User-Agent": UA, "Accept": "text/event-stream"}
    if a.token:
        headers["Authorization"] = f"Bearer {a.token}"
    body = json.dumps({"code": code}).encode()

    conn, resp = request(endpoint(a.url, "/api/kernel/execute"), "POST", headers, body)
    if resp.status in (401, 403):
        conn.close()
        sys.exit(f"auth gagal (HTTP {resp.status})")
    if resp.status != 200:
        detail = resp.read()[:300]
        conn.close()
        sys.exit(f"/api/kernel/execute -> HTTP {resp.status}: {detail!r}")

    success, output = None, None
    try:
        for name, data in iter_sse(resp):
            try:
                payload = json.loads(data)
            except ValueError:
                continue
            if name == "stdout":
                sys.stdout.write(payload.get("data", "")); sys.stdout.flush()
            elif name == "stderr":
                sys.stderr.write(payload.get("data", "")); sys.stderr.flush()
            elif name == "done":
                success = payload.get("success")
                out = payload.get("output")
                if isinstance(out, dict) and out.get("data"):
                    output = out
                break
    finally:
        conn.close()

    if output is not None and output.get("mimetype", "").startswith("text/"):
        sys.stdout.write(output["data"].rstrip("\n") + "\n")
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
