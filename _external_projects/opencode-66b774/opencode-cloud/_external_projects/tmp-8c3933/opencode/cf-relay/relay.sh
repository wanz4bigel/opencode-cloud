#!/bin/bash
# Jalankan agent relay di sandbox. Aman dijalankan berkali-kali.
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

: "${RELAY_URL:=wss://ai.wanz4bigel.dpdns.org/_agent}"
: "${AGENT_TOKEN:?set AGENT_TOKEN}"
export RELAY_URL AGENT_TOKEN

python3 -c "import websockets" 2>/dev/null || pip install --quiet websockets

exec python3 "$DIR/agent.py"
