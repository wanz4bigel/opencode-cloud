#!/usr/bin/env bash
# ============================================================================
#  gen-config.sh - rakit config.json (inbound VMess) untuk v2ray/xray.
#
#  Sederhana (default):
#    PORT=443                      -> 1 inbound ws+tls
#  Multi-transport (mode "full", seperti kartu akun komersial):
#    PORTS_TLS=443,8443            -> ws + tls
#    PORTS_PLAIN=80,8080           -> ws tanpa tls
#    PORT_GRPC=2053                -> grpc (+ tls kalau GRPC_TLS=1)
#    PORT_UPGRADE=2052             -> httpupgrade (+ tls), KHUSUS CORE=xray
#
#  Env lain: WS_PATH, UPGRADE_PATH, GRPC_SERVICE, GRPC_TLS, UPGRADE_TLS,
#            ALPN, DOMAIN, VMESS_UUID, VMESS_ALTID, BLOCK_PRIVATE, LOGLEVEL
# ============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"

command -v jq >/dev/null 2>&1 || die "jq tidak ditemukan."
[ -f "$WORK_DIR/tls.env" ] || die "Jalankan gen-cert.sh dulu."
# shellcheck source=/dev/null
source "$WORK_DIR/tls.env"

csv() { printf '%s' "${1:-}" | tr ',' '\n' | tr -d ' ' | sed '/^$/d'; }

# ---- sertifikat -------------------------------------------------------------
if [ -n "${TLS_CRT_FILE:-}" ] && [ -n "${TLS_KEY_FILE:-}" ]; then
  HAS_TLS=1
  CRT_CONTENT="$(cat "$TLS_CRT_FILE")"
  KEY_CONTENT="$(cat "$TLS_KEY_FILE")"
else
  HAS_TLS=0
  CRT_CONTENT=""; KEY_CONTENT=""
  [ -n "$PORTS_TLS" ] && warn "TLS tidak aktif: $PORTS_TLS akan dilayani sebagai ws biasa."
fi

# ---- daftar inbound yang diminta -------------------------------------------
# Tanpa TLS jangan default ke PORT, kalau tidak port yang sama masuk dua kali.
if [ "$HAS_TLS" = "1" ]; then
  PORTS_TLS="${PORTS_TLS:-$PORT}"
else
  PORTS_TLS="${PORTS_TLS:-}"
fi
PORTS_PLAIN="${PORTS_PLAIN:-}"
UPGRADE_PATH="${UPGRADE_PATH:-/up$(printf '%s' "$WS_PATH" | tr -d '/')}"
GRPC_SERVICE="${GRPC_SERVICE:-vmess}"

if [ -n "$PORT_UPGRADE" ] && [ "$CORE" != "xray" ]; then
  warn "CORE=$CORE tidak mendukung httpupgrade -> PORT_UPGRADE=$PORT_UPGRADE dilewati (pakai CORE=xray)."
  PORT_UPGRADE=""
fi

SPEC='[]'
add_inbound() { # port net tls path svc
  # satu port cuma boleh satu inbound
  if printf '%s' "$SPEC" | jq -e --argjson p "$1" 'any(.[]; .port == $p)' >/dev/null 2>&1; then
    warn "Port $1 sudah dipakai inbound lain, dilewati."
    return 0
  fi
  SPEC="$(jq -c --argjson port "$1" --arg net "$2" --argjson tls "$3" \
    --arg path "${4:-}" --arg svc "${5:-}" --arg host "${DOMAIN:-}" \
    '. + [{port: $port, net: $net, tls: $tls, path: $path, svc: $svc, host: $host}]' <<<"$SPEC")"
}

for p in $(csv "$PORTS_TLS"); do add_inbound "$p" ws "$HAS_TLS" "$WS_PATH" ""; done
for p in $(csv "$PORTS_PLAIN"); do add_inbound "$p" ws 0 "$WS_PATH" ""; done
[ -n "$PORT_GRPC" ] && add_inbound "$PORT_GRPC" grpc "$([ "${GRPC_TLS:-1}" = 1 ] && echo "$HAS_TLS" || echo 0)" "" "$GRPC_SERVICE"
[ -n "$PORT_UPGRADE" ] && add_inbound "$PORT_UPGRADE" httpupgrade "$([ "${UPGRADE_TLS:-1}" = 1 ] && echo "$HAS_TLS" || echo 0)" "$UPGRADE_PATH" ""

[ "$SPEC" != "[]" ] || die "Tidak ada inbound yang aktif. Isi PORTS_TLS / PORTS_PLAIN / PORT_GRPC."

# ---- routing ----------------------------------------------------------------
if [ "${BLOCK_PRIVATE:-1}" = "1" ]; then
  ROUTING_JSON='{
    "domainStrategy": "AsIs",
    "rules": [
      { "type": "field", "outboundTag": "block", "ip": [
          "0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8",
          "169.254.0.0/16", "172.16.0.0/12", "192.168.0.0/16",
          "::1/128", "fc00::/7", "fe80::/10" ] }
    ] }'
else
  ROUTING_JSON='{ "domainStrategy": "AsIs", "rules": [] }'
fi

# ---- rakit config -----------------------------------------------------------
jq -n \
  --argjson spec "$SPEC" \
  --arg uuid "$VMESS_UUID" \
  --argjson aid "$VMESS_ALTID" \
  --arg email "$VMESS_EMAIL" \
  --arg crt "$CRT_CONTENT" \
  --arg key "$KEY_CONTENT" \
  --argjson alpn "$(printf '%s' "$ALPN" | jq -R 'split(",")')" \
  --argjson routing "$ROUTING_JSON" \
  --arg loglevel "${LOGLEVEL:-warning}" '
{
  log: { loglevel: $loglevel },
  inbounds: ($spec | map(
    . as $s |
    {
      listen: "0.0.0.0",
      port: $s.port,
      protocol: "vmess",
      tag: ("in-" + $s.net + "-" + ($s.port | tostring) + (if $s.tls == 1 then "-tls" else "" end)),
      settings: {
        clients: [ { id: $uuid, alterId: $aid, email: $email, level: 1 } ]
      },
      sniffing: { enabled: true, destOverride: [ "http", "tls", "quic" ], metadataOnly: false },
      streamSettings: (
        { network: $s.net, security: (if $s.tls == 1 then "tls" else "none" end) }
        + (if $s.tls == 1 then {
             tlsSettings: {
               minVersion: "1.2",
               certificates: [ { certificate: [ $crt ], key: [ $key ] } ],
               alpn: (if $s.net == "grpc" then [ "h2" ]
                      elif $s.net == "httpupgrade" then [ "http/1.1" ]
                      else $alpn end)
             }
           } else {} end)
        + (if $s.net == "ws" then {
             wsSettings: (
               { path: $s.path }
               + (if $s.host == "" then {} else { headers: { Host: $s.host } } end)
             )
           } else {} end)
        + (if $s.net == "grpc" then {
             grpcSettings: { serviceName: $s.svc, multiMode: false }
           } else {} end)
        + (if $s.net == "httpupgrade" then {
             httpupgradeSettings: (
               { path: $s.path }
               + (if $s.host == "" then {} else { host: $s.host } end)
             )
           } else {} end)
      )
    }
  )),
  outbounds: [
    { protocol: "freedom", tag: "direct", settings: { domainStrategy: "AsIs" } },
    { protocol: "blackhole", tag: "block", settings: { response: { type: "http" } } }
  ],
  routing: $routing
}' >"$CONFIG_FILE"

chmod 600 "$CONFIG_FILE"
save_state
log "config.json -> $CONFIG_FILE ($(printf '%s' "$SPEC" | jq -r 'map(.net + ":" + (.port|tostring) + (if .tls==1 then "/tls" else "" end)) | join(", ")'))"

if [ -x "$V2RAY_BIN" ]; then
  if [ "$(v2ray_cli_detect "$V2RAY_BIN")" = "1" ]; then
    VERIFY_CMD=("$V2RAY_BIN" test -config "$CONFIG_FILE")
  else
    VERIFY_CMD=("$V2RAY_BIN" -test -config "$CONFIG_FILE")
  fi
  # xray: `run -test -c`
  [ "$CORE" = "xray" ] && VERIFY_CMD=("$V2RAY_BIN" run -test -c "$CONFIG_FILE")

  if VERIFY_OUT="$("${VERIFY_CMD[@]}" 2>&1)"; then
    log "Verifikasi config: OK"
  else
    warn "Verifikasi config GAGAL:"
    printf '%s\n' "$VERIFY_OUT" | tail -n 20 >&2
  fi
fi
