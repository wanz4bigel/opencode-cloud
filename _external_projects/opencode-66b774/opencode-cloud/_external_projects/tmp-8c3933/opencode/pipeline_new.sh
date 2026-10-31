#!/bin/bash
# Rebuild Strata + relay agent, dari nol sampai domain publik melayani.
set -uo pipefail
LOG=/marimo/llm/pipeline.log
say(){ echo "[$(date -u +%T)] $*" >> "$LOG"; }
KEY=sk-strata-d71951f458683d6a913c18fb1e31e4b3
AGENT_TOKEN=agt_736811c6b67d3f956d991df748a78c3a
mkdir -p /marimo/llm /dev/shm/sc117 /marimo/llm/sc117-aux
echo "$KEY" > /marimo/llm/api_key.txt
say "mulai"

curl -fsSL https://github.com/Niko1221/Strata/releases/latest/download/install.sh -o /tmp/si.sh
env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV -u PYTHONHOME \
    PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin \
    sh /tmp/si.sh >> "$LOG" 2>&1
say "strata rc=$?"

R=SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
hf download "$R" --include "IQ3_S/*" --local-dir /dev/shm/sc117 >> "$LOG" 2>&1
say "shards rc=$? $(du -sh /dev/shm/sc117 2>/dev/null | cut -f1)"
hf download "$R" --include "strata/rt/*" --local-dir /marimo/llm/sc117-aux >> "$LOG" 2>&1
hf download "$R" mmproj-Qwen3.8-Flash-Next-BF16.gguf --local-dir /marimo/llm/sc117-aux >> "$LOG" 2>&1
say "aux rc=$?"

cp /marimo/llm/sc117-aux/mmproj-Qwen3.8-Flash-Next-BF16.gguf /dev/shm/sc117/IQ3_S/
mkdir -p /marimo/llm/sc117-data/mtp
cp -r /marimo/llm/sc117-aux/strata/rt /marimo/llm/sc117-data/mtp/
say "prep ok"

cat > /marimo/llm/launch.sh <<'EOL'
#!/bin/bash
cd /marimo/llm
S=/home/marimo/.local/share/strata/terminal/current/bin/strata
exec env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV "$S" launch \
  --model-path /dev/shm/sc117/IQ3_S --model iq3_s --family swift \
  --data-dir /marimo/llm/sc117-data --context 256k --vision gpu --mtp on \
  --kv int8 --tune skip --access local --port 8081 \
  --api-key sk-strata-d71951f458683d6a913c18fb1e31e4b3 --yes --no-tui
EOL
cat > /marimo/llm/relay.sh <<'EOR'
#!/bin/bash
cd /marimo/llm
export RELAY_URL=wss://ai.wanz4bigel.dpdns.org/_agent
export AGENT_TOKEN=agt_736811c6b67d3f956d991df748a78c3a
if ! python3 -c "import websockets" 2>/dev/null; then
  python3 -m pip install --quiet websockets >> /marimo/llm/relay.log 2>&1 || \
  uv pip install --system websockets >> /marimo/llm/relay.log 2>&1 || \
  pip install --quiet websockets >> /marimo/llm/relay.log 2>&1
fi
while true; do
  python3 /marimo/llm/agent.py >> /marimo/llm/relay.log 2>&1
  echo "[$(date -u +%T)] agent keluar, restart 5s" >> /marimo/llm/relay.log
  sleep 5
done
EOR
chmod +x /marimo/llm/launch.sh /marimo/llm/relay.sh

nohup bash /marimo/llm/launch.sh >> /marimo/llm/launch.log 2>&1 &
say "launch pid=$!"

code=000
for i in $(seq 1 70); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 3 http://127.0.0.1:8081/v1/models -H "Authorization: Bearer $KEY")
  [ "$code" = "200" ] && break
  sleep 8
done
say "server=$code setelah ${i}x8s"

if [ "$code" = "200" ]; then
  nohup bash /marimo/llm/relay.sh >> /marimo/llm/relay.log 2>&1 &
  say "relay pid=$!"
  pub=000
  for i in $(seq 1 15); do
    pub=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://ai.wanz4bigel.dpdns.org/v1/models -H "Authorization: Bearer $KEY")
    [ "$pub" = "200" ] && break
    sleep 4
  done
  say "publik=$pub"
fi
say "SELESAI"
