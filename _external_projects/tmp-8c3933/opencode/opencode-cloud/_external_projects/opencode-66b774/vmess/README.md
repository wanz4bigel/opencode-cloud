# VMess di GitHub Actions — v2ray / xray, WebSocket + TLS

Menjalankan server **VMess** langsung di runner GitHub Actions, lalu mencetak link
`vmess://` + **kartu akun** (format seperti layanan VPN komersial) di ringkasan run.

Dua mode:

| Mode | Isi | Cocok untuk |
|---|---|---|
| `simple` (default) | 1 port, `ws` + TLS, 1 link | cepat, aman, paling kompatibel |
| `full` | multi-port: TLS `443,8443`, non-TLS `80,8080`, plus `grpc` + `upgrade` (httpupgrade) | mirip kartu akun premium |

Contoh kartu yang dihasilkan (mode `full`, core `xray`):

```
————————————————————————————————————
               VMESS
————————————————————————————————————
Remarks        : gh-actions-223165
CITY           : San Jose
ISP            : AS8075 Microsoft Corporation
Domain         : 20.57.223.165
Port TLS       : 19443,19444
Port none TLS  : 19080,19081
Port any       : 19052,19053
id             : 7029cffc-d36b-4a11-a354-ae95c3d58111
alterId        : 0
Security       : auto
network        : ws,grpc,upgrade
path ws        : /vmess
serviceName    : vmess
path upgrade   : /upvmess
Cert SHA256    : 6f1c… (untuk pinning di klien Xray baru)
Limit IP       : -
Expired On     : 2026-10-28 19:19:22 WIB
————————————————————————————————————
```

Server menjaga dirinya sendiri: **watchdog** (restart kalau mati), **healthcheck**
(semua port dicek tiap 20 detik), **handoff** (trigger run baru sebelum limit 6 jam,
parameter disalin), **keep alive** (cron tiap 15 menit).

## Struktur

```
.
├─ action.yml                            # composite action (bisa dipakai repo lain)
├─ .github/workflows/
│  ├─ vmess-server.yml                   # workflow utama
│  ├─ keepalive.yml                      # cron: nyalakan ulang kalau mati
│  └─ test.yml                           # CI: self-test ws + semua transport
└─ scripts/
   ├─ lib.sh                             # default, helper, handoff, notifikasi
   ├─ install-v2ray.sh                   # install v2ray ATAU xray (auto arsip per-arch)
   ├─ gen-cert.sh                        # TLS: self-signed / custom / off
   ├─ gen-config.sh                      # config multi-inbound (ws/grpc/httpupgrade)
   ├─ gen-link.sh                        # kartu akun + link per transport + QR
   ├─ dns-cloudflare.sh                  # auto-update A record ke IP runner
   ├─ run-server.sh                      # jalankan + watchdog + handoff
   ├─ healthcheck.sh                     # cek semua port + handshake WS
   ├─ get-ip.sh
   ├─ test-local.sh                      # self-test ws+tls (14 assertion)
   ├─ test-transports.sh                 # self-test semua transport
   ├─ test-edge.sh                       # self-test mode CDN (origin plain, link 443)
   ├─ test-dns.sh                        # self-test auto-DNS (pakai mock)
   └─ mock-cloudflare.py                 # API Cloudflare tiruan untuk test-dns
```

## Pakai cepat

1. Push folder ini ke repo GitHub (branch `main`).
2. **Actions → VMess V2Ray Server → Run workflow**
   - `mode: simple` → 1 endpoint, atau
   - `mode: full`, `core: xray` → kartu akun lengkap (ws/grpc/upgrade).
3. Buka run → **Summary** → kartu + link `vmess://` per transport (+ QR).
   Artifact `vmess-info-*` menyimpan `akun.txt`, `links.txt`, `config.json`, log.
4. Import ke klien (v2rayNG / NekoBox / v2rayN / Streisand) sesuai transport.
5. Biarkan jalan; handoff + keepalive mengurus regenerasi.

## Pemetaan kartu → config

| Baris kartu | Sumber di script |
|---|---|
| `Remarks` | `RUNNER_TAG` (default nama image runner) |
| `CITY` / `ISP` | lookup `ipinfo.io` dari public IP runner (kosong → "GitHub") |
| `Domain` | `DOMAIN` kalau diisi, kalau tidak public IP runner |
| `Port TLS` | `PORTS_TLS` (mode full: `443,8443`) |
| `Port none TLS` | `PORTS_PLAIN` (`80,8080`) |
| `Port any` | `PORT_UPGRADE`,`PORT_GRPC` (`2052`,`2053`) |
| `id` / `alterId` | `VMESS_UUID` / `VMESS_ALTID` |
| `Security` | `auto` |
| `network` | `ws` + `grpc`/`upgrade` kalau port-nya aktif |
| `path ws` | `WS_PATH` |
| `serviceName` | `GRPC_SERVICE` (`vmess`) |
| `path upgrade` | `UPGRADE_PATH` (`/up…`) |
| `Limit IP` | hanya info (`LIMIT_IP`) — core tidak menegakkan limit |
| `Expired On` | hanya info: waktu handoff berikutnya (WIB), bisa di-set `EXPIRED_ON` |

`Port any` di kartu komersial biasanya port CDN (2052/2053/8880). Di sini yang
ditampilkan hanya port yang **benar-benar listen**.

## Format link `vmess://`

Default `LINK_STYLE=minimal` — sama seperti yang dipakai v2rayN/v2rayNG:

```json
{"v":"2","ps":"coolmaxx","add":"bansos.sunekvpn.cc.cd","port":443,"id":"0d0f…c9bb","net":"ws","host":"bansos.sunekvpn.cc.cd","path":"/vmess","tls":"tls"}
```

Karakteristik: `v` string, `port` angka, `tls` hanya kalau pakai TLS, tanpa
`aid/sc/type/alpn/email`. Untuk ws tanpa TLS, field `tls` dihilangkan.
grpc → `net:"grpc"` + `path` berisi serviceName. upgrade → `net:"httpupgrade"`.

Kalau butuh field lengkap (`aid`, `sni`, `alpn`, `email`) — misalnya untuk klien
yang rewel soal SNI — set `LINK_STYLE=full` (Variable repo atau input action).

## v2ray vs xray

| | `v2ray` (v2fly v5) | `xray` |
|---|---|---|
| ws / grpc | ✅ | ✅ |
| `upgrade` / httpupgrade | ❌ (tidak ada transport) | ✅ |
| Klien lama + sertifikat self-signed | ✅ `allowInsecure` masih ada | ⚠️ Xray ≥ 26 menghapus `allowInsecure` → harus pinning cert / cert valid |

Kalau butuh baris `network : ws,grpc,upgrade` persis seperti kartu komersial,
pakai `core: xray`. Selain itu `v2ray` lebih aman untuk pemula.

## Input `workflow_dispatch`

| Input | Default | Keterangan |
|---|---|---|
| `mode` | `simple` | `simple` \| `full` |
| `core` | `v2ray` | `v2ray` \| `xray` |
| `port` | `443` | port TLS utama (mode simple) |
| `ws_path` | acak | path WebSocket |
| `uuid` | acak | UUID VMess |
| `domain` | kosong | Host header / domain |
| `sni` | = domain | TLS serverName |
| `tls_mode` | `selfsigned` | `selfsigned` \| `custom` \| `off` |
| `lifetime_minutes` | `330` | umur per run (limit job 360) |
| `runner_images` | `["ubuntu-latest"]` | 1 image = 1 endpoint/IP |

## Variables / Secrets repo

| Nama | Jenis | Fungsi |
|---|---|---|
| `CORE`, `MODE` | Variable | default core & mode |
| `PORT`, `WS_PATH`, `VMESS_UUID`, `DOMAIN`, `SNI`, `TLS_MODE`, `LIFETIME_MINUTES` | Variable | parameter tetap antar restart |
| `PORTS_TLS`, `PORTS_PLAIN`, `PORT_GRPC`, `PORT_UPGRADE`, `GRPC_SERVICE`, `UPGRADE_PATH` | Variable | override port/transport mode full |
| `LIMIT_IP` | Variable | tulisan di kartu saja |
| `REMARKS` | Variable | nama di link (`ps`) & baris `Remarks` kartu |
| `LINK_STYLE` | Variable | `minimal` (default, format v2rayN) \| `full` |
| `V2RAY_VERSION` | Variable | pin versi core (mis. `v5.53.0` / `v26.10.21`) |
| `TLS_CRT`, `TLS_KEY` | Secret | cert + key PEM asli (Let's Encrypt / Cloudflare) |
| `TG_TOKEN`, `TG_CHAT_ID` | Secret | notifikasi Telegram |
| `REPO_TOKEN` | Secret | PAT `actions:write` kalau `GITHUB_TOKEN` ditolak saat handoff |
| `CF_API_TOKEN` | Secret | API token Cloudflare (`Zone.DNS:Edit` + `Zone:Read`) untuk auto-update DNS |
| `CF_ZONE_ID` | Variable | opsional; kosong = dicari otomatis dari `DOMAIN` |
| `CF_RECORD_NAME` | Variable | opsional; nama record (default = `DOMAIN`) |
| `CF_PROXIED` | Variable | `true` = orange cloud, `false`/kosong = DNS only |
| `CF_DNS_WAIT` | Variable | detik menunggu propagasi saat verifikasi (default 20) |
| `CF_TTL` | Variable | TTL A record (default `1` = auto/300 s; pakai `60` untuk origin CloudFront) |
| `EDGE_PORT` | Variable | port publik di link kalau di belakang CDN (mis. `443`); kosong = port origin |
| `EDGE_TLS` | Variable | `tls` \| `none` yang dilihat klien; kosong = ikut cert origin |

`GITHUB_TOKEN` sebenarnya cukup: `workflow_dispatch` & `repository_dispatch`
**selalu** membuat run baru walau dipicu `GITHUB_TOKEN` (pengecualian aturan anti-rekursi).

## Pakai domain sendiri (Cloudflare)

Kalau `DOMAIN` diisi, link memakai domain. Karena IP runner berubah tiap run,
A record harus ikut berubah — script `dns-cloudflare.sh` melakukannya otomatis
sebelum server dijalankan.

### 1. Siapkan Cloudflare

1. Domain harus memakai **nameserver Cloudflare** (Add site → ganti NS di registrar).
2. Buat **API Token**: *My Profile → API Tokens → Create Token*
   - template **Edit zone DNS** (`Zone.DNS:Edit`), zone = domainmu; atau
   - custom: `Zone.DNS:Edit` + `Zone:Read` (Zone:Read hanya perlu kalau
     `CF_ZONE_ID` tidak di-set, karena script harus mencari zone dulu).
3. Salin token sekali saja (tidak bisa dilihat lagi).

### 2. Isi repo

| Nama | Jenis | Nilai |
|---|---|---|
| `DOMAIN` | Variable | `v2.domainmu.com` |
| `CF_API_TOKEN` | **Secret** | token dari langkah 1 |
| `CF_PROXIED` | Variable | `false` (DNS only) atau `true` (orange cloud) |
| `CF_ZONE_ID` | Variable | opsional — isi kalau token tidak punya `Zone:Read` |
| `CF_RECORD_NAME` | Variable | opsional, mis. `vm.domainmu.com` kalau beda dari `DOMAIN` |

Lalu jalankan workflow seperti biasa. Di log akan muncul:

```
[vmess] Zone: domainmu.com | record: v2.domainmu.com -> 203.0.113.10 (proxied=false)
[vmess] A record diupdate: 198.51.100.7 -> 203.0.113.10
[vmess] DNS propagasi OK: v2.domainmu.com -> 203.0.113.10
```

Kalau `CF_API_TOKEN` kosong atau `DOMAIN` kosong, step ini **hanya skip**
(exit 0) — workflow tetap jalan memakai IP.

### 3. Pilih: DNS only vs proxied

| | **DNS only** (`CF_PROXIED=false`) | **Proxied** (`CF_PROXIED=true`) |
|---|---|---|
| Port yang bisa dipakai | bebas (443, 8443, 2053, …) | hanya port Cloudflare: **443, 2053, 2083, 2087, 2096, 8443** |
| Sertifikat | cert origin (self-signed / `TLS_MODE=custom`) | cert Cloudflare → **valid**, klien tidak perlu allow-insecure |
| IP runner | terlihat di DNS publik | tersembunyi di balik IP Cloudflare |
| `ws` / `wss` | langsung ke runner | didukung Cloudflare |
| `grpc` / `upgrade` | langsung ke runner | tidak dijamin — pakai `ws` |
| Cocok untuk | semua mode, semua transport | mode `simple` (ws+tls), port 443/8443 |

Catatan proxied:

1. **Port di link harus port yang didukung Cloudflare**, dan origin juga harus
   listen di port itu (`PORT`/`PORTS_TLS`) — Cloudflare meneruskan ke origin
   dengan nomor port yang sama.
2. Set **SSL/TLS → Overview → Full** (bukan *Full (strict)*) kalau origin masih
   self-signed. Kalau `TLS_MODE=custom` dengan cert valid, boleh *Full (strict)*.
3. WebSocket otomatis aktif, tidak ada setting tambahan.
4. Jangan pakai **Global API Key**; pakai API Token (bisa dibatasi per zone).

Contoh setup proxied yang rapi:

```
PORT          = 8443          # atau 443
TLS_MODE      = selfsigned
DOMAIN        = v2.domainmu.com
CF_PROXIED    = true
CF_RECORD_NAME= v2.domainmu.com
```

Link keluar: `add: v2.domainmu.com`, `port: 8443`, `tls: "tls"` → klien
tersambung ke Cloudflare, bukan langsung ke runner.

### 4. Verifikasi manual

```bash
dig +short A v2.domainmu.com          # harus IP runner saat ini
curl -sI https://v2.domainmu.com      # 400/426 dari v2ray = server hidup
```

Kalau A record benar tapi klien timeout, masalahnya bukan DNS — lihat
[Yang perlu kamu tahu](#yang-perlu-kamu-tahu) poin 1.

## Mode edge / CDN (CloudFront, Cloudflare proxied)

Kalau server berada di belakang CDN, port yang dilihat klien **beda** dengan port
origin. Dua variable ini yang menjembatani:

```
EDGE_PORT = 443       # port di link (viewer)
EDGE_TLS  = tls       # paksa link pakai TLS walau origin plain
```

Contoh: origin ws biasa di `8080` (TLS dimatikan), klien tetap dapat link
`port: 443, tls: "tls"`:

```json
{"v":"2","ps":"coolmaxx","add":"d37bawnvqx75hf.cloudfront.net","port":443,
 "id":"…","net":"ws","host":"d37bawnvqx75hf.cloudfront.net","path":"/vmess","tls":"tls"}
```

Kartu ikut menyesuaikan: `Port TLS : 443`, `Port none TLS : -`, `network : ws`.
`server-info.json` menambah blok `edge: {port, tls}`.

### CloudFront

Batasan CloudFront yang harus diakui dulu:

| Hal | Nilai |
|---|---|
| Port viewer | **80/443 saja** |
| Origin | wajib **nama domain** (tidak boleh IP) |
| Cert origin | **tidak boleh self-signed** (502) |
| WebSocket | HTTP/1.1, idle ±10 menit |
| Kuota | 1 TB + 10 jt request/bulan, lalu bayar |

Karena itu paling gampang: **TLS berhenti di CloudFront, origin pakai HTTP**.

1. **Origin DDNS** — A record ke IP runner, update otomatis:
   ```
   CF_RECORD_NAME = origin.domainmu.com
   CF_TTL         = 60
   ```
2. **Runner** (Variables):
   ```
   MODE       = simple
   TLS_MODE   = off
   PORT       = 8080
   PORTS_PLAIN= 8080
   DOMAIN     = d37bawnvqx75hf.cloudfront.net   # host yang dilihat klien
   EDGE_PORT  = 443
   EDGE_TLS   = tls
   ```
3. **CloudFront distribution**:
   - Origin domain: `origin.domainmu.com`
   - Origin protocol: **HTTP only**, HTTP port `8080`
   - Viewer protocol: **Redirect HTTP to HTTPS**
   - Allowed methods: `GET, HEAD, OPTIONS`
   - Cache policy: **CachingDisabled**
   - Origin request policy: **AllViewer** (wajib, agar header `Sec-WebSocket-*` diteruskan)
4. **Domain sendiri (opsional)**: ACM cert di **us-east-1**, alternate domain
   `v2.domainmu.com`, lalu CNAME `v2` → `dxxxx.cloudfront.net`. Kalau tidak,
   pakai domain `*.cloudfront.net` bawaan (cert-nya sudah valid).

Catatan:

- `grpc` / `upgrade` **tidak** diteruskan CloudFront — pakai `MODE=simple` (ws).
- Hanya satu port yang terekspos; `Port any` di kartu jadi `-`.
- Idle WebSocket ±10 menit; klien yang memakai mux/keepalive lebih aman.
- `EDGE_PORT`/`EDGE_TLS` juga berguna untuk Cloudflare proxied (origin 8443,
  edge 443).

## Pakai sebagai action di repo lain

```yaml
- id: vmess
  uses: <user>/v2ray-vmess-action@v1
  with:
    mode: full
    core: xray
    tls_mode: selfsigned
    lifetime_minutes: "330"
    domain: v2.domainmu.com
    cloudflare_token: ${{ secrets.CF_API_TOKEN }}
    cloudflare_proxied: "false"
    github_token: ${{ secrets.GITHUB_TOKEN }}
- run: echo "${{ steps.vmess.outputs.vmess_link }}"
```

## Uji lokal

```bash
sudo apt-get install -y jq openssl uuid-runtime qrencode

# 0) auto-DNS Cloudflare (pakai API tiruan, tanpa token asli) — 17 assertion
bash scripts/test-dns.sh

# 1) ws+tls dasar (14 assertion)
bash scripts/test-local.sh

# 2) semua transport dengan xray (ws+plain+grpc+httpupgrade)
CORE=xray bash scripts/test-transports.sh

# 3) core v2ray (httpupgrade otomatis dilewati)
CORE=v2ray bash scripts/test-transports.sh

# 4) mode CDN: origin plain ws, link tetap 443/tls
bash scripts/test-edge.sh
```

Jalan manual di mesin sendiri:

```bash
export PORT=8443 TLS_MODE=selfsigned
bash scripts/install-v2ray.sh && bash scripts/gen-cert.sh
bash scripts/gen-config.sh && bash scripts/gen-link.sh   # kartu + link
bash scripts/run-server.sh                               # foreground
```

## Yang perlu kamu tahu

1. **Inbound ke hosted runner tidak dijamin** (container Azure). Uji dari luar:
   `nc -vz <IP_RUNNER> 443`. Kalau ditolak → pakai **self-hosted runner**
   (`runs-on: self-hosted`, script sama), atau Cloudflare Tunnel.
2. **IP berubah tiap run**; link & kartu selalu dibuat ulang otomatis.
3. **Self-signed + Xray ≥ 26**: `allowInsecure` sudah dihapus. Pakai
   `TLS_MODE=custom` (cert valid), atau pin sidik jari cert dari baris
   `Cert SHA256` di kartu (`pinnedPeerCertSha256`). Klien lama (v2rayNG/NekoBox
   dengan core lama) masih bisa "allow insecure".
4. **Limit IP / Expired On** di kartu hanya informasi — core tidak menegakkan
   limit IP, dan "Expired" = jadwal handoff run.
5. **Repo publik**: log/artifact bisa dibaca siapa pun. Simpan UUID di Secrets
   kalau repo publik.
6. Patuhi ToS GitHub Actions dan hukum yang berlaku.

## Troubleshooting

| Gejala | Solusi |
|---|---|
| `Bind: permission denied` (port < 1024) | Script memasang `cap_net_bind_service`; kalau gagal, pakai port ≥ 1024 atau runner dengan sudo |
| `unknown transport protocol: httpupgrade` | Set `core: xray` (v2ray-core tidak punya transport ini) |
| `x509: certificate signed by unknown authority` | Cert self-signed: aktifkan allow-insecure / pin `Cert SHA256` / pakai cert valid |
| Link ada tapi klien timeout | Inbound runner diblokir — lihat poin 1 |
| Handoff HTTP 403 | Tambah secret `REPO_TOKEN` (PAT `actions:write`) |
| `Zone Cloudflare ... tidak ditemukan` | Token kurang `Zone:Read`, atau `DOMAIN` beda zone → set `CF_ZONE_ID` |
| `Cloudflare API menolak: Invalid request headers` | `CF_API_TOKEN` salah/kedaluwarsa (secret tidak bisa dibaca ulang — buat baru) |
| `DNS belum menunjuk ke ...` | Normal kalau TTL masih cache; cek `dig +short A`, tunggu ±1–5 menit |
| Proxied tapi klien timeout | Port tidak didukung Cloudflare (pakai 443/8443/2053/2083/2087/2096), atau SSL mode bukan *Full* |
| CloudFront 502 | Origin HTTPS pakai cert self-signed — ubah ke **HTTP only** atau pasang cert valid |
| CloudFront 400/426 di path WS | Origin request policy belum **AllViewer** (`Sec-WebSocket-*` tidak diteruskan) |
| Link menunjuk port 8080, klien gagal | `EDGE_PORT`/`EDGE_TLS` belum di-set (lihat *Mode edge / CDN*) |
| Domain jalan, IP langsung tidak | Wajar: runner hanya mengizinkan inbound lewat jalur yang diuji; lihat poin 1 |
| Semua port terbuka tapi tidak bisa browsing | Cek log `$RUNNER_TEMP/v2ray-vmess/logs/latest.log` (artifact) |

## Lisensi

MIT.
