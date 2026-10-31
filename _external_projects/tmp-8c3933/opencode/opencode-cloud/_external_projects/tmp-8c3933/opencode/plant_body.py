import base64
import os
import subprocess

os.makedirs("/marimo/llm", exist_ok=True)
agent = base64.b64decode(B64)
open("/marimo/llm/agent.py", "wb").write(agent)
open("/marimo/llm/pipeline.sh", "w").write(PIPE)
os.chmod("/marimo/llm/pipeline.sh", 0o755)
print("agent.py:", len(agent), "byte | sha256[:16] =", __import__("hashlib").sha256(agent).hexdigest()[:16])
print("pipeline.sh:", len(PIPE), "byte")

log = open("/marimo/llm/pipeline.out", "ab")
p = subprocess.Popen(["bash", "/marimo/llm/pipeline.sh"], stdout=log,
                     stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                     start_new_session=True)
print("pipeline pid:", p.pid)

import marimo._code_mode as cm

code = '''import marimo as mo

mo.status.toast(
    "🧪 Siap pair — jalur permanen dipasang",
    "79 GB model + Strata sedang dimuat. Kali ini keluar lewat Worker relay di ai.wanz4bigel.dpdns.org, bukan tunnel sekali pakai.",
)
'''
async with cm.get_context(skip_staleness_check=True) as c:
    c.edit_cell("Hbol", code=code)
    c.run_cell("Hbol")
print("toast terkirim")
