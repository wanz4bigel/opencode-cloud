#!/usr/bin/env bash
# ============================================================================
#  healthcheck.sh - cek apakah core benar-benar melayani semua inbound.
#    1. setiap port harus listen (TCP open)
#    2. port WS utama harus menjawab handshake WebSocket (bukan refused)
#  Exit 0 = sehat, exit 1 = ada yang mati.
# ============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"

HOST_CHECK="${HEALTH_HOST:-127.0.0.1}"

csv() { printf '%s' "${1:-}" | tr ',' '\n' | tr -d ' ' | sed '/^$/d'; }

port_open() {
  (exec 3<>"/dev/tcp/$HOST_CHECK/$1") 2>/dev/null && { exec 3>&- 3<&-; return 0; } || return 1
}

# kumpulkan semua port yang seharusnya hidup
PORTS_TO_CHECK="$PORTS_TLS"
[ -n "$PORTS_PLAIN" ] && PORTS_TO_CHECK="$PORTS_TO_CHECK $(printf '%s' "$PORTS_PLAIN" | tr ',' ' ')"
[ -n "$PORT_GRPC" ] && PORTS_TO_CHECK="$PORTS_TO_CHECK $PORT_GRPC"
[ -n "$PORT_UPGRADE" ] && PORTS_TO_CHECK="$PORTS_TO_CHECK $PORT_UPGRADE"
[ -n "${PORTS_TO_CHECK// /}" ] || PORTS_TO_CHECK="$PORT"

EXIT=0
for p in $(csv "$(printf '%s' "$PORTS_TO_CHECK" | tr ' ' ',')"); do
  if ! port_open "$p"; then
    warn "Port $p TIDAK terbuka."
    EXIT=1
  fi
done

# handshake WS hanya di port WS TLS/utama
WS_PORT="$(csv "$PORTS_TLS" | head -n1)"
[ -n "$WS_PORT" ] || WS_PORT="$PORT"
SCHEME="http"; [ -n "${TLS_CRT_FILE:-}" ] || [ "$TLS_MODE" != "off" ] && SCHEME="https"
[ -f "$WORK_DIR/tls.env" ] && { source "$WORK_DIR/tls.env"; [ -n "${TLS_CRT_FILE:-}" ] && SCHEME="https"; }

URL="$SCHEME://$HOST_CHECK:$WS_PORT$WS_PATH"
CODE="$(curl -ksS -o /dev/null -w '%{http_code}' --max-time 6 \
  -H 'Upgrade: websocket' -H 'Connection: Upgrade' \
  -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' -H 'Sec-WebSocket-Version: 13' \
  -H "Host: ${DOMAIN:-$HOST_CHECK}" "$URL" 2>/dev/null || echo 000)"

case "$CODE" in
  000) warn "Tidak ada respons HTTP di $URL"; exit 1 ;;
esac

if [ "$EXIT" = "0" ]; then
  log "Sehat: port [$PORTS_TO_CHECK] open, WS handshake $URL -> HTTP $CODE"
else
  warn "Sebagian port mati (lihat pesan di atas)."
fi
exit "$EXIT"
