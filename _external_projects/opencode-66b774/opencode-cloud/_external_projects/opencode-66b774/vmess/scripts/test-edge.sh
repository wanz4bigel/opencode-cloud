#!/usr/bin/env bash
# ============================================================================
#  test-edge.sh - uji mode edge/CDN (CloudFront):
#    origin  : ws biasa (TLS_MODE=off) di port lokal
#    link    : port 443 + tls:"tls" (yang dilihat klien)
#  Membuktikan link tetap bisa dipakai walau origin tanpa TLS.
#
#  Env: CONF_DIR, TEST_EDGE_PORT (default 19080)
# ============================================================================
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

export CONF_DIR="${CONF_DIR:-/tmp/v2ray-vmess-edge}"
export CORE="${CORE:-v2ray}"
export TLS_MODE=off
export PORT="${TEST_EDGE_PORT:-19080}"
export PORTS_TLS=""
export PORTS_PLAIN="$PORT"
export DOMAIN="${TEST_EDGE_HOST:-d37bawnvqx75hf.cloudfront.net}"
export SNI=""
export EDGE_PORT=443
export EDGE_TLS=tls
export REMARKS=panel
export LINK_STYLE=minimal
export LIFETIME_MINUTES=10
export CHECK_INTERVAL=5
rm -rf "$CONF_DIR"

PASS=0; FAIL=0
ok()  { printf '  \033[1;32mPASS\033[0m %s\n' "$1"; PASS=$((PASS + 1)); }
bad() { printf '  \033[1;31mFAIL\033[0m %s\n' "$1"; FAIL=$((FAIL + 1)); }
chk() { if "$@" >/dev/null 2>&1; then ok "$LBL"; else bad "$LBL"; fi; }
chk_grep() { if grep -q -- "$1" "$2"; then ok "$3"; else bad "$3"; fi; }

echo "== 1. Siapkan origin (plain ws) =="
bash "$HERE/install-v2ray.sh" >/dev/null 2>&1 || { echo "install gagal"; exit 1; }
# shellcheck source=/dev/null
source "$CONF_DIR/vars.env"
bash "$HERE/gen-cert.sh" >/dev/null 2>&1 || { echo "gen-cert gagal"; exit 1; }
bash "$HERE/gen-config.sh" >/dev/null 2>&1 || { echo "gen-config gagal"; exit 1; }
# shellcheck source=/dev/null
source "$CONF_DIR/vmess.env"   # uuid/path final yang dipakai server

LBL="config origin tanpa TLS (security none)"; chk jq -e '.inbounds[0].streamSettings.security == "none"' "$CONF_DIR/config.json"
LBL="origin listen di port $PORT";            chk jq -e --argjson p "$PORT" '.inbounds[0].port == $p' "$CONF_DIR/config.json"

echo "== 2. Link menunjuk edge =="
bash "$HERE/gen-link.sh" >/dev/null 2>&1 || { echo "gen-link gagal"; exit 1; }
LINK="$(cat "$CONF_DIR/vmess-link.txt")"
DEC="$(printf '%s' "${LINK#vmess://}" | base64 -d 2>/dev/null || true)"
echo "  $DEC"

LBL="add = domain CDN";       chk test "$(printf '%s' "$DEC" | jq -r .add)" = "$DOMAIN"
LBL="port link = 443 (edge)"; chk test "$(printf '%s' "$DEC" | jq -r .port)" = "443"
LBL="tls link = tls";         chk test "$(printf '%s' "$DEC" | jq -r .tls)" = "tls"
LBL="host link = domain CDN"; chk test "$(printf '%s' "$DEC" | jq -r .host)" = "$DOMAIN"
LBL="path link = /vmess";     chk test "$(printf '%s' "$DEC" | jq -r .path)" = "$WS_PATH"

echo "== 3. Kartu pakai port edge =="
chk_grep '^Port TLS       : 443$' "$CONF_DIR/akun.txt" "kartu: Port TLS 443"
chk_grep '^Port none TLS  : -$'   "$CONF_DIR/akun.txt" "kartu: none TLS -"
chk_grep '^network        : ws$'  "$CONF_DIR/akun.txt" "kartu: network ws"
LBL="server-info: edge 443/tls"; chk jq -e '.edge.port == 443 and .edge.tls == "tls"' "$CONF_DIR/server-info.json"

echo "== 4. Origin tetap melayani (klien ws biasa) =="
bash "$HERE/run-server.sh" >"$CONF_DIR/server-test.log" 2>&1 &
SRV=$!
sleep 6
L_ID="$(printf '%s' "$DEC" | jq -r .id)"
L_PATH="$(printf '%s' "$DEC" | jq -r .path)"
PROXY_PORT="${TEST_EDGE_PROXY_PORT:-18130}"
cat >"$CONF_DIR/client.json" <<EOF
{ "log": { "loglevel": "warning" },
  "inbounds": [ { "listen": "127.0.0.1", "port": $PROXY_PORT, "protocol": "http" } ],
  "outbounds": [ { "protocol": "vmess",
    "settings": { "vnext": [ { "address": "127.0.0.1", "port": $PORT,
      "users": [ { "id": "$L_ID", "alterId": 0, "security": "auto" } ] } ] },
    "streamSettings": { "network": "ws", "security": "none",
      "wsSettings": { "path": "$L_PATH", "headers": { "Host": "$DOMAIN" } } } } ] }
EOF
CARGS=()
[ "${V2RAY_USE_RUN_SUBCMD:-0}" = "1" ] && CARGS+=(run)
CARGS+=("${V2RAY_CONFIG_FLAG:--config}" "$CONF_DIR/client.json")
"$V2RAY_BIN" "${CARGS[@]}" >"$CONF_DIR/client.log" 2>&1 &
CLI=$!
sleep 4
CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 \
  -x "http://127.0.0.1:$PROXY_PORT" https://www.google.com/generate_204 2>/dev/null)"
if [ "$CODE" = "204" ] || [ "$CODE" = "200" ]; then ok "tunnel lewat origin ws: HTTP $CODE"
else bad "tunnel lewat origin ws (HTTP ${CODE:-000})"; tail -n 3 "$CONF_DIR/client.log"; fi
kill "$CLI" 2>/dev/null
kill -TERM "$SRV" 2>/dev/null
sleep 2
pkill -9 -f "$CONF_DIR/config.json" 2>/dev/null

echo "== 5. EDGE_TLS=none (link tanpa field tls) =="
sed -i 's/^EDGE_TLS=.*/EDGE_TLS=none/' "$CONF_DIR/vmess.env"
EDGE_TLS=none bash "$HERE/gen-link.sh" >/dev/null 2>&1
DEC2="$(printf '%s' "$(cat "$CONF_DIR/vmess-link.txt")" | sed 's|^vmess://||' | base64 -d 2>/dev/null || true)"
LBL="tls dihilangkan saat none"; chk jq -e 'has("tls") | not' <<<"$DEC2"
LBL="port tetap 443";            chk test "$(printf '%s' "$DEC2" | jq -r .port)" = "443"

echo
echo "==============================="
echo "  PASS=$PASS  FAIL=$FAIL"
echo "==============================="
[ "$FAIL" -eq 0 ]
