#!/bin/bash
# Stage 2: tunggu unduhan + Strata, lalu prep/launch/relay.
set -uo pipefail
cd /marimo/llm
KEY=sk-strata-d71951f458683d6a913c18fb1e31e4b3
say(){ echo "[$(date -u +%T)] $*" >> /marimo/llm/pipeline.log; }
phase(){ echo "$1" > /marimo/llm/phase; say "fase: $1"; }

phase download
while pgrep -f "[h]f download" >/dev/null 2>&1; do sleep 2; done
say "unduhan selesai, $(du -sh /home/marimo/models/sc117 2>/dev/null | cut -f1)"

phase strata
S=/home/marimo/.local/share/strata/terminal/current/bin/strata
for i in $(seq 1 300); do [ -x "$S" ] && break; sleep 2; done
say "strata: $([ -x "$S" ] && echo ada || echo TIDAK-ADA)"

phase prep
mkdir -p /marimo/llm/sc117-data/mtp
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
cat > /marimo/llm/relay.sh <<'EOR'
#!/bin/bash
cd /marimo/llm
export RELAY_URL=wss://ai.wanz4bigel.dpdns.org/_agent
export AGENT_TOKEN=agt_736811c6b67d3f956d991df748a78c3a
while true; do
  python3 /marimo/llm/agent.py >> /marimo/llm/relay.log 2>&1
  echo "[$(date -u +%T)] agent keluar, restart 5s" >> /marimo/llm/relay.log
  sleep 5
done
EOR
chmod +x /marimo/llm/launch.sh /marimo/llm/relay.sh

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

if [ "$code" = "200" ]; then
  phase relay
  nohup bash /marimo/llm/relay.sh >> /marimo/llm/relay.log 2>&1 &
  for i in $(seq 1 40); do
    pub=$(curl -s -o /dev/null -w "%{http_code}" -m 5 https://ai.wanz4bigel.dpdns.org/v1/models -H "Authorization: Bearer $KEY")
    [ "$pub" = "200" ] && break
    sleep 2
  done
  say "publik=$pub setelah $((i*2))s"
fi
phase done
say "===== SELESAI ====="
