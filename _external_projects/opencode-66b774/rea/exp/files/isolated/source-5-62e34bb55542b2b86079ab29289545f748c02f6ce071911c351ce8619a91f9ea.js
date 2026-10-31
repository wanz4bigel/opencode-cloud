
  (function () {
    const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

    const UTM_ORIGIN_KEYS = ['utm_source_origin', 'utm_medium_origin', 'utm_campaign_origin', 'utm_content_origin'];

    function getCleanPath() {
      let path = window.location.pathname.replace(/\/$/, '');
      return path.replace(/^\/(en-us|id|en)/, '');
    }

    function getMedium() {
      const parts = getCleanPath().split('/').filter(Boolean);
      return parts[0] || 'homepage';
    }

    function getSlug() {
      const parts = getCleanPath().split('/').filter(Boolean);
      return parts[parts.length - 1] || 'homepage';
    }

    function getCTASection(link) {
      const parent = link.closest('[data-cta-group],[data-cta-section]');
      return link.getAttribute('data-cta-section') || parent?.getAttribute('data-cta-section') || parent?.getAttribute('data-cta-group') || 'unknown';
    }

    function shouldTrack(link, href) {
      const manual = (link.getAttribute('data-cta') || '').trim().toLowerCase() === 'true';
      const register = href.includes('dashboard.doku.com/bo/register');
      const contact = href.includes('/contact-sales');
      return manual || register || contact;
    }

    function cleanBase(rawHref) {
      const temp = new URL(rawHref, window.location.origin);
      return temp.origin + temp.pathname;
    }

    function preserveNonUTM(rawHref) {
      const temp = new URL(rawHref, window.location.origin);
      const params = new URLSearchParams();
      temp.searchParams.forEach((v, k) => {
        if (!UTM_KEYS.includes(k) && !UTM_ORIGIN_KEYS.includes(k)) {
          params.append(k, v);
        }
      });
      return params;
    }

    function processLink(link) {
      const rawHref = link.getAttribute('href');
      if (!rawHref) return;

      // SKIP UTM CHECK
      const noUTM = link.getAttribute('data-no-utm');
      if (noUTM && noUTM.toLowerCase() === 'true') {
        return;
      }

      // TRACKING CHECK
      if (!shouldTrack(link, rawHref)) {
        return;
      }

      // PREVENT DOUBLE PROCESS
      if (link.dataset.utmProcessed === 'true') {
        return;
      }

      // SAVE CLEAN URL
      if (!link.dataset.cleanHref) {
        link.dataset.cleanHref = cleanBase(rawHref);
      }

      const url = new URL(link.dataset.cleanHref);
      const params = new URLSearchParams();

      // Set internal UTM params
      params.set('utm_source', 'dokucom');
      params.set('utm_medium', getMedium());
      params.set('utm_campaign', getSlug());
      params.set('utm_content', getCTASection(link));

      // Append _origin values dari localStorage (hanya yang memang ada)
      // Tanpa fallback — head code sudah handle penyimpanan _origin
      UTM_KEYS.forEach(function (key) {
        var originKey = key + '_origin';
        var originVal = localStorage.getItem(originKey);
        if (originVal) {
          params.set(originKey, originVal);
        }
      });

      // Preserve non-UTM params (matomo_visitor_id, _gl, dll)
      preserveNonUTM(rawHref).forEach((v, k) => {
        params.append(k, v);
      });

      url.search = params.toString();
      link.setAttribute('href', url.toString());
      link.dataset.utmProcessed = 'true';
    }

    function init() {
      document.querySelectorAll('a[href]').forEach(processLink);
    }

    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);

    const obs = new MutationObserver(() => {
      init();
    });

    obs.observe(document.body, {
      childList: true,
      subtree: true,
    });
  })();
