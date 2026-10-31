// Duplikasi persis jalur info.js (UA + header + timeout) tapi cetak status HTTP,
// biar kelihatan apakah YouTube menolak (403/429) atau cuma lambat.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const ids = ["9bZkp7q19f0", "dQw4w9WgXcQ", "kJQP7kiw5Fk", "jNQXAC9IVRw", "60ItHLz5WEA", "hT_nvWreIhg"];
for (const id of ids) {
  const u = `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&format=json`;
  const t0 = Date.now();
  try {
    const r = await fetch(u, {
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": UA, accept: "application/json", connection: "close" }
    });
    const t = await r.text();
    console.log(`${id} ${String(Date.now() - t0).padStart(5)}ms ${r.status} | ${t.slice(0, 40).replace(/\s+/g, " ")}`);
  } catch (e) {
    console.log(`${id} ${String(Date.now() - t0).padStart(5)}ms LEMPAR ${e.name} cause=${e.cause?.code || e.cause?.message || "-"}`);
  }
}
