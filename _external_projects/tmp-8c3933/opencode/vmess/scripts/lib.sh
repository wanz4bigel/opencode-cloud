#!/usr/bin/env bash
# ============================================================================
#  lib.sh - helper & default values yang dipakai semua script di repo ini.
#  Cara pakai:  source "<dir script>/lib.sh"   (jangan dieksekusi langsung)
# ============================================================================
set -euo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
export LIB_DIR

log()  { printf '\033[1;36m[vmess]\033[0m %s\n' "$*" >&2; }
warn() { printf '\033[1;33m[vmess] WARN\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[vmess] ERROR\033[0m %s\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1. Lokasi kerja (di Actions pakai RUNNER_TEMP, lokal fallback ke /tmp)
# ---------------------------------------------------------------------------
WORK_DIR="${CONF_DIR:-${RUNNER_TEMP:-/tmp}/v2ray-vmess}"
BIN_DIR="${BIN_DIR:-${V2RAY_DIR:-$WORK_DIR/bin}}"
CERT_DIR="${CERT_DIR:-$WORK_DIR/cert}"
LOG_DIR="${LOG_DIR:-$WORK_DIR/logs}"
CORE="${CORE:-v2ray}"                     # v2ray (paling kompatibel) | xray (dukung httpupgrade)
V2RAY_BIN="${V2RAY_BIN:-$BIN_DIR/$CORE}"
CONFIG_FILE="${CONFIG_FILE:-$WORK_DIR/config.json}"
export WORK_DIR BIN_DIR CERT_DIR LOG_DIR V2RAY_BIN CONFIG_FILE
mkdir -p "$WORK_DIR" "$BIN_DIR" "$CERT_DIR" "$LOG_DIR"

# ---------------------------------------------------------------------------
# 2. Parameter server (bisa lewat env / secrets / workflow inputs)
#    STATE file ($WORK_DIR/vmess.env) menang atas env, supaya UUID & path
#    tetap sama walau script dipanggil berulang kali dalam satu job.
# ---------------------------------------------------------------------------
STATE_FILE="$WORK_DIR/vmess.env"
VARS_FILE="$WORK_DIR/vars.env"
# shellcheck source=/dev/null
[ -f "$STATE_FILE" ] && { source "$STATE_FILE" || true; }
# shellcheck source=/dev/null
[ -f "$VARS_FILE" ] && { source "$VARS_FILE" || true; }

# Bentuk CLI beda antar generasi:
#   v2fly v5 : v2ray run -config x.json   |  v2ray test -config x.json
#   v2ray v4 : v2ray -config x.json       |  v2ray -test -config x.json
V2RAY_USE_RUN_SUBCMD="${V2RAY_USE_RUN_SUBCMD:-}"
v2ray_cli_detect() {
  local b="${1:-$V2RAY_BIN}"
  [ -x "$b" ] || { printf '0'; return; }
  if "$b" help run 2>&1 | grep -qi 'run V2Ray with config'; then printf '1'; else printf '0'; fi
}
v2ray_version() {
  local b="${1:-$V2RAY_BIN}"
  { "$b" version 2>/dev/null || "$b" --version 2>/dev/null; } | head -n 1
}

PORT="${PORT:-443}"
case "$PORT" in ''|*[!0-9]*) die "PORT harus angka, bukan '$PORT'." ;; esac
[ "$PORT" -ge 1 ] && [ "$PORT" -le 65535 ] || die "PORT di luar rentang 1-65535: $PORT"
VMESS_ALTID="${VMESS_ALTID:-0}"
case "$VMESS_ALTID" in ''|*[!0-9]*) VMESS_ALTID=0 ;; esac
WS_PATH="${WS_PATH:-}"                 # kosong -> digenerate acak
VMESS_UUID="${VMESS_UUID:-}"           # kosong -> digenerate acak
VMESS_EMAIL="${VMESS_EMAIL:-github-actions}"
TLS_MODE="${TLS_MODE:-selfsigned}"     # selfsigned | custom | off
TLS_CRT="${TLS_CRT:-}"                 # isi = isi file sertifikat (PEM, multi-line)
TLS_KEY="${TLS_KEY:-}"                 # isi = isi private key (PEM)
DOMAIN="${DOMAIN:-}"                   # opsional, misal v2ray.example.com
SNI="${SNI:-$DOMAIN}"                  # serverName di sisi client
ALPN="${ALPN:-h2,http/1.1}"
RUNNER_TAG="${RUNNER_TAG:-gh-actions}" # nama profile/link + email client
V2RAY_VERSION="${V2RAY_VERSION:-latest}"

# --- multi-transport (opsional, dipakai mode "full") ------------------------
PORTS_TLS="${PORTS_TLS:-}"             # ws+tls, mis. "443,8443"
PORTS_PLAIN="${PORTS_PLAIN:-}"         # ws tanpa tls, mis. "80,8080"
PORT_GRPC="${PORT_GRPC:-}"             # grpc, mis. 2053
GRPC_TLS="${GRPC_TLS:-1}"
GRPC_SERVICE="${GRPC_SERVICE:-vmess}"
PORT_UPGRADE="${PORT_UPGRADE:-}"       # httpupgrade, mis. 2052 (butuh CORE=xray)
UPGRADE_TLS="${UPGRADE_TLS:-1}"
UPGRADE_PATH="${UPGRADE_PATH:-}"       # kosong -> diturunkan dari WS_PATH
REMARKS="${REMARKS:-}"                 # nama di link (ps) & kartu; kosong = RUNNER_TAG
LINK_STYLE="${LINK_STYLE:-minimal}"    # minimal (v2rayN) | full (aid/sni/alpn/email)
LIMIT_IP="${LIMIT_IP:-}"               # info di kartu saja (core tidak menegakkan)
EXPIRED_ON="${EXPIRED_ON:-}"           # info di kartu saja (kosong -> dihitung dari lifetime)

# --- edge / CDN (CloudFront, Cloudflare proxied, dll) -----------------------
# Origin tetap ws biasa (TLS_MODE=off) atau ws+tls; link menunjuk ke edge.
EDGE_PORT="${EDGE_PORT:-}"             # port publik di link (mis. 443); kosong = port origin
EDGE_TLS="${EDGE_TLS:-}"               # tls | none; kosong = ikut cert origin
case "$EDGE_PORT" in
  '') : ;;
  *[!0-9]*) die "EDGE_PORT harus angka, bukan '$EDGE_PORT'." ;;
  *) [ "$EDGE_PORT" -ge 1 ] && [ "$EDGE_PORT" -le 65535 ] || die "EDGE_PORT di luar rentang 1-65535: $EDGE_PORT" ;;
esac
case "$EDGE_TLS" in
  ''|tls|none) : ;;
  *) die "EDGE_TLS harus 'tls' atau 'none' (dapat: '$EDGE_TLS')." ;;
esac

rand() { tr -dc 'a-z0-9' </dev/urandom 2>/dev/null | head -c "${1:-8}" || true; }

# Path WS: awalan "/", tanpa karakter aneh
if [ -z "$WS_PATH" ]; then
  WS_PATH="/$(rand 8)-$(rand 4)"
fi
case "$WS_PATH" in /*) : ;; *) WS_PATH="/$WS_PATH" ;; esac
WS_PATH="$(printf '%s' "$WS_PATH" | tr -c 'a-zA-Z0-9/._-' '-')"

if [ -z "$VMESS_UUID" ]; then
  if command -v uuidgen >/dev/null 2>&1; then
    VMESS_UUID="$(uuidgen | tr 'A-Z' 'a-z')"
  elif [ -r /proc/sys/kernel/random/uuid ]; then
    VMESS_UUID="$(cat /proc/sys/kernel/random/uuid)"
  else
    VMESS_UUID="$(python3 -c 'import uuid;print(uuid.uuid4())' 2>/dev/null || echo "")"
  fi
fi
[ -n "$VMESS_UUID" ] || die "Gagal bikin UUID, set VMESS_UUID manual lewat secrets/inputs."

# ---------------------------------------------------------------------------
# 3. Izin bind port < 1024
#    Utama: capability CAP_NET_BIND_SERVICE pada binary (tanpa root, proses
#    tetap milik user -> kill/restart bersih). Fallback: jalan via sudo.
#    Marker: V2RAY_SUDO_RUN=1 (dari vars.env) -> pakai sudo.
# ---------------------------------------------------------------------------
SUDO=()
if [ "$(id -u)" != "0" ] && [ "$PORT" -lt 1024 ] && [ "${V2RAY_SUDO_RUN:-1}" = "1" ]; then
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    # shellcheck disable=SC2034  # dipakai run-server.sh
    SUDO=(sudo -n)
    warn "Port $PORT -> v2ray akan dijalankan via sudo (setcap tidak tersedia/gagal)."
  else
    warn "Port $PORT butuh root/root-capability tapi sudo tidak tersedia. Pakai port >= 1024 (mis. 8443)."
  fi
fi

# ---------------------------------------------------------------------------
# 4. Public IP runner (beberapa provider, fallback berurutan)
# ---------------------------------------------------------------------------
get_public_ip() {
  local ip="" url
  for url in \
    "https://api.ipify.org" \
    "https://ifconfig.me/ip" \
    "https://ipinfo.io/ip" \
    "https://icanhazip.com" \
    "https://checkip.amazonaws.com"; do
    ip="$(curl -fsS --max-time 8 "$url" 2>/dev/null | tr -d '[:space:]' || true)"
    if printf '%s' "$ip" | grep -Eq '^([0-9]{1,3}\.){3}[0-9]{1,3}$'; then
      printf '%s' "$ip"; return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------------------
# 5. Kirim "sinyal hidup" ke GitHub API -> dipakai buat restart otomatis
#    sebelum job kena limit 6 jam, sekaligus jaga cron supaya tidak nonaktif.
# ---------------------------------------------------------------------------
dispatch_next() {
  local reason="${1:-keepalive}"
  local token="${REPO_TOKEN:-${GITHUB_TOKEN:-${ACTIONS_RUNTIME_TOKEN:-}}}"
  local api="${GITHUB_API_URL:-https://api.github.com}"
  local repo="${GITHUB_REPOSITORY:-}" wf="${KEEPALIVE_WORKFLOW:-vmess-server.yml}"
  local ref="${GITHUB_REF_NAME:-${DEFAULT_BRANCH:-${GITHUB_HEAD_REF:-main}}}"
  [ -n "$repo" ] && [ -n "$token" ] || { warn "dispatch dilewati (token/repo kosong)."; return 1; }

  # Kirim ulang parameter yang sedang aktif supaya endpoint tidak berubah saat handoff
  local body
  if command -v jq >/dev/null 2>&1; then
    body="$(jq -nc --arg ref "$ref" --arg reason "$reason" \
      --arg port "$PORT" --arg path "$WS_PATH" --arg uuid "$VMESS_UUID" \
      --arg domain "$DOMAIN" --arg sni "$SNI" --arg tls "$TLS_MODE" \
      --arg life "${LIFETIME_MINUTES:-330}" --arg src "${GITHUB_RUN_ID:-none}" \
      --arg tag "${RUNNER_TAG:-ubuntu-latest}" --arg mode "${MODE:-simple}" \
      --arg core "$CORE" '{
        ref: $ref,
        inputs: {
          port: $port, ws_path: $path, uuid: $uuid, domain: $domain,
          sni: $sni, tls_mode: $tls, lifetime_minutes: $life,
          mode: $mode, core: $core,
          runner_images: ("[\"" + $tag + "\"]")
        },
        client_payload: { reason: $reason, source_run: $src }
      }')"
  else
    body="{\"ref\":\"$ref\"}"
  fi

  local code
  code="$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
    -X POST "$api/repos/$repo/actions/workflows/$wf/dispatches" \
    -H "Authorization: Bearer $token" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -d "$body" 2>/dev/null || echo 000)"
  log "Handoff dispatch '$reason' -> HTTP $code"
  [ "$code" = "204" ]
}

# ---------------------------------------------------------------------------
# 6. Notifikasi Telegram (opsional: TG_TOKEN + TG_CHAT_ID)
# ---------------------------------------------------------------------------
notify() {
  local msg="${1:-}"
  [ -n "$msg" ] || return 0
  if [ -n "${TG_TOKEN:-}" ] && [ -n "${TG_CHAT_ID:-}" ]; then
    curl -fsS --max-time 10 -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
      -d chat_id="$TG_CHAT_ID" -d disable_web_page_preview=true \
      --data-urlencode "text=$msg" >/dev/null 2>&1 || warn "Kirim Telegram gagal."
  fi
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    printf '%s\n' "$msg" >>"$GITHUB_STEP_SUMMARY" 2>/dev/null || true
  fi
}

# ---------------------------------------------------------------------------
# 7. Export semua nilai ke file $GITHUB_ENV & $GITHUB_OUTPUT
# ---------------------------------------------------------------------------
export_ci() {
  local var val
  for var in VMESS_UUID VMESS_ALTID VMESS_EMAIL WS_PATH PORT DOMAIN SNI TLS_MODE \
             RUNNER_TAG PUBLIC_IP V2RAY_VERSION WORK_DIR CONFIG_FILE CORE \
             PORTS_TLS PORTS_PLAIN PORT_GRPC GRPC_SERVICE PORT_UPGRADE UPGRADE_PATH \
             EDGE_PORT EDGE_TLS; do
    val="${!var:-}"
    if [ -n "${GITHUB_ENV:-}" ]; then
      printf '%s=%s\n' "$var" "$val" >>"$GITHUB_ENV" 2>/dev/null || true
    fi
  done
}

is_ipv4() { printf '%s' "$1" | grep -Eq '^([0-9]{1,3}\.){3}[0-9]{1,3}$'; }

# ---------------------------------------------------------------------------
# 8. Simpan parameter ke state file supaya konsisten antar script
# ---------------------------------------------------------------------------
save_state() {
  {
    printf 'VMESS_UUID=%s\n' "$VMESS_UUID"
    printf 'VMESS_ALTID=%s\n' "$VMESS_ALTID"
    printf 'VMESS_EMAIL=%s\n' "$VMESS_EMAIL"
    printf 'WS_PATH=%s\n' "$WS_PATH"
    printf 'PORT=%s\n' "$PORT"
    printf 'DOMAIN=%s\n' "${DOMAIN:-}"
    printf 'SNI=%s\n' "${SNI:-}"
    printf 'TLS_MODE=%s\n' "$TLS_MODE"
    printf 'ALPN=%s\n' "$ALPN"
    printf 'RUNNER_TAG=%s\n' "$RUNNER_TAG"
    printf 'CORE=%s\n' "$CORE"
    printf 'PORTS_TLS=%s\n' "$PORTS_TLS"
    printf 'PORTS_PLAIN=%s\n' "$PORTS_PLAIN"
    printf 'PORT_GRPC=%s\n' "$PORT_GRPC"
    printf 'GRPC_TLS=%s\n' "$GRPC_TLS"
    printf 'GRPC_SERVICE=%s\n' "$GRPC_SERVICE"
    printf 'PORT_UPGRADE=%s\n' "$PORT_UPGRADE"
    printf 'UPGRADE_TLS=%s\n' "$UPGRADE_TLS"
    printf 'UPGRADE_PATH=%s\n' "$UPGRADE_PATH"
    printf 'EDGE_PORT=%s\n' "${EDGE_PORT:-}"
    printf 'EDGE_TLS=%s\n' "${EDGE_TLS:-}"
    [ -n "${PUBLIC_IP:-}" ] && printf 'PUBLIC_IP=%s\n' "$PUBLIC_IP"
  } >"$STATE_FILE"
  chmod 600 "$STATE_FILE" 2>/dev/null || true
}

