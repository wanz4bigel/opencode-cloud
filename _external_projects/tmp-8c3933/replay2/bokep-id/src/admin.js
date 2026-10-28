// Panel kelola: isinya cuma tempel URL. Tidak ada form upload file, karena
// video memang tidak pernah masuk ke server kita.
import { categories, countVideos, demoCount, listVideos, stats } from "./db.js";
import { hostCatalog, labelOf } from "./hosts.js";
import { durationText } from "./poster.js";
import { esc, fmtViews, layout } from "./views.js";

function flash(message, kind = "ok") {
  return `<p class="flash flash--${kind}" role="status">${esc(message)}</p>`;
}

const HOST_COUNT = hostCatalog().length;

export function adminPage({ token, note, kind, host }) {
  if (!token) {
    return layout({
      title: "Masuk panel kelola — BokepKita",
      path: "/admin",
      query: {},
      body: `<section class="strip"><h1 class="strip__title">Masuk panel kelola</h1>
        <p class="strip__note">Panel ini cuma buat nempel URL video baru.</p></section>
        <form class="login" method="get" action="/admin">
          <label for="token">Kata kunci</label>
          <input id="token" type="password" name="token" autocomplete="current-password" required>
          <button class="btn btn--go" type="submit">Masuk</button>
        </form>
        <p class="watch__note">Kata kunci dibikin lewat variabel <code>ADMIN_TOKEN</code> saat server jalan.
          Kata kunci bawaannya <code>gus</code>.</p>`
    });
  }

  const cats = categories();
  const s = stats();
  const { rows } = listVideos({ per: 60 });
  const nContoh = demoCount();

  const body = `
  <section class="strip">
    <h1 class="strip__title">Kelola koleksi</h1>
    <p class="strip__note">${s.videos} video di katalog · semua dari embed, nol file di server${
      nContoh ? ` · <b>${nContoh} masih video contoh</b>` : ""
    }.</p>
    <div class="switch"><a class="is-on" href="/admin?token=${encodeURIComponent(token)}">Daftar video</a>
      <a href="/rss.xml">Umpan RSS</a><a href="/">Lihat situs</a></div>
  </section>
  ${note ? flash(note, kind) : ""}
  <div class="admin-grid">
    <section class="panel">
      <h2 class="section-title section-title--sm">Tambah satu video</h2>
      <form class="form" method="post" action="/admin/tambah?token=${encodeURIComponent(token)}">
        <label>Judul
          <input name="judul" placeholder="Colmek ABG Kosan Kebon Jeruk" maxlength="140">
        </label>
        <label>URL video di host
          <input name="url" required inputmode="url" placeholder="https://www.bitchute.com/video/xxxx/">
        </label>
        <label class="check">
          <input type="checkbox" name="ambil" value="1" checked>
          Ambil judul, durasi, dan gambar dari host otomatis
          <span class="field-note">Cocok buat YouTube / Vimeo / archive.org / Dailymotion. Kalau host menolak
            (XHamster, XNXX, Pornhub sering diblokir Cloudflare), judul di bawah yang dipakai.</span>
        </label>
        <label>Kategori
          <select name="kategori">
            <option value="">— pilih —</option>
            ${cats.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}
          </select>
        </label>
        <div class="form__row">
          <label>Tag <input name="tags" placeholder="abg, kos, lokal"></label>
          <label>Durasi detik <input name="durasi" type="number" min="0" max="7200" placeholder="600"></label>
        </div>
        <button class="btn btn--go" type="submit">Simpan ke katalog</button>
        <p class="field-note">Host dikenal otomatis: ${HOST_COUNT} sumber — daftarnya di <a href="/host">/host</a>.
          Host di luar itu tetap masuk sebagai Eksternal.</p>
      </form>
    </section>

    <section class="panel">
      <h2 class="section-title section-title--sm">Tempel banyak sekaligus</h2>
      <form class="form" method="post" action="/admin/impor?token=${encodeURIComponent(token)}">
        <label>Satu baris per video: <code>judul | url</code>
          <textarea name="daftar" rows="9" spellcheck="false"
            placeholder="Colmek Janda Dapur | https://www.bitchute.com/video/abc/&#10;https://youtu.be/xxxx"></textarea>
        </label>
        <label>Kategori untuk semua baris
          <select name="kategori">
            <option value="">— tebak sendiri —</option>
            ${cats.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}
          </select>
        </label>
        <label class="check">
          <input type="checkbox" name="ambil" value="1">
          Cek metadata host per baris (lebih lambat, cuma untuk host yang mau kasih metadata)
        </label>
        <button class="btn btn--go" type="submit">Impor daftar</button>
        <p class="field-note">Baris boleh cuma URL saja kalau host-nya mau kasih judul otomatis.</p>
      </form>
    </section>
  </div>

  <section class="panel">
    <h2 class="section-title section-title--sm">Samakan judul dengan video aslinya</h2>
    <p class="strip__note">Host yang mau kasih metadata (YouTube, Vimeo, archive.org, Dailymotion) bisa menimpa
      judul ditulis tangan dengan judul asli video, plus durasi dan gambarnya.
      ${nContoh ? `Sekarang ada <b>${nContoh} video contoh</b> — tombol ini akan membuat katalog kelihatan jujur.` : "Tidak ada video contoh tersisa."}</p>
    <form class="form form--inline" method="post" action="/admin/samakan?token=${encodeURIComponent(token)}">
      <div class="form__row form__row--tight">
        ${nContoh ? '<label class="check"><input type="checkbox" name="contoh" value="1" checked> Hanya video contoh</label>' : ""}
        <label>Batas <input type="number" name="batas" value="30" min="1" max="300"></label>
        <button class="btn" type="submit">Jalankan sekarang</button>
      </div>
    </form>
    <p class="field-note">Bisa juga dari terminal: <code>npm run asli</code> (semua video) atau
      <code>npm run asli -- --contoh</code>.</p>
  </section>

  <section class="panel">
    <h2 class="section-title section-title--sm">60 video terakhir</h2>
    <table class="table">
      <thead><tr><th>Judul</th><th>Host</th><th>Kategori</th><th>Diputar</th><th></th></tr></thead>
      <tbody>${rows
        .map(
          (v) => `<tr>
        <td><a href="/v/${v.slug}" target="_blank" rel="noopener">${esc(v.title)}</a>
            <small>${v.slug} · ${durationText(v.duration)} · ${String(v.added_at).slice(0, 10)}${
              v.demo ? " · contoh" : ""
            }${v.poster ? " · gambar asli" : ""}</small></td>
        <td>${esc(labelOf(v.provider))}</td>
        <td>${esc(v.category || "—")}</td>
        <td>${fmtViews(v.views)}</td>
        <td><form method="post" action="/admin/hapus/${v.id}?token=${encodeURIComponent(token)}">
            <button class="btn btn--danger" type="submit">Hapus</button></form></td>
      </tr>`
        )
        .join("")}</tbody>
    </table>
    <p class="field-note">${countVideos()} video tersimpan. Menghapus video hanya menghapus tautannya, file aslinya tetap di host.</p>
  </section>`;

  return layout({ title: "Kelola koleksi — BokepKita", path: "/admin", query: { token }, body });
}
