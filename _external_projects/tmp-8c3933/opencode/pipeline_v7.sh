#!/bin/bash
# v7: 3 unduhan paralel + retry Strata, lalu stage2 (prep/launch/relay).
set -uo pipefail
mkdir -p /marimo/llm /home/marimo/models/sc117/IQ3_S /marimo/llm/sc117-aux /marimo/llm/sc117-data/mtp
cd /marimo/llm
KEY=sk-strata-d71951f458683d6a913c18fb1e31e4b3
R=SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
echo "$KEY" > /marimo/llm/api_key.txt
say(){ echo "[$(date -u +%T)] $*" >> /marimo/llm/pipeline.log; }
say "===== mulai v7 ====="

pkill -f "[s]tatus_loop.py" 2>/dev/null
nohup python3 /marimo/llm/status_loop.py > /marimo/llm/status.log 2>&1 &

cat > /marimo/llm/strata_retry.sh <<'EOS'
#!/bin/bash
S=/home/marimo/.local/share/strata/terminal/current/bin/strata
for i in $(seq 1 40); do
  [ -x "$S" ] && { echo "[$(date -u +%T)] strata sudah ada" >> /marimo/llm/pipeline.log; exit 0; }
  echo "[$(date -u +%T)] install strata #$i" >> /marimo/llm/pipeline.log
  curl -fsSL https://github.com/Niko1221/Strata/releases/latest/download/install.sh -o /tmp/si.sh 2>>/marimo/llm/pipeline.log
  env -u PYTHONPATH -u PYTHONSAFEPATH -u VIRTUAL_ENV -u PYTHONHOME \
      PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin \
      sh /tmp/si.sh >> /marimo/llm/pipeline.log 2>&1
  [ -x "$S" ] && { echo "[$(date -u +%T)] strata OK #$i" >> /marimo/llm/pipeline.log; exit 0; }
  sleep 4
done
EOS
chmod +x /marimo/llm/strata_retry.sh
nohup bash /marimo/llm/strata_retry.sh >> /marimo/llm/strata_retry.log 2>&1 &

hf download "$R" --include "IQ3_S/*.gguf" --local-dir /home/marimo/models/sc117 >> /marimo/llm/bootstrap.log 2>&1 &
hf download "$R" --include "strata/rt/*" --local-dir /marimo/llm/sc117-aux >> /marimo/llm/bootstrap.log 2>&1 &
hf download "$R" mmproj-Qwen3.8-Flash-Next-BF16.gguf --local-dir /home/marimo/models/sc117/IQ3_S >> /marimo/llm/bootstrap.log 2>&1 &

exec bash /marimo/llm/stage2.sh
