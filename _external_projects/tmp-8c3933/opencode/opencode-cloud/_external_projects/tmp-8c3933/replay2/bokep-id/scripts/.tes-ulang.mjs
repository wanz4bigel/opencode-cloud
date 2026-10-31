// Panggil fetchInfo berkali-kali dalam satu proses: apakah panggilan pertama
// selalu gagal? (Dugaan: DNS/nama host pertama lambat, bukan host menolak.)
import { fetchInfo } from "../src/info.js";

const u = "https://www.youtube.com/watch?v=9bZkp7q19f0";
for (let i = 1; i <= 4; i += 1) {
  const t0 = Date.now();
  const r = await fetchInfo(u);
  console.log(`#${i} ${String(Date.now() - t0).padStart(5)}ms ${r.dipakai ? "PAKE" : "skip"} via=${r.via} | ${String(r.judul || "-").slice(0, 40)}`);
}
