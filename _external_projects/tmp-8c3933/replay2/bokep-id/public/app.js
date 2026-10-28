// Cuma sedikit JavaScript di sini: salin tautan, pintasan pencarian, dan rantai
// cadangan gambar kartu. Urutan penyelamatan ditentukan server lewat data-rantai:
// foto asli dari host → thumbnail lokal polos → thumbnail lokal berjudul → warna
// dasar kartu. Tidak pernah kotak hitam kosong.
document.addEventListener("click", (event) => {
  const tombol = event.target.closest("[data-copy]");
  if (!tombol) return;
  const selesai = (ok) => {
    const asal = tombol.textContent;
    tombol.textContent = ok ? "Tersalin" : "Gagal menyalin";
    setTimeout(() => (tombol.textContent = asal), 1600);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(tombol.dataset.copy).then(() => selesai(true), () => selesai(false));
  else selesai(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
  const field = document.querySelector(".search input");
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (field && !typing) {
    event.preventDefault();
    field.focus();
  }
});

function majukanGambar(img) {
  const rantai = (img.dataset.rantai || "").split(",").filter(Boolean);
  const sudah = Number(img.dataset.maju || 0);
  if (sudah < rantai.length) {
    img.dataset.maju = String(sudah + 1);
    img.src = rantai[sudah];
    return;
  }
  img.classList.add("broken");
}

for (const img of document.querySelectorAll("img[data-rantai]")) {
  if (img.complete && img.naturalWidth === 0) majukanGambar(img);
  img.addEventListener("error", () => majukanGambar(img));
}
