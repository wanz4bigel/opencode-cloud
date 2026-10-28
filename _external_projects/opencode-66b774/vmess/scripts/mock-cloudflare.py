#!/usr/bin/env python3
"""API Cloudflare tiruan untuk scripts/test-dns.sh (bukan untuk produksi).

  python3 scripts/mock-cloudflare.py <port> [ip-awal]

Endpoint:
  GET  /_state                          -> {"state": {...}, "calls": [...]}
  GET  /zones?name=...                  -> zone (hanya *.domainmu.com)
  GET  /zones/<id>/dns_records?type=A   -> record A (kalau ip-awal != "-")
  PATCH/POST /zones/<id>/dns_records    -> update / buat record
Semua endpoint butuh header "Authorization: Bearer good-token".
"""
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

ZONE_ID = "zone123"
RECORD_ID = "rec456"
TOKEN = "good-token"
STATE = {"ip": "1.1.1.1", "proxied": False, "created": 0, "patched": 0}
CALLS = []


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def _send(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _ok(self):
        if self.headers.get("Authorization") == f"Bearer {TOKEN}":
            return True
        self._send({"success": False, "errors": [{"message": "Invalid request headers"}]})
        return False

    def _read_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        CALLS.append(["GET", self.path])
        if self.path == "/_state":
            return self._send({"state": STATE, "calls": CALLS})
        if not self._ok():
            return
        if self.path.startswith("/zones?name="):
            name = self.path.split("name=")[1].split("&")[0]
            found = name.endswith("domainmu.com")
            return self._send({"success": True,
                               "result": [{"id": ZONE_ID, "name": name}] if found else []})
        if self.path.startswith(f"/zones/{ZONE_ID}/dns_records"):
            if STATE["ip"] is None:
                return self._send({"success": True, "result": []})
            return self._send({"success": True, "result": [
                {"id": RECORD_ID, "content": STATE["ip"], "proxied": STATE["proxied"]}]})
        self._send({"success": False, "errors": [{"message": "not found"}]}, 404)

    def do_PATCH(self):
        CALLS.append(["PATCH", self.path])
        if not self._ok():
            return
        data = self._read_json()
        STATE.update(ip=data["content"], proxied=data["proxied"], patched=STATE["patched"] + 1)
        self._send({"success": True, "result": {"id": RECORD_ID, **data}})

    def do_POST(self):
        CALLS.append(["POST", self.path])
        if not self._ok():
            return
        data = self._read_json()
        STATE.update(ip=data["content"], proxied=data["proxied"], created=STATE["created"] + 1)
        self._send({"success": True, "result": {"id": RECORD_ID, **data}})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 18080
    if len(sys.argv) > 2:
        STATE["ip"] = None if sys.argv[2] == "-" else sys.argv[2]
    HTTPServer(("127.0.0.1", port), Handler).serve_forever()
