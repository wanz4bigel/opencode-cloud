// Uji cepat semua rute: `npm run smoke` (butuh server yang sedang jalan).
// Slug, kategori, dan tag diambil dari database, jadi daftar rute tidak basi
// waktu seed berubah.
import { categoriesWithCounts, listVideos } from "../src/db.js";

const BASE = process.env.BASE || "http://localhost:3000";
const KUKI = "usia=1; admin=gus";

const { rows } = listVideos({ per: 500 });
if (!rows.length) {
  console.error("Database kosong — jalankan `npm run reset` dulu.");
  process.exit(1);
}
const iframe = rows.find((v) => v.kind === "iframe");
const video = rows.find((v) => v.kind === "video");
const cat = categoriesWithCounts().find((c) => c.total) || categoriesWithCounts()[0];
const tag = (rows[0].tags || "colmek").split(",")[0];

const rute = [
  "/",
  "/?urutan=populer",
  "/?halaman=2",
  "/katalog",
  "/host",
  "/cari?q=janda",
  "/cari",
  `/k/${cat.slug}`,
  `/k/${cat.slug}?urutan=populer`,
  "/k/tidak-ada",
  `/tag/${tag}`,
  `/v/${(video || rows[0]).slug}`,
  `/v/${(iframe || rows[0]).slug}`,
  `/v/${rows[0].slug}?halaman=2`,
  "/v/slug-tidak-ada",
  `/t/${rows[0].slug}.svg`,
  `/p/${rows[0].slug}.svg`,
  "/t/bukan-slug.svg",
  "/static/style.css",
  "/static/app.js",
  "/static/favicon.svg",
  "/rss.xml",
  "/sitemap.xml",
  "/robots.txt",
  "/admin",
  "/admin?token=gus",
  "/admin?token=salah",
  "/entah-apa-ini"
];

let rusak = 0;
for (const jalan of rute) {
  const res = await fetch(`${BASE}${jalan}`, { headers: { cookie: KUKI } });
  const isi = await res.text();
  const mau404 = jalan.includes("tidak-ada") || jalan.includes("bukan-slug") || jalan === "/entah-apa-ini";
  const error = /Situs sedang bermasalah|Cannot read|is not a function|is not defined/.test(isi);
  const statusSalah = mau404 ? res.status !== 404 : res.status >= 500 || (res.status === 404 && !mau404);
  if (error || statusSalah) {
    rusak += 1;
    console.log(`× ${jalan} → ${res.status}${error ? " + teks error" : ""}`);
    continue;
  }
  console.log(`✓ ${jalan} → ${res.status} (${isi.length} byte)`);
}

// Beberapa jaminan isi: halamannya hidup bukan cuma statusnya.
const cek = [];
const beranda = await (await fetch(`${BASE}/`, { headers: { cookie: KUKI } })).text();
cek.push([beranda.includes('class="card"'), "beranda menampilkan kartu video"]);
cek.push([/\/t\/[\w-]+\.svg/.test(beranda), "beranda memanggil thumbnail /t/"]);
cek.push([/class="notice"|Katalog masih kosong/.test(beranda), "beranda punya catatan contoh/kosong yang jujur"]);

const nonton = await (await fetch(`${BASE}/v/${rows[0].slug}`, { headers: { cookie: KUKI } })).text();
cek.push([/class="player"/.test(nonton), "halaman nonton memuat pemutar"]);
cek.push([/Lanjut ke berikutnya/.test(nonton), "halaman nonton punya antrean lanjutan"]);

const gerbang = await (await fetch(`${BASE}/`)).text();
cek.push([gerbang.includes('class="gate"'), "gerbang 18+ tampil tanpa kuki"]);
cek.push([!gerbang.includes('class="card"') || gerbang.includes("gate__box"), "gerbang menutupi konten buat pengunjung baru"]);

const panel = await (await fetch(`${BASE}/admin?token=gus`, { headers: { cookie: KUKI } })).text();
cek.push([/Ambil judul/.test(panel), "panel bisa ambil metadata host otomatis"]);

const sumber = await (await fetch(`${BASE}/host`, { headers: { cookie: KUKI } })).text();
const jumlahSumber = (sumber.match(/class="hostlist__item"/g) || []).length;
cek.push([jumlahSumber >= 20, `halaman /host daftar ${jumlahSumber} sumber`]);

for (const [ok, pesan] of cek) {
  if (!ok) rusak += 1;
  console.log(`${ok ? "✓" : "×"} ${pesan}`);
}

console.log(rusak ? `\n${rusak} hal perlu dibereskan.` : "\nSemua rute & isi sehat.");
process.exit(rusak ? 1 : 0);
