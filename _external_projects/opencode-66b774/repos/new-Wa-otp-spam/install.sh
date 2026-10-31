#!/bin/bash
# ============================================================
#  DODO SPAMMER — INSTALL SCRIPT
#  Usage: bash install.sh
# ============================================================

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   D O D O   S P A M M E R            ║"
echo "║   INSTALL SCRIPT v2.0                ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Update
echo "[*] Updating packages..."
pkg update -y && pkg upgrade -y

# Install dependencies
echo "[*] Installing Python..."
pkg install python -y

echo "[*] Installing pip..."
pkg install python-pip -y

echo "[*] Installing requests..."
pip install requests

echo "[*] Installing git..."
pkg install git -y

# Create config
echo "[*] Creating config.json..."
cat > config.json << EOF
{
    "threads": 40,
    "delay": 0.5,
    "timeout": 8,
    "max_retry": 3
}
EOF

# Create api_list.txt with 40 APIs
echo "[*] Creating api_list.txt..."
cat > api_list.txt << EOF
# WhatsApp OTP Endpoints (40 API)
https://web.whatsapp.com/send
https://api.whatsapp.com/send
https://chat.whatsapp.com/invite
https://wa.me/send
https://api.whatsapp.net/v1/send
https://graph.facebook.com/v17.0/
https://graph.facebook.com/v18.0/
https://graph.facebook.com/v19.0/
https://api.instagram.com/v1/
https://i.instagram.com/api/v1/
https://api.telegram.org/bot
https://api2.telegram.org/bot
https://sms-activate.org/stubs/handler_api
https://smshub.org/stubs/handler_api
https://5sim.net/v1/user/
https://api.sms-man.com/stubs/handler_api
https://sms-aktivasi.ru/stubs/handler_api
https://api.temp-number.org/v1/
https://api.sms-list.com/v1/
https://api.getsmscode.com/v1/
https://api.smsreceive.com/v1/
https://api.free-sms-number.com/v1/
https://api.sms-online.com/v1/
https://api.sms-receive.net/v1/
https://api.textnow.com/v1/
https://api.google.com/v1/
https://api.apple.com/v1/
https://api.microsoft.com/v1/
https://api.amazon.com/v1/
https://api.spotify.com/v1/
https://api.netflix.com/v1/
https://api.discord.com/v1/
https://api.snapchat.com/v1/
https://api.tiktok.com/v1/
https://api.twitter.com/v1/
https://api.signal.org/v1/
https://api.line.me/v1/
https://api.viber.com/v1/
https://api.wechat.com/v1/
https://api.kakaotalk.com/v1/
EOF

# Make spam.py executable
chmod +x spam.py

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   ✅ INSTALL COMPLETE                ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Usage: python3 spam.py +628xxxxxxxxxx"
echo "Example: python3 spam.py +6281234567890"
echo ""