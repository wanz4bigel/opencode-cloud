#!/bin/bash
# Rebuild Strata (v5: relay hanya kalau agent.py ada). Sandbox tanpa snapshot.
set -uo pipefail
mkdir -p /marimo/llm
cd /marimo/llm
LOG=/marimo/llm/pipeline.log
KEY=sk-strata-d71951f458683d6a913c18fb1e31e4b3
MODEL=/home/marimo/models/sc117
say(){ echo "[$(date -u +%T)] $*" >> "$LOG"; }
phase(){ echo "$1" > /marimo/llm/phase; say "fase: $1"; }

mkdir -p "$MODEL/IQ3_S" /marimo/llm/sc117-aux /marimo/llm/sc117-data/mtp
echo "$KEY" > /marimo/llm/api_key.txt
say "===== mulai ====="
phase start

pkill -f "[s]tatus_loop.py" 2>/dev/null
nohup python3 /marimo/llm/status_loop.py > /marimo/llm/status.log 2>&1 &

phase strata
(
  curl -fsSL https://github.com/Niko1221/Strata/releases/latest/download/install.sh -o /tmp/si.sh
  env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV -u PYTHONHOME \
      PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin \
      sh /tmp/si.sh
  python3 -c "import websockets" 2>/dev/null || python3 -m pip install --quiet websockets
) >> "$LOG" 2>&1 &
STRATA=$!

R=SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
phase download
( hf download "$R" --include "strata/rt/*" --local-dir /marimo/llm/sc117-aux \
    && hf download "$R" mmproj-Qwen3.8-Flash-Next-BF16.gguf --local-dir "$MODEL/IQ3_S" ) \
    >> "$LOG" 2>&1 &
AUX=$!

hf download "$R" --include "IQ3_S/*.gguf" --local-dir "$MODEL" >> "$LOG" 2>&1
say "shards rc=$? $(du -sh "$MODEL" 2>/dev/null | cut -f1)"
phase aux
wait $AUX
say "aux rc=$?"

wait $STRATA
say "strata rc=$?"

phase prep
cp -r /marimo/llm/sc117-aux/strata/rt /marimo/llm/sc117-data/mtp/ 2>/dev/null
say "prep ok"

cat > /marimo/llm/launch.sh <<'EOL'
#!/bin/bash
cd /marimo/llm
S=/home/marimo/.local/share/strata/terminal/current/bin/strata
exec env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV "$S" launch \
  --model-path /home/marimo/models/sc117/IQ3_S --model iq3_s --family swift \
  --data-dir /marimo/llm/sc117-data --context 256k --vision gpu --mtp on \
  --kv int8 --tune skip --access local --port 8081 \
  --api-key sk-strata-d71951f458683d6a913c18fb1e31e4b3 --yes --no-tui
EOL
chmod +x /marimo/llm/launch.sh

phase launch
nohup bash /marimo/llm/launch.sh >> /marimo/llm/launch.log 2>&1 &
say "launch pid=$!"

code=000
for i in $(seq 1 200); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 2 http://127.0.0.1:8081/v1/models -H "Authorization: Bearer $KEY")
  [ "$code" = "200" ] && break
  sleep 2
done
say "server=$code setelah $((i*2))s"

if [ -f /marimo/llm/agent.py ]; then
  phase relay
  nohup bash /marimo/llm/relay.sh >> /marimo/llm/relay.log 2>&1 &
  for i in $(seq 1 30); do
    pub=$(curl -s -o /dev/null -w "%{http_code}" -m 5 https://ai.wanz4bigel.dpdns.org/v1/models -H "Authorization: Bearer $KEY")
    [ "$pub" = "200" ] && break
    sleep 2
  done
  say "publik=$pub setelah $((i*2))s"
else
  say "agent.py belum ada, relay dilewati"
fi
phase done
say "===== SELESAI ====="
