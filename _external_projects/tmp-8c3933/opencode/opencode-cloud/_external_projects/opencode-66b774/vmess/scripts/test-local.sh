#!/usr/bin/env bash
# ============================================================================
#  test-local.sh - uji end-to-end tanpa GitHub Actions:
#    install v2ray -> bikin cert -> bikin config -> jalankan server
#    -> healthcheck -> koneksi via klien VMess (ws+tls) -> uji UUID salah
#  Dipakai juga oleh workflow ".github/workflows/test.yml".
#
#  Env: TEST_PORT (default 18443), TEST_PROXY_PORT (default 18080),
#       CONF_DIR (default /tmp/v2ray-vmess-selftest)
# ============================================================================
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

export CONF_DIR="${CONF_DIR:-/tmp/v2ray-vmess-selftest}"
export PORT="${TEST_PORT:-18443}"
export TLS_MODE="${TLS_MODE:-selfsigned}"
export LIFETIME_MINUTES="${LIFETIME_MINUTES:-10}"
export CHECK_INTERVAL="${CHECK_INTERVAL:-5}"
PROXY_PORT="${TEST_PROXY_PORT:-18080}"

# ambil nilai path/berkas standar dari lib.sh, tapi jangan berhenti kalau ada langkah gagal
source "$HERE/lib.sh" >/dev/null 2>&1 || true
set +e +o pipefail

PASS=0; FAIL=0
ok()   { printf '\033[1;32m  PASS\033[0m %s\n' "$*"; PASS=$(( PASS + 1 )); }
bad()  { printf '\033[1;31m  FAIL\033[0m %s\n' "$*"; FAIL=$(( FAIL + 1 )); }
check(){ if [ "$1" = "0" ]; then ok "$2"; else bad "$2"; fi; }

echo "== 1. Install v2ray =="
bash "$HERE/install-v2ray.sh"; check $? "install-v2ray.sh"

echo "== 2. Sertifikat TLS =="
bash "$HERE/gen-cert.sh"; check $? "gen-cert.sh"

echo "== 3. config.json =="
bash "$HERE/gen-config.sh"; check $? "gen-config.sh"
jq -e '.inbounds[0].streamSettings.network == "ws"' "$CONFIG_FILE" >/dev/null 2>&1
check $? "config pakai network ws"

# state final dari gen-config (uuid/path yang benar-benar dipakai server)
# shellcheck disable=SC1091
source "$CONF_DIR/vmess.env"

echo "== 4. Link vmess:// =="
bash "$HERE/gen-link.sh" >"$CONF_DIR/link-test.log" 2>&1; check $? "gen-link.sh"
LINK="$(cat "$CONF_DIR/vmess-link.txt" 2>/dev/null || true)"
echo "  ${LINK:0:70}..."
printf '%s' "$LINK" | grep -q '^vmess://'
check $? "link vmess:// terbentuk"

echo "== 4b. Isi link (decode base64) =="
DEC="$(printf '%s' "${LINK#vmess://}" | base64 -d 2>/dev/null || true)"
echo "  $DEC"
printf '%s' "$DEC" | jq -e '.add and .id and .port and .net and .path and .tls' >/dev/null 2>&1
check $? "field wajib (add/id/port/net/path/tls) lengkap"
if [ "$(printf '%s' "$DEC" | jq -r .id)" = "$VMESS_UUID" ] \
   && [ "$(printf '%s' "$DEC" | jq -r .path)" = "$WS_PATH" ]; then
  ok "uuid & path di link sama dengan config server"
else
  bad "uuid/path di link BEDA dengan config server"
fi

echo "== 5. Jalankan server =="
bash "$HERE/run-server.sh" >"$CONF_DIR/server-test.log" 2>&1 &
SRV=$!
sleep 6
kill -0 "$SRV" 2>/dev/null; check $? "proses v2ray hidup"
bash "$HERE/healthcheck.sh" >/dev/null 2>&1; check $? "healthcheck port+ws"

echo "== 6. Klien VMess via ws+tls =="
CLIENT="$CONF_DIR/client-test.json"
mkclient() {  # $1=uuid  $2=port proxy
  cat >"$CLIENT" <<EOF
{ "log": { "loglevel": "warning" },
  "inbounds": [ { "listen": "127.0.0.1", "port": $2, "protocol": "http" } ],
  "outbounds": [ { "protocol": "vmess",
    "settings": { "vnext": [ { "address": "127.0.0.1", "port": $L_PORT,
      "users": [ { "id": "$1", "alterId": $VMESS_ALTID, "security": "auto" } ] } ] },
    "streamSettings": { "network": "ws", "security": "tls",
      "tlsSettings": { "insecure": true, "allowInsecure": true, "serverName": "v2ray.local" },
      "wsSettings": { "path": "$L_PATH", "headers": { "Host": "v2ray.local" } } } } ] }
EOF
}

URLS=("https://www.google.com/generate_204" "https://www.cloudflare.com/cdn-cgi/trace" "https://api.ipify.org")
http_via() {  # $1 = port proxy; coba beberapa URL sampai ada yang membalas
  local port="$1" u out code="000"
  for u in "${URLS[@]}"; do
    out="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 \
           -x "http://127.0.0.1:$port" "$u" 2>/dev/null)"
    code="${out:-000}"
    [ "$code" != "000" ] && break
  done
  printf '%s' "$code"
}

L_ID="$(printf '%s' "$DEC" | jq -r .id)"
L_PORT="$(printf '%s' "$DEC" | jq -r .port)"
L_PATH="$(printf '%s' "$DEC" | jq -r .path)"
mkclient "$L_ID" "$PROXY_PORT"
"$V2RAY_BIN" test -config "$CLIENT" >/dev/null 2>&1; check $? "config klien valid"
"$V2RAY_BIN" run -config "$CLIENT" >"$CONF_DIR/client-test.log" 2>&1 &
CLI=$!
sleep 5
code_ok="$(http_via "$PROXY_PORT")"
case "$code_ok" in 2??|3??) : ;; *) false ;; esac
check $? "request lewat tunnel (HTTP $code_ok)"

echo "== 7. UUID salah harus ditolak =="
BAD_PORT=$(( PROXY_PORT + 1 ))
CLI2="$CONF_DIR/client-bad.json"
mkclient "$(uuidgen | tr 'A-Z' 'a-z')" "$BAD_PORT" 2>/dev/null
kill "$CLI" 2>/dev/null; wait "$CLI" 2>/dev/null
"$V2RAY_BIN" run -config "$CLI2" >"$CONF_DIR/client-bad.log" 2>&1 &
CLI2PID=$!
sleep 5
code_bad="$(http_via "$BAD_PORT")"
[ "$code_bad" = "000" ] || [ "$code_bad" = "502" ]
check $? "UUID asing ditolak (HTTP $code_bad)"

echo "== 8. Bersih-bersih =="
kill "$CLI2PID" "$SRV" 2>/dev/null
left=""
for _ in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  left="$(pgrep -f "v2ray run -config $CONF_DIR/config.json" || true)"
  [ -z "$left" ] && break
done
if [ -z "$left" ]; then ok "server berhenti rapi"; else
  pkill -9 -f "v2ray run -config $CONF_DIR/config.json" 2>/dev/null
  bad "server masih hidup setelah 10 detik"
fi

echo
echo "==============================="
echo "  PASS=$PASS  FAIL=$FAIL"
echo "  log  : $CONF_DIR"
echo "==============================="
[ "$FAIL" -eq 0 ]
