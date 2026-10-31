<?php
// Diagnosa redbus + rupiahcepat: apakah respons "sukses" itu asli atau cuma template,
// dan apakah nomor kita sebenarnya lagi di-throttle.
$N = '83822461998'; $P = '6283822461998'; $L = '083822461998';
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';

function get($u, $hdrs = []) {
  $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25, CURLOPT_ENCODING => '',
    CURLOPT_HTTPHEADER => array_merge(['Accept: application/json, text/plain, */*',
      'Origin: https://m.redbus.id', 'Referer: https://m.redbus.id/'], $hdrs, ['User-Agent: ' .
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'])]);
  $r = (string) curl_exec($ch); $c = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  return [$c, trim(preg_replace('/\s+/', ' ', $r))];
}
function post($u, $b, $hdrs = []) {
  $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => $b,
    CURLOPT_TIMEOUT => 25, CURLOPT_ENCODING => '',
    CURLOPT_HTTPHEADER => array_merge($hdrs, ['User-Agent: ' .
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'])]);
  $r = (string) curl_exec($ch); $c = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  return [$c, trim(preg_replace('/\s+/', ' ', $r))];
}

echo "=== REDBUS: apakah responsnya berubah kalau nomor/channel diubah? ===\n";
$cases = [
  'nomor asli + WA=True ' => 'https://m.redbus.id/api/getOtp?number=' . $N . '&cc=62&whatsAppOpted=True',
  'nomor asli + WA=False' => 'https://m.redbus.id/api/getOtp?number=' . $N . '&cc=62&whatsAppOpted=False',
  'nomor ACAK (kontrol) ' => 'https://m.redbus.id/api/getOtp?number=8' . random_int(1000000000, 9999999999) . '&cc=62&whatsAppOpted=True',
  'nomor INVALID (8888) ' => 'https://m.redbus.id/api/getOtp?number=8888&cc=62&whatsAppOpted=True',
];
foreach ($cases as $label => $u) {
  [$c, $b] = get($u);
  printf("%s [%d] %s\n", $label, $c, substr($b, 0, 190));
  usleep(1200000);
}

echo "\n=== RUPIAHCEPAT: body mentah + kontrol nomor acak ===\n";
foreach ([['asli', $L], ['acak', '08' . random_int(1000000000, 9999999999)]] as [$n, $mob]) {
  $body = 'data={"mobile":"' . $mob . '","noise":"1583590641573155574","request_time":"'
    . (int) (microtime(true) * 1000) . '","access_token":"11111"}';
  [$c, $r] = post('https://apiservice.rupiahcepatweb.com/webapi/v1/request_login_register_auth_code', $body,
    ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8', 'Origin: https://h5.rupiahcepatweb.com',
     'Referer: https://h5.rupiahcepatweb.com/']);
  printf("nomor %-5s [%d] %s\n", $n, $c, substr($r, 0, 220));
  usleep(1200000);
}
echo "\n";
