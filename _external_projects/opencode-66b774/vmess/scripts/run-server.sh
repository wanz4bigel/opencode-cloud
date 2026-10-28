#!/usr/bin/env bash
# ============================================================================
#  run-server.sh - menjalankan v2ray di foreground (dipakai step "Run" di
#  Actions) dengan watchdog + restart otomatis + regenerasi sebelum kena
#  limit 6 jam GitHub Actions.
#
#  Env:
#    LIFETIME_MINUTES      : umur maksimal server di runner ini (default 330)
#    RESTART_BEFORE_MINUTES: jarak trigger run pengganti sebelum mati (default 12)
#    CHECK_INTERVAL        : detik antar cek kesehatan (default 20)
#    MAX_RESTARTS          : batas restart karena crash (default 50)
# ============================================================================
source "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/lib.sh"

[ -f "$CONFIG_FILE" ] || die "config.json belum ada, jalankan gen-config.sh dulu."

LIFETIME_MINUTES="${LIFETIME_MINUTES:-330}"
RESTART_BEFORE_MINUTES="${RESTART_BEFORE_MINUTES:-12}"
# jangan sampai titik handoff jatuh sebelum run dimulai (mis. lifetime 5 menit)
MAX_BEFORE=$(( LIFETIME_MINUTES / 3 ))
[ "$MAX_BEFORE" -lt 0 ] && MAX_BEFORE=0
[ "$RESTART_BEFORE_MINUTES" -gt "$MAX_BEFORE" ] && RESTART_BEFORE_MINUTES="$MAX_BEFORE"
CHECK_INTERVAL="${CHECK_INTERVAL:-20}"
MAX_RESTARTS="${MAX_RESTARTS:-50}"

START_TS="$(date +%s)"
DEADLINE=$(( START_TS + LIFETIME_MINUTES * 60 ))
HANDOFF_AT=$(( DEADLINE - RESTART_BEFORE_MINUTES * 60 ))
LOG_FILE="$LOG_DIR/v2ray.$(date -u +%Y%m%d%H%M%S).log"
[ -n "${LOG_DIR:-}" ] && ln -sfn "$LOG_FILE" "$LOG_DIR/latest.log" 2>/dev/null || true

cleanup() {
  trap - INT TERM EXIT
  log "Shutdown (SIGTERM) ..."
  [ -n "${PID:-}" ] && "${SUDO[@]}" kill "$PID" 2>/dev/null || true
  for _ in 1 2 3 4 5; do
    [ -z "${PID:-}" ] && break
    "${SUDO[@]}" kill -0 "$PID" 2>/dev/null || break
    sleep 1
  done
  [ -n "${PID:-}" ] && "${SUDO[@]}" kill -9 "$PID" 2>/dev/null || true
  # kalau belum sempat handoff, pastikan ada run pengganti
  if [ "${DISPATCHED:-0}" = "0" ]; then dispatch_next "final-shutdown" || true; fi
  exit 0
}
trap cleanup INT TERM

start_v2ray() {
  local args=()
  [ "${V2RAY_USE_RUN_SUBCMD:-0}" = "1" ] && args+=(run)
  args+=("${V2RAY_CONFIG_FLAG:--config}" "$CONFIG_FILE")
  log "Start: $(basename "$V2RAY_BIN") ${args[*]}"
  log "Inbound: tls=[${PORTS_TLS:-none}] plain=[${PORTS_PLAIN:-none}]${PORT_GRPC:+ grpc=[$PORT_GRPC]}${PORT_UPGRADE:+ upgrade=[$PORT_UPGRADE]} ws=$WS_PATH"
  "${SUDO[@]}" "$V2RAY_BIN" "${args[@]}" >>"$LOG_FILE" 2>&1 &
  PID=$!
  disown 2>/dev/null || true
  sleep 3
  if ! "${SUDO[@]}" kill -0 "$PID" 2>/dev/null; then
    warn "v2ray langsung mati. Log:"
    tail -n 25 "$LOG_FILE" 2>/dev/null || true
    return 1
  fi
  log "v2ray hidup, pid=$PID"
  return 0
}

log "==============================================="
log " Deadline job : $(date -u -d "@$DEADLINE" '+%Y-%m-%d %H:%M UTC' 2>/dev/null || echo "${LIFETIME_MINUTES}m dari sekarang")"
log " Handoff run  : $(date -u -d "@$HANDOFF_AT" '+%Y-%m-%d %H:%M UTC' 2>/dev/null || echo '-')"
log "==============================================="

RESTARTS=0
DISPATCHED=0
DISPATCH_TRIES=0
HEALTH_FAILS=0
PID=""

start_v2ray || { notify "❌ VMess gagal start di port $PORT"; die "v2ray gagal start sama sekali."; }
notify "🟢 VMess aktif: ${DOMAIN:-${PUBLIC_IP:-127.0.0.1}}:$PORT$WS_PATH
UUID: $VMESS_UUID | alterId: $VMESS_ALTID
Transport: ws + ${TLS_MODE} | runner: ${RUNNER_TAG}
Umur run ini: ${LIFETIME_MINUTES} menit (handoff ke run baru sebelum limit 6 jam)"

while :; do
  NOW="$(date +%s)"

  # 1) mau habis masa tayang -> panggil run pengganti lalu tutup rapi-rapi
  if [ "$NOW" -ge "$HANDOFF_AT" ]; then
    if [ "$DISPATCHED" = "0" ] && [ "$DISPATCH_TRIES" -lt 5 ]; then
      DISPATCH_TRIES=$(( DISPATCH_TRIES + 1 ))
      log "Fase handoff (percobaan $DISPATCH_TRIES/5): trigger run baru supaya endpoint tidak lama mati."
      if dispatch_next "handoff"; then
        DISPATCHED=1
      else
        warn "Dispatch belum berhasil, dicoba lagi ${CHECK_INTERVAL}s lagi."
      fi
    fi
    if [ "$NOW" -ge "$DEADLINE" ]; then
      log "Masa tayang $(( LIFETIME_MINUTES )) menit selesai. Keluar dengan rapi."
      break
    fi
  fi

  # 2) proses mati?
  if ! "${SUDO[@]}" kill -0 "$PID" 2>/dev/null; then
    warn "Proses v2ray mati (exit). Log terakhir:"
    tail -n 30 "$LOG_FILE" 2>/dev/null || true
    RESTARTS=$(( RESTARTS + 1 ))
    if [ "$RESTARTS" -gt "$MAX_RESTARTS" ]; then
      notify "❌ VMess ${PUBLIC_IP:-?}:$PORT$WS_PATH berhenti permanen setelah $MAX_RESTARTS restart."
      die "Melewati batas $MAX_RESTARTS restart."
    fi
    log "Restart ke-$RESTARTS dalam 5 detik ..."
    sleep 5
    start_v2ray || sleep 15
    continue
  fi

  # 3) cek kesehatan berkala (kirim parameter eksplisit supaya tidak beda path)
  if ! CONF_DIR="$WORK_DIR" VMESS_UUID="$VMESS_UUID" VMESS_ALTID="$VMESS_ALTID" \
       WS_PATH="$WS_PATH" PORT="$PORT" DOMAIN="$DOMAIN" SNI="$SNI" TLS_MODE="$TLS_MODE" \
       bash "$LIB_DIR/healthcheck.sh" >/dev/null 2>&1; then
    HEALTH_FAILS=$(( HEALTH_FAILS + 1 ))
    warn "Healthcheck gagal ($HEALTH_FAILS)."
    if [ "$HEALTH_FAILS" -ge 3 ]; then
      warn "Tidak sehat 3x beruntun -> restart paksa."
      "${SUDO[@]}" kill -9 "$PID" 2>/dev/null || true
      HEALTH_FAILS=0
      sleep 3
      start_v2ray || true
    fi
  else
    HEALTH_FAILS=0
  fi

  # tidur 1 detik per putaran supaya SIGTERM langsung tertangani
  waited=0
  while [ "$waited" -lt "$CHECK_INTERVAL" ]; do
    sleep 1
    waited=$(( waited + 1 ))
  done
done

"${SUDO[@]}" kill "$PID" 2>/dev/null || true
wait "$PID" 2>/dev/null || true
log "Selesai. Total restart karena crash: $RESTARTS"
exit 0
