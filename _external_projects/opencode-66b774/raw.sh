h=$1
req=$(printf 'GET / HTTP/1.1\r\nHost: %s\r\nUser-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36\r\nAccept: */*\r\nConnection: close\r\n\r\n' "$h")
printf '%s' "$req" | timeout 25 openssl s_client -connect 203.175.8.18:443 -servername tutorialinjectid.my.id -quiet -ign_eof 2>/dev/null | head -c 1200
