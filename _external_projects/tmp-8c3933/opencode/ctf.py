#!/usr/bin/env python3
"""Session cookie forge + fetch helper for the Koperasi CTF."""
import base64
import json
import re
import sys
import urllib.request
import urllib.parse
import urllib.error

BASE = "https://naples-division-mary-compounds.trycloudflare.com"
COOKIE_RE = re.compile(r"session=([^;]+)")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def post_login(username="budi", password="budi123"):
    data = urllib.parse.urlencode({"username": username, "password": password}).encode()
    r = urllib.request.Request(BASE + "/login", data=data, method="POST")
    r.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        resp = OPENER.open(r, timeout=30)
        sc = resp.headers.get("set-cookie", "")
        body = resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        sc = e.headers.get("set-cookie", "")
        body = e.read().decode("utf-8", "replace")
    m = COOKIE_RE.search(sc)
    return m.group(1) if m else None, body


def decode(cookie):
    payload, sig = cookie.split("|")
    obj = json.loads(base64.b64decode(payload + "=" * (-len(payload) % 4)))
    return payload, sig, obj


def strip(html):
    html = re.sub(r"(?is)<style.*?</style>", "", html)
    html = re.sub(r"(?is)<head>.*?</head>", "", html)
    html = re.sub(r"(?s)<[^>]+>", "\n", html)
    lines, blank = [], 0
    for l in (x.strip() for x in html.splitlines()):
        if not l:
            blank += 1
            if blank > 1:
                continue
        else:
            blank = 0
        lines.append(l)
    return "\n".join(lines).strip()


def get(path, cookie=None, method="GET", data=None):
    r = urllib.request.Request(BASE + path, method=method)
    r.add_header("User-Agent", "ctf")
    if cookie:
        r.add_header("Cookie", "session=" + cookie)
    if data:
        r.data = data.encode() if isinstance(data, str) else data
    try:
        resp = OPENER.open(r, timeout=30)
        return resp.status, strip(resp.read().decode("utf-8", "replace")), r.full_url
    except urllib.error.HTTPError as e:
        return e.code, strip(e.read().decode("utf-8", "replace")), e.geturl()


if __name__ == "__main__":
    c, _ = post_login()
    print("cookie:", c)
    print("decoded:", decode(c))
    for p in sys.argv[1:] or ["/dashboard"]:
        code, body, url = get(p, c)
        print(f"\n[{code}] {p} -> {url}\n{body}")
