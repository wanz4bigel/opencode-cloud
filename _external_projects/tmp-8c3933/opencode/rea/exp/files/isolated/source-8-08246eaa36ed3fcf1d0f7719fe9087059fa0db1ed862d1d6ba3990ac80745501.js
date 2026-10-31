
  (function () {
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    var params = new URLSearchParams(window.location.search);

    // Sumber internal DOKU: jangan dianggap trafik eksternal.
    // Samakan isinya dengan DOKU_INTERNAL_SOURCES di blok Google tag.
    var INTERNAL = ['dokucom', 'dokucom2', 'doku.com', 'blog', 'pr'];

    // Pembersihan satu kali: buang nilai _origin lama yang tercemar UTM internal
    var storedOrigin = (localStorage.getItem('utm_source_origin') || '').toLowerCase();
    if (storedOrigin && INTERNAL.indexOf(storedOrigin) > -1) {
      utmKeys.forEach(function (key) {
        localStorage.removeItem(key + '_origin');
      });
    }

    // Deteksi traffic eksternal: simpan UTM sebagai _origin hanya jika
    // utm_source ada dan BUKAN sumber internal
    var source = (params.get('utm_source') || '').toLowerCase();
    if (source && INTERNAL.indexOf(source) === -1) {
      utmKeys.forEach(function (key) {
        var val = params.get(key);
        if (val) {
          localStorage.setItem(key + '_origin', val);
        }
      });
    }

    // Simpan semua UTM params ke localStorage seperti biasa (tidak diubah)
    utmKeys.forEach(function (key) {
      var val = params.get(key);
      if (val) {
        localStorage.setItem(key, val);
      }
    });
  })();
