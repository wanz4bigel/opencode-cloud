#!/bin/bash
# Prober: cek kapan IP kita berhenti di-block oleh host tutorialinjectid
# Log: /tmp/opencode/probe.log
IP=203.175.8.18
LOG=/tmp/opencode/probe.log
: > "$LOG"
for i in $(seq 1 80); do
  ts=$(date -u '+%H:%M:%S')
  out=$(timeout 6 bash -c "</dev/tcp/$IP/443" 2>&1)
  rc=$?
  if [ $rc -eq 0 ]; then st="OPEN"; else st="blocked(rc=$rc)"; fi
  code=$(timeout 12 curl -s -o /dev/null -m 10 -w '%{http_code}' http://$IP/ 2>/dev/null)
  echo "$ts  443=$st  http80=$code" >> "$LOG"
  if [ "$st" = "OPEN" ]; then
    echo "$ts  === UNBLOCKED, lanjutin ===" >> "$LOG"
    break
  fi
  sleep 20
done
echo "done $(date -u '+%H:%M:%S')" >> "$LOG"
