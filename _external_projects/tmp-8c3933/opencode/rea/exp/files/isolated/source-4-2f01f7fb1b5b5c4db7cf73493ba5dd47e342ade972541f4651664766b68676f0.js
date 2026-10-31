
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  // Buang UTM internal dari page_location sebelum dikirim ke GA4
  var DOKU_INTERNAL_SOURCES = ['doku.com', 'dokucom', 'dokucom2', 'blog', 'pr'];
  function cleanPageLocation() {
    try {
      var url = new URL(window.location.href);
      var ref = document.referrer ? new URL(document.referrer).hostname : '';
      var internalRef = ref === 'doku.com' || ref.endsWith('.doku.com');
      var src = (url.searchParams.get('utm_source') || '').toLowerCase();
      var internalSrc = DOKU_INTERNAL_SOURCES.indexOf(src) > -1;
      if (internalRef || internalSrc) {
        ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id']
          .forEach(function (p) { url.searchParams.delete(p); });
      }
      return url.toString();
    } catch (e) { return window.location.href; }
  }
  gtag('config', 'G-S4BX0298SF', { page_location: cleanPageLocation() });
