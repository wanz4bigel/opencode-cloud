<?php
// Diagnosa Tokopedia: jalankan alur 2-langkah 5x, cetak token + body mentah tiap percobaan.
$P = '6283822461998';
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$PAGE = 'https://accounts.tokopedia.com/otp/c/page?otp_type=116&msisdn=+' . $P . '&ld=https%3A%2F%2Faccounts.tokopedia.com%2Fregister';
$API = 'https://accounts.tokopedia.com/otp/c/ajax/request-wa';

for ($i = 1; $i <= 5; $i++) {
  // langkah 1: ambil token + simpan cookie
  $jar = tempnam(sys_get_temp_dir(), 'tk');
  $ch = curl_init($PAGE);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => ['Accept: text/html', 'User-Agent: ' . $UA]]);
  $html = (string) curl_exec($ch);
  $c1 = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  $token = '';
  if (preg_match('/id="Token"\s+value="(.*?)"/', $html, $m)) $token = $m[1];
  elseif (preg_match('/name="token"\s+value="(.*?)"/i', $html, $m)) $token = $m[1];
  $len = strlen($html);

  // langkah 2: POST request-wa pakai cookie yang sama
  $ch = curl_init($API);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 25,
    CURLOPT_COOKIEFILE => $jar,
    CURLOPT_POSTFIELDS => 'otp_type=116&msisdn=+' . $P . '&tk=' . $token .
      '&email=&original_param=&user_id=&signature=&number_otp_digit=6',
    CURLOPT_HTTPHEADER => ['Accept: application/json, text/javascript, */*; q=0.01',
      'X-Requested-With: XMLHttpRequest', 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
      'Origin: https://accounts.tokopedia.com', 'Referer: https://accounts.tokopedia.com/otp/c/page?otp_type=116',
      'User-Agent: ' . $UA]]);
  $body = (string) curl_exec($ch);
  $c2 = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  @unlink($jar);

  printf("#%d page=%d len=%d token=%s\n", $i, $c1, $len, $token !== '' ? substr($token, 0, 26) . '…' : '(KOSONG)');
  printf("   post=%d body=%s\n", $c2, substr(trim(preg_replace('/\s+/', ' ', $body)), 0, 240));
  usleep(1500000);
}
echo "\n";
