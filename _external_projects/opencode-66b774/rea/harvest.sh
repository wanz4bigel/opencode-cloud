#!/bin/bash
# Panen endpoint OTP dari JS situs live:
#  navigate (CDP) -> analyze-web-bundle (ambil semua script source) -> export -> grep
TID=$(curl -s --max-time 10 http://127.0.0.1:9222/json | python3 -c "import json,sys; print([t['id'] for t in json.load(sys.stdin) if t['type']=='page'][0])")
cd /tmp/opencode/rea
for spec in "$@"; do
  name="${spec%%=*}"; url="${spec#*=}"
  echo "##### $name  $url"
  node nav2.mjs "$url" 2>&1 | tail -2
  rm -f "b-$name.json" "bs-$name.json"
  npx -y rea-agents analyze-web-bundle "http://127.0.0.1:9222" "$TID" \
      --detail complete --evidence_output "/tmp/opencode/rea/b-$name.json" \
      --observation-ms 1500 --format toon > "b-$name.out" 2>&1
  python3 - "$name" <<'PY'
import json, sys, os
n = sys.argv[1]
p = f"/tmp/opencode/rea/b-{n}.json"
if not os.path.exists(p):
    print("  evidence GAGAL:", open(f"/tmp/opencode/rea/b-{n}.out").read()[:200]); raise SystemExit
d = json.load(open(p))
d = d.get('data', d)
json.dump(d, open(f"/tmp/opencode/rea/bs-{n}.json", "w"))
src = d.get('normalized_result', {}).get('route_inventory', {}).get('sources', [])
ok = [s for s in src if s.get('status') == 'retained' or s.get('source')]
print("  sumber JS teridentifikasi:", len(src), "| tersimpan:", len(ok))
PY
  rm -rf "x-$name"
  npx -y rea-agents export-web-scripts "/tmp/opencode/rea/bs-$name.json" "/tmp/opencode/rea/x-$name" --format toon 2>&1 | grep -E 'status|exported|scripts:' | head -3
  n=$(find "x-$name" -name '*.js' 2>/dev/null | wc -l)
  echo "  chunk JS di disk: $n"
  if [ "$n" -gt 0 ]; then
    grep -rhoE '[a-zA-Z0-9/_.{}-]*(send-otp|sendOtp|send_otp|req-otp|request-otp|otp/|/otp|generateOtp|otp-|otpCode|verify-otp|sendCode|send-code)[a-zA-Z0-9/_.{}-]*' "x-$name" 2>/dev/null | tr -d '"' | sort -u | grep -viE 'otp-input|otp-input|data-otp|otp-wrapper|otpModal|otp-form|ngx-otp|otp-digit|placeholder|aria|css|otpLength$' | head -12 | sed 's/^/   > /'
  fi
done
