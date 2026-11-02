/* A day with the pump: scroll drives one progress value p (0..1), and p drives
   the clock, the photo, the line, the pump marks and the words. It runs
   backwards too. Reduced motion (or old browsers) keep the static layout. */
(function () {
  var el = document.getElementById('day');
  if (!el) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var line = el.querySelector('.dw-line');
  if (reduce || !line || !line.getTotalLength) return;

  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };

  var stage = el.querySelector('.dw-stage');
  var hdr = document.getElementById('hdr');
  var rect = el.querySelector('.dw-cliprect');
  var dot = el.querySelector('.dw-dot');
  var now = el.querySelector('.dw-now');
  var pics = [].slice.call(el.querySelectorAll('.dw-pic'));
  var scenes = [].slice.call(el.querySelectorAll('.dw-scene'));
  var marks = [].slice.call(el.querySelectorAll('.dw-mk'));
  var basal = el.querySelector('.dw-basal');

  // Hour (6 = 6 am, 30 = 6 am next day) at which each part of the day begins.
  var STARTS = [6, 12.5, 15.6, 18, 20, 23.3];

  // Illustrative basal bars, one per half hour. Higher after meals, lower before
  // play, zero during the night-time pause.
  var B = [];
  for (var i = 0; i < 48; i++) {
    var h = 6 + i / 2, v = .45;
    if (h >= 13.5 && h < 15) v = .8;
    if (h >= 15.8 && h < 17.2) v = .18;
    if (h >= 21.5 && h < 23.5) v = .78;
    if (h >= 26 && h < 27.6) v = 0;
    B.push(v);
    var bar = document.createElement('i');
    bar.style.height = (v * 100) + '%';
    basal.appendChild(bar);
  }
  var bars = [].slice.call(basal.children);

  // Sample the path once, in viewBox units, to place the moving dot.
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

  var ticking = false, last = -1;
  function frame() {
    ticking = false;
    var hh = hdr ? hdr.offsetHeight : 0;
    var total = el.offsetHeight - stage.offsetHeight;
    var p = clamp(-(el.getBoundingClientRect().top - hh) / (total || 1), 0, 1);
    if (Math.abs(p - last) < .0004) return;
    last = p;

    var lx = seg(p, .03, .88);          // how much of the day has passed
    var hour = 6 + 24 * lx;
    var x = lx * 1000;
    rect.setAttribute('width', x.toFixed(1));
    dot.style.left = (lx * 100) + '%';
    dot.style.top = (yAt(x) / 3) + '%';
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

    el.classList.toggle('dw-done', p >= .92);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setHdr(); last = -1; onScroll(); });
  frame();
})();
