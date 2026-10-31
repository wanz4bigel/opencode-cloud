PIPE = '#!/bin/bash\n# Rebuild Strata + relay agent. v4: paralel, polling rapat, status realtime.\nset -uo pipefail\ncd /marimo/llm\nLOG=/marimo/llm/pipeline.log\nKEY=sk-strata-d71951f458683d6a913c18fb1e31e4b3\nMODEL=/home/marimo/models/sc117\nsay(){ echo "[$(date -u +%T)] $*" >> "$LOG"; }\nphase(){ echo "$1" > /marimo/llm/phase; say "fase: $1"; }\n\nmkdir -p /marimo/llm "$MODEL/IQ3_S" /marimo/llm/sc117-aux /marimo/llm/sc117-data/mtp\necho "$KEY" > /marimo/llm/api_key.txt\nsay "===== mulai ====="\nphase start\n\npkill -f "[s]tatus_loop.py" 2>/dev/null\nnohup python3 /marimo/llm/status_loop.py > /marimo/llm/status.log 2>&1 &\n\nphase strata\n# install Strata + websockets di latar belakang, bersamaan dengan unduhan\n(\n  curl -fsSL https://github.com/Niko1221/Strata/releases/latest/download/install.sh -o /tmp/si.sh\n  env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV -u PYTHONHOME \\\n      PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin \\\n      sh /tmp/si.sh\n  python3 -c "import websockets" 2>/dev/null || python3 -m pip install --quiet websockets\n) >> "$LOG" 2>&1 &\nSTRATA=$!\n\nR=SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF\nphase download\n# runtime + mmproj juga paralel\n( hf download "$R" --include "strata/rt/*" --local-dir /marimo/llm/sc117-aux \\\n    && hf download "$R" mmproj-Qwen3.8-Flash-Next-BF16.gguf --local-dir "$MODEL/IQ3_S" ) \\\n    >> "$LOG" 2>&1 &\nAUX=$!\n\nhf download "$R" --include "IQ3_S/*.gguf" --local-dir "$MODEL" >> "$LOG" 2>&1\nsay "shards rc=$? $(du -sh "$MODEL" 2>/dev/null | cut -f1)"\nphase aux\nwait $AUX\nsay "aux rc=$?"\n\nwait $STRATA\nsay "strata rc=$?"\n\nphase prep\ncp -r /marimo/llm/sc117-aux/strata/rt /marimo/llm/sc117-data/mtp/ 2>/dev/null\nsay "prep ok"\n\ncat > /marimo/llm/launch.sh <<\'EOL\'\n#!/bin/bash\ncd /marimo/llm\nS=/home/marimo/.local/share/strata/terminal/current/bin/strata\nexec env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV "$S" launch \\\n  --model-path /home/marimo/models/sc117/IQ3_S --model iq3_s --family swift \\\n  --data-dir /marimo/llm/sc117-data --context 256k --vision gpu --mtp on \\\n  --kv int8 --tune skip --access local --port 8081 \\\n  --api-key sk-strata-d71951f458683d6a913c18fb1e31e4b3 --yes --no-tui\nEOL\ncat > /marimo/llm/relay.sh <<\'EOR\'\n#!/bin/bash\ncd /marimo/llm\nexport RELAY_URL=wss://ai.wanz4bigel.dpdns.org/_agent\nexport AGENT_TOKEN=agt_736811c6b67d3f956d991df748a78c3a\nif ! python3 -c "import websockets" 2>/dev/null; then\n  python3 -m pip install --quiet websockets >> /marimo/llm/relay.log 2>&1 || \\\n  uv pip install --system websockets >> /marimo/llm/relay.log 2>&1 || \\\n  pip install --quiet websockets >> /marimo/llm/relay.log 2>&1\nfi\nwhile true; do\n  python3 /marimo/llm/agent.py >> /marimo/llm/relay.log 2>&1\n  echo "[$(date -u +%T)] agent keluar, restart 5s" >> /marimo/llm/relay.log\n  sleep 5\ndone\nEOR\nchmod +x /marimo/llm/launch.sh /marimo/llm/relay.sh\n\nphase launch\nnohup bash /marimo/llm/launch.sh >> /marimo/llm/launch.log 2>&1 &\nsay "launch pid=$!"\n\ncode=000\nfor i in $(seq 1 200); do\n  code=$(curl -s -o /dev/null -w "%{http_code}" -m 2 http://127.0.0.1:8081/v1/models -H "Authorization: Bearer $KEY")\n  [ "$code" = "200" ] && break\n  sleep 2\ndone\nsay "server=$code setelah $((i*2))s"\n\nif [ "$code" = "200" ]; then\n  phase relay\n  nohup bash /marimo/llm/relay.sh >> /marimo/llm/relay.log 2>&1 &\n  for i in $(seq 1 30); do\n    pub=$(curl -s -o /dev/null -w "%{http_code}" -m 5 https://ai.wanz4bigel.dpdns.org/v1/models -H "Authorization: Bearer $KEY")\n    [ "$pub" = "200" ] && break\n    sleep 2\n  done\n  say "publik=$pub setelah $((i*2))s"\nfi\nphase done\nsay "===== SELESAI ====="\n'

import os, subprocess, time
open("/marimo/llm/pipeline.sh","w").write(PIPE)
os.chmod("/marimo/llm/pipeline.sh", 0o755)
def sh(c,t=60):
    r=subprocess.run(["bash","-c",c],capture_output=True,text=True,timeout=t)
    return (r.stdout+r.stderr).strip()
print("agent.py  :", sh("sha256sum /marimo/llm/agent.py | cut -c1-16"))
print("statusloop:", "patched" if "downloading =" in open("/marimo/llm/status_loop.py").read() else "LAMA")
print("bash -n   :", sh("bash -n /marimo/llm/pipeline.sh && echo OK"))
log = open("/marimo/llm/pipeline.out","ab")
p = subprocess.Popen(["bash","/marimo/llm/pipeline.sh"], stdout=log, stderr=subprocess.STDOUT,
                     stdin=subprocess.DEVNULL, start_new_session=True)
print("pipeline pid:", p.pid)
import marimo._code_mode as cm
code = '''import marimo as mo

mo.status.toast(
    "🧪 Siap pair — rebuild v4 jalan",
    "Install + unduhan paralel, dashboard status refresh 2 detik. URL tetap ai.wanz4bigel.dpdns.org.",
)
'''
async with cm.get_context(skip_staleness_check=True) as c:
    c.edit_cell("Hbol", code=code)
    c.run_cell("Hbol")
print("toast terkirim")
