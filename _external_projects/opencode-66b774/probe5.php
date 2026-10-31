<?php
// Tes Tokopedia 2-langkah: ambil tk dari halaman OTP (pakai cookie jar), lalu POST request-wa
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$P = '6283822461998';
$cj = tempnam(sys_get_temp_dir(), 'cj');

$base = ['Accept: application/json, text/javascript, */*; q=0.01', 'X-Requested-With: XMLHttpRequest',
         'Origin: https://accounts.tokopedia.com', 'User-Agent: ' . $UA, 'Accept-Language: id'];

$page = 'https://accounts.tokopedia.com/otp/c/page?otp_type=116&msisdn=+' . $P . '&ld=https%3A%2F%2Faccounts.tokopedia.com%2Fregister';
$ch = curl_init($page);
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $base,
  CURLOPT_COOKIEJAR => $cj, CURLOPT_COOKIEFILE => $cj, CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30]);
$html = (string) curl_exec($ch);
$code1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

preg_match('/id="Token"\s+value="(.*?)"/', $html, $m);
$tk = $m[1] ?? '';
echo "STEP1: HTTP $code1, tk=" . ($tk ?: 'KOSONG') . "\n";
echo "COOKIE FILE: " . (strlen((string) file_get_contents($cj)) > 20 ? 'ada cookie tersimpan' : 'kosong') . "\n";

if ($tk !== '') {
  $post = http_build_query(['otp_type' => '116', 'msisdn' => '+' . $P, 'tk' => $tk, 'email' => '',
    'original_param' => '', 'user_id' => '', 'signature' => '', 'number_otp_digit' => '6']);
  $ch2 = curl_init('https://accounts.tokopedia.com/otp/c/ajax/request-wa');
  curl_setopt_array($ch2, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $post, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array_merge($base, ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
      'Referer: https://accounts.tokopedia.com/otp/c/page?otp_type=116&msisdn=+' . $P]),
    CURLOPT_COOKIEJAR => $cj, CURLOPT_COOKIEFILE => $cj, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30]);
  $r2 = (string) curl_exec($ch2);
  $code2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
  curl_close($ch2);
  echo "STEP2: HTTP $code2\nRESP: " . trim(preg_replace('/\s+/', ' ', substr($r2, 0, 300))) . "\n";
}
unlink($cj);
echo "\n";
