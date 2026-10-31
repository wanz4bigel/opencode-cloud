#!/bin/bash
# Sweep cepat: cek konektivitas + proteksi WAF dasar dari IP ini.
UA='Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'
URLS="
https://www.buckscore.com/id/login
https://jamkkartini.jamkrid.com/id
https://www.jamkrid.com/
https://akulaku.co.id/
https://www.akseleran.co.id/login
https://www.moneytm.com/
https://www.amartha.co.id/
https://api.cermati.com/
https://www.dana.id/
https://dashboard.dana.id/
https://www.ovo.id/
https://biz.ovo.id/
https://www.doku.com/
https://www.momotoran.id/
https://api.momotoran.id/
https://www.fintio.me/
https://www.kreditpintar.com/
https://www.bfifinance.co.id/
https://www.cashlez.com/
https://www.kreditplus.com/
https://www.acc.co.id/
https://www.kreditgo.id/
https://www.inilah.com/
https://www.rogas.id/
https://www.pakbor.id/
https://api.pakbor.id/
https://www.cicil.co.id/
https://www.credibuzz.com/
https://www.kreditpro.me/
https://smaa.go.id/login
https://picon-api.jamkrid.com/
https://www.gnometo.com/
https://api.gnometo.com/
https://www.pln.co.id/
https://api-pln.mypln.id/api/auth/v1/user/otp
https://mypln.id/
https://www.telkomsel.com/
https://my.telkomsel.com/
https://api.mytelkomsel.com/myrestri/api/v1/customers
https://api.indosat.com/
https://im3.indosat.com/
https://myxl.co.id/
https://www.xl.co.id/
https://api.xl.co.id/
https://smartfren.com/
https://three.co.id/
https://registrasi.tri.co.id/daftar/
"
for u in $URLS; do
  r=$(curl -s -o /dev/null -w '%{http_code}|%{time_total}|%{size_download}' --max-time 12 -A "$UA" -H 'Accept-Language: id' "$u" 2>&1)
  code=${r%%|*}
  rest=${r#*|}
  if [ "$code" = "000" ]; then
    printf '%-52s FAIL     %s\n' "$u" "$rest"
  else
    printf '%-52s HTTP %-4s %s\n' "$u" "$code" "$rest"
  fi
done
