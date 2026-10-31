#!/usr/bin/env python3
"""Quick CTF fetch helper: prints status, headers of interest, and stripped body."""
import re
import sys
import urllib.request
import urllib.error

BASE = "https://naples-division-mary-compounds.trycloudflare.com"


def strip(html):
    html = re.sub(r"(?is)<style.*?</style>", "", html)
    html = re.sub(r"(?is)<script.*?</script>", "", html)
    html = re.sub(r"(?s)<head>.*?</head>", "", html)
    html = re.sub(r"(?s)<[^>]+>", "\n", html)
    lines = [l.strip() for l in html.splitlines()]
    out, blank = [], 0
    for l in lines:
        if not l:
            blank += 1
            if blank > 1:
                continue
        else:
            blank = 0
        out.append(l)
    return "\n".join(out).strip()


def req(path, method="GET", data=None, headers=None, cookie=None, full=False, base=BASE):
    url = base + path
    body = data.encode() if isinstance(data, str) else data
    r = urllib.request.Request(url, data=body, method=method)
    r.add_header("User-Agent", "ctf")
    if headers:
        for k, v in headers.items():
            r.add_header(k, v)
    if cookie:
        r.add_header("Cookie", cookie)
    try:
        resp = urllib.request.urlopen(r, timeout=30)
        code, hdrs, raw = resp.status, resp.headers, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        code, hdrs, raw = e.code, e.headers, e.read().decode("utf-8", "replace")
    except Exception as e:
        return f"{method} {path} !! {e}"
    head = f"[{code}] {method} {path}"
    sc = hdrs.get("set-cookie")
    loc = hdrs.get("location")
    if sc:
        head += f"\n  set-cookie: {sc}"
    if loc:
        head += f"\n  location: {loc}"
    content = raw if full else strip(raw)
    return f"{head}\n{content}"


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print("usage: get.py path [method] [data] [cookie]")
        sys.exit()
    path = args[0]
    method = args[1] if len(args) > 1 else "GET"
    data = args[2] if len(args) > 2 else None
    cookie = args[3] if len(args) > 3 else None
    print(req(path, method, data, cookie=cookie))
