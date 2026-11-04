/* Microsoft Clarity (project z7zgvd25jo, Strict masking set in Clarity).
   Loaded once per page, only after the page has finished loading, so it never
   blocks rendering. Every page on this site is a public education page; there
   are no forms, logins or report tools here. */
(function () {
  if (window.clarity) return;
  function load() {
    if (window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", "z7zgvd25jo");
  }
  if (document.readyState === "complete") load();
  else window.addEventListener("load", load, { once: true });
})();
