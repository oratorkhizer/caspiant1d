/* Caspian T1D site: GA4 conversion tracking.
   Every WhatsApp, call, booking and download click on any page is sent to GA4
   as its own event so revenue actions can be counted, not just page views. */
(function () {
  var ID = 'G-XQ0QCK1PLQ';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', ID, { anonymize_ip: true });

  function classify(a) {
    var h = (a.getAttribute('href') || '').toLowerCase();
    if (h.indexOf('wa.me') > -1 || h.indexOf('whatsapp.com') > -1) return 'whatsapp_click';
    if (h.indexOf('tel:') === 0) return 'call_click';
    if (h.indexOf('eka.care') > -1) return 'book_click';
    if (h.indexOf('.pdf') > -1) return 'resource_download';
    if (h.indexOf('amzn') > -1 || h.indexOf('amazon.') > -1) return 'book_amazon_click';
    if (h.indexOf('share.google') > -1 || h.indexOf('maps') > -1) return 'directions_click';
    return null;
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var name = classify(a);
    if (!name) return;
    var section = a.closest('section, header, footer, .mbar');
    gtag('event', name, {
      link_url: a.getAttribute('href'),
      link_text: (a.textContent || '').trim().slice(0, 80),
      page_path: location.pathname,
      placement: section ? (section.id || section.className || section.tagName).toString().slice(0, 40) : 'body'
    });
  }, true);
})();
