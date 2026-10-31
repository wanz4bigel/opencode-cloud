#!/usr/bin/env bash
# uji: SIGTERM ke run-server.sh harus mematikan v2ray dengan rapi
cd /home/runner/v2ray-vmess-action || exit 1
pkill -9 -f 'v443/config.json' 2>/dev/null
sleep 1

env CONF_DIR=/tmp/opencode/v443 PORT=443 LIFETIME_MINUTES=30 CHECK_INTERVAL=3 \
  bash scripts/run-server.sh >/tmp/opencode/s443d.log 2>&1 &
SRV=$!
sleep 6
echo "script pid=$SRV"
ps -o user,pid,args -C v2ray | head -3

kill -TERM "$SRV"
for _ in $(seq 1 8); do
  sleep 1
  pgrep -f 'v443/config.json' >/dev/null || break
done

if pgrep -f 'v443/config.json' >/dev/null; then
  echo "FAIL: v2ray masih hidup setelah SIGTERM"
  pkill -9 -f 'v443/config.json'
  exit 1
fi
echo "OK: v2ray berhenti rapi setelah SIGTERM"
echo "--- log ---"
tail -5 /tmp/opencode/s443d.log
