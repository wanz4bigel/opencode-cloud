// Ambil metadata (judul, durasi, gambar) dari host asli dan simpan ke database,
// supaya judul kartu tidak lagibohong terhadap isi videonya.
//
//   node scripts/asli.js            semua video yang bisa dijiteng
//   node scripts/asli.js --contoh   hanya video bawaan/contoh
//   node scripts/asli.js --batas 20
import { applyHostInfo, listFetchable } from "../src/db.js";
import { fetchInfo } from "../src/info.js";

const arg = (nama, cadangan) => {
  const i = process.argv.indexOf(`--${nama}`);
  return i >= 0 && process.argv[i + 1] ? Number(process.argv[i + 1]) : cadangan;
};
const hanyaContoh = process.argv.includes("--contoh");
const batas = arg("batas", 500);

const kandidat = listFetchable({ hanyaContoh, batas });
console.log(`Ngecek ${kandidat.length} video${hanyaContoh ? " (khusus contoh)" : ""}...\n`);

let diubah = 0;
let bergambar = 0;
const dilewati = [];
for (const video of kandidat) {
  const info = await fetchInfo(video.url);
  if (!info.dipakai) {
    dilewati.push(`${video.title.slice(0, 30)} — ${info.pesan || info.via}`);
    continue;
  }
  const ok = applyHostInfo(video.id, { title: info.judul, duration: info.detik, poster: info.gambar });
  if (!ok) continue;
  diubah += 1;
  if (info.gambar) bergambar += 1;
  console.log(`✓ ${video.title.slice(0, 32).padEnd(33)} → ${String(info.judul).slice(0, 52)}${info.detik ? ` (${Math.round(info.detik)}s)` : ""}${info.gambar ? " +img" : ""}`);
}

console.log(`\n${diubah} judul disamakan dengan aslinya (${bergambar} pakai gambar asli), ${dilewati.length} host tidak kasih metadata.`);
if (dilewati.length) console.log("Contoh yang dilewati:\n  " + dilewati.slice(0, 4).join("\n  "));
