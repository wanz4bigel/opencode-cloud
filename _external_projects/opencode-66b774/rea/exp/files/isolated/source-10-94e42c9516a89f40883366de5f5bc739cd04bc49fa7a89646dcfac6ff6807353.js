
  (function () {
    if (window.location.pathname.indexOf('contact-sales') === -1) return;

    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'routeLog'];
    var queryParts = [];
    utmKeys.forEach(function (key) {
      var val = sessionStorage.getItem(key);
      if (val) queryParts.push(key + '=' + encodeURIComponent(val));
    });

    if (queryParts.length === 0) return;

    function injectUTM() {
      var iframe = document.getElementById('mf_iframe');
      if (iframe) {
        var currentSrc = iframe.src;
        if (currentSrc.indexOf('utm_source') === -1) {
          var separator = currentSrc.indexOf('?') !== -1 ? '&' : '?';
          iframe.src = currentSrc + separator + queryParts.join('&');
        }
      } else {
        setTimeout(injectUTM, 500);
      }
    }

    injectUTM();
  })();
