#!/usr/bin/env bash
# Uji end-to-end: server (run-server.sh) + client vmess via ws+tls
cd /home/runner/v2ray-vmess-action
set -uo pipefail
export CONF_DIR=/tmp/opencode/vmtest
source "$CONF_DIR/vmess.env"
V=/tmp/opencode/vmtest/bin/v2ray

CFG=/tmp/opencode/client.json
cat >"$CFG" <<EOF
{
  "log": { "loglevel": "warning" },
  "inbounds": [ { "listen": "127.0.0.1", "port": 18080, "protocol": "http" } ],
  "outbounds": [ {
    "protocol": "vmess",
    "settings": { "vnext": [ { "address": "127.0.0.1", "port": $PORT,
      "users": [ { "id": "$VMESS_UUID", "alterId": $VMESS_ALTID, "security": "auto", "level": 1 } ] } ] },
    "streamSettings": {
      "network": "ws",
      "security": "tls",
      "tlsSettings": { "insecure": true, "allowInsecure": true, "serverName": "v2ray.local" },
      "wsSettings": { "path": "$WS_PATH", "headers": { "Host": "v2ray.local" } }
    }
  } ]
}
EOF
echo "== verifikasi config client =="
"$V" test -config "$CFG" 2>&1 | tail -3

echo "== start server =="
LIFETIME_MINUTES=2 CHECK_INTERVAL=5 bash scripts/run-server.sh >/tmp/opencode/server.out 2>&1 &
SRV=$!
sleep 6
echo "-- server log --"; tail -5 /tmp/opencode/server.out
echo "== healthcheck =="
CONF_DIR=$CONF_DIR bash scripts/healthcheck.sh; echo "exit=$?"

echo "== start client =="
"$V" run -config "$CFG" >/tmp/opencode/client.out 2>&1 &
CLI=$!
sleep 5
echo "== lewat proxy (harusnya keluar IP publik) =="
curl -sS --max-time 15 -x http://127.0.0.1:18080 https://api.ipify.org; echo
echo "== ip tanpa proxy =="; curl -sS --max-time 15 https://api.ipify.org; echo
echo "-- client log --"; tail -6 /tmp/opencode/client.out

kill $CLI 2>/dev/null
kill $SRV 2>/dev/null
sleep 3
pkill -f 'v2ray run -config /tmp/opencode/vmtest/config.json' 2>/dev/null
echo "== server tail =="; tail -6 /tmp/opencode/server.out
echo DONE
