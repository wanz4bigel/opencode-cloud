#!/usr/bin/env bash
# ============================================================================
#  test-dns.sh - uji scripts/dns-cloudflare.sh tanpa menyentuh Cloudflare asli.
#  Memakai server tiruan (scripts/mock-cloudflare.py) di 127.0.0.1.
#
#  Skenario: UPDATE, tidak berubah, CREATE, proxied=true, skip tanpa token,
#            token salah, zone manual.
# ============================================================================
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PORT="${TEST_DNS_PORT:-18080}"
BASE="http://127.0.0.1:$PORT"
PASS=0; FAIL=0

pass() { printf '  \033[1;32mPASS\033[0m %s\n' "$1"; PASS=$((PASS + 1)); }
fail() { printf '  \033[1;31mFAIL\033[0m %s\n' "$1"; FAIL=$((FAIL + 1)); }

expect() { # actual expected label
  if [ "$1" = "$2" ]; then pass "$3"; else fail "$3 (dapat: '$1', harap: '$2')"; fi
}
expect_log() { # output pattern label
  if printf '%s\n' "$1" | grep -q -- "$2"; then pass "$3"; else fail "$3"; fi
}

start_mock() { # $1 = ip awal ("-" = belum ada record)
  if [ -n "${MOCK_PID:-}" ]; then kill "$MOCK_PID" 2>/dev/null; wait "$MOCK_PID" 2>/dev/null; fi
  python3 "$HERE/mock-cloudflare.py" "$PORT" "$1" >/dev/null 2>&1 &
  MOCK_PID=$!
  for _ in $(seq 1 40); do
    curl -fsS "$BASE/_state" >/dev/null 2>&1 && return 0
    sleep 0.1
  done
  echo "mock gagal start"; exit 1
}
trap '[ -n "${MOCK_PID:-}" ] && kill "$MOCK_PID" 2>/dev/null' EXIT

state() { curl -fsS "$BASE/_state" | jq -r "$1"; }
run_dns() { bash "$HERE/dns-cloudflare.sh" 2>&1; }

export DOMAIN=v2.domainmu.com
export PUBLIC_IP=203.0.113.10
export CF_API_TOKEN=good-token
export CF_ZONE_ID=""
export CF_PROXIED=""
export CF_RECORD_NAME=""
export CF_DNS_WAIT=0

echo "== 1. record lama -> UPDATE (PATCH) =="
start_mock 1.1.1.1
OUT="$(CF_API_BASE="$BASE" run_dns)"
expect_log "$OUT" 'diupdate: 1.1.1.1 -> 203.0.113.10' "log update benar"
expect "$(state .state.ip)" "203.0.113.10" "IP record jadi 203.0.113.10"
expect "$(state '[.calls[] | select(.[0]=="PATCH")] | length')" "1" "tepat 1x PATCH"

echo "== 2. IP sama -> tidak ada perubahan =="
OUT="$(CF_API_BASE="$BASE" run_dns)"
expect_log "$OUT" 'sudah benar' "log 'sudah benar'"
expect "$(state '[.calls[] | select(.[0]=="PATCH")] | length')" "1" "tidak ada PATCH tambahan"

echo "== 3. record belum ada -> CREATE (POST) =="
start_mock -
OUT="$(CF_API_BASE="$BASE" run_dns)"
expect_log "$OUT" 'dibuat: v2.domainmu.com -> 203.0.113.10' "log create benar"
expect "$(state .state.created)" "1" "tepat 1x POST"
expect "$(state .state.ip)" "203.0.113.10" "record terisi"

echo "== 4. CF_PROXIED=true -> proxied di record =="
start_mock 1.1.1.1
OUT="$(CF_API_BASE="$BASE" CF_PROXIED=true run_dns)"
expect_log "$OUT" 'proxied=true' "log menyebut proxied=true"
expect "$(state .state.proxied)" "true" "record proxied=true"

echo "== 5. tanpa token -> skip (exit 0, tanpa panggilan API) =="
start_mock 1.1.1.1
BEFORE="$(state '[.calls[] | select(.[1] != "/_state")] | length')"
OUT="$(CF_API_BASE="$BASE" CF_API_TOKEN="" run_dns)"; RC=$?
expect "$RC" "0" "exit 0"
expect_log "$OUT" 'CF_API_TOKEN tidak di-set' "log skip"
expect "$(state '[.calls[] | select(.[1] != "/_state")] | length')" "$BEFORE" "tidak ada request ke API"

echo "== 6. token salah -> warning, exit 0 =="
start_mock 1.1.1.1
OUT="$(CF_API_BASE="$BASE" CF_API_TOKEN=salah run_dns)"; RC=$?
expect "$RC" "0" "exit 0 (run tidak digagalkan)"
expect_log "$OUT" 'API menolak' "peringatan token"

echo "== 7. CF_ZONE_ID manual -> tanpa lookup zone =="
start_mock 1.1.1.1
OUT="$(CF_API_BASE="$BASE" CF_ZONE_ID=zone123 run_dns)"
expect_log "$OUT" 'diupdate' "update jalan"
expect "$(state '[.calls[] | select(.[0]=="GET" and (.[1] // "" | startswith("/zones?name=")))] | length')" "0" "tidak ada pencarian zone"

echo "== 8. DOMAIN CloudFront + CF_RECORD_NAME origin =="
start_mock 1.1.1.1
OUT="$(CF_API_BASE="$BASE" DOMAIN=d37bawnvqx75hf.cloudfront.net \
       CF_RECORD_NAME=origin.domainmu.com run_dns)"
expect_log "$OUT" 'record: origin.domainmu.com' "record name dipakai"
expect_log "$OUT" 'Zone: domainmu.com' "zone dari record, bukan DOMAIN"
expect "$(state .state.ip)" "203.0.113.10" "A record origin terisi"

echo
echo "==============================="
echo "  PASS=$PASS  FAIL=$FAIL"
echo "==============================="
[ "$FAIL" -eq 0 ]
