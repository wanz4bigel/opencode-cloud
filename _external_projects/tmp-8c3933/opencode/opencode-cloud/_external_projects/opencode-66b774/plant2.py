PIPE = '#!/bin/bash\n# Rebuild Strata + relay agent, dari nol sampai domain publik melayani.\nset -uo pipefail\nLOG=/marimo/llm/pipeline.log\nsay(){ echo "[$(date -u +%T)] $*" >> "$LOG"; }\nKEY=sk-strata-d71951f458683d6a913c18fb1e31e4b3\nAGENT_TOKEN=agt_736811c6b67d3f956d991df748a78c3a\nmkdir -p /marimo/llm /dev/shm/sc117 /marimo/llm/sc117-aux\necho "$KEY" > /marimo/llm/api_key.txt\nsay "mulai"\n\ncurl -fsSL https://github.com/Niko1221/Strata/releases/latest/download/install.sh -o /tmp/si.sh\nenv -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV -u PYTHONHOME \\\n    PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin \\\n    sh /tmp/si.sh >> "$LOG" 2>&1\nsay "strata rc=$?"\n\nR=SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF\nhf download "$R" --include "IQ3_S/*" --local-dir /dev/shm/sc117 >> "$LOG" 2>&1\nsay "shards rc=$? $(du -sh /dev/shm/sc117 2>/dev/null | cut -f1)"\nhf download "$R" --include "strata/rt/*" --local-dir /marimo/llm/sc117-aux >> "$LOG" 2>&1\nhf download "$R" mmproj-Qwen3.8-Flash-Next-BF16.gguf --local-dir /marimo/llm/sc117-aux >> "$LOG" 2>&1\nsay "aux rc=$?"\n\ncp /marimo/llm/sc117-aux/mmproj-Qwen3.8-Flash-Next-BF16.gguf /dev/shm/sc117/IQ3_S/\nmkdir -p /marimo/llm/sc117-data/mtp\ncp -r /marimo/llm/sc117-aux/strata/rt /marimo/llm/sc117-data/mtp/\nsay "prep ok"\n\ncat > /marimo/llm/launch.sh <<\'EOL\'\n#!/bin/bash\ncd /marimo/llm\nS=/home/marimo/.local/share/strata/terminal/current/bin/strata\nexec env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV "$S" launch \\\n  --model-path /dev/shm/sc117/IQ3_S --model iq3_s --family swift \\\n  --data-dir /marimo/llm/sc117-data --context 256k --vision gpu --mtp on \\\n  --kv int8 --tune skip --access local --port 8081 \\\n  --api-key sk-strata-d71951f458683d6a913c18fb1e31e4b3 --yes --no-tui\nEOL\ncat > /marimo/llm/relay.sh <<\'EOR\'\n#!/bin/bash\ncd /marimo/llm\nexport RELAY_URL=wss://ai.wanz4bigel.dpdns.org/_agent\nexport AGENT_TOKEN=agt_736811c6b67d3f956d991df748a78c3a\nif ! python3 -c "import websockets" 2>/dev/null; then\n  python3 -m pip install --quiet websockets >> /marimo/llm/relay.log 2>&1 || \\\n  uv pip install --system websockets >> /marimo/llm/relay.log 2>&1 || \\\n  pip install --quiet websockets >> /marimo/llm/relay.log 2>&1\nfi\nwhile true; do\n  python3 /marimo/llm/agent.py >> /marimo/llm/relay.log 2>&1\n  echo "[$(date -u +%T)] agent keluar, restart 5s" >> /marimo/llm/relay.log\n  sleep 5\ndone\nEOR\nchmod +x /marimo/llm/launch.sh /marimo/llm/relay.sh\n\nnohup bash /marimo/llm/launch.sh >> /marimo/llm/launch.log 2>&1 &\nsay "launch pid=$!"\n\ncode=000\nfor i in $(seq 1 70); do\n  code=$(curl -s -o /dev/null -w "%{http_code}" -m 3 http://127.0.0.1:8081/v1/models -H "Authorization: Bearer $KEY")\n  [ "$code" = "200" ] && break\n  sleep 8\ndone\nsay "server=$code setelah ${i}x8s"\n\nif [ "$code" = "200" ]; then\n  nohup bash /marimo/llm/relay.sh >> /marimo/llm/relay.log 2>&1 &\n  say "relay pid=$!"\n  pub=000\n  for i in $(seq 1 15); do\n    pub=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://ai.wanz4bigel.dpdns.org/v1/models -H "Authorization: Bearer $KEY")\n    [ "$pub" = "200" ] && break\n    sleep 4\n  done\n  say "publik=$pub"\nfi\nsay "SELESAI"\n'

import hashlib, os, subprocess
open("/marimo/llm/pipeline.sh", "w").write(PIPE)
os.chmod("/marimo/llm/pipeline.sh", 0o755)
print("pipeline.sh:", len(PIPE), "byte")
def sh(c, t=60):
    r = subprocess.run(["bash","-c",c], capture_output=True, text=True, timeout=t)
    return (r.stdout+r.stderr).strip()
print("agent.py sha:", sh("sha256sum /marimo/llm/agent.py 2>/dev/null | cut -c1-16"))
log = open("/marimo/llm/pipeline.out", "ab")
p = subprocess.Popen(["bash","/marimo/llm/pipeline.sh"], stdout=log,
                     stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                     start_new_session=True)
print("pipeline pid:", p.pid)
import marimo._code_mode as cm
code = '''import marimo as mo

mo.status.toast(
    "🧪 Siap pair — rebuild jalan",
    "Agent relay sudah ada di snapshot. Sekarang 79 GB model + Strata. URL tetap ai.wanz4bigel.dpdns.org.",
)
'''
async with cm.get_context(skip_staleness_check=True) as c:
    c.edit_cell("Hbol", code=code)
    c.run_cell("Hbol")
print("toast terkirim")
