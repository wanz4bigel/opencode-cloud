#!/usr/bin/env bash
# uji mode full (multi-transport) dengan core xray
set -uo pipefail
cd /home/runner/v2ray-vmess-action || exit 1
export CONF_DIR=/tmp/opencode/full
export CORE=xray
export PORTS_TLS=19443,19444
export PORTS_PLAIN=19080,19081
export PORT_GRPC=19053
export PORT_UPGRADE=19052
export WS_PATH=/vmess
export UPGRADE_PATH=/upvmess
export GRPC_SERVICE=vmess
export TLS_MODE=selfsigned
export LIFETIME_MINUTES=30
export CHECK_INTERVAL=5
rm -rf "$CONF_DIR"

echo "== install xray =="
bash scripts/install-v2ray.sh 2>&1 | tail -3
echo "== cert =="; bash scripts/gen-cert.sh 2>&1 | tail -2
echo "== config =="; bash scripts/gen-config.sh 2>&1 | tail -3
echo "== link/kartu =="; bash scripts/gen-link.sh 2>&1 | tail -2
echo
cat "$CONF_DIR/akun.txt"
echo
echo "== start server =="
bash scripts/run-server.sh >"$CONF_DIR/server.log" 2>&1 &
SRV=$!
sleep 7
bash scripts/healthcheck.sh; echo "health exit=$?"
echo "== daftar inbound =="
jq -r '.inbounds[] | "\(.tag)  port=\(.port)"' "$CONF_DIR/config.json"

source "$CONF_DIR/vmess.env"
V2RAY_BIN="$CONF_DIR/bin/xray"; export V2RAY_BIN

mkclient() { # file uuid proxyport net port path svc tls
  local f=$1 id=$2 pp=$3 net=$4 port=$5 path=$6 svc=$7 tls=$8
  local stream
  case "$net" in
    ws) stream="\"network\":\"ws\",\"security\":\"$tls\",\"wsSettings\":{\"path\":\"$path\",\"headers\":{\"Host\":\"v2ray.local\"}}";;
    grpc) stream="\"network\":\"grpc\",\"security\":\"$tls\",\"grpcSettings\":{\"serviceName\":\"$svc\"}";;
    httpupgrade) stream="\"network\":\"httpupgrade\",\"security\":\"$tls\",\"httpupgradeSettings\":{\"path\":\"$path\",\"host\":\"v2ray.local\"}";;
  esac
  [ "$tls" = tls ] && stream="$stream,\"tlsSettings\":{\"insecure\":true,\"serverName\":\"v2ray.local\"}"
  cat >"$f" <<EOF
{ "log":{"loglevel":"error"},
  "inbounds":[{"listen":"127.0.0.1","port":$pp,"protocol":"http"}],
  "outbounds":[{"protocol":"vmess","settings":{"vnext":[{"address":"127.0.0.1","port":$port,
     "users":[{"id":"$id","alterId":$VMESS_ALTID,"security":"auto"}]}]},
   "streamSettings":{ $stream }}] }
EOF
}

PASS=0; FAIL=0
test_one() { # label net port path svc tls proxyport
  local label=$1 net=$2 port=$3 path=$4 svc=$5 tls=$6 pp=$7
  mkclient "$CONF_DIR/c-$label.json" "$VMESS_UUID" "$pp" "$net" "$port" "$path" "$svc" "$tls"
  "$V2RAY_BIN" run -c "$CONF_DIR/c-$label.json" >"$CONF_DIR/c-$label.log" 2>&1 &
  local cp=$!
  sleep 4
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 -x "http://127.0.0.1:$pp" https://www.google.com/generate_204 2>/dev/null)"
  if [ "$code" = "204" ] || [ "$code" = "200" ]; then
    echo "  PASS $label (HTTP $code)"; PASS=$((PASS+1))
  else
    echo "  FAIL $label (HTTP ${code:-000})"; FAIL=$((FAIL+1)); tail -3 "$CONF_DIR/c-$label.log"
  fi
  kill "$cp" 2>/dev/null
}

echo "== uji tiap transport =="
test_one ws-tls-19443  ws 19443 /vmess "" tls 19101
test_one ws-tls-19444  ws 19444 /vmess "" tls 19102
test_one ws-plain-19080 ws 19080 /vmess "" none 19103
test_one grpc-tls-19053 grpc 19053 "" vmess tls 19104
test_one upg-tls-19052  httpupgrade 19052 /upvmess "" tls 19105

kill -TERM "$SRV" 2>/dev/null
sleep 3
pkill -9 -f "$CONF_DIR/config.json" 2>/dev/null
echo
echo "==== PASS=$PASS FAIL=$FAIL ===="
[ "$FAIL" -eq 0 ]
