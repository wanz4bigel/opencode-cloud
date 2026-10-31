# BokepKita

Situs koleksi video colmek Indonesia. **Tidak ada upload video sama sekali** — yang
disimpan di server cuma tautan, dan videonya diputar dari host aslinya. Jadi tidak ada
server video, tidak ada transcoding, tidak ada tagihan storage.

## Kenapa tanpa upload

| Upload video | Embed (sistem di sini) |
| --- | --- |
| Butuh disk besar + bandes mahal | Nyaris nol bandwidth buat video |
| Harus transcode per resolusi | Resolusi ikut host aslinya |
| 1 video = 1 pekerjaan | 1 video = tempel 1 URL |
| Risiko video di-takedown, hosting kena masalah | Host yang kena, katalog tetap hidup |

## Menjalankan

Butuh Node.js 22.5 atau lebih baru (pakai modul SQLite bawaan Node, jadi tidak ada
`npm install` yang perlu dijalankan).

```bash
node server.js            # http://localhost:3000
PORT=4173 node server.js  # ganti port kalau 3000 kepakai app lain
ADMIN_TOKEN=rahasia node server.js              # ganti kata kunci panel
PUBLIC_URL=https://bokepkita.example node server.js  # buat RSS/sitemap/OG
```

Database SQLite dibuat otomatis di `data/bokep-kita.db`. Kalau masih kosong, ia diisi
18 kategori + 57 video contoh.

```bash
npm run reset   # kosongkan lalu isi ulang contoh (tambahan manual ikut terhapus)
npm run dev     # node --watch
npm run probe   # cek semua URL katalog masih menjawab atau tidak
npm run smoke   # cek semua rute + jaminan isi (butuh server yang sedang jalan)
npm run asli    # samakan judul/durasi/gambar dengan video aslinya
npm run info -- <url>   # intip metadata yang bakal diambil dari sebuah URL
```

## Katalog contoh vs video sungguhan

Katalog bawaan itu **contoh**: judulnya ditulis untuk menguji tampilan & SEO,
videonya file uji publik (Big Buck Bunny, Sintel, video musik) yang dijamin bisa
diputar. Makanya judul dan isinya beda — itu memang disengaja, dan situs bilang
jujur soal itu:

- kartu contoh dikasih badge **Contoh**,
- beranda menampilkan baris penjelasan selama masih ada video contoh,
- halaman nonton video contoh menulis hal yang sama.

Cara menggantinya:

1. **Tempel URL asli** di `/admin` — centang *Ambil judul, durasi, dan gambar dari
   host otomatis* dan BokepKita pakai judul asli video (YouTube/Vimeo/archive.org/
   Dailymotion).
2. **`npm run asli`** untuk menimpa judul video-video lama dengan judul aslinya dari
   host. `-- --contoh` cuma video contoh, `-- --batas 20` membatasi jumlah.

Setelah tidak ada video contoh tersisa, badge dan baris penjelasan hilang sendiri.

## Menambah video (panel kelola)

Buka `/admin`, kata kunci bawaan `gus`.

- **Tambah satu video** — isi URL; judul boleh dikosongkan kalau host mau kasih.
- **Tempel banyak sekaligus** — satu baris per video: `judul | url`, atau URL saja.
- **Samakan judul dengan aslinya** — satu tombol, atau dari terminal.
- **Hapus** — yang hilang cuma tautannya, file di host tetap utuh.

Daftar host yang dikenal otomatis ada di halaman **`/host`**: 26 sumber — Bitchute,
XHamster, XNXX, XVideos, Pornhub, Eporner, YouPorn, SpankBang, Beeg, TXXX/Tnaflix,
JavHD, MissAV, AnyBunny, Dailymotion, Vimeo, YouTube, Internet Archive, Ok.ru, VK,
Facebook/Reels, StreamTape, UpCloud, Mixdrop, Dood, Filemoon, SBStream/HD-1, plus
file `.mp4`/`.webm`/`.m3u8` langsung (diputar pakai pemutar bawaan browser). Host di
luar daftar tetap bisa ditempel — ia masuk sebagai **Eksternal** dan dicoba lewat iframe.

```bash
curl -s "http://localhost:3000/admin" -X POST \
  -d "token=gus" -d "judul=Colmek Janda Dapur" -d "ambil=1" \
  --data-urlencode "url=https://www.bitchute.com/video/abc123/"
```

## Cara kerja

```
server.js          HTTP murni, pencocokan rute, gerbang 18+, RSS & sitemap
src/db.js          skema SQLite (videos + categories), seed, kueri daftar/cari/terkait
src/hosts.js       peta host: URL -> alamat embed + provider, dan data halaman /host
src/info.js        ambil judul/durasi/gambar dari host (oEmbed, og:title) — perantara
                   biar judul tidak bohong
src/poster.js      thumbnail SVG digambar dari slug, dua varian (polos & berjudul)
src/views.js       semua HTML sisi server
src/admin.js       panel kelola: tempel URL, impor massal, hapus
scripts/probe.js   uji hidup semua URL katalog
scripts/smoke.js   uji semua rute + jaminan isi, pakai slug dari database
scripts/asli.js    timpa judul dengan judul asli dari host
scripts/info.js    intip metadata satu URL
public/            style.css, app.js, favicon.svg
```

Yang **tidak** ada: form upload, folder unduhan, ffmpeg, dependensi npm, build step.

## Catatan hukum & teknis

- Situs ini cuma menempel. Video dan hak siarnya milik host masing-masing.
- Thumbnail daftar selalu digambar sendiri dari slug (`src/poster.js`, enam palet ×
  lima susunan bentuk yang dipilih hash FNV). Tidak ada satu request pun ke host yang
  membocorkan penonton. `/t/<slug>.svg` varian polos untuk daftar, `/p/<slug>.svg`
  varian berjudul untuk `og:image`. Kalau host memberi gambar asli, gambar itu
  dipakai sebagai `poster` pemutar & `og:image`, bukan sebagai gambar kartu.
- Kalau thumbnail gagal dimuat (proxy ketat, atau cache 404 dari versi lama),
  `public/app.js` mencoba varian berjudul, lalu meninggalkan warna dasar kartu —
  tidak pernah kotak hitam kosong. Cache thumbnail sengaja cuma 1 jam.
- Beberapa host (StreamTape, UpCloud, Mixdrop, Dood, Filemoon, SBStream, VK) sering
  menolak di-iframe. Halaman nonton otomatis memunculkan tombol **Buka di host asli**.
- **Judul vs isi video.** Jangan harapkan metadata dari XHamster/XNXX/Pornhub:
  server mereka umumnya di belakang Cloudflare dan menolak permintaan dari server kita.
  Untuk host semacam itu judul ditulis tangan — jadi tempel judul yang benar.
- "Kok videonya rusak?" hampir selalu berarti URL host-nya mati, bukan situs ini.
  Jalankan `npm run probe`; dia juga mengecek ulang Vimeo & archive.org, yang doyan
  membalas HTTP 200 untuk video yang sudah dihapus.
- Gerbang 18+ disimpan sebagai cookie setahun (`usia=1`), dipasang di server, bukan
  modal JavaScript.
- Panel kelola cuma dilindungi satu kata kunci + cookie. Taruh di belakang HTTPS
  (nginx/Caddy) sebelum dibuka untuk publik, dan ganti `ADMIN_TOKEN`.
- Penonton dihitung per IP per video, dibatasi 30 menit, di memori. Pindah ke tabel
  kalau butuh statistik jangka panjang.
