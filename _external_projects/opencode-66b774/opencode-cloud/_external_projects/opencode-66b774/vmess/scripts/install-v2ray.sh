#!/usr/bin/env bash
# ============================================================================
#  install-v2ray.sh - unduh & pasang v2ray-core (v2fly) ke folder kerja.
#  Env:
#    V2RAY_VERSION  : "latest" (default) atau "v5.53.0"
#    BIN_DIR        : tujuan install (default $WORK_DIR/bin)
#  Output:
#    $V2RAY_BIN siap dieksekusi, path didaftarkan ke $GITHUB_PATH
# ============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"

ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  x86_64 | amd64)  ARCH="64" ;;
  aarch64 | arm64) ARCH="arm64" ;;
  armv7 | armv7l)  ARCH="arm" ;;
  armv6 | armv6l)  ARCH="arm" ;;
  i386 | i686)     ARCH="32" ;;
  *) die "Arsitektur tidak didukung: $ARCH_RAW" ;;
esac

# penamaan arsip beda antara v2fly dan Xray
if [ "${CORE:-v2ray}" = "xray" ]; then
  case "$ARCH" in
    64)    ARCHIVE_ARCH="64" ;;
    arm64) ARCHIVE_ARCH="arm64-v8a" ;;
    arm)   ARCHIVE_ARCH="arm32-v7a" ;;
    32)    ARCHIVE_ARCH="32" ;;
  esac
else
  case "$ARCH" in
    64)    ARCHIVE_ARCH="64" ;;
    arm64) ARCHIVE_ARCH="arm64" ;;
    arm)   ARCHIVE_ARCH="arm" ;;
    32)    ARCHIVE_ARCH="32" ;;
  esac
fi

case "$CORE" in
  xray)
    REPO_REL="XTLS/Xray-core"
    ASSET="Xray-linux-${ARCHIVE_ARCH}.zip"
    ;;
  *)
    REPO_REL="v2fly/v2ray-core"
    ASSET="v2ray-linux-${ARCHIVE_ARCH}.zip"
    ;;
esac
BASE="https://github.com/$REPO_REL/releases"
VER="$V2RAY_VERSION"

if [ "$VER" = "latest" ]; then
  VER="$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$BASE/latest" 2>/dev/null \
        | sed -E 's#.*/tag/##' | tr -d '[:space:]')"
  if [ -z "$VER" ]; then
    [ "$CORE" = "xray" ] && VER="v26.10.21" || VER="v5.53.0"
  fi
fi
case "$VER" in v*) : ;; *) VER="v$VER" ;; esac

URL="$BASE/download/$VER/$ASSET"
TMP="$WORK_DIR/dl"
mkdir -p "$TMP"

if [ -x "$V2RAY_BIN" ] && v2ray_version "$V2RAY_BIN" | grep -qi "${VER#v}"; then
  log "v2ray ${VER} sudah terpasang di $V2RAY_BIN, lewati download."
else
  log "Unduh $ASSET ($VER) ..."
  ok=0
  for u in "$URL" "$BASE/latest/download/$ASSET"; do
    if curl -fL --retry 3 --retry-delay 2 --max-time 300 -o "$TMP/$ASSET" "$u" 2>/dev/null; then
      ok=1; break
    fi
  done
  [ "$ok" = "1" ] || die "Download gagal: $URL"

  command -v unzip >/dev/null 2>&1 || die "unzip tidak ditemukan."
  rm -rf "$TMP/x"; mkdir -p "$TMP/x"
  unzip -qo "$TMP/$ASSET" -d "$TMP/x"
  [ -f "$TMP/x/$CORE" ] || die "Binary '$CORE' tidak ada di dalam arsip $ASSET."
  install -m 0755 "$TMP/x/$CORE" "$V2RAY_BIN"
  for f in geoip.dat geosite.dat; do
    [ -f "$TMP/x/$f" ] && cp -f "$TMP/x/$f" "$BIN_DIR/" 2>/dev/null || true
  done
  rm -rf "$TMP"
fi

chmod +x "$V2RAY_BIN" 2>/dev/null || true

# Port < 1024: kasih capability supaya tetap jalan sebagai user biasa
V2RAY_SUDO_RUN=1
if [ "$(id -u)" != "0" ] && [ "$PORT" -lt 1024 ]; then
  if command -v setcap >/dev/null 2>&1 && command -v sudo >/dev/null 2>&1 \
     && sudo -n setcap 'cap_net_bind_service=+ep' "$V2RAY_BIN" 2>/dev/null; then
    V2RAY_SUDO_RUN=0
    log "cap_net_bind_service dipasang -> port $PORT tanpa root ($(getcap "$V2RAY_BIN" 2>/dev/null || echo cap_net_bind_service))"
  else
    warn "setcap gagal/tidak ada; v2ray akan dijalankan via sudo untuk port $PORT."
  fi
fi

# bentuk CLI
USE_RUN="$(v2ray_cli_detect "$V2RAY_BIN")"
CONFIG_FLAG="-config"
if [ "$CORE" = "xray" ]; then USE_RUN=1; CONFIG_FLAG="-c"; fi

log "Terpasang: $(v2ray_version "$V2RAY_BIN")"
log "Mode CLI : $([ "$USE_RUN" = "1" ] && echo "run $CONFIG_FLAG" || echo "$CONFIG_FLAG")"

if [ -n "${GITHUB_PATH:-}" ]; then
  printf '%s\n' "$BIN_DIR" >>"$GITHUB_PATH"
fi
{
  printf 'V2RAY_BIN=%s\n' "$V2RAY_BIN"
  printf 'V2RAY_INSTALLED_VERSION=%s\n' "$VER"
  printf 'V2RAY_USE_RUN_SUBCMD=%s\n' "$USE_RUN"
  printf 'V2RAY_CONFIG_FLAG=%s\n' "$CONFIG_FLAG"
  printf 'V2RAY_SUDO_RUN=%s\n' "$V2RAY_SUDO_RUN"
} >"$WORK_DIR/vars.env"
