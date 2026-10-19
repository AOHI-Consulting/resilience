(function () {
  'use strict';

  var D = window.RR;
  var CLOUD = { rpc: 'https://fziyuauwrfdmiomwelij.supabase.co/rest/v1/rpc/', key: 'sb_publishable_ADg1MNwF3XHtn0bdRYv8cw_NfdZomZ6' };
  var $ = function (id) { return document.getElementById(id); };

  var state = { view: 'command', range: '30d', scenario: null, simT0: 0, simFrom: null, selInc: null, selRisk: null,
    incFilter: 'all', openKpi: {}, reports: [], quiz: null, seen: null, fresh: {}, sig: '', feedAt: 0, pcode: '' };
  try { state.pcode = sessionStorage.getItem('rr-pcode') || ''; } catch (e) {}

  var VIEWS = [
    { id: 'command', title: 'Command centre', group: 'Overview', icon: 'grid' },
    { id: 'challenges', title: 'Top resilience challenges', nav: 'Challenges', group: 'Overview', icon: 'target' },
    { id: 'defences', title: 'Defences: the six NIST functions', nav: 'Defences', group: 'Cyber security', icon: 'shield' },
    { id: 'surface', title: 'Attack surface', group: 'Cyber security', icon: 'server' },
    { id: 'trace', title: 'Track & trace', group: 'Cyber security', icon: 'route' },
    { id: 'simulator', title: 'Attack simulator', group: 'Cyber security', icon: 'bolt' },
    { id: 'human', title: 'Human factor', group: 'Cyber security', icon: 'people' },
    { id: 'live', title: 'Live from the room', group: 'Cyber security', icon: 'qr' },
    { id: 'wider', title: 'Wider resilience', group: 'Beyond cyber', icon: 'layers' },
    { id: 'marriott', title: 'Lessons from Marriott', nav: 'Marriott case', group: 'Learn', icon: 'book' },
    { id: 'about', title: 'How it works', group: 'Learn', icon: 'info' }
  ];

  var RANGES = {
    '7d': { n: 7, step: 'day', f: 0.6, label: '7 days ago', name: '7 days' },
    '30d': { n: 30, step: 'day', f: 1.2, label: '30 days ago', name: '30 days' },
    '90d': { n: 13, step: 'week', f: 2, label: '90 days ago', name: '90 days' },
    '12m': { n: 12, step: 'month', f: 3.2, label: '12 months ago', name: '12 months' }
  };

  // ---------- icons ----------
  var ICON = {
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    shield: '<path d="M12 3l8 3.2v5.6c0 4.9-3.4 9.1-8 10.7-4.6-1.6-8-5.8-8-10.7V6.2z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c2.8 0 5 2.2 5 5"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M8 7h7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.75 3.75 0 0 1 17.5 18z"/><path d="M10 12l4 4M14 12l-4 4"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }
  var STATUS = {
    good: { label: 'On target', svg: '<circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M4.8 8.3l2.1 2.1 4.3-4.6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    warning: { label: 'Watch', svg: '<path d="M8 1.2l7.2 13H.8z" fill="currentColor" stroke="currentColor" stroke-linejoin="round"/><path d="M8 5.6v4" stroke="#111" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="12" r="1" fill="#111"/>' },
    serious: { label: 'At risk', svg: '<path d="M8 .6l7.4 7.4L8 15.4.6 8z" fill="currentColor"/><path d="M8 4.6v4.2" stroke="#111" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.2" r="1" fill="#111"/>' },
    critical: { label: 'Critical', svg: '<path d="M5 1h6l4 4v6l-4 4H5l-4-4V5z" fill="currentColor"/><path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' }
  };
  var LVCOLOR = { good: 'var(--good)', warning: 'var(--warning)', serious: 'var(--serious)', critical: 'var(--critical)' };
  function level(s) { return s >= 80 ? 'good' : s >= 60 ? 'warning' : s >= 40 ? 'serious' : 'critical'; }
  function kpiLevel(s) { return s >= 99.99 ? 'good' : s >= 60 ? 'warning' : s >= 40 ? 'serious' : 'critical'; }
  function chip(lv, text) { return '<span class="status s-' + lv + '"><svg viewBox="0 0 16 16" aria-hidden="true">' + STATUS[lv].svg + '</svg>' + (text || STATUS[lv].label) + '</span>'; }
  function yesNo(ok, y, n) { return ok ? '<span class="yes">' + icon('check') + (y || 'Yes') + '</span>' : '<span class="no">' + icon('x') + (n || 'No') + '</span>'; }

  // ---------- numbers ----------
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clampK(k, v) {
    var hi = Infinity;
    if (k.unit === '%' && Math.max(k.good, k.bad, k.value) <= 100) hi = 100;
    if (k.unit === '/10') hi = 10;
    if (k.unit === '/5') hi = 5;
    return Math.max(0, Math.min(hi, v));
  }
  var cache = {};
  function series(k) {
    var key = k.id + '|' + state.range;
    if (cache[key]) return cache[key];
    var R = RANGES[state.range], n = R.n, rand = rng(hash(key)), dir = Math.sign(k.good - k.bad);
    var start = k.value - k.trend * dir * k.vol * R.f, pts = [];
    for (var i = 0; i < n; i++) {
      var v = start + (k.value - start) * (i / (n - 1)) + (i === n - 1 ? 0 : (rand() - 0.5) * k.vol * 1.1);
      v = clampK(k, v);
      if (k.int) v = Math.max(0, Math.round(v));
      pts.push(v);
    }
    return (cache[key] = pts);
  }
  function score(k, v) { return Math.max(0, Math.min(1, (v - k.bad) / (k.good - k.bad))) * 100; }
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / (a.length || 1); }
  function scn() { return state.scenario ? D.scenarios.filter(function (s) { return s.id === state.scenario; })[0] : null; }

  function model(withScenario) {
    var n = RANGES[state.range].n, sc = withScenario === false ? null : scn();
    var ks = D.kpis.map(function (k) {
      var pts = series(k).slice(), changed = false;
      if (sc && sc.impact[k.id] != null && sc.impact[k.id] !== pts[n - 1]) { pts[n - 1] = sc.impact[k.id]; changed = true; }
      return { k: k, pts: pts, v: pts[n - 1], s: score(k, pts[n - 1]), changed: changed };
    });
    var fns = D.functions.map(function (f) {
      var mine = ks.filter(function (x) { return x.k.fn === f.id; });
      var at = function (i) { return mean(mine.map(function (x) { return score(x.k, x.pts[i]); })); };
      return { f: f, kpis: mine, s: at(n - 1), s0: at(0), at: at, hit: mine.some(function (x) { return x.changed; }) };
    });
    var idx = [];
    for (var i = 0; i < n; i++) idx.push(mean(fns.map(function (x) { return x.at(i); })));
    var byId = {}; ks.forEach(function (x) { byId[x.k.id] = x; });
    return { ks: ks, byId: byId, fns: fns, idx: idx, score: idx[n - 1], score0: idx[0] };
  }

  function unitOf(k) { return k.unit === '%' ? '%' : k.unit === 'h' ? ' h' : k.unit; }
  function fmt(k, v) { return (k.dec ? v.toFixed(1) : String(Math.round(v))) + unitOf(k); }
  function target(k) {
    var lower = k.good < k.bad, g = k.dec ? k.good.toFixed(1) : k.good;
    if (k.good === 0) return 'Target 0';
    return 'Target ' + (lower ? '≤ ' : '≥ ') + g + unitOf(k);
  }
  function fmtDur(h) {
    if (h == null) return '–';
    if (h < 1) return Math.max(1, Math.round(h * 60)) + ' min';
    if (h < 72) return (Math.round(h * 10) / 10) + ' h';
    if (h < 24 * 90) return Math.round(h / 24) + ' days';
    return Math.round(h / 730) + ' months';
  }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function pad(x) { return (x < 10 ? '0' : '') + x; }
  function fmtDate(d, t) { var s = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; return t ? s + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : s; }
  function pointDate(i, n, step) {
    var d = new Date(), back = n - 1 - i;
    if (step === 'day') d.setDate(d.getDate() - back);
    else if (step === 'week') d.setDate(d.getDate() - 7 * back);
    else d.setMonth(d.getMonth() - back);
    return d;
  }
  function pointLabel(i, n) {
    var st = RANGES[state.range].step, d = pointDate(i, n, st);
    if (st === 'month') return MONTHS[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2);
    return (st === 'week' ? 'Week of ' : '') + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function compact(v) { return v >= 10000 ? Math.round(v / 1000) + 'K' : v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'K' : String(Math.round(v)); }
  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago'; return Math.floor(s / 86400) + ' days ago';
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function riskLv(l, i) { var s = l * i; return s <= 4 ? 1 : s <= 9 ? 2 : s <= 14 ? 3 : 4; }

  // ---------- small charts ----------
  function spark(pts, changed, w, h) {
    w = w || 90; h = h || 30; var p = 4;
    var lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var x = function (i) { return p + i * (w - 2 * p) / (pts.length - 1); };
    var y = function (v) { return p + (hi - v) / (hi - lo) * (h - 2 * p); };
    var d = pts.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join('');
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><path d="' + d + '" fill="none" style="stroke:var(--muted)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + x(pts.length - 1) + '" cy="' + y(pts[pts.length - 1]) + '" r="3.5" style="fill:' + (changed ? 'var(--critical)' : 'var(--accent)') + ';stroke:var(--panel)" stroke-width="2"/></svg>';
  }
  function polar(cx, cy, r, a) { var t = a * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
  function arc(cx, cy, r, a0, a1) {
    var p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1), large = a1 - a0 > 180 ? 1 : 0;
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }
  function gauge(v) {
    var a0 = 150, sweep = 240, a1 = a0 + sweep * Math.max(0.5, v) / 100, lv = level(v), t = polar(120, 120, 86, a0 + sweep * 0.8), t2 = polar(120, 120, 106, a0 + sweep * 0.8);
    return '<svg viewBox="0 0 240 205" role="img" aria-label="Score ' + Math.round(v) + ' out of 100">' +
      '<path d="' + arc(120, 120, 96, a0, a0 + sweep) + '" fill="none" style="stroke:var(--panel-3)" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="' + arc(120, 120, 96, a0, a1) + '" fill="none" style="stroke:' + LVCOLOR[lv] + '" stroke-width="14" stroke-linecap="round"/>' +
      '<line x1="' + t[0].toFixed(1) + '" y1="' + t[1].toFixed(1) + '" x2="' + t2[0].toFixed(1) + '" y2="' + t2[1].toFixed(1) + '" style="stroke:var(--ink)" stroke-width="2.5" stroke-linecap="round"/>' +
      '<text x="' + (t2[0] + 4).toFixed(1) + '" y="' + (t2[1] - 4).toFixed(1) + '" font-size="10" style="fill:var(--ink-2)">target</text></svg>';
  }
  function ring(v) {
    var r = 19, c = 2 * Math.PI * r, lv = level(v);
    return '<svg class="ring" viewBox="0 0 46 46" aria-hidden="true"><circle cx="23" cy="23" r="' + r + '" fill="none" style="stroke:var(--panel-3)" stroke-width="5"/>' +
      '<circle cx="23" cy="23" r="' + r + '" fill="none" style="stroke:' + LVCOLOR[lv] + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (c * v / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 23 23)"/>' +
      '<text x="23" y="27.5" text-anchor="middle" font-size="12.5" font-weight="700" style="fill:var(--ink)">' + Math.round(v) + '</text></svg>';
  }

  // Blocked phishing e-mails per bucket (demo)
  function blocked() {
    var R = RANGES[state.range], rand = rng(hash('blocked')), today = new Date(), daily = [];
    for (var b = 0; b < 400; b++) {
      var d = new Date(today); d.setDate(d.getDate() - b);
      var wk = d.getDay() === 0 || d.getDay() === 6 ? 0.45 : 1;
      var v = D.blockedBase * wk * (0.75 + rand() * 0.5);
      var key = d.getMonth() + '-' + d.getDate();
      if (key === '8-22') v *= 4.2;
      if (key === '9-16') v *= 2.6;
      daily.push(Math.round(v));
    }
    var out = [], i, j;
    if (R.step === 'day') { for (i = R.n - 1; i >= 0; i--) out.push(daily[i]); }
    else if (R.step === 'week') { for (i = R.n - 1; i >= 0; i--) { var s = 0; for (j = 0; j < 7; j++) s += daily[i * 7 + j]; out.push(s); } }
    else { for (i = R.n - 1; i >= 0; i--) { var sm = 0; for (j = 0; j < 30; j++) sm += daily[i * 30 + j] || D.blockedBase; out.push(sm); } }
    return { pts: out, total: out.reduce(function (a, c) { return a + c; }, 0) };
  }
  function columnChart(box, pts) {
    if (!box) return;
    var w = Math.max(300, box.clientWidth || 600), h = 200, pl = 36, pr = 8, pt = 10, pb = 26, n = pts.length;
    var max = Math.max.apply(null, pts), step = Math.pow(10, Math.floor(Math.log10(max || 1)));
    var top = Math.ceil(max / step) * step; if (top / step < 3) { step /= 2; top = Math.ceil(max / step) * step; }
    var slot = (w - pl - pr) / n, bw = Math.min(24, slot * 0.62);
    var y = function (v) { return pt + (top - v) / top * (h - pt - pb); };
    var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" height="' + h + '" role="img" aria-label="Blocked phishing e-mails">';
    for (var t = 0; t <= top + 1e-9; t += step) {
      s += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + y(t) + '" y2="' + y(t) + '" style="stroke:var(--grid)"/>';
      s += '<text x="' + (pl - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end" font-size="10.5" style="fill:var(--muted);font-family:var(--mono)">' + compact(t) + '</text>';
    }
    pts.forEach(function (v, i) {
      var x = pl + i * slot + (slot - bw) / 2, yy = y(v), hh = Math.max(1, y(0) - yy), r = Math.min(4, bw / 2, hh);
      s += '<path class="colbar" data-i="' + i + '" d="M' + x + ' ' + y(0) + 'V' + (yy + r) + 'Q' + x + ' ' + yy + ' ' + (x + r) + ' ' + yy + 'H' + (x + bw - r) + 'Q' + (x + bw) + ' ' + yy + ' ' + (x + bw) + ' ' + (yy + r) + 'V' + y(0) + 'Z" style="fill:var(--accent)" opacity="' + (i === n - 1 ? 1 : 0.78) + '"/>';
      s += '<rect data-i="' + i + '" x="' + (pl + i * slot) + '" y="' + pt + '" width="' + slot + '" height="' + (h - pt - pb) + '" fill="transparent"/>';
    });
    [0, Math.floor((n - 1) / 2), n - 1].forEach(function (i, j) {
      s += '<text x="' + (pl + i * slot + slot / 2) + '" y="' + (h - 7) + '" text-anchor="' + (j === 0 ? 'start' : j === 2 ? 'end' : 'middle') + '" font-size="10.5" style="fill:var(--muted)">' + (i === n - 1 ? 'Today' : pointLabel(i, n).replace('Week of ', '')) + '</text>';
    });
    box.innerHTML = s + '</svg><div class="tip"></div>';
    var tip = box.querySelector('.tip'), svg = box.querySelector('svg');
    function reset() { tip.style.opacity = 0; box.querySelectorAll('.colbar').forEach(function (b) { b.setAttribute('opacity', +b.getAttribute('data-i') === n - 1 ? 1 : 0.78); }); }
    svg.addEventListener('pointermove', function (e) {
      var i = e.target.getAttribute && e.target.getAttribute('data-i'); if (i == null) { reset(); return; }
      i = +i;
      box.querySelectorAll('.colbar').forEach(function (b) { b.setAttribute('opacity', +b.getAttribute('data-i') === i ? 1 : 0.5); });
      tip.innerHTML = '<strong>' + pts[i].toLocaleString('en-GB') + '</strong><span class="k"><span class="key"></span>' + (i === n - 1 ? 'Today' : pointLabel(i, n)) + '</span>';
      var px = (pl + i * slot + slot / 2) / w * box.clientWidth;
      tip.style.left = Math.min(box.clientWidth - 140, Math.max(0, px - 65)) + 'px'; tip.style.top = '-10px'; tip.style.opacity = 1;
    });
    svg.addEventListener('pointerleave', reset);
  }

  // ---------- navigation ----------
  function renderNav() {
    var groups = [];
    VIEWS.forEach(function (v) { if (groups.indexOf(v.group) < 0) groups.push(v.group); });
    $('nav').innerHTML = groups.map(function (g) {
      return '<div class="nav-group"><span>' + g + '</span>' + VIEWS.filter(function (v) { return v.group === g; }).map(function (v) {
        return '<a href="#' + v.id + '" data-v="' + v.id + '">' + icon(v.icon) + '<span>' + (v.nav || v.title) + '</span>' +
          (v.id === 'live' ? '<span class="count" id="liveCount"></span>' : '') + '</a>';
      }).join('') + '</div>';
    }).join('');
  }
  function go(id) {
    if (!VIEWS.some(function (v) { return v.id === id; })) id = 'command';
    var prev = state.view;
    state.view = id;
    var v = VIEWS.filter(function (x) { return x.id === id; })[0];
    Array.prototype.forEach.call(document.querySelectorAll('.view'), function (s) { s.classList.toggle('on', s.id === 'v-' + id); });
    Array.prototype.forEach.call(document.querySelectorAll('.nav-group a'), function (a) { a.classList.toggle('on', a.dataset.v === id); });
    $('viewTitle').textContent = v.title;
    $('crumb').textContent = v.group + ' · page ' + (VIEWS.indexOf(v) + 1) + ' of ' + VIEWS.length;
    $('side').classList.remove('open'); $('scrim').classList.remove('on');
    window.scrollTo(0, 0);
    if (id === 'command') columnChart($('blockedChart'), blocked().pts);
    if (id === 'trace' && prev !== 'trace') renderTrace();
  }

  // ---------- views ----------
  var shownScore = null;
  function renderCommand(m) {
    var lv = level(m.score), d = Math.round(m.score - m.score0), sorted = m.fns.slice().sort(function (a, b) { return a.s - b.s; });
    var b = blocked(), openInc = D.incidents.filter(function (x) { return x.status !== 'closed'; }).length + (scn() ? 1 : 0);
    var tile = function (id, label) {
      var x = m.byId[id], klv = kpiLevel(x.s);
      return '<div class="card s3 stat"><span class="label">' + label + '</span><span class="v">' + fmt(x.k, x.v) + '</span>' +
        '<div class="f">' + chip(klv, target(x.k)) + spark(x.pts, x.changed, 96, 30) + '</div></div>';
    };
    var topRisks = D.risks.filter(function (r) { return r.cyber; }).sort(function (a, c) { return c.l * c.i - a.l * a.i; }).slice(0, 5);
    $('v-command').innerHTML =
      '<div class="grid">' +
        '<div class="card s4 score-card"><div class="card-h"><span class="label">Cyber resilience score</span>' + (state.scenario ? '<span class="pill live">Simulation</span>' : '<span class="pill cyber">NIST CSF 2.0</span>') + '</div>' +
          '<div class="gauge-wrap">' + gauge(m.score) + '<div class="gauge-num"><span class="n" id="scoreNum">' + Math.round(m.score) + '</span><span class="of">out of 100</span></div></div>' +
          '<div class="score-meta">' + chip(lv) + '<span class="delta ' + (d > 0 ? 'up' : d < 0 ? 'down' : 'flat') + '">' + (d > 0 ? '▲ +' : d < 0 ? '▼ ' : '● ') + d + ' vs ' + RANGES[state.range].label + '</span></div>' +
          '<p class="score-read">Weakest: <b>' + sorted[0].f.name + '</b> (' + Math.round(sorted[0].s) + ') and <b>' + sorted[1].f.name + '</b> (' + Math.round(sorted[1].s) + ')</p></div>' +
        '<div class="card s8"><div class="card-h"><span class="label">The six functions of the NIST framework</span><button class="link-btn" data-go="defences">All 18 KPIs →</button></div><div class="fn-grid">' +
          m.fns.map(function (x, i) {
            var l = level(x.s), dd = Math.round(x.s - x.s0);
            return '<button class="fn' + (x.hit ? ' hit' : '') + '" data-go="defences"><div class="top"><span class="nm"><i>0' + (i + 1) + '</i>' + x.f.name + '</span>' + chip(l) + '</div>' +
              '<div class="top"><span class="v">' + Math.round(x.s) + '</span><span class="delta ' + (dd > 0 ? 'up' : dd < 0 ? 'down' : 'flat') + '">' + (dd > 0 ? '▲ +' : dd < 0 ? '▼ ' : '● ') + dd + '</span></div>' +
              '<div class="meter s-' + l + '"><i style="width:' + Math.round(x.s) + '%"></i></div><span class="q">' + x.f.q + '</span></button>';
          }).join('') + '</div></div>' +
        tile('mfa', 'Accounts with two-step login') + tile('mttd', 'Mean time to detect') + tile('phish', 'Phishing test click rate') +
        '<div class="card s3 stat"><span class="label">Open incidents</span><span class="v">' + openInc + '</span><div class="f"><span class="sub">' +
          (scn() ? 'Including the running simulation' : 'Being traced right now') + '</span><button class="link-btn" data-go="trace">Trace →</button></div></div>' +
        '<div class="card s7"><div class="card-h"><div><span class="label">Phishing e-mails blocked</span><h3 style="margin-top:4px">' + b.total.toLocaleString('en-GB') + ' <span class="sub" style="font-weight:400">in the last ' + RANGES[state.range].name + '</span></h3></div><span class="sub">per ' + RANGES[state.range].step + '</span></div><div class="chart" id="blockedChart"></div></div>' +
        '<div class="card s5"><div class="card-h"><span class="label">Top cyber risks</span><button class="link-btn" data-go="challenges">All challenges →</button></div><ul class="mini-list">' +
          topRisks.map(function (r) { return '<li><span class="id">' + r.id + '</span><span class="t">' + r.title + '</span><span class="score-badge lv' + riskLv(r.l, r.i) + '">' + (r.l * r.i) + '</span></li>'; }).join('') + '</ul></div>' +
        '<div class="card s12"><div class="card-h"><span class="label">Beyond cyber: the wider resilience of the school</span><button class="link-btn" data-go="wider">Open →</button></div><div class="wider-strip">' +
          D.wider.map(function (w) {
            var sc = mean(w.kpis.map(function (k) { return score(k, k.value); })), l = level(sc);
            return '<button class="wchip" data-go="wider"><span class="nm">' + w.name + '</span><div class="row"><span class="v">' + Math.round(sc) + '</span>' + chip(l) + '</div><div class="meter s-' + l + '"><i style="width:' + Math.round(sc) + '%"></i></div></button>';
          }).join('') + '</div></div>' +
      '</div>';
    if (state.view === 'command') columnChart($('blockedChart'), b.pts);
    var goal = Math.round(m.score), node = $('scoreNum');
    if (shownScore != null && shownScore !== goal) {
      var from = shownScore, t0 = performance.now();
      node.textContent = String(from);
      requestAnimationFrame(function frame(t) { var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 3); node.textContent = String(Math.round(from + (goal - from) * e)); if (p < 1) requestAnimationFrame(frame); });
    }
    shownScore = goal;
  }

  function renderChallenges() {
    var cells = '';
    for (var imp = 5; imp >= 1; imp--) for (var lik = 1; lik <= 5; lik++) {
      var here = D.risks.filter(function (r) { return r.l === lik && r.i === imp; });
      cells += '<div class="cell c' + riskLv(lik, imp) + '">' + here.map(function (r) {
        return '<button class="rdot' + (r.cyber ? ' cy' : '') + (state.selRisk === r.id ? ' on' : '') + '" data-risk="' + r.id + '" title="' + r.title + '">' + r.id + '</button>';
      }).join('') + '</div>';
    }
    var mv = { up: '↑ rising', flat: '→ stable', down: '↓ falling' };
    $('v-challenges').innerHTML =
      '<p class="lead">The answer to the homework question: <b>what are the resilience challenges for the Hotelschool?</b> Six of the ten are cyber risks. R5 is what students run into every week: a confusing platform and messages spread over too many channels.</p>' +
      '<div class="grid"><div class="card s5"><div class="card-h"><span class="label">Likelihood × impact</span></div>' +
        '<div class="matrix-wrap"><div class="matrix-y">Impact →</div><div><div class="matrix">' + cells + '</div>' +
        '<div class="axis-x"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div><div class="axis-xl">Likelihood →</div></div></div>' +
        '<div class="legend"><span><i class="ring"></i>Cyber risk</span><span><i class="lv1"></i>Low</span><span><i class="lv2"></i>Medium</span><span><i class="lv3"></i>High</span><span><i class="lv4"></i>Critical</span></div></div>' +
      '<div class="card s7"><div class="card-h"><span class="label">Ranked by score</span><span class="sub">score = likelihood × impact</span></div><ol class="risk-list">' +
        D.risks.slice().sort(function (a, b) { return b.l * b.i - a.l * a.i || b.i - a.i; }).map(function (r) {
          return '<li data-risk="' + r.id + '" class="' + (state.selRisk === r.id ? 'on' : '') + '"><span class="rid">' + r.id + '</span><div><div class="tt">' + r.title + '</div><div class="fx">' +
            (r.cyber ? '<span class="pill cyber" style="padding:0 7px;margin-right:6px">Cyber</span>' : '') + 'Fix: ' + r.fix + '</div></div>' +
            '<div class="rs"><span class="score-badge lv' + riskLv(r.l, r.i) + '">' + (r.l * r.i) + '</span><span class="mv">' + mv[r.move] + '</span></div></li>';
        }).join('') + '</ol></div></div>';
  }

  function renderDefences(m) {
    $('v-defences').innerHTML =
      '<p class="lead">The dashboard follows the <b>NIST Cybersecurity Framework 2.0</b>, the standard most organisations use: six functions, three KPIs each, every KPI with a target and a trend. Click a KPI to see why it matters.</p>' +
      '<div class="grid">' + m.fns.map(function (x) {
        var l = level(x.s);
        return '<div class="card s4 fn-card"><div class="head">' + ring(x.s) + '<div><h3>' + x.f.name + '</h3><p class="q">' + x.f.q + '</p></div><span style="margin-left:auto">' + chip(l) + '</span></div>' +
          x.kpis.map(function (y) {
            var kl = kpiLevel(y.s), open = state.openKpi[y.k.id];
            return '<div class="kpi' + (open ? ' open' : '') + (y.changed ? ' changed' : '') + '"><button class="nb" data-kpi="' + y.k.id + '" aria-expanded="' + !!open + '"><span class="n">' + y.k.name + '</span><span class="t">' + target(y.k) + '</span></button>' +
              spark(y.pts, y.changed) + '<div class="val"><span class="x">' + fmt(y.k, y.v) + '</span>' + chip(kl) + '</div><p class="why">' + y.k.why + '</p></div>';
          }).join('') + '</div>';
      }).join('') + '</div>';
  }

  function renderSurface() {
    var sc = scn(), sys = D.systems;
    var high = sys.filter(function (s) { return s.data === 'High'; }).length;
    var noMfa = sys.filter(function (s) { return !s.mfa; }).length;
    var noRev = sys.filter(function (s) { return !s.review; }).length;
    $('v-surface').innerHTML =
      '<p class="lead">Every system an attacker could use to get in, and what they would find there. A hotel school has a bigger attack surface than most schools: <b>it runs real outlets with real guests and real card payments.</b></p>' +
      '<div class="grid" style="margin-bottom:16px">' +
        '<div class="card s4 stat"><span class="label">Systems with sensitive data</span><span class="v">' + high + ' <small>of ' + sys.length + '</small></span><span class="sub">Passports, grades, guest and card data</span></div>' +
        '<div class="card s4 stat"><span class="label">Systems without two-step login</span><span class="v">' + noMfa + '</span><span class="sub">Shared logins in outlets and building systems</span></div>' +
        '<div class="card s4 stat"><span class="label">Suppliers not yet reviewed</span><span class="v">' + noRev + '</span><span class="sub">The Marriott 2020 lesson: partners are part of your perimeter</span></div></div>' +
      '<div class="card"><div class="table-scroll"><table class="table"><thead><tr><th>System</th><th>Used by</th><th>Data</th><th>Two-step login</th><th>Patched</th><th>Supplier review</th><th>Status</th><th>Note</th></tr></thead><tbody>' +
        sys.map(function (s) {
          var hit = sc && sc.system === s.name;
          return '<tr class="' + (hit ? 'hit' : '') + '"><td><div class="sys">' + s.name + '</div><div class="use">' + s.use + '</div></td><td class="ink2">' + s.who + '</td>' +
            '<td><span class="sens ' + s.data + '">' + s.data + '</span></td><td>' + yesNo(s.mfa) + '</td><td>' + yesNo(s.patched, 'Yes', 'Overdue') + '</td><td>' + yesNo(s.review, 'Done', 'Missing') + '</td>' +
            '<td>' + (hit ? chip('critical', 'Under attack') : chip(s.status)) + '</td><td class="note">' + s.note + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
  }

  function simHours(sc) { return Math.min(sc.stages.r * 1.02, (performance.now() - state.simT0) / 1000 / 16 * sc.stages.r); }
  function incidents() {
    var list = D.incidents.filter(function (x) { return state.incFilter === 'all' || x.cyber; });
    var sc = scn();
    if (sc) list = [{ id: 'SIM', sim: true, kind: 'Simulation', cyber: true, sev: 3, status: 'live',
      start: new Date(Date.now() - simHours(sc) * 3600000).toISOString(), title: sc.name + ' (simulation)',
      how: 'Started from the attack simulator. The clock runs fast: ' + fmtDur(sc.stages.r) + ' in about 16 seconds.',
      d: sc.stages.d, c: sc.stages.c, r: sc.stages.r, rto: sc.rto, cause: sc.blurb,
      lesson: 'Written after the exercise: which step was slowest, and which KPI warned us first?' }].concat(list);
    return list;
  }
  function renderTrace() {
    var list = incidents(), real = list.filter(function (x) { return !x.sim; });
    var closed = real.filter(function (x) { return x.status === 'closed'; });
    var within = closed.length ? Math.round(closed.filter(function (x) { return x.r <= x.rto; }).length / closed.length * 100) : null;
    if (!list.some(function (x) { return x.id === state.selInc; })) state.selInc = list.length ? list[0].id : null;
    var labels = { live: 'Live', open: 'Open', monitoring: 'Monitoring', closed: 'Closed' };
    var x = list.filter(function (i) { return i.id === state.selInc; })[0];
    var detail = '';
    if (x) {
      var el0 = x.sim ? simHours(scn()) : (Date.now() - new Date(x.start).getTime()) / 3600000, t0 = new Date(x.start).getTime();
      var stages = [{ n: 'Started', h: 0 }, { n: 'Detected', h: x.d }, { n: 'Contained', h: x.c }, { n: 'Recovered', h: x.r }, { n: 'Lesson learned', h: x.status === 'closed' ? x.r + 48 : null }];
      var firstOpen = stages.findIndex(function (s) { return s.h == null || s.h > el0; });
      var steps = stages.map(function (s, i) {
        var done = s.h != null && s.h <= el0, cls = done ? 'done' : (i === firstOpen ? 'now' : '');
        var when = done ? (x.sim ? (s.h ? 'T+' + fmtDur(s.h) : 'T+0') : fmtDate(new Date(t0 + s.h * 3600000), true)) : (i === firstOpen ? 'In progress' : 'Waiting');
        return '<div class="step ' + cls + '"><span class="dot"></span><b>' + s.n + '</b><span>' + when + '</span>' + (done && i > 0 && !x.sim ? '<em>+' + fmtDur(s.h) + '</em>' : '') + '</div>';
      }).join('');
      var rec = x.r != null && x.r <= el0, recH = rec ? x.r : el0, ok = recH <= x.rto, maxH = Math.max(recH, x.rto) * 1.15;
      var lv = ok ? (rec ? 'good' : 'warning') : 'critical';
      var txt = rec ? (ok ? 'Recovered within target' : 'Recovered ' + fmtDur(recH - x.rto) + ' late') : (ok ? fmtDur(x.rto - recH) + ' left to target' : fmtDur(recH - x.rto) + ' over target');
      detail = '<div class="card s7"><div class="card-h"><span class="label">' + (x.sim ? 'Simulation' : x.id + ' · ' + x.kind) + ' · ' + ['', 'Low', 'Medium', 'High'][x.sev] + ' impact</span><span class="pill ' + x.status + '">' + labels[x.status] + '</span></div>' +
        '<h3 style="font-size:19px">' + x.title + '</h3><div class="steps">' + steps + '</div>' +
        '<div class="rbar"><div class="lab"><span>' + (rec ? 'Time to recover' : 'Time so far') + ' · <b>' + fmtDur(recH) + '</b> <span class="muted">(target ' + fmtDur(x.rto) + ')</span></span>' + chip(lv, txt) + '</div>' +
        '<div class="rtrack s-' + lv + '"><i style="width:' + (recH / maxH * 100).toFixed(1) + '%"></i><span class="rto" style="left:' + (x.rto / maxH * 100).toFixed(1) + '%"></span></div></div>' +
        '<dl class="facts"><dt>How we found out</dt><dd>' + x.how + '</dd><dt>Root cause</dt><dd>' + x.cause + '</dd><dt>Lesson</dt><dd>' + x.lesson + '</dd></dl></div>';
    }
    $('v-trace').innerHTML =
      '<div class="stat-row">' +
        '<div class="card stat"><span class="label">Mean time to detect</span><span class="v">' + fmtDur(mean(real.map(function (i) { return i.d; }))) + '</span></div>' +
        '<div class="card stat"><span class="label">Mean time to contain</span><span class="v">' + fmtDur(mean(real.map(function (i) { return i.c; }))) + '</span></div>' +
        '<div class="card stat"><span class="label">Mean time to recover</span><span class="v">' + (closed.length ? fmtDur(mean(closed.map(function (i) { return i.r; }))) : '–') + '</span></div>' +
        '<div class="card stat"><span class="label">Recovered within target</span><span class="v">' + (within == null ? '–' : within + '%') + '</span></div></div>' +
      '<div class="grid"><div class="card s5"><div class="card-h"><span class="label">Incidents</span><div class="seg" id="incSeg"><button data-f="all" aria-pressed="' + (state.incFilter === 'all') + '">All</button><button data-f="cyber" aria-pressed="' + (state.incFilter === 'cyber') + '">Cyber only</button></div></div>' +
        '<ul class="inc-list">' + list.map(function (i) {
          return '<li><button class="inc' + (i.sim ? ' live' : '') + '" data-inc="' + i.id + '" aria-pressed="' + (state.selInc === i.id) + '"><span class="t">' + i.title + '</span><span class="pill ' + i.status + '">' + labels[i.status] + '</span>' +
            '<span class="m"><span class="id">' + (i.sim ? 'SIM' : i.id) + '</span>' + (i.cyber ? '<span class="pill cyber" style="padding:0 7px">' + i.kind + '</span>' : '<span class="pill" style="padding:0 7px">' + i.kind + '</span>') + (i.sim ? 'now' : fmtDate(new Date(i.start))) + '</span></button></li>';
        }).join('') + '</ul></div>' + detail + '</div>';
  }

  function renderSimulator(m) {
    var sc = scn();
    var html = '<p class="lead">Pick an attack. Watch the score drop, follow the attack step by step, and see <b>which KPI would have stopped it</b>, and how much faster we recover with a playbook.</p>' +
      '<div class="scn-grid">' + D.scenarios.map(function (s) {
        return '<button class="scn" data-scn="' + s.id + '" aria-pressed="' + (state.scenario === s.id) + '">' + icon(s.icon) + '<b>' + s.name + '</b><span>Target: ' + s.system + '</span></button>';
      }).join('') + '</div>';
    if (!sc) {
      $('v-simulator').innerHTML = html + '<div class="empty-sim">Choose an attack above to start the simulation. Every page of the dashboard reacts while it runs.</div>';
      return;
    }
    var from = Math.round(state.simFrom), to = Math.round(m.score), maxH = Math.max(sc.without, sc.rto) * 1.08;
    var bar = function (label, hrs) {
      var ok = hrs <= sc.rto, lv = ok ? 'good' : 'critical';
      return '<div class="rbar"><div class="lab"><span>' + label + ' · <b>' + fmtDur(hrs) + '</b></span>' + chip(lv, ok ? 'Within target' : fmtDur(hrs - sc.rto) + ' over target') + '</div>' +
        '<div class="rtrack s-' + lv + '"><i style="width:' + (hrs / maxH * 100).toFixed(1) + '%"></i><span class="rto" style="left:' + (sc.rto / maxH * 100).toFixed(1) + '%"></span></div></div>';
    };
    html += '<div class="grid">' +
      '<div class="card s7"><div class="card-h"><span class="label">How the attack unfolds, and where it could be stopped</span><span class="pill live">Running</span></div>' +
        '<h3 style="font-size:20px;margin-bottom:6px">' + sc.name + '</h3><p class="sub" style="font-size:14px;margin-bottom:16px">' + sc.blurb + '</p>' +
        '<div class="chain">' + sc.chain.map(function (c) {
          var x = c.kpi ? m.byId[c.kpi] : null;
          return '<div class="link"><div class="box">' + c.step + '</div><div class="ctl"><b>Stopped by</b>' + c.control + (x ? '<span>' + chip(kpiLevel(x.s), 'Now ' + fmt(x.k, x.v)) + '</span>' : '<span class="muted">Not measured yet</span>') + '</div></div>';
        }).join('') + '</div>' +
        '<div class="lists" style="margin-top:18px"><div><span class="label">What breaks</span><ul class="list-x">' + sc.breaks.map(function (b) { return '<li>' + icon('x') + '<span>' + b + '</span></li>'; }).join('') + '</ul></div>' +
        '<div><span class="label">Playbook</span><ol class="list-x play">' + sc.playbook.map(function (b) { return '<li><span>' + b + '</span></li>'; }).join('') + '</ol></div></div>' +
        '<p class="bench">' + sc.benchmark + '</p></div>' +
      '<div class="card s5"><div class="card-h"><span class="label">Impact</span><button class="icon-btn" data-end="1">End simulation</button></div>' +
        '<div class="drop"><div><span class="sub">Score before</span><span class="big">' + from + '</span></div><div><span class="sub">During the attack</span><span class="big">' + to + '</span></div><div><span class="sub">Change</span><span class="big delta down">' + (to - from) + '</span></div></div>' +
        '<p class="sub" style="margin:10px 0 18px">Functions hit: ' + (m.fns.filter(function (f) { return f.hit; }).map(function (f) { return f.f.name; }).join(', ') || 'none') + '</p>' +
        '<span class="label">Time to recover vs target (' + fmtDur(sc.rto) + ')</span><div style="margin-top:12px">' + bar('With the playbook', sc.stages.r) + bar('Without a playbook', sc.without) + '</div>' +
        '<p class="sub">The black line is the recovery target.</p>' +
        '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button class="icon-btn" data-go="trace">Follow it in Track &amp; trace →</button><button class="icon-btn" data-go="surface">See the target system →</button></div></div>' +
      '</div>';
    $('v-simulator').innerHTML = html;
  }

  function renderHuman() {
    var max = 16, tgt = 5;
    $('v-human').innerHTML =
      '<div class="grid">' +
        '<div class="card s7 quote-card"><span class="label">What students run into</span><h2>A confusing platform is a security risk.</h2>' +
          '<p>Many students struggle to find their way around MyHotelschool: lots of sections, information in different places, and changes announced in different ways. That is an annoyance, but it is also an opening. <b style="color:var(--ink)">If students do not know what the real thing looks like, a fake login page or a fake announcement looks just as real.</b> Attackers count on exactly that.</p>' +
          '<p class="who">From our own experience as students, Block A 2026. See incident INC-0417 and risk R5.</p>' +
          '<div class="qstats"><div><b>14</b><span>accounts reset after the fake login page (INC-0417)</span></div><div><b>40%</b><span>missed a deadline change posted in one place (INC-0409)</span></div><div><b>3 of 3</b><span>students who reported the fake page said it “looked real”</span></div></div></div>' +
        '<div class="card s5"><div class="card-h"><span class="label">Human-factor KPIs</span></div><div style="display:flex;flex-direction:column;gap:18px">' +
          D.humanKpis.map(function (k) {
            var s = score(k, k.value), l = kpiLevel(s);
            return '<div class="hk"><div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px"><span class="n">' + k.name + '</span><span class="v">' + k.value + '%</span></div>' +
              '<div class="meter s-' + l + '"><i style="width:' + k.value + '%"></i></div>' + chip(l, target(k)) + '<span class="w">' + k.why + '</span></div>';
          }).join('') + '</div></div>' +
        '<div class="card s7"><div class="card-h"><div><span class="label">Phishing test click rate by group</span><h3 style="margin-top:4px">First-years click almost three times as often as support staff</h3></div><span class="sub">line = target 5%</span></div><div class="hbars">' +
          D.groups.map(function (g) {
            return '<div class="hbar"><span>' + g.name + '</span><div class="tr"><span class="fl" style="width:' + (g.v / max * 85) + '%"></span><span class="n">' + g.v + '%</span><span class="tg" style="left:' + (tgt / max * 85) + '%"></span></div></div>';
          }).join('') + '</div><p class="sub" style="margin-top:14px">New students meet the most new systems at once, before they know what normal looks like.</p></div>' +
        '<div class="card s5"><div class="card-h"><span class="label">Five fixes that cost almost nothing</span></div><ul class="fixes">' +
          D.fixes.map(function (f, i) { return '<li><span class="k">' + (i + 1) + '</span><div><b>' + f.t + '</b><span>' + f.d + '</span></div></li>'; }).join('') + '</ul>' +
          '<button class="icon-btn" data-go="live" style="margin-top:16px">Test the room: Spot the phish →</button></div>' +
      '</div>';
  }

  var AREAS = { cyber: 'Cyber & data', learning: 'Platform & communication', campus: 'Campus & outlets', people: 'People', finance: 'Finance & intake', reputation: 'Reputation & trust' };
  function renderLiveStatic() {
    var url = new URL('report.html', location.href).href;
    $('v-live').innerHTML =
      '<p class="lead">Scan the code. First <b>spot the phish</b>: three e-mails, real or fake? Then report a problem you have run into at school. Results appear here within seconds.</p>' +
      '<div class="grid">' +
        '<div class="card s4 qr-card"><div class="qr" id="qr"></div><div><h3>Scan to join</h3><p class="qr-url">' + url.replace(/^https?:\/\//, '') + '</p></div></div>' +
        '<div class="card s4"><div class="card-h"><span class="label">Spot the phish: the room</span><span class="sub" id="quizState">Connecting…</span></div><div id="quizBox"></div></div>' +
        '<div class="card s4"><div class="card-h"><span class="label">Reported problems</span><span class="sub" id="feedState"></span></div><ul class="feed" id="feed"></ul>' +
          '<div class="presenter"><label for="pcode">Presenter code</label><input id="pcode" type="password" autocomplete="off" placeholder="to hide posts"></div></div>' +
      '</div>';
    if (window.QRCode) new window.QRCode($('qr'), { text: url, width: 224, height: 224, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    else $('qr').textContent = 'QR library did not load. Use the link below.';
    var pc = $('pcode'); pc.value = state.pcode;
    pc.addEventListener('change', function () { state.pcode = pc.value.trim(); try { sessionStorage.setItem('rr-pcode', state.pcode); } catch (e) {} renderFeed(); });
  }
  function renderQuiz() {
    var q = state.quiz, box = $('quizBox'); if (!box) return;
    if (!q || !q.n) { box.innerHTML = '<div class="feed"><div class="empty">Nobody has taken the test yet. Scan the code.</div></div>'; return; }
    var pcts = [q.q1, q.q2, q.q3].map(function (c) { return Math.round(c / q.n * 100); });
    var worst = pcts.indexOf(Math.min.apply(null, pcts));
    box.innerHTML = '<div style="display:flex;gap:26px;align-items:flex-end;margin-bottom:10px"><div><span class="big-n">' + q.n + '</span><div class="sub">took the test</div></div>' +
      '<div><span class="big-n">' + Math.round(q.all3 / q.n * 100) + '%</span><div class="sub">got all three right</div></div></div>' +
      D.quiz.map(function (m, i) {
        return '<div class="qbar"><div class="row"><b>' + (i + 1) + '. ' + m.subject + '</b><span>' + pcts[i] + '% right</span></div><div class="meter s-' + kpiLevel(pcts[i] >= 90 ? 100 : pcts[i]) + '"><i style="width:' + pcts[i] + '%"></i></div>' +
          '<span class="mono">' + (m.fake ? 'FAKE' : 'REAL') + ' · ' + m.addr + (i === worst && pcts[i] < 100 ? ' · fooled the most people' : '') + '</span></div>';
      }).join('');
  }
  function renderFeed() {
    var feed = $('feed'); if (!feed) return;
    feed.innerHTML = '';
    if (!state.reports.length) feed.appendChild(el('li', 'empty', 'No reports yet.'));
    state.reports.slice(0, 30).forEach(function (r) {
      var li = el('li', state.fresh[r.id] ? 'fresh' : '');
      li.appendChild(el('span', 'note', r.note));
      li.appendChild(el('span', 'meta', (AREAS[r.pillar] || r.pillar) + ' · ' + ['', 'Annoying', 'Disruptive', 'Stopped me'][r.severity] + ' · ' + ago(r.created_at)));
      if (state.pcode) {
        var b = el('button', 'hide-btn', 'Hide');
        b.addEventListener('click', function () {
          rpc('resilience_hide', { p_code: state.pcode, p_id: r.id }).then(function () { state.reports = state.reports.filter(function (x) { return x.id !== r.id; }); renderFeed(); })
            .catch(function (er) { toast('Could not hide', String(er.message || er)); });
        });
        li.appendChild(b);
      }
      feed.appendChild(li);
    });
  }

  function renderWider() {
    $('v-wider').innerHTML =
      '<p class="lead">Cyber is the sharpest risk, but resilience is wider. These five areas complete the picture, three KPIs each. The first is <b>the problem students raise most: the platform and the way information reaches them.</b></p>' +
      '<div class="grid">' + D.wider.map(function (w, i) {
        var sc = mean(w.kpis.map(function (k) { return score(k, k.value); })), l = level(sc);
        return '<div class="card ' + (i < 2 ? 's6' : 's4') + ' wcard"><div class="card-h"><h3>' + w.name + '</h3>' + chip(l, Math.round(sc) + ' · ' + STATUS[l].label) + '</div><p class="ch">' + w.challenge + '</p>' +
          w.kpis.map(function (k) {
            return '<div class="wk"><span>' + k.name + '<span class="t">' + target(k) + '</span></span><span class="r"><b>' + fmt(k, k.value) + '</b>' + chip(kpiLevel(score(k, k.value))) + '</span></div>';
          }).join('') + '</div>';
      }).join('') + '</div>';
  }

  function renderMarriott() {
    $('v-marriott').innerHTML =
      '<p class="lead">The two cases from class. <b>A hotel school is a small hotel company</b>: it holds guest data, card payments and passport copies. Marriott’s lessons apply directly.</p>' +
      '<div class="grid">' + D.marriott.map(function (c) {
        return '<div class="card s6"><span class="label">' + c.year + '</span><h3 style="font-size:20px;margin-top:4px">' + c.title + '</h3><ol class="tl">' +
          c.timeline.map(function (t) { return '<li><span class="when">' + t.t + '</span>' + t.e + '</li>'; }).join('') + '</ol>' +
          '<div class="lesson">' + c.lesson + '</div><div style="margin-top:14px"><span class="label">KPIs on this dashboard that would catch it earlier</span><div class="chips">' +
          c.kpis.map(function (k) { return '<span class="chip">' + k + '</span>'; }).join('') + '</div></div></div>';
      }).join('') + '</div>';
  }

  function renderAbout() {
    var steps = [
      { n: 'Anticipate', d: 'Top challenges, scored on likelihood × impact.', p: 'Challenges' },
      { n: 'Monitor', d: '18 cyber KPIs with targets and trends.', p: 'Defences' },
      { n: 'Respond', d: 'Track & trace every incident against a recovery target.', p: 'Track & trace' },
      { n: 'Rehearse', d: 'Simulate attacks before a real one does it for us.', p: 'Simulator' },
      { n: 'Learn', d: 'Every incident ends with a lesson, and often a new KPI.', p: 'Lessons' }
    ];
    $('v-about').innerHTML =
      '<div class="grid"><div class="card s12"><div class="card-h"><span class="label">The resilience cycle behind the dashboard</span></div><div class="cycle">' +
        steps.map(function (s, i) { return '<div><i>0' + (i + 1) + ' · ' + s.p + '</i><b>' + s.n + '</b><span>' + s.d + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="card s6"><div class="card-h"><span class="label">Where the data would come from</span></div><table class="table"><tbody>' +
        D.sources.map(function (s) { return '<tr><td class="sys" style="width:110px">' + s.name + '</td><td class="ink2">' + s.from + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="card s6"><div class="card-h"><span class="label">Built with an LLM</span></div><ul class="plain">' +
        '<li>Built with <b>Claude (Anthropic)</b> for the LDD class on resilience, within the 2-hour limit.</li>' +
        '<li>Steps: brief → resilience challenges → cyber focus on NIST CSF 2.0 → KPIs and targets → page → live test in the browser.</li>' +
        '<li>Plain HTML, CSS and JavaScript. Live answers run on a free Supabase database.</li>' +
        '<li><b>All KPI values are demo data</b>, chosen to be realistic. They are not official Hotelschool figures.</li>' +
        '<li>Course link: Gillingham, <i>Tech-Enabled Hospitality</i>, ch. 8 (operations, security and guest access), and the two Marriott cases.</li></ul></div></div>';
  }

  function renderSimbar() {
    var sc = scn(), bar = $('simbar');
    if (!sc) { bar.hidden = true; bar.innerHTML = ''; return; }
    bar.hidden = false;
    bar.innerHTML = '<span class="tag">Simulation</span><span><b>' + sc.name + '</b> · target: ' + sc.system + '</span><span class="clockx" id="simClock">T+' + fmtDur(simHours(sc)) + '</span>' +
      '<button class="icon-btn" data-go="simulator">Open simulator</button><button class="icon-btn" data-end="1" style="margin-left:0">End</button>';
  }
  function renderThreat(m) {
    var sc = scn(), lv = sc ? 'critical' : level(m.score), names = { good: 'Guarded', warning: 'Elevated', serious: 'High', critical: 'Severe' };
    var n = { good: 1, warning: 2, serious: 3, critical: 5 }[lv], bars = '';
    for (var i = 0; i < 5; i++) bars += '<i style="' + (i < n ? 'background:' + LVCOLOR[lv] : '') + '"></i>';
    $('threat').innerHTML = '<span class="l">Threat level</span><span class="v">' + chip(lv, names[lv]) + '</span><div class="bars">' + bars + '</div>';
  }

  function renderAll() {
    var m = model();
    renderCommand(m); renderDefences(m); renderSurface(); renderTrace(); renderSimulator(m); renderSimbar(); renderThreat(m);
  }

  // ---------- simulation ----------
  var simTimer = null;
  function startScenario(id) {
    if (state.scenario === id) { endScenario(); return; }
    state.simFrom = model(false).score; state.scenario = id; state.simT0 = performance.now(); state.selInc = 'SIM';
    renderAll();
    clearInterval(simTimer);
    simTimer = setInterval(function () {
      var sc = scn(); if (!sc) return clearInterval(simTimer);
      var c = $('simClock'); if (c) c.textContent = 'T+' + fmtDur(simHours(sc));
      if (state.view === 'trace') renderTrace();
      if (simHours(sc) >= sc.stages.r) { clearInterval(simTimer); renderTrace(); }
    }, 300);
  }
  function endScenario() { state.scenario = null; state.simFrom = null; clearInterval(simTimer); if (state.selInc === 'SIM') state.selInc = null; renderAll(); }

  // ---------- live data ----------
  function rpc(name, body) {
    return fetch(CLOUD.rpc + name, { method: 'POST', headers: { apikey: CLOUD.key, Authorization: 'Bearer ' + CLOUD.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.message) || r.status); return j; }); });
  }
  function poll() {
    if (document.hidden) return;
    var d = new Date(), stamp = 'Live · ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    rpc('resilience_feed').then(function (rows) {
      var fresh = {};
      if (state.seen) rows.forEach(function (r) { if (!state.seen[r.id]) fresh[r.id] = true; });
      state.seen = state.seen || {}; rows.forEach(function (r) { state.seen[r.id] = true; });
      var sig = rows.map(function (r) { return r.id; }).join();
      state.reports = rows; state.fresh = fresh;
      var nf = rows.filter(function (r) { return fresh[r.id]; })[0];
      if (nf) toast('New report · ' + (AREAS[nf.pillar] || ''), nf.note);
      if (sig !== state.sig || Date.now() - state.feedAt > 30000) { state.sig = sig; state.feedAt = Date.now(); renderFeed(); }
      if ($('feedState')) $('feedState').textContent = rows.length + ' so far';
    }).catch(function () { if ($('feedState')) $('feedState').textContent = 'Offline, retrying'; });
    rpc('resilience_quiz_results').then(function (rows) {
      var q = rows && rows[0] ? { n: +rows[0].n, q1: +rows[0].q1, q2: +rows[0].q2, q3: +rows[0].q3, all3: +rows[0].all3 } : null;
      var changed = !state.quiz || !q || state.quiz.n !== q.n;
      if (state.quiz && q && q.n > state.quiz.n && state.view !== 'live') toast('Spot the phish', q.n === 1 ? '1 person has now taken the test' : q.n + ' people have now taken the test');
      state.quiz = q;
      if (changed) renderQuiz();
      if ($('quizState')) $('quizState').textContent = stamp;
      var c = $('liveCount'); if (c) c.textContent = q && q.n ? String(q.n) : '';
    }).catch(function () { if ($('quizState')) $('quizState').textContent = 'Offline, retrying'; });
  }
  var toastTimer;
  function toast(title, text) {
    var t = $('toast'); t.innerHTML = ''; t.appendChild(el('b', '', title)); t.appendChild(document.createTextNode(text));
    t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 5000);
  }

  // ---------- events ----------
  function toggleFs() { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
  function setRange() { Array.prototype.forEach.call($('rangeSeg').querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === state.range)); }); }
  function wire() {
    document.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); location.hash = g.dataset.go; return; }
      var s = e.target.closest('[data-scn]'); if (s) { startScenario(s.dataset.scn); return; }
      if (e.target.closest('[data-end]')) { endScenario(); return; }
      var k = e.target.closest('[data-kpi]');
      if (k) { var id = k.dataset.kpi; state.openKpi[id] = !state.openKpi[id]; k.parentNode.classList.toggle('open', state.openKpi[id]); k.setAttribute('aria-expanded', String(state.openKpi[id])); return; }
      var r = e.target.closest('[data-risk]'); if (r) { state.selRisk = state.selRisk === r.dataset.risk ? null : r.dataset.risk; renderChallenges(); return; }
      var i = e.target.closest('[data-inc]'); if (i) { state.selInc = i.dataset.inc; renderTrace(); return; }
      var f = e.target.closest('#incSeg [data-f]'); if (f) { state.incFilter = f.dataset.f; renderTrace(); return; }
    });
    window.addEventListener('hashchange', function () { go(location.hash.slice(1)); });
    $('rangeSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.range = b.dataset.v; setRange();
      if (state.scenario) state.simFrom = model(false).score;
      shownScore = null; renderAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      var i = VIEWS.findIndex(function (v) { return v.id === state.view; });
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { location.hash = VIEWS[Math.min(VIEWS.length - 1, i + 1)].id; e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { location.hash = VIEWS[Math.max(0, i - 1)].id; e.preventDefault(); }
      if (e.key === 'f' || e.key === 'F') toggleFs();
      if (e.key === 'Escape' && state.scenario) endScenario();
    });
    $('themeBtn').addEventListener('click', function () {
      var root = document.documentElement, next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next); try { localStorage.setItem('rr-theme', next); } catch (e) {}
    });
    $('fsBtn').addEventListener('click', toggleFs);
    $('menuBtn').addEventListener('click', function () { $('side').classList.add('open'); $('scrim').classList.add('on'); });
    $('scrim').addEventListener('click', function () { $('side').classList.remove('open'); $('scrim').classList.remove('on'); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (state.view === 'command') columnChart($('blockedChart'), blocked().pts); }, 150); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
  }
  function tick() { var d = new Date(); $('clock').textContent = fmtDate(d) + ' · ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }

  renderNav(); setRange();
  renderChallenges(); renderHuman(); renderLiveStatic(); renderWider(); renderMarriott(); renderAbout();
  wire();
  go(location.hash.slice(1) || 'command');
  renderAll(); renderFeed(); renderQuiz();
  if (state.view === 'command') columnChart($('blockedChart'), blocked().pts);
  tick(); setInterval(tick, 1000);
  poll(); setInterval(poll, 4000);
  setInterval(function () { if (!state.scenario && state.view === 'trace') renderTrace(); }, 60000);
})();
