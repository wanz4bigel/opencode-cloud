#!/usr/bin/env bash
# ============================================================================
#  gen-link.sh - bikin kartu akun (format seperti layanan komersial),
#  link vmess:// untuk SETIAP transport, QR, dan server-info.json.
#
#  Output di $WORK_DIR:
#    vmess-link.txt   link utama (ws+tls, atau transport pertama yang aktif)
#    links.txt        semua link + label transport
#    akun.txt         kartu akun (plain text)
#    vmess-qr.txt/.png
#    server-info.json
# ============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"

csv() { printf '%s' "${1:-}" | tr ',' '\n' | tr -d ' ' | sed '/^$/d'; }
join_csv() { paste -sd, - 2>/dev/null || true; }

PUBLIC_IP="${PUBLIC_IP:-$(get_public_ip || true)}"
[ -n "$PUBLIC_IP" ] || warn "Public IP tidak terdeteksi, link pakai placeholder."
export PUBLIC_IP
save_state

HOSTNAME_ADDR="${DOMAIN:-$PUBLIC_IP}"
SERVED_NAME="${SNI:-$DOMAIN}"
# Tanpa TLS, jangan default ke PORT (bisa dobel dengan PORTS_PLAIN)
if [ -n "$PORTS_TLS" ]; then :; elif [ -z "$PORTS_PLAIN" ]; then PORTS_TLS="$PORT"; else PORTS_TLS=""; fi
UPGRADE_PATH="${UPGRADE_PATH:-/up$(printf '%s' "$WS_PATH" | tr -d '/')}"
GRPC_SERVICE="${GRPC_SERVICE:-vmess}"

if [ -n "$PORT_UPGRADE" ] && [ "$CORE" != "xray" ]; then
  warn "PORT_UPGRADE=$PORT_UPGRADE dilewati: transport httpupgrade hanya ada di core xray."
  PORT_UPGRADE=""
fi

# --- edge/CDN: link menunjuk port publik, origin tetap seperti di config ------
if [ -n "$EDGE_PORT" ]; then
  EDGE_TLS="${EDGE_TLS:-tls}"          # CDN hampir selalu TLS di sisi viewer
  if [ -n "$PORT_GRPC" ] || [ -n "$PORT_UPGRADE" ]; then
    warn "EDGE_PORT=$EDGE_PORT: CloudFront/Cloudflare hanya meneruskan ws di port itu; link grpc/upgrade tidak akan jalan lewat CDN."
  fi
fi

OUT="${INFO_DIR:-$WORK_DIR}"
mkdir -p "$OUT"

NAME="${RUNNER_TAG:-vmess}"
[ -n "${PUBLIC_IP:-}" ] && NAME="${RUNNER_TAG}-$(printf '%s' "$PUBLIC_IP" | tr -d '.:' | tail -c 6)"

# ---- metadata lokasi (buat kolom CITY / ISP seperti kartu komersial) --------
CITY="${CITY:-}"; ISP="${ISP:-}"
if [ -z "$CITY$ISP" ] && command -v jq >/dev/null 2>&1; then
  INFO_JSON="$(curl -fsS --max-time 6 "https://ipinfo.io/${PUBLIC_IP}/json" 2>/dev/null || true)"
  [ -n "$INFO_JSON" ] && {
    CITY="${CITY:-$(printf '%s' "$INFO_JSON" | jq -r '.city // empty' 2>/dev/null)}"
    ISP="${ISP:-$(printf '%s' "$INFO_JSON" | jq -r '.org // empty' 2>/dev/null)}"
  }
fi
CITY="${CITY:-GitHub}"; ISP="${ISP:-GitHub Actions}"

# ---- link builder -----------------------------------------------------------
mk_link() { # port net tls path label
  local port="$1" net="$2" tls="$3" path="$4" label="$5"
  # port/tls yang dilihat klien: edge kalau di-set, kalau tidak = origin
  local pub_port="${EDGE_PORT:-$port}" pub_tls="${EDGE_TLS:-$tls}"
  local ps="${REMARKS:-$NAME}" json link
  if [ "$LINK_STYLE" = "full" ]; then
    json="$(jq -nc \
      --arg add "$HOSTNAME_ADDR" --arg port "$pub_port" --arg id "$VMESS_UUID" \
      --arg aid "$VMESS_ALTID" --arg net "$net" --arg path "$path" \
      --arg host "${DOMAIN:-}" --arg sni "$SERVED_NAME" --arg alpn "$ALPN" \
      --arg tls "$pub_tls" --arg ps "$ps-$label" --arg email "$VMESS_EMAIL" '{
        v: "2", ps: $ps, add: $add, port: $port, id: $id, aid: $aid, sc: "auto",
        net: $net, type: "none", host: $host, path: $path, tls: $tls,
        sni: $sni, alpn: $alpn, email: $email
      } | with_entries(select(.value != ""))')"
  else
    # format minimal ala v2rayN: v2, ps, add, port(number), id, net, host, path, tls
    json="$(jq -nc \
      --arg ps "$ps" --arg add "$HOSTNAME_ADDR" --argjson port "$pub_port" \
      --arg id "$VMESS_UUID" --arg net "$net" \
      --arg host "${DOMAIN:-$PUBLIC_IP}" --arg path "$path" --arg tls "$pub_tls" '{
        v: "2", ps: $ps, add: $add, port: $port, id: $id, net: $net,
        host: $host, path: $path
      } + (if $tls == "tls" then { tls: "tls" } else {} end)
        | with_entries(select(.value != "" and .value != null))')"
  fi
  link="vmess://$(printf '%s' "$json" | base64 -w0 2>/dev/null || printf '%s' "$json" | base64 | tr -d '\n')"
  LINKS+=("$label|$pub_port|$net|$link")
}

LINKS=()
for p in $(csv "$PORTS_TLS"); do
  pp="${EDGE_PORT:-$p}"
  if [ "$TLS_MODE" = "off" ]; then mk_link "$p" ws none "$WS_PATH" "ws@$pp"; else mk_link "$p" ws tls "$WS_PATH" "ws-tls@$pp"; fi
done
for p in $(csv "$PORTS_PLAIN"); do
  pp="${EDGE_PORT:-$p}"
  mk_link "$p" ws none "$WS_PATH" "ws@$pp"
done
[ -n "$PORT_GRPC" ] && mk_link "$PORT_GRPC" grpc "$([ "${GRPC_TLS:-1}" = 1 ] && echo tls || echo none)" "" "grpc@$PORT_GRPC"
[ -n "$PORT_UPGRADE" ] && mk_link "$PORT_UPGRADE" httpupgrade "$([ "${UPGRADE_TLS:-1}" = 1 ] && echo tls || echo none)" "$UPGRADE_PATH" "upgrade@$PORT_UPGRADE"

[ "${#LINKS[@]}" -gt 0 ] || die "Tidak ada link yang bisa dibuat (cek PORTS_TLS / PORTS_PLAIN)."

VMESS_LINK="${LINKS[0]#*|*|*|}"
export VMESS_LINK

# ---- fingerprint cert (dipakai klien Xray>=26 buat pinnedPeerCertSha256) ----
CERT_SHA256=""
if [ -f "$CERT_DIR/fullchain.crt" ]; then
  CERT_SHA256="$(openssl x509 -in "$CERT_DIR/fullchain.crt" -noout -fingerprint -sha256 2>/dev/null \
    | sed 's/.*=//; s/://g' | tr 'A-Z' 'a-z')"
fi

# ---- kartu akun -------------------------------------------------------------
NET_LIST="ws"
[ -n "$PORT_GRPC" ] && NET_LIST="$NET_LIST,grpc"
[ -n "$PORT_UPGRADE" ] && NET_LIST="$NET_LIST,upgrade"
PORT_ANY="$(printf '%s\n%s\n' "$PORT_UPGRADE" "$PORT_GRPC" | sed '/^$/d' | join_csv)"
CARD_TLS="$(csv "$PORTS_TLS" | join_csv)"
CARD_PLAIN="$(csv "$PORTS_PLAIN" | join_csv)"
if [ -n "$EDGE_PORT" ]; then
  # di balik CDN cuma satu port/transport yang terekspos
  CARD_TLS="-"; CARD_PLAIN="-"; PORT_ANY="-"; NET_LIST="ws"
  if [ "${EDGE_TLS:-tls}" = "none" ]; then CARD_PLAIN="$EDGE_PORT"; else CARD_TLS="$EDGE_PORT"; fi
fi
EXPIRED="${EXPIRED_ON:-$(TZ=Asia/Jakarta date -d "+${LIFETIME_MINUTES:-330} minutes" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo '-')} WIB"
[ "$EXPIRED" = " WIB" ] && EXPIRED="-"
BAR="————————————————————————————————————"

card() {
  echo "$BAR"
  echo "               VMESS"
  echo "$BAR"
  printf '%-14s : %s\n' "Remarks"        "${REMARKS:-$NAME}"
  printf '%-14s : %s\n' "CITY"           "$CITY"
  printf '%-14s : %s\n' "ISP"            "$ISP"
  printf '%-14s : %s\n' "Domain"         "$HOSTNAME_ADDR"
  printf '%-14s : %s\n' "Port TLS"       "$CARD_TLS"
  printf '%-14s : %s\n' "Port none TLS"  "$CARD_PLAIN"
  printf '%-14s : %s\n' "Port any"       "${PORT_ANY:--}"
  printf '%-14s : %s\n' "id"             "$VMESS_UUID"
  printf '%-14s : %s\n' "alterId"        "$VMESS_ALTID"
  printf '%-14s : %s\n' "Security"       "auto"
  printf '%-14s : %s\n' "network"        "$NET_LIST"
  printf '%-14s : %s\n' "path ws"        "$WS_PATH"
  [ -n "$PORT_GRPC" ] && printf '%-14s : %s\n' "serviceName" "$GRPC_SERVICE"
  [ -n "$PORT_UPGRADE" ] && printf '%-14s : %s\n' "path upgrade" "$UPGRADE_PATH"
  [ -n "${CERT_SHA256:-}" ] && printf '%-14s : %s\n' "Cert SHA256" "$CERT_SHA256"
  printf '%-14s : %s\n' "Limit IP"       "${LIMIT_IP:--}"
  printf '%-14s : %s\n' "Expired On"     "$EXPIRED"
  echo "$BAR"
}
card | tee "$OUT/akun.txt"

# ---- simpan semua link ------------------------------------------------------
: >"$OUT/links.txt"
for row in "${LINKS[@]}"; do
  IFS='|' read -r label port net link <<<"$row"
  printf '%s\n%s\n\n' "# $label" "$link" >>"$OUT/links.txt"
done
printf '%s\n' "$VMESS_LINK" >"$OUT/vmess-link.txt"

printf 'ip=%s\nport=%s\nports_tls=%s\nports_plain=%s\nport_grpc=%s\nport_upgrade=%s\nedge_port=%s\nedge_tls=%s\n' \
  "$HOSTNAME_ADDR" "$PORT" "$PORTS_TLS" "$PORTS_PLAIN" "$PORT_GRPC" "$PORT_UPGRADE" \
  "${EDGE_PORT:-}" "${EDGE_TLS:-}" >"$OUT/server-info.env"

jq -n --arg ip "$HOSTNAME_ADDR" --arg ports_tls "$PORTS_TLS" --arg ports_plain "$PORTS_PLAIN" \
      --arg port_grpc "$PORT_GRPC" --arg port_upgrade "$PORT_UPGRADE" \
      --arg uuid "$VMESS_UUID" --argjson aid "$VMESS_ALTID" --arg path "$WS_PATH" \
      --arg svc "$GRPC_SERVICE" --arg upath "$UPGRADE_PATH" \
      --arg tls "$([ "$TLS_MODE" = off ] && echo none || echo tls)" \
      --arg sni "$SERVED_NAME" --arg core "$CORE" --arg link "$VMESS_LINK" \
      --arg edge "$EDGE_PORT" --arg edge_tls "${EDGE_TLS:-}" \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg runner "${RUNNER_TAG:-github-hosted}" '{
  address: $ip, uuid: $uuid, alterId: $aid, core: $core,
  endpoints: {
    ws_tls: ($ports_tls | split(",") | map(select(. != "") | tonumber)),
    ws_plain: ($ports_plain | split(",") | map(select(. != "") | tonumber)),
    grpc: (if $port_grpc == "" then null else {port: ($port_grpc | tonumber), serviceName: $svc} end),
    httpupgrade: (if $port_upgrade == "" then null else {port: ($port_upgrade | tonumber), path: $upath} end)
  },
  path: $path, security: $tls, sni: $sni,
  edge: (if $edge == "" then null
         else { port: ($edge | tonumber), tls: (if $edge_tls == "" then "tls" else $edge_tls end) } end),
  runner: $runner, startedAt: $ts, link: $link
}' >"$OUT/server-info.json"

# ---- QR untuk link utama ----------------------------------------------------
if command -v qrencode >/dev/null 2>&1; then
  qrencode -t ANSIUTF8 -o - "$VMESS_LINK" >"$OUT/vmess-qr.txt" 2>/dev/null || true
  qrencode -o "$OUT/vmess-qr.png" -s 6 "$VMESS_LINK" 2>/dev/null || true
fi

# ---- ringkasan run ----------------------------------------------------------
SUMMARY="${GITHUB_STEP_SUMMARY:-}"
[ -z "$SUMMARY" ] && SUMMARY="$OUT/SUMMARY.md"
{
  echo '```'
  card
  echo '```'
  echo
  echo "<details><summary>Semua link vmess:// (${#LINKS[@]})</summary>"
  echo
  for row in "${LINKS[@]}"; do
    IFS='|' read -r label _port _net link <<<"$row"
    echo "- **$label**"
    echo '```'
    echo "$link"
    echo '```'
  done
  echo "</details>"
} >>"$SUMMARY" 2>/dev/null || true

log "LINK UTAMA : $VMESS_LINK"
[ -n "${GITHUB_OUTPUT:-}" ] && {
  echo "vmess_link=$VMESS_LINK" >>"$GITHUB_OUTPUT"
  echo "public_ip=$HOSTNAME_ADDR" >>"$GITHUB_OUTPUT"
}
export_ci
notify "🟢 VMess siap: ${HOSTNAME_ADDR}
TLS: $(csv "$PORTS_TLS" | join_csv) | none: $(csv "$PORTS_PLAIN" | join_csv)
network: $NET_LIST | path: $WS_PATH${EDGE_PORT:+
edge: port $EDGE_PORT (${EDGE_TLS:-tls})}"
