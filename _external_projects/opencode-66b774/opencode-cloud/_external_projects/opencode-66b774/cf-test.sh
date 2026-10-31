#!/usr/bin/env bash
# Uji dns-cloudflare.sh dengan API tiruan (tanpa menyentuh Cloudflare asli).
set -uo pipefail
cd /home/runner/v2ray-vmess-action || exit 1

PORT=18080
python3 /tmp/opencode/cf-mock.py "$PORT" &
MOCK=$!
trap 'kill $MOCK 2>/dev/null' EXIT
sleep 1

BASE="http://127.0.0.1:$PORT"
export DOMAIN=v2.domainmu.com
export PUBLIC_IP=203.0.113.10
export CF_API_TOKEN=good-token
export CF_API_BASE="$BASE"
export CF_DNS_WAIT=0
unset CF_ZONE_ID CF_PROXIED CF_RECORD_NAME 2>/dev/null || true

show_state() { curl -s "$BASE/_state" | jq -c '.state'; }

echo "== 1) record lama beda IP -> PATCH =="
bash scripts/dns-cloudflare.sh 2>&1 | grep -aE 'Zone:|diupdate|dibuat|sudah benar|WARN'
echo -n "   state: "; show_state

echo "== 2) IP sama -> tidak diubah =="
bash scripts/dns-cloudflare.sh 2>&1 | grep -aE 'Zone:|diupdate|dibuat|sudah benar|WARN'

echo "== 3) record belum ada -> POST (buat) =="
# hapus record di mock dengan restart server (state kosong)
kill $MOCK 2>/dev/null; sleep 1
python3 - <<'PY' >/tmp/opencode/cf-mock2.log 2>&1 &
import json, sys
sys.argv = ["m", "18080"]
import importlib.util
spec = importlib.util.spec_from_file_location("m", "/tmp/opencode/cf-mock.py")
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
m.STATE["ip"] = None
m.HTTPServer(("127.0.0.1", 18080), m.H).serve_forever()
PY
MOCK=$!
sleep 1
bash scripts/dns-cloudflare.sh 2>&1 | grep -aE 'Zone:|diupdate|dibuat|sudah benar|WARN'
echo -n "   state: "; show_state

echo "== 4) proxied=true (orange cloud) =="
kill $MOCK 2>/dev/null; sleep 1
python3 - <<'PY' >/tmp/opencode/cf-mock3.log 2>&1 &
import sys, importlib.util
spec = importlib.util.spec_from_file_location("m", "/tmp/opencode/cf-mock.py")
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
m.HTTPServer(("127.0.0.1", 18080), m.H).serve_forever()
PY
MOCK=$!
sleep 1
CF_PROXIED=true bash scripts/dns-cloudflare.sh 2>&1 | grep -aE 'Zone:|diupdate|dibuat|sudah benar|proxied|WARN'
echo -n "   state: "; show_state

echo "== 5) CF_ZONE_ID manual (tanpa lookup zone) =="
CF_ZONE_ID=zone123 bash scripts/dns-cloudflare.sh 2>&1 | grep -aE 'Zone:|diupdate|dibuat|sudah benar|WARN'
echo -n "   state: "; show_state
