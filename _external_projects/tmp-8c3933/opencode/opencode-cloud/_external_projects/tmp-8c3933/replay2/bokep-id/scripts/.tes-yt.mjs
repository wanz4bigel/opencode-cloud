import { fetchInfo } from "/home/runner/bokep-id/src/info.js";

const ids = ["9bZkp7q19f0", "dQw4w9WgXcQ", "kJQP7kiw5Fk", "jNQXAC9IVRw", "60ItHLz5WEA"];
for (let ronde = 1; ronde <= 2; ronde += 1) {
  for (const id of ids) {
    const r = await fetchInfo(`https://www.youtube.com/watch?v=${id}`);
    console.log(`ronde${ronde}`, id, String(r.via).padEnd(12), r.dipakai ? "PAKE" : "skip", "|", String(r.judul || "-").slice(0, 40), "|", r.detik || "-", "|", r.gambar ? "img" : "-");
  }
}
