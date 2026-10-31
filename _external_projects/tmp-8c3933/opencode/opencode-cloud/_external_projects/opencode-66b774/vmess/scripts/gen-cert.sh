#!/usr/bin/env bash
# ============================================================================
#  gen-cert.sh - siapkan sertifikat TLS untuk inbound WebSocket+TLS.
#    TLS_MODE=selfsigned : bikin self-signed (10 tahun) + SAN IP/domain  <- default
#    TLS_MODE=custom     : pakai TLS_CRT / TLS_KEY (dari secrets, isi PEM)
#    TLS_MODE=off        : tanpa TLS (plain WS), config dibikin tanpa tlsSettings
#  Output: $CERT_DIR/fullchain.crt dan $CERT_DIR/priv.key
# ============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"

CRT_FILE="$CERT_DIR/fullchain.crt"
KEY_FILE="$CERT_DIR/priv.key"

if [ "$TLS_MODE" = "off" ]; then
  log "TLS_MODE=off -> inbound pakai plain WebSocket (tanpa TLS)."
  printf 'TLS_CRT_FILE=\nTLS_KEY_FILE=\n' >"$WORK_DIR/tls.env"
  exit 0
fi

if [ "$TLS_MODE" = "custom" ]; then
  if [ -n "${TLS_CRT_FILE:-}" ] && [ -f "${TLS_CRT_FILE:-}" ]; then
    CRT_FILE="$TLS_CRT_FILE"; KEY_FILE="${TLS_KEY_FILE:?}"
  elif [ -n "$TLS_CRT" ] && [ -n "$TLS_KEY" ]; then
    printf '%s\n' "$TLS_CRT" >"$CRT_FILE"
    printf '%s\n' "$TLS_KEY" >"$KEY_FILE"
    chmod 600 "$KEY_FILE"
  else
    die "TLS_MODE=custom tapi TLS_CRT / TLS_KEY kosong."
  fi
  openssl x509 -in "$CRT_FILE" -noout >/dev/null 2>&1 || die "Sertifikat tidak valid: $CRT_FILE"
  log "Sertifikat custom OK: $(openssl x509 -in "$CRT_FILE" -noout -enddate 2>/dev/null | cut -d= -f2)"
  printf 'TLS_CRT_FILE=%s\nTLS_KEY_FILE=%s\n' "$CRT_FILE" "$KEY_FILE" >"$WORK_DIR/tls.env"
  exit 0
fi

# ---- self-signed ------------------------------------------------------------
command -v openssl >/dev/null 2>&1 || die "openssl tidak ditemukan."

IP_FOR_SAN="${PUBLIC_IP:-${SERVER_IP:-}}"
SUBJ="/C=ID/ST=Indonesia/L=Jakarta/O=GitHub-Actions/OU=VMess/CN=${DOMAIN:-v2ray.local}"
SAN="DNS:localhost,DNS:v2ray.local"
[ -n "$DOMAIN" ] && SAN="$SAN,DNS:$DOMAIN"
[ -n "$SNI" ] && SAN="$SAN,DNS:$SNI"
[ -n "$IP_FOR_SAN" ] && SAN="$SAN,IP:$IP_FOR_SAN"
SAN="$SAN,IP:127.0.0.1,IP:::1"

openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes \
  -keyout "$KEY_FILE" -out "$CRT_FILE" \
  -subj "$SUBJ" -addext "subjectAltName=$SAN" \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth" 2>/dev/null

chmod 600 "$KEY_FILE"
log "Self-signed cert dibuat (10 tahun). SAN: $SAN"
log "Client wajib menyalakan 'Allow Insecure / Allow invalid certificate'."
printf 'TLS_CRT_FILE=%s\nTLS_KEY_FILE=%s\n' "$CRT_FILE" "$KEY_FILE" >"$WORK_DIR/tls.env"
