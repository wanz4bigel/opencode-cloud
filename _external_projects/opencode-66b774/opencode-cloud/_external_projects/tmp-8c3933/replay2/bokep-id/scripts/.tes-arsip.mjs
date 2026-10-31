// Coba: apakah Internet Archive bisa dipakai sebagai sumber konten contoh yang
// JUJUR — judul, durasi, dan thumbnail diambil dari item aslinya.
const Q = process.argv[2] || 'collection:"prelinger" AND mediatype:"movies"';
const u =
  `https://archive.org/advancedsearch.php?q=${encodeURIComponent(Q)}` +
  `&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=runtime&fl%5B%5D=year&fl%5B%5D=downloads` +
  `&sort%5B%5D=downloads+desc&rows=8&page=1&output=json`;
const res = await fetch(u, { signal: AbortSignal.timeout(25000) });
const data = await res.json();
const docs = data?.response?.docs || [];
console.log(`query: ${Q}\nhitungan: ${data?.response?.numFound} · balik ${docs.length}\n`);
for (const d of docs) {
  let thumb = "-";
  try {
    const t = await fetch(`https://archive.org/services/img/${d.identifier}`, { signal: AbortSignal.timeout(9000) });
    thumb = `${t.status} ${t.headers.get("content-type")}`;
  } catch (e) {
    thumb = `GAGAL ${e.name}`;
  }
  console.log(
    `${String(d.identifier).slice(0, 34).padEnd(35)} ${(d.runtime || "-").toString().slice(0, 12).padEnd(13)} ${thumb.padEnd(24)} ${String(d.title).slice(0, 44)}`
  );
}
