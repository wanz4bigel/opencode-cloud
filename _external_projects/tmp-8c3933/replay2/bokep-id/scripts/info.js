// Lihat metadata yang akan diambil dari sebuah URL, tanpa menyimpan apa pun.
//   npm run info -- https://www.youtube.com/watch?v=dQw4w9WgXcQ
import { fetchInfo } from "../src/info.js";
import { resolve } from "../src/hosts.js";
import { labelOf } from "../src/hosts.js";

const url = process.argv[2];
if (!url) {
  console.error("Pakai: node scripts/info.js <url-video>");
  process.exit(1);
}

const target = resolve(url);
if (!target) {
  console.error("URL tidak dikenali sebagai video.");
  process.exit(1);
}
console.log(`host     : ${labelOf(target.provider)}`);
console.log(`embed    : ${target.embed}`);
console.log(`diputar  : ${target.kind === "video" ? "pemutar browser" : "iframe"}`);

const info = await fetchInfo(url);
console.log(`metadata : ${info.dipakai ? "dikasih host (" + info.via + ")" : "tidak diberikan — " + (info.pesan || info.via)}`);
if (info.judul) console.log(`judul    : ${info.judul}`);
if (info.detik) console.log(`durasi   : ${Math.round(info.detik)} detik`);
if (info.gambar) console.log(`gambar   : ${info.gambar}`);
