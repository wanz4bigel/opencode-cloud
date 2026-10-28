set -uo pipefail
cd /home/runner/v2ray-vmess-action || exit 1
export CONF_DIR=/tmp/opencode/full CORE=xray LIFETIME_MINUTES=30 CHECK_INTERVAL=5
source skills 2>/dev/null || true
bash scripts/run-server.sh >/tmp/opencode/full/server2.log 2>&1 &
SRV=$!
sleep 7
source /tmp/opencode/full/vmess.env
X=/tmp/opencode/full/bin/xray
CA="$(cat /tmp/opencode/full/cert/fullchain.crt | python3 -c 'import sys,json;print(json.dumps(sys.stdin.read()))')"
mk() { # port net path svc proxy pp
  cat > /tmp/opencode/cc.json <<EOF
{ "log":{"loglevel":"warning"},
  "inbounds":[{"listen":"127.0.0.1","port":$6,"protocol":"http"}],
  "outbounds":[{"protocol":"vmess","settings":{"vnext":[{"address":"127.0.0.1","port":$1,
    "users":[{"id":"$VMESS_UUID","alterId":0,"security":"auto"}]}]},
    "streamSettings":{"network":"$2","security":"tls",
      "tlsSettings":{"serverName":"v2ray.local","certificates":[{"usage":"verify","certificate":[$CA]}]},
      $3}}]}
EOF
}
mk 19443 ws '"wsSettings":{"path":"/vmess","headers":{"Host":"v2ray.local"}}' "" 19201
$X run -c /tmp/opencode/cc.json >/tmp/opencode/cc.log 2>&1 &
C=$!; sleep 4
echo -n "ws+tls(CA verify) -> "; curl -sS -o /dev/null -w '%{http_code}\n' --max-time 15 -x http://127.0.0.1:19201 https://www.google.com/generate_204 2>/dev/null || echo fail
kill $C 2>/dev/null; sleep 1
mk 19052 httpupgrade '"httpupgradeSettings":{"path":"/upvmess","host":"v2ray.local"}' "" 19202
$X run -c /tmp/opencode/cc.json >/tmp/opencode/cc2.log 2>&1 &
C=$!; sleep 4
echo -n "httpupgrade+tls -> "; curl -sS -o /dev/null -w '%{http_code}\n' --max-time 15 -x http://127.0.0.1:19202 https://www.google.com/generate_204 2>/dev/null || echo fail
kill $C 2>/dev/null; sleep 1
mk 19053 grpc '"grpcSettings":{"serviceName":"vmess"}' "" 19203
$X run -c /tmp/opencode/cc.json >/tmp/opencode/cc3.log 2>&1 &
C=$!; sleep 4
echo -n "grpc+tls -> "; curl -sS -o /dev/null -w '%{http_code}\n' --max-time 15 -x http://127.0.0.1:19203 https://www.google.com/generate_204 2>/dev/null || echo fail
kill $C $SRV 2>/dev/null
sleep 2
pkill -9 -f '/tmp/opencode/full/config.json' 2>/dev/null
