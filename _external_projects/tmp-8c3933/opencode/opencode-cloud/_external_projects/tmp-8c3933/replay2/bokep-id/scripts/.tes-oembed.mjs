// Coba: apakah oEmbed YouTube bisa dipanggil berkali-kali dari satu proses Node?
// Dugaan: koneksi keep-alive kedua ditolak, jadi perlu `connection: close`.
const ids = ["9bZkp7q19f0", "dQw4w9WgXcQ", "kJQP7kiw5Fk", "jNQXAC9IVRw", "60ItHLz5WEA"];
const ua = { "user-agent": "Mozilla/5.0 Chrome/124", accept: "application/json" };

for (const mode of ["keepalive", "close"]) {
  const headers = mode === "close" ? { ...ua, connection: "close" } : ua;
  const opsi = mode === "close" ? { headers } : { headers };
  console.log(`-- mode ${mode}`);
  for (const id of ids) {
    const u = `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${id}&format=json`;
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(7000), ...opsi });
      const t = await r.text();
      console.log("  ", id, r.status, t.slice(0, 46).replace(/\s+/g, " "));
    } catch (e) {
      console.log("  ", id, "ERR", e.name, String(e.message).slice(0, 50));
    }
  }
}
