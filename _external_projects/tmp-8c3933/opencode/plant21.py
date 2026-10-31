S2 = '#!/bin/bash\n# Stage 2: tunggu unduhan + Strata, lalu prep/launch/relay.\nset -uo pipefail\ncd /marimo/llm\nKEY=sk-strata-d71951f458683d6a913c18fb1e31e4b3\nsay(){ echo "[$(date -u +%T)] $*" >> /marimo/llm/pipeline.log; }\nphase(){ echo "$1" > /marimo/llm/phase; say "fase: $1"; }\n\nphase download\nwhile pgrep -f "[h]f download" >/dev/null 2>&1; do sleep 2; done\nsay "unduhan selesai, $(du -sh /home/marimo/models/sc117 2>/dev/null | cut -f1)"\n\nphase strata\nS=/home/marimo/.local/share/strata/terminal/current/bin/strata\nfor i in $(seq 1 300); do [ -x "$S" ] && break; sleep 2; done\nsay "strata: $([ -x "$S" ] && echo ada || echo TIDAK-ADA)"\n\nphase prep\nmkdir -p /marimo/llm/sc117-data/mtp\ncp -r /marimo/llm/sc117-aux/strata/rt /marimo/llm/sc117-data/mtp/ 2>/dev/null\nsay "prep ok"\n\ncat > /marimo/llm/launch.sh <<\'EOL\'\n#!/bin/bash\ncd /marimo/llm\nS=/home/marimo/.local/share/strata/terminal/current/bin/strata\nexec env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV "$S" launch \\\n  --model-path /home/marimo/models/sc117/IQ3_S --model iq3_s --family swift \\\n  --data-dir /marimo/llm/sc117-data --context 256k --vision gpu --mtp on \\\n  --kv int8 --tune skip --access local --port 8081 \\\n  --api-key sk-strata-d71951f458683d6a913c18fb1e31e4b3 --yes --no-tui\nEOL\ncat > /marimo/llm/relay.sh <<\'EOR\'\n#!/bin/bash\ncd /marimo/llm\nexport RELAY_URL=wss://ai.wanz4bigel.dpdns.org/_agent\nexport AGENT_TOKEN=agt_736811c6b67d3f956d991df748a78c3a\nwhile true; do\n  python3 /marimo/llm/agent.py >> /marimo/llm/relay.log 2>&1\n  echo "[$(date -u +%T)] agent keluar, restart 5s" >> /marimo/llm/relay.log\n  sleep 5\ndone\nEOR\nchmod +x /marimo/llm/launch.sh /marimo/llm/relay.sh\n\nphase launch\nnohup bash /marimo/llm/launch.sh >> /marimo/llm/launch.log 2>&1 &\nsay "launch pid=$!"\n\ncode=000\nfor i in $(seq 1 200); do\n  code=$(curl -s -o /dev/null -w "%{http_code}" -m 2 http://127.0.0.1:8081/v1/models -H "Authorization: Bearer $KEY")\n  [ "$code" = "200" ] && break\n  sleep 2\ndone\nsay "server=$code setelah $((i*2))s"\n\nif [ "$code" = "200" ]; then\n  phase relay\n  nohup bash /marimo/llm/relay.sh >> /marimo/llm/relay.log 2>&1 &\n  for i in $(seq 1 40); do\n    pub=$(curl -s -o /dev/null -w "%{http_code}" -m 5 https://ai.wanz4bigel.dpdns.org/v1/models -H "Authorization: Bearer $KEY")\n    [ "$pub" = "200" ] && break\n    sleep 2\n  done\n  say "publik=$pub setelah $((i*2))s"\nfi\nphase done\nsay "===== SELESAI ====="\n'
CELL = 'import json\nimport pathlib\n\nimport marimo as mo\n\nrefresh = mo.ui.refresh(default_interval="2s")\n\ntry:\n    s = json.loads(pathlib.Path("/marimo/llm/status.json").read_text())\nexcept Exception:\n    s = {}\n\npct = float(s.get("pct") or 0)\nfilled = int(round(pct / 100 * 30))\nbar = "█" * filled + "░" * (30 - filled)\neta = int(s.get("eta_s") or 0)\neta_txt = f"{eta // 60}m{eta % 60:02d}s" if eta else "—"\nlive = s.get("public") == 200\nkey = pathlib.Path("/marimo/llm/api_key.txt").read_text().strip() if pathlib.Path("/marimo/llm/api_key.txt").exists() else ""\n\nmo.vstack([\n    mo.md(f"""\n# IQ3_S (SC117 abliterated) — {\'LIVE\' if live else \'sedang dibangun\'}\n\n| | |\n|---|---|\n| **Base URL** | `https://ai.wanz4bigel.dpdns.org/v1` |\n| **API key** | `{key}` |\n| **Model** | `swift-1.5-iq3_s` · 262.144 konteks · KV int8 · ~115–160 tok/s |\n| **Fase** | **{s.get(\'phase_label\', \'—\')}** · {s.get(\'elapsed_s\', 0)} detik |\n| **Unduhan** | `{bar}` {pct:.1f}% · {s.get(\'model_gb\', 0)} / {s.get(\'total_gb\', 0)} GB · {int(s.get(\'speed_mbps\') or 0)} MB/s · ETA {eta_txt} |\n| **RAM / VRAM** | {s.get(\'ram_gb\', 0)} GB / {s.get(\'vram_gb\', 0)} GB |\n| **Server lokal / publik** | {s.get(\'server\', 0)} / {s.get(\'public\', 0)} |\n| **Diperbarui** | {s.get(\'t\', \'—\')} |\n\nModel ada di `/home/marimo/models/sc117` (disk), jadi RAM tidak dipakai untuk 85 GB.\n\nKalau sandbox mati: **Relaunch** di molab → `bash /marimo/llm/pipeline.sh`.\nDashboard ini menyegarkan sendiri tiap 2 detik.\n"""),\n    refresh,\n])\n'

import os, subprocess, time
def sh(c,t=120):
    r=subprocess.run(["bash","-c",c],capture_output=True,text=True,timeout=t)
    return (r.stdout+r.stderr).strip()
open("/marimo/llm/stage2.sh","w").write(S2)
os.chmod("/marimo/llm/stage2.sh", 0o755)
print("strata install:", sh("(curl -fsSL https://github.com/Niko1221/Strata/releases/latest/download/install.sh -o /tmp/si.sh && env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV -u PYTHONHOME PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin sh /tmp/si.sh) >> /marimo/llm/pipeline.log 2>&1 && echo terpasang || echo GAGAL", 600))
print("status_loop start:", sh("pkill -f '[s]tatus_loop.py'; sleep 1; echo ok"))
subprocess.Popen(["python3","/marimo/llm/status_loop.py"], stdout=open("/marimo/llm/status.log","ab"),
                 stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True)
log = open("/marimo/llm/stage2.out","ab")
p = subprocess.Popen(["bash","/marimo/llm/stage2.sh"], stdout=log, stderr=subprocess.STDOUT,
                     stdin=subprocess.DEVNULL, start_new_session=True)
print("stage2 pid:", p.pid)
import marimo._code_mode as cm
async with cm.get_context(skip_staleness_check=True, skip_validation=True) as c:
    c.edit_cell("Hbol", code=CELL)
    c.run_cell("Hbol")
    cid = c.create_cell("""import marimo as _mo

_mo.status.toast(
    "🧪 Siap pair — unduhan sudah jalan",
    "3 stream paralel + Strata. Dashboard di bawah bergerak tiap 2 detik.",
)
""", before="Hbol")
    c.run_cell(cid)
print("toast + dashboard terpasang")
time.sleep(4)
print(open("/marimo/llm/status.json").read())
