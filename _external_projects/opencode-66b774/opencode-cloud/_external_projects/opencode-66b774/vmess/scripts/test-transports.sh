#!/usr/bin/env bash
# ============================================================================
#  test-transports.sh - uji SEMUA inbound yang aktif (mode full):
#    ws+tls (tiap port), ws plain, grpc, httpupgrade
#  Klien memakai core yang sama; sertifikat self-signed di-pin sebagai CA
#  (cara ini tetap jalan di Xray terbaru yang sudah menghapus "allowInsecure").
#
#  Env: CONF_DIR, CORE (v2ray|xray), TEST_PORT_* (opsional)
# ============================================================================
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

export CONF_DIR="${CONF_DIR:-/tmp/v2ray-vmess-transports}"
export CERT_DIR="${CERT_DIR:-$CONF_DIR/cert}"
export CORE="${CORE:-xray}"
export MODE=full
export PORTS_TLS="${PORTS_TLS:-19443,19444}"
export PORTS_PLAIN="${PORTS_PLAIN:-19080}"
export PORT_GRPC="${PORT_GRPC:-19053}"
export PORT_UPGRADE="${PORT_UPGRADE:-19052}"
export WS_PATH="${WS_PATH:-/vmess}"
export UPGRADE_PATH="${UPGRADE_PATH:-/upvmess}"
export GRPC_SERVICE="${GRPC_SERVICE:-vmess}"
export PORT="${PORT:-443}"
export TLS_MODE="${TLS_MODE:-selfsigned}"
export LIFETIME_MINUTES="${LIFETIME_MINUTES:-10}"
export CHECK_INTERVAL="${CHECK_INTERVAL:-5}"

bash "$HERE/install-v2ray.sh" >/dev/null 2>&1 || { echo "install gagal"; exit 1; }
# shellcheck source=/dev/null
source "$CONF_DIR/vars.env"
# shellcheck source=/dev/null
source "$CONF_DIR/vmess.env" 2>/dev/null || true

bash "$HERE/gen-cert.sh" >/dev/null 2>&1 || { echo "gen-cert gagal"; exit 1; }
bash "$HERE/gen-config.sh" 2>&1 | tail -2
bash "$HERE/gen-link.sh" >/dev/null 2>&1 || { echo "gen-link gagal"; exit 1; }
# nilai final (uuid/path) ada di state file
# shellcheck source=/dev/null
source "$CONF_DIR/vmess.env"

bash "$HERE/run-server.sh" >"$CONF_DIR/server-test.log" 2>&1 &
SRV=$!
sleep 7
bash "$HERE/healthcheck.sh" >/dev/null 2>&1
HEALTH=$?

CERT_PEM="$(cat "$CERT_DIR/fullchain.crt" 2>/dev/null || true)"
CFG="$CONF_DIR/client-transport.json"
PP=19201
PASS=0; FAIL=0

mkclient() { # port net path svc proxy insecure
  local extra="{}"
  [ "${6:-0}" = "1" ] && extra='{"insecure":true}'
  jq -n --arg id "$VMESS_UUID" --argjson port "$1" --arg net "$2" \
        --arg path "$3" --arg svc "$4" --argjson pp "$5" \
        --arg ca "$CERT_PEM" --argjson extra "$extra" '{
    log: { loglevel: "warning" },
    inbounds: [ { listen: "127.0.0.1", port: $pp, protocol: "http" } ],
    outbounds: [ { protocol: "vmess",
      settings: { vnext: [ { address: "127.0.0.1", port: $port,
        users: [ { id: $id, alterId: 0, security: "auto" } ] } ] },
      streamSettings: ({ network: $net, security: "tls",
        tlsSettings: ({ serverName: "v2ray.local",
                        certificates: [ { usage: "verify", certificate: [ $ca ] } ] } + $extra) }
        + (if $net == "ws" then { wsSettings: { path: $path, headers: { Host: "v2ray.local" } } } else {} end)
        + (if $net == "grpc" then { grpcSettings: { serviceName: $svc } } else {} end)
        + (if $net == "httpupgrade" then { httpupgradeSettings: { path: $path, host: "v2ray.local" } } else {} end)
      ) } ] }' >"$CFG"
}

try() { # label port net path svc [tls]
  local label="$1" port="$2" net="$3" path="$4" svc="$5" tls="${6:-tls}"
  local pp=$PP; PP=$((PP + 1))
  local code
  if [ "$tls" = "none" ]; then
    # plain ws: tanpa tlsSettings & tanpa security tls
    jq -n --arg id "$VMESS_UUID" --argjson port "$port" --argjson pp "$pp" --arg path "$path" '{
      log: { loglevel: "warning" },
      inbounds: [ { listen: "127.0.0.1", port: $pp, protocol: "http" } ],
      outbounds: [ { protocol: "vmess",
        settings: { vnext: [ { address: "127.0.0.1", port: $port,
          users: [ { id: $id, alterId: 0, security: "auto" } ] } ] },
        streamSettings: { network: "ws", security: "none",
          wsSettings: { path: $path, headers: { Host: "v2ray.local" } } } } ] }' >"$CFG"
  else
    mkclient "$port" "$net" "$path" "$svc" "$pp" 0
  fi

  local cargs=()
  [ "${V2RAY_USE_RUN_SUBCMD:-0}" = "1" ] && cargs+=(run)
  cargs+=("${V2RAY_CONFIG_FLAG:--config}" "$CFG")
  "$V2RAY_BIN" "${cargs[@]}" >"$CONF_DIR/client-$net-$port.log" 2>&1 &
  local cp=$!
  sleep 4
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 \
         -x "http://127.0.0.1:$pp" https://www.google.com/generate_204 2>/dev/null)"
  case "${code:-000}" in
    204|200) printf '\033[1;32m  PASS\033[0m %-22s HTTP %s\n' "$label" "$code"; PASS=$((PASS + 1)) ;;
    *)       printf '\033[1;31m  FAIL\033[0m %-22s HTTP %s\n' "$label" "${code:-000}"; FAIL=$((FAIL + 1))
             tail -n 3 "$CONF_DIR/client-$net-$port.log" 2>/dev/null ;;
  esac
  kill "$cp" 2>/dev/null
  sleep 1
}

echo "== healthcheck: $([ "$HEALTH" = 0 ] && echo OK || echo GAGAL) =="
echo "== uji transport (core $CORE) =="
for p in $(printf '%s' "$PORTS_TLS" | tr ',' ' '); do try "ws+tls :$p" "$p" ws "$WS_PATH" "" tls; done
for p in $(printf '%s' "$PORTS_PLAIN" | tr ',' ' '); do try "ws plain :$p" "$p" ws "$WS_PATH" "" none; done
[ -n "$PORT_GRPC" ] && try "grpc :$PORT_GRPC" "$PORT_GRPC" grpc "" "$GRPC_SERVICE" tls
[ -n "$PORT_UPGRADE" ] && try "upgrade :$PORT_UPGRADE" "$PORT_UPGRADE" httpupgrade "$UPGRADE_PATH" "" tls

kill -TERM "$SRV" 2>/dev/null
sleep 2
pkill -9 -f "$CONF_DIR/config.json" 2>/dev/null

echo
echo "==== PASS=$PASS FAIL=$FAIL ===="
[ "$FAIL" -eq 0 ] && [ "$HEALTH" = 0 ]
