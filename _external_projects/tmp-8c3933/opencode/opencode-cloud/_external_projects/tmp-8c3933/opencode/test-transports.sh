#!/usr/bin/env bash
# uji semua transport server xray dengan klien xray (CA di-pin ke cert server)
set -uo pipefail
cd /home/runner/v2ray-vmess-action || exit 1
export CONF_DIR=/tmp/opencode/full CORE=xray LIFETIME_MINUTES=30 CHECK_INTERVAL=5

bash scripts/run-server.sh >/tmp/opencode/full/server3.log 2>&1 &
SRV=$!
sleep 7
bash scripts/healthcheck.sh >/dev/null 2>&1; echo "health=$?"

source /tmp/opencode/full/vmess.env
X=/tmp/opencode/full/bin/xray
CERT_PEM="$(cat /tmp/opencode/full/cert/fullchain.crt)"
CFG=/tmp/opencode/cc.json

mkclient() { # port net path svc proxy insecure
  local inc="{}"
  [ "${6:-0}" = "1" ] && inc='{"insecure":true}'
  jq -n --arg id "$VMESS_UUID" --argjson port "$1" --arg net "$2" \
        --arg path "$3" --arg svc "$4" --argjson pp "$5" \
        --arg ca "$CERT_PEM" --argjson inc "$inc" '{
    log: { loglevel: "warning" },
    inbounds: [ { listen: "127.0.0.1", port: $pp, protocol: "http" } ],
    outbounds: [ { protocol: "vmess",
      settings: { vnext: [ { address: "127.0.0.1", port: $port,
        users: [ { id: $id, alterId: 0, security: "auto" } ] } ] },
      streamSettings: ({ network: $net, security: "tls",
        tlsSettings: ({ serverName: "v2ray.local",
                        certificates: [ { usage: "verify", certificate: [ $ca ] } ] } + $inc) }
        + (if $net == "ws" then { wsSettings: { path: $path, headers: { Host: "v2ray.local" } } } else {} end)
        + (if $net == "grpc" then { grpcSettings: { serviceName: $svc } } else {} end)
        + (if $net == "httpupgrade" then { httpupgradeSettings: { path: $path, host: "v2ray.local" } } else {} end)
      ) } ] }' >"$CFG"
}

try() { # label port net path svc proxy
  mkclient "$2" "$3" "$4" "$5" "$6" 0
  "$X" run -c "$CFG" >/tmp/opencode/cc.log 2>&1 &
  local cp=$!
  sleep 4
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 -x "http://127.0.0.1:$6" https://www.google.com/generate_204 2>/dev/null)"
  printf '  %-22s -> HTTP %s\n' "$1" "${code:-000}"
  kill "$cp" 2>/dev/null
  sleep 1
}

echo "== transport xray (kokpit: cert pinning) =="
try "ws+tls 19443"   19443 ws          /vmess   ""    19201
try "ws+tls 19444"   19444 ws          /vmess   ""    19202
try "grpc+tls 19053" 19053 grpc        ""       vmess 19203
try "upgrade 19052"  19052 httpupgrade /upvmess ""    19204

kill -TERM "$SRV" 2>/dev/null
sleep 3
pkill -9 -f '/tmp/opencode/full/config.json' 2>/dev/null
echo selesai
