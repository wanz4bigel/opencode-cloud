#!/usr/bin/env python3
"""Server tiruan untuk menguji relay tanpa GPU: meniru Strata secukupnya."""
import hashlib
import json
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    def _json(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/v1/models"):
            self._json({"object": "list", "data": [{"id": "stub-iq3_s"}]})
        else:
            self._json({"error": "not found"}, 404)

    def do_POST(self):
        n = int(self.headers.get("content-length") or 0)
        raw = self.rfile.read(n) if n else b""
        if self.path.startswith("/v1/echo"):
            self._json({"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()})
            return
        try:
            req = json.loads(raw or b"{}")
        except ValueError:
            self._json({"error": "bad json"}, 400)
            return
        if req.get("stream"):
            self.send_response(200)
            self.send_header("content-type", "text/event-stream")
            self.send_header("cache-control", "no-cache")
            self.send_header("transfer-encoding", "chunked")
            self.end_headers()
            for i in range(5):
                chunk = ("data: " + json.dumps({"choices": [{"delta": {"content": f"tok{i} "}}]}) + "\n\n").encode()
                self.wfile.write(b"%x\r\n%s\r\n" % (len(chunk), chunk))
                self.wfile.flush()
                time.sleep(0.4)
            end = b"data: [DONE]\n\n"
            self.wfile.write(b"%x\r\n%s\r\n0\r\n\r\n" % (len(end), end))
            self.wfile.flush()
            return
        self._json({"id": "chatcmpl-stub", "model": "stub-iq3_s",
                    "choices": [{"index": 0, "message": {"role": "assistant",
                                "content": f"ok, terima {len(req.get('messages', []))} pesan"}}]})


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8081), H).serve_forever()
