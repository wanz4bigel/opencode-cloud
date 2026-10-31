import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync("/tmp/dood-durasi.json", "utf8"));
const KATEGORI = [
  ["colmek-hijab", /jilbab|hijab|kerudung|ukhti|mukenah/],
  ["colmek-amoy", /amoy|chindo|cindo|chinese|china|cina/],
  ["colmek-toge", /toge|tobrut|montok|gembrot|chubby|gemuk|bbw|gemoy/],
  ["colmek-toket", /toket|tetek|susu|payudara|big.?tits|big.?boob|pentil/],
  ["colmek-janda", /janda|tante|bunda|mama|mom|milf|\bibu\b|mertua/],
  ["colmek-mahasiswi", /mahasiswi|kuliah|kampus|skripsi/],
  ["colmek-abg", /abg|remaja|teen|tocil|muda|18 ?yo|18 tahun/],
  ["colmek-mandi", /mandi|shower|basah|toilet|wc/],
  ["colmek-dildo", /dildo|vibrator|bantal|guling|botol|timun|terong|colok|stik/],
  ["colmek-live", /live|webcam|vcs|streaming|host|ome/],
  ["colmek-viral", /viral|tiktok|terbaru|update|baru/],
  ["colmek-kamera-hp", /./]
];

const hasil = {};
for (const [slug] of KATEGORI) hasil[slug] = [];

const dipakai = new Set();
for (const v of data) {
  if (!v.detik || v.detik < 60) continue;
  const judul = String(v.title).toLowerCase();
  for (const [slug, pola] of KATEGORI) {
    if (!pola.test(judul)) continue;
    hasil[slug].push({
      id: v.code,
      title: v.title,
      url: `https://jwplyr.com/e/${v.code}`,
      detik: Math.round(v.detik),
      tag: "colmek,indonesia",
      poster: v.poster,
      rasio: 0,
      views: 0,
      added: ""
    });
    dipakai.add(v.code);
    break;
  }
}

const jumlah = Object.values(hasil).reduce((a, x) => a + x.length, 0);
const isi = {
  dibuat: new Date().toISOString(),
  sumber: "jwplyr",
  catatan: "Panen dari channel Telegram publik t.me/s/dooodlive; diputar dari player jwplyr.com. Durasi dibaca dari file aslinya.",
  hasil
};
writeFileSync("/home/runner/bokep-id/data/katalog-dood.json", JSON.stringify(isi, null, 2));

for (const [slug] of KATEGORI) {
  console.log(slug.padEnd(20), String(hasil[slug].length).padStart(3), hasil[slug].slice(0, 1).map((v) => `${Math.round(v.detik / 60)}m ${v.title.slice(0, 35)}`).join(""));
}
console.log(`\ntotal: ${jumlah} video · dibuang (<60 dtk): ${data.filter((v) => !v.detik || v.detik < 60).length}`);
