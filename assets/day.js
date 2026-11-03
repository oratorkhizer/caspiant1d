// Scroll-moment analytics: sends to Caspian's own event log, and to GA4 / Vercel if the page has them.
(function(){
  if (window.sigTrack) return;
  var URL_ = "https://gjpbiiqkvzysmdpioexk.supabase.co/functions/v1/moment-event";
  var sent = {};
  function vid(){ try{ var v=localStorage.getItem("sig-vid"); if(!v){ v=Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem("sig-vid",v);} return v; }catch(e){ return "anon"; } }
  window.sigTrack = function(site, ev, meta, repeat){
    if (!repeat) { if (sent[site+ev]) return; sent[site+ev]=1; }
    var body = JSON.stringify({ site:site, event:ev, path:location.pathname, visitor:vid(),
      device: innerWidth<=760 ? "phone":"desk", meta: meta||null });
    try { if (!(navigator.sendBeacon && navigator.sendBeacon(URL_, body))) fetch(URL_, {method:"POST", body:body, keepalive:true}); } catch(e){}
    try { if (window.gtag) gtag("event", "moment_"+ev, Object.assign({ site:site }, meta||{})); } catch(e){}
    try { if (window.va) va("event", { name:"moment_"+ev, data:Object.assign({ site:site }, meta||{}) }); } catch(e){}
  };
})();

/* A day with the pump: scroll drives one progress value p (0..1), and p drives
   the hero hand-over, the clock, the photo, the line, the pump marks and the
   words. It runs backwards too. Reduced motion (or old browsers) keep the
   static layout. A returning visitor sees the end state as one normal screen. */
(function () {
  var el = document.getElementById('day');
  if (!el) return;
  var SITE = 't1d', KEY = 'sig-seen-' + SITE;
  var track = function (ev, meta, rep) { try { window.sigTrack(SITE, ev, meta, rep); } catch (e) {} };

  // Measurement that works in every mode, static or live.
  el.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if (!t || !el.contains(t)) return;
    var href = t.getAttribute('href');
    track('cta', { label: (t.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), href: href ? href.split('?')[0] : null }, true);
  });
  if ('IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { track('view'); vo.disconnect(); } });
    }, { threshold: .1 });
    vo.observe(el);
  } else { track('view'); }

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var line = el.querySelector('.dw-line');
  if (reduce || !line || !line.getTotalLength) return;

  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var store = {
    get: function () { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } },
    set: function () { try { localStorage.setItem(KEY, '1'); } catch (e) {} },
    del: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  var stage = el.querySelector('.dw-stage');
  var hdr = document.getElementById('hdr');
  var hero = el.querySelector('.dw-hero');
  var heroIn = el.querySelector('.dw-hero-in');
  var replay = el.querySelector('.dw-replay');
  var skip = el.querySelector('.dw-skip');
  var rect = el.querySelector('.dw-cliprect');
  var dot = el.querySelector('.dw-dot');
  var now = el.querySelector('.dw-now');
  var pics = [].slice.call(el.querySelectorAll('.dw-pic'));
  var scenes = [].slice.call(el.querySelectorAll('.dw-scene'));
  var marks = [].slice.call(el.querySelectorAll('.dw-mk'));
  var basal = el.querySelector('.dw-basal');

  // Hour (6 = 6 am, 30 = 6 am next day) at which each part of the day begins.
  var STARTS = [6, 12.5, 15.6, 18, 20, 23.3];
  // Timeline: hero hands over by .08, each part of the day then gets an equal
  // .12 of the scroll, and the closing frame (with the hero back) runs from .80.
  var DAY0 = .08, PART = .12, DONE = DAY0 + PART * STARTS.length; // .80
  function hourAt(p) {
    if (p <= DAY0) return 6;
    for (var i = 0; i < STARTS.length; i++) {
      var a = DAY0 + PART * i;
      if (p < a + PART) return STARTS[i] + ((STARTS[i + 1] || 30) - STARTS[i]) * seg(p, a, a + PART);
    }
    return 30;
  }

  // Illustrative basal bars, one per half hour. Higher after meals, lower before
  // play, zero during the night-time pause.
  for (var i = 0; i < 48; i++) {
    var h = 6 + i / 2, v = .45;
    if (h >= 13.5 && h < 15) v = .8;
    if (h >= 15.8 && h < 17.2) v = .18;
    if (h >= 21.5 && h < 23.5) v = .78;
    if (h >= 26 && h < 27.6) v = 0;
    var bar = document.createElement('i');
    bar.style.height = (v * 100) + '%';
    basal.appendChild(bar);
  }
  var bars = [].slice.call(basal.children);

  // Sample the path once, in viewBox units, to place the moving dot.
  // The viewBox shows y 85..300 (215 units tall).
  var VB_Y = 85, VB_H = 215;
  var LUT = [], len = line.getTotalLength();
  for (var k = 0; k <= 400; k++) { var pt = line.getPointAtLength(len * k / 400); LUT.push([pt.x, pt.y]); }
  function yAt(x) {
    for (var j = 1; j < LUT.length; j++) if (LUT[j][0] >= x) {
      var a = LUT[j - 1], b = LUT[j], t = (x - a[0]) / ((b[0] - a[0]) || 1);
      return a[1] + (b[1] - a[1]) * t;
    }
    return LUT[LUT.length - 1][1];
  }
  function clock(h) {
    var m = Math.floor(((h % 24) * 60) / 15) * 15, hh = Math.floor(m / 60), mm = m % 60;
    var ap = hh < 12 ? 'am' : 'pm', h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
  }

  el.classList.add('dw-live');
  var setHdr = function () { el.style.setProperty('--hdr', (hdr ? hdr.offsetHeight : 0) + 'px'); };
  setHdr();

  var seen = store.get() && !/[?&]replay=1(&|$)/.test(location.search);

  // On phones the closing words grow upward into the photo slot. Keep the
  // closing hero card clear of them so the two never overlap or leave a gap.
  var endEl = el.querySelector('.dw-end');
  function fitEnd(atEnd) {
    heroIn.style.bottom = '';
    if (!atEnd) return;
    // Measured without the fade-in transform, so it is exact mid-transition too.
    var hb = hero.getBoundingClientRect(), wr = endEl.parentNode.getBoundingClientRect();
    var et = wr.bottom - endEl.offsetHeight;
    var sameCol = wr.left < hb.right && hb.left < wr.right;
    if (sameCol && et > hb.top && et < hb.bottom + 1) heroIn.style.bottom = Math.round(hb.bottom - et + 12) + 'px';
  }

  function render(p) {
    // Hero: full at the start, gone by DAY0, back over the photo at the end.
    var ho, hy, atEnd = p >= DONE;
    if (atEnd) { ho = seg(p, DONE, DONE + .06); hy = (1 - ho) * 14; }
    else { ho = 1 - seg(p, .02, DAY0); hy = -28 * (1 - ho); }
    hero.classList.toggle('at-end', atEnd);
    hero.classList.toggle('off', ho < .02);
    heroIn.style.setProperty('--ho', ho.toFixed(3));
    heroIn.style.setProperty('--hy', hy.toFixed(1) + 'px');
    heroIn.style.pointerEvents = ho > .5 ? 'auto' : 'none';
    fitEnd(atEnd);

    var hour = hourAt(p);
    var lx = (hour - 6) / 24;
    var x = lx * 1000;
    rect.setAttribute('width', x.toFixed(1));
    dot.style.left = (lx * 100) + '%';
    dot.style.top = ((yAt(x) - VB_Y) / VB_H * 100) + '%';
    now.textContent = clock(hour);

    var s = 0;
    for (var i = 0; i < STARTS.length; i++) if (hour >= STARTS[i]) s = i;
    pics.forEach(function (f, i) { f.classList.toggle('on', i === s); });
    scenes.forEach(function (f, i) { f.classList.toggle('on', i === s); });
    var a = STARTS[s], b = STARTS[s + 1] || 30;
    pics[s].style.setProperty('--kb', (1.02 + .06 * seg(hour, a, b)).toFixed(3));

    marks.forEach(function (m) { m.classList.toggle('on', lx * 100 >= parseFloat(m.getAttribute('data-x')) - .4); });
    var nb = Math.floor(lx * 48);
    bars.forEach(function (bar, i) { bar.classList.toggle('on', i < nb); });

    el.classList.toggle('dw-done', atEnd);
  }

  var ticking = false, last = -1;
  function frame() {
    ticking = false;
    if (seen) return;
    var hh = hdr ? hdr.offsetHeight : 0;
    var total = el.offsetHeight - stage.offsetHeight;
    var p = clamp(-(el.getBoundingClientRect().top - hh) / (total || 1), 0, 1);
    if (Math.abs(p - last) < .0004) return;
    last = p;
    render(p);
    if (p > .03) track('start');
    if (p >= .5) track('half');
    if (p >= .97) { track('complete'); store.set(); }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  function showSeen() {
    el.classList.add('dw-seen');
    replay.hidden = false;
    render(1);
    track('seen_return');
  }

  skip.addEventListener('click', function () { track('skip'); store.set(); });
  replay.addEventListener('click', function () {
    store.del();
    seen = false;
    el.classList.remove('dw-seen');
    replay.hidden = true;
    track('replay');
    var hh = hdr ? hdr.offsetHeight : 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - hh, behavior: 'instant' });
    try { el.focus({ preventScroll: true }); } catch (e) {}
    last = -1;
    frame();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setHdr(); last = -1; if (seen) render(1); else onScroll(); });
  if (seen) showSeen(); else frame();
})();
