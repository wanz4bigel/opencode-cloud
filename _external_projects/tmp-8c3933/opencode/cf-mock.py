#!/usr/bin/env python3
"""Mock Cloudflare API minimal untuk menguji scripts/dns-cloudflare.sh."""
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

ZONE_ID = "zone123"
RECORD_ID = "rec456"
STATE = {"ip": "1.1.1.1", "proxied": False, "created": 0}
CALLS = []


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, obj, code=200):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _auth(self):
        return self.headers.get("Authorization") == "Bearer good-token"

    def do_GET(self):
        CALLS.append(("GET", self.path))
        if self.path == "/_state":
            return self._send({"state": STATE, "calls": CALLS})
        if not self._auth():
            return self._send({"success": False, "errors": [{"message": "Invalid request headers"}]})
        if self.path.startswith("/zones?name=") or self.path.startswith("/zones?") and "name=" in self.path:
            name = self.path.split("name=")[1].split("&")[0]
            if name.endswith("domainmu.com"):
                return self._send({"success": True, "result": [{"id": ZONE_ID, "name": name}]})
            return self._send({"success": True, "result": []})
        if self.path.startswith(f"/zones/{ZONE_ID}/dns_records"):
            if STATE["ip"]:
                return self._send({"success": True, "result": [
                    {"id": RECORD_ID, "content": STATE["ip"], "proxied": STATE["proxied"]}]})
            return self._send({"success": True, "result": []})
        self._send({"success": False, "errors": [{"message": "not found"}]}, 404)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"{}")

    def do_PATCH(self):
        CALLS.append(("PATCH", self.path))
        if not self._auth():
            return self._send({"success": False, "errors": [{"message": "Invalid request headers"}]})
        d = self._body()
        STATE["ip"] = d["content"]
        STATE["proxied"] = d["proxied"]
        return self._send({"success": True, "result": {"id": RECORD_ID, **d}})

    def do_POST(self):
        CALLS.append(("POST", self.path))
        if not self._auth():
            return self._send({"success": False, "errors": [{"message": "Invalid request headers"}]})
        d = self._body()
        STATE["ip"] = d["content"]
        STATE["proxied"] = d["proxied"]
        STATE["created"] += 1
        return self._send({"success": True, "result": {"id": RECORD_ID, **d}})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 18080
    HTTPServer(("127.0.0.1", port), H).serve_forever()
