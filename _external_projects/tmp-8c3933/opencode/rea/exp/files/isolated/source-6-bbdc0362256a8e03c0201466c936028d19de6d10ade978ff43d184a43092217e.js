
  var _paq = (window._paq = window._paq || []);

  // 1. Ambil Visitor ID dan simpan ke Local Storage
  _paq.push([
    function () {
      var visitor_id = this.getVisitorId();
      if (visitor_id) {
        localStorage.setItem('matomo_visitor_id', visitor_id);
      }
    },
  ]);

  // 2. Fungsi untuk menambahkan parameter ke link secara dinamis
  function appendMatomoIdToLinks() {
    var savedId = localStorage.getItem('matomo_visitor_id');
    if (!savedId) return;

    // Cari semua link yang mengandung URL register DOKU
    var links = document.querySelectorAll('a[href*="dashboard.doku.com/bo/register"]');

    links.forEach(function (link) {
      try {
        var url = new URL(link.href);
        // Cek agar tidak terjadi duplikasi parameter jika script jalan berkali-kali
        if (!url.searchParams.has('matomo_visitor_id')) {
          url.searchParams.set('matomo_visitor_id', savedId);
          link.href = url.toString();
        }
      } catch (e) {
        console.error('Gagal memproses URL:', e);
      }
    });
  }

  // 3. Jalankan fungsi saat DOM siap dan berikan sedikit delay untuk memastikan Matomo ID sudah terambil
  document.addEventListener('DOMContentLoaded', function () {
    // Jalankan segera
    appendMatomoIdToLinks();

    // Jalankan lagi setelah 1 detik untuk memastikan (fallback jika tracker lambat)
    setTimeout(appendMatomoIdToLinks, 1500);

    // Jika ada elemen yang muncul dinamis (misal dari pop-up),
    // jalankan fungsi ini saat tombol diklik (Event Delegation)
    document.addEventListener('click', function (e) {
      if (e.target.closest('a[href*="dashboard.doku.com/bo/register"]')) {
        appendMatomoIdToLinks();
      }
    });
  });
