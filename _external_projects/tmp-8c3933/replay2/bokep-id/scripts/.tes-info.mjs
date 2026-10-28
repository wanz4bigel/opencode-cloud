import { fetchInfo } from "../src/info.js";
import { resolve } from "../src/hosts.js";

const tes = [
  "https://www.youtube.com/watch?v=9bZkp7q19f0",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://youtu.be/jNQXAC9IVRw",
  "https://vimeo.com/174732568",
  "https://archive.org/details/BigBuckBunny_124",
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",
  "https://www.pornhub.com/view_video.php?viewkey=ph5abc",
  "https://www.youtube.com/watch?v=TIDAKENAL"
];
for (const u of tes) {
  const t0 = Date.now();
  const r = await fetchInfo(u);
  console.log(
    `${String(Date.now() - t0).padStart(5)}ms ${(r.via || "").padEnd(18)} ${r.dipakai ? "PAKE" : "skip"} | ${String(r.judul || "-").slice(0, 42)} | ${r.detik || "-"} | ${r.gambar ? "gambar-ok" : "tanpa-gambar"}${r.pesan ? ` | ${String(r.pesan).slice(0, 44)}` : ""} | provider=${resolve(u).provider}`
  );
}
