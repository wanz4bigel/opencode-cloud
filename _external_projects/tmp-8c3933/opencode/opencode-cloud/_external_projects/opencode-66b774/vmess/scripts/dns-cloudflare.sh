#!/usr/bin/env bash
# ============================================================================
#  dns-cloudflare.sh - arahkan DOMAIN ke public IP runner (A record) lewat
#  Cloudflare API. Dipanggil tiap run, jadi domain selalu ikut IP baru.
#
#  Env:
#    DOMAIN            : v2ray.domainmu.com            (wajib)
#    PUBLIC_IP         : IP runner (kosong -> dideteksi otomatis)
#    CF_API_TOKEN      : token API, permission Zone.DNS:Edit (wajib)
#    CF_ZONE_ID        : opsional, kalau kosong dicari otomatis dari DOMAIN
#    CF_RECORD_NAME    : opsional, default = DOMAIN (mis. www.domainmu.com)
#    CF_PROXIED        : true/false, default false (orange cloud = true)
#    CF_DNS_WAIT       : detik menunggu propagasi saat verifikasi (default 20)
#    CF_TTL            : default 1 (auto)
#
#  Tanpa CF_API_TOKEN / DOMAIN -> script hanya skip (exit 0).
# ============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"

[ -n "${DOMAIN:-}" ] || { log "DOMAIN kosong -> lewati update DNS (pakai IP langsung)."; exit 0; }
[ -n "${CF_API_TOKEN:-}" ] || { log "CF_API_TOKEN tidak di-set -> lewati update DNS."; exit 0; }
command -v jq >/dev/null 2>&1 || die "jq diperlukan untuk update DNS."

API="${CF_API_BASE:-https://api.cloudflare.com/client/v4}"   # bisa di-override buat tes
RECORD_NAME="${CF_RECORD_NAME:-$DOMAIN}"
case "${CF_PROXIED:-false}" in
  1|true|TRUE|yes|y|on) PROXIED=true ;;
  *)                    PROXIED=false ;;
esac
TTL="${CF_TTL:-1}"
WAIT="${CF_DNS_WAIT:-20}"

PUBLIC_IP="${PUBLIC_IP:-$(get_public_ip || true)}"
if ! is_ipv4 "$PUBLIC_IP"; then
  warn "Public IP tidak valid ('$PUBLIC_IP'), update DNS dibatalkan."
  exit 0
fi

cf() { # method path [json]
  local method="$1" path="$2" data="${3:-}"
  if [ -n "$data" ]; then
    curl -sS --max-time 20 -X "$method" "$API$path" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" -d "$data"
  else
    curl -sS --max-time 20 -X "$method" "$API$path" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json"
  fi
}

# ---- 1. cari zone id ---------------------------------------------------------
ZONE_ID="${CF_ZONE_ID:-}"
if [ -z "$ZONE_ID" ]; then
  # zone dicari dari nama record (bisa beda dari DOMAIN, mis. CloudFront)
  CANDS="$(printf '%s' "$RECORD_NAME" | awk -F. '{for(i=2;i<=NF-1;i++){s=$i;for(j=i+1;j<=NF;j++)s=s"."$j;print s}}')"
  API_ERR=""
  while read -r cand; do
    [ -n "$cand" ] || continue
    resp="$(cf GET "/zones?name=$cand&per_page=1")"
    if [ "$(printf '%s' "$resp" | jq -r '.success // false' 2>/dev/null)" != "true" ]; then
      API_ERR="$(printf '%s' "$resp" | jq -r '.errors[0].message // empty' 2>/dev/null)"
      break
    fi
    id="$(printf '%s' "$resp" | jq -r '.result[0].id // empty' 2>/dev/null)"
    if [ -n "$id" ]; then ZONE_ID="$id"; ZONE="$cand"; break; fi
  done <<<"$CANDS"
fi
[ -n "$ZONE_ID" ] || {
  if [ -n "${API_ERR:-}" ]; then
    warn "Cloudflare API menolak: $API_ERR (cek CF_API_TOKEN: izin Zone.DNS:Edit + Zone:Read)."
  else
    warn "Zone Cloudflare untuk '$RECORD_NAME' tidak ditemukan (set CF_ZONE_ID manual)."
  fi
  exit 0
}
log "Zone: ${ZONE:-$ZONE_ID} | record: $RECORD_NAME -> $PUBLIC_IP (proxied=$PROXIED)"

# ---- 2. cari record A yang sudah ada -----------------------------------------
LIST="$(cf GET "/zones/$ZONE_ID/dns_records?type=A&name=$RECORD_NAME&per_page=1")"
if [ "$(printf '%s' "$LIST" | jq -r '.success')" != "true" ]; then
  warn "Cloudflare menolak permintaan: $(printf '%s' "$LIST" | jq -r '.errors[0].message // "unknown"')"
  exit 0
fi
REC_ID="$(printf '%s' "$LIST" | jq -r '.result[0].id // empty')"
OLD_IP="$(printf '%s' "$LIST" | jq -r '.result[0].content // empty')"

BODY="$(jq -nc --arg name "$RECORD_NAME" --arg ip "$PUBLIC_IP" \
  --argjson proxied "$PROXIED" --argjson ttl "$TTL" \
  '{type:"A", name:$name, content:$ip, proxied:$proxied, ttl:$ttl, comment:"v2ray-vmess-action"}')"

# ---- 3. update / buat --------------------------------------------------------
if [ -n "$REC_ID" ]; then
  if [ "$OLD_IP" = "$PUBLIC_IP" ]; then
    log "A record sudah benar ($OLD_IP), tidak diubah."
  else
    RES="$(cf PATCH "/zones/$ZONE_ID/dns_records/$REC_ID" "$BODY")"
    [ "$(printf '%s' "$RES" | jq -r '.success')" = "true" ] \
      && log "A record diupdate: $OLD_IP -> $PUBLIC_IP" \
      || { warn "Gagal update: $(printf '%s' "$RES" | jq -r '.errors[0].message // "unknown"')"; exit 0; }
  fi
else
  RES="$(cf POST "/zones/$ZONE_ID/dns_records" "$BODY")"
  [ "$(printf '%s' "$RES" | jq -r '.success')" = "true" ] \
    && log "A record dibuat: $RECORD_NAME -> $PUBLIC_IP" \
    || { warn "Gagal membuat record: $(printf '%s' "$RES" | jq -r '.errors[0].message // "unknown"')"; exit 0; }
fi
# shellcheck disable=SC2015
[ -n "${GITHUB_STEP_SUMMARY:-}" ] && printf '### 🌐 DNS\n`%s` → `%s` (proxied: %s)\n\n' \
  "$RECORD_NAME" "$PUBLIC_IP" "$PROXIED" >>"$GITHUB_STEP_SUMMARY" 2>/dev/null || true

# ---- 4. verifikasi propagasi -------------------------------------------------
[ "${PROXIED}" = "true" ] && { log "Proxied (orange cloud): DNS akan menunjuk IP Cloudflare, verifikasi A record dilewati."; exit 0; }
command -v dig >/dev/null 2>&1 || exit 0

tries=$(( WAIT / 5 + 1 ))
for _ in $(seq 1 "$tries"); do
  got="$(dig +short A "$RECORD_NAME" @1.1.1.1 2>/dev/null | head -n1)"
  if [ "$got" = "$PUBLIC_IP" ]; then
    log "DNS propagasi OK: $RECORD_NAME -> $got"
    exit 0
  fi
  sleep 5
done
warn "DNS belum menunjuk ke $PUBLIC_IP (sekarang: '${got:-kosong}'). Cek TTL/zone."
exit 0
