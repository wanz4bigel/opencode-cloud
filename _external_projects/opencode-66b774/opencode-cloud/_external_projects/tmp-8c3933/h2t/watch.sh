#!/bin/bash
# Merekam status yang dilihat "pengunjung baru" tiap 1 detik selama durasi (detik).
n=${1:-30}
for i in $(seq 1 $n); do
  printf '%s ' "$(date +%H:%M:%S)"
  curl -sk -o /dev/null -m 6 -w 'code=%{http_code} t=%{time_total}\n' \
    https://9router-production-a2ff.up.railway.app/dashboard/quota
  sleep 1
done
