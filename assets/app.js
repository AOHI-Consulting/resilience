(function () {
  'use strict';

  var D = window.RR;
  var CLOUD = { rpc: 'https://fziyuauwrfdmiomwelij.supabase.co/rest/v1/rpc/', key: 'sb_publishable_ADg1MNwF3XHtn0bdRYv8cw_NfdZomZ6' };
  var $ = function (id) { return document.getElementById(id); };

  var state = {
    range: '30d', campus: 'All', scenario: null, simT0: 0, simFrom: null,
    selInc: null, selRisk: null, openKpi: {}, reports: [], seen: null, pcode: ''
  };
  try { state.pcode = sessionStorage.getItem('rr-pcode') || ''; } catch (e) {}

  var RANGES = {
    '7d': { n: 7, step: 'day', days: 7, f: 0.6, label: '7 days ago' },
    '30d': { n: 30, step: 'day', days: 30, f: 1.2, label: '30 days ago' },
    '90d': { n: 13, step: 'week', days: 91, f: 2, label: '90 days ago' },
    '12m': { n: 12, step: 'month', days: 365, f: 3.2, label: '12 months ago' }
  };

  // ---------- icons ----------
  var ICON = {
    cyber: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    learning: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    campus: '<path d="M4 21V6l8-3 8 3v15"/><path d="M9 21v-5h6v5M8 9h1M15 9h1M8 13h1M15 13h1"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c2.8 0 5 2.2 5 5"/>',
    finance: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    reputation: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 01-.5-9 6 6 0 0111.5 1.5A3.75 3.75 0 0117.5 18z"/><path d="M10 12l4 4M14 12l-4 4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    chart: '<path d="M4 4v16h16"/><path d="M7 9l4 4 3-3 5 6"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M17 3l4 4M21 3l-4 4"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }

  var STATUS = {
    good: { label: 'On target', svg: '<circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M4.8 8.3l2.1 2.1 4.3-4.6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    warning: { label: 'Watch', svg: '<path d="M8 1.2l7.2 13H.8z" fill="currentColor" stroke="currentColor" stroke-linejoin="round"/><path d="M8 5.6v4" stroke="#1a1a19" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="12" r="1" fill="#1a1a19"/>' },
    serious: { label: 'At risk', svg: '<path d="M8 .6l7.4 7.4L8 15.4.6 8z" fill="currentColor"/><path d="M8 4.6v4.2" stroke="#1a1a19" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.2" r="1" fill="#1a1a19"/>' },
    critical: { label: 'Critical', svg: '<path d="M5 1h6l4 4v6l-4 4H5l-4-4V5z" fill="currentColor"/><path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' }
  };
  function level(score) { return score >= 80 ? 'good' : score >= 60 ? 'warning' : score >= 40 ? 'serious' : 'critical'; }
  // A single KPI is only "on target" when it meets its target; otherwise its score decides how bad.
  function kpiLevel(s) { return s >= 99.99 ? 'good' : s >= 60 ? 'warning' : s >= 40 ? 'serious' : 'critical'; }
  function statusChip(lv, text) {
    return '<span class="status s-' + lv + '"><svg viewBox="0 0 16 16" aria-hidden="true">' + STATUS[lv].svg + '</svg>' + (text || STATUS[lv].label) + '</span>';
  }

  // ---------- numbers ----------
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = seed;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function clampK(k, v) {
    var hi = Infinity;
    if (k.unit === '%' && Math.max(k.good, k.bad, k.value) <= 100) hi = 100;
    if (k.unit === '/10') hi = 10;
    if (k.unit === '/5') hi = 5;
    return Math.max(0, Math.min(hi, v));
  }
  function baseValue(k, campus) {
    if (campus === 'All') return k.value;
    var r = rng(hash(k.id + ':campus'))();
    if (k.int) { var th = Math.round(k.value * (0.3 + r * 0.4)); return campus === 'The Hague' ? th : k.value - th; }
    var off = (r - 0.5) * 2 * k.vol * 1.3;
    return clampK(k, campus === 'The Hague' ? k.value + off : k.value - off);
  }
  var seriesCache = {};
  function baseSeries(k) {
    var key = k.id + '|' + state.campus + '|' + state.range;
    if (seriesCache[key]) return seriesCache[key];
    var R = RANGES[state.range], n = R.n;
    var end = baseValue(k, state.campus);
    var rand = rng(hash(key));
    var dir = Math.sign(k.good - k.bad);
    var start = end - k.trend * dir * k.vol * R.f;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var v = start + (end - start) * t + (i === n - 1 ? 0 : (rand() - 0.5) * k.vol * 1.1);
      v = clampK(k, v);
      if (k.int) v = Math.max(0, Math.round(v));
      pts.push(v);
    }
    seriesCache[key] = pts;
    return pts;
  }
  function score(k, v) { return Math.max(0, Math.min(1, (v - k.bad) / (k.good - k.bad))) * 100; }
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / (a.length || 1); }
  function activeScenario() { return state.scenario ? D.scenarios.filter(function (s) { return s.id === state.scenario; })[0] : null; }

  function model(withScenario) {
    var n = RANGES[state.range].n;
    var sc = withScenario === false ? null : activeScenario();
    var ks = D.kpis.map(function (k) {
      var pts = baseSeries(k).slice();
      var changed = false;
      if (sc && sc.impact[k.id] != null && sc.impact[k.id] !== pts[n - 1]) { pts[n - 1] = sc.impact[k.id]; changed = true; }
      return { k: k, pts: pts, v: pts[n - 1], v0: pts[0], s: score(k, pts[n - 1]), changed: changed };
    });
    var pillars = D.pillars.map(function (p) {
      var mine = ks.filter(function (x) { return x.k.pillar === p.id; });
      var at = function (i) { return mean(mine.map(function (x) { return score(x.k, x.pts[i]); })); };
      var weakest = mine.slice().sort(function (a, b) { return a.s - b.s; })[0];
      return { p: p, kpis: mine, s: at(n - 1), s0: at(0), at: at, weakest: weakest, hit: mine.some(function (x) { return x.changed; }) };
    });
    var idx = [];
    for (var i = 0; i < n; i++) idx.push(mean(pillars.map(function (pl) { return pl.at(i); })));
    return { ks: ks, pillars: pillars, idx: idx, index: idx[n - 1], index0: idx[0] };
  }

  function fmt(k, v) {
    var s = k.dec ? v.toFixed(1) : String(Math.round(v));
    if (k.unit === '%') return s + '%';
    if (k.unit === 'h') return s + ' h';
    if (k.unit === '') return s;
    return s + '<small>' + k.unit + '</small>';
  }
  function fmtPlain(k, v) { return fmt(k, v).replace(/<[^>]+>/g, ''); }
  function target(k) {
    var lower = k.good < k.bad;
    var g = k.dec ? k.good.toFixed(1) : k.good;
    var u = k.unit === '%' ? '%' : k.unit === 'h' ? ' h' : k.unit;
    if (k.good === 0) return 'Target 0';
    return 'Target ' + (lower ? '≤ ' : '≥ ') + g + u;
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
  function fmtDate(d, withTime) {
    var s = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    return withTime ? s + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : s;
  }
  function pointDate(i, n) {
    var d = new Date(), back = n - 1 - i, st = RANGES[state.range].step;
    if (st === 'day') d.setDate(d.getDate() - back);
    else if (st === 'week') d.setDate(d.getDate() - 7 * back);
    else d.setMonth(d.getMonth() - back);
    return d;
  }
  function pointLabel(i, n) {
    var d = pointDate(i, n);
    if (RANGES[state.range].step === 'month') return MONTHS[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    return Math.floor(s / 86400) + ' days ago';
  }
  function pillarName(id) { return D.pillars.filter(function (p) { return p.id === id; })[0].name; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ---------- charts ----------
  function sparkline(pts, changed) {
    var w = 84, h = 30, p = 4;
    var lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var x = function (i) { return p + i * (w - 2 * p) / (pts.length - 1); };
    var y = function (v) { return p + (hi - v) / (hi - lo) * (h - 2 * p); };
    var d = pts.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join('');
    var lx = x(pts.length - 1), ly = y(pts[pts.length - 1]);
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' +
      '<path d="' + d + '" fill="none" style="stroke:var(--muted)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + lx + '" cy="' + ly + '" r="3.5" style="fill:' + (changed ? 'var(--critical)' : 'var(--accent)') + ';stroke:var(--surface)" stroke-width="2"/></svg>';
  }

  function indexChart(m) {
    var box = $('indexChart');
    var w = Math.max(260, box.clientWidth || 400), h = 150, pl = 30, pr = 44, pt = 10, pb = 24;
    var pts = m.idx, n = pts.length;
    var lo = Math.floor((Math.min.apply(null, pts) - 3) / 10) * 10;
    var hi = Math.max(90, Math.ceil((Math.max.apply(null, pts) + 3) / 10) * 10);
    lo = Math.max(0, Math.min(lo, 50));
    var x = function (i) { return pl + i * (w - pl - pr) / (n - 1); };
    var y = function (v) { return pt + (hi - v) / (hi - lo) * (h - pt - pb); };
    var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" height="' + h + '" role="img" aria-label="Resilience index over the selected period">';
    for (var t = lo; t <= hi; t += 10) {
      s += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + y(t) + '" y2="' + y(t) + '" style="stroke:var(--grid)" stroke-width="1"/>';
      s += '<text x="' + (pl - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end" font-size="11" style="fill:var(--muted);font-variant-numeric:tabular-nums">' + t + '</text>';
    }
    s += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + y(80) + '" y2="' + y(80) + '" style="stroke:var(--good)" stroke-width="1" stroke-opacity=".7"/>';
    s += '<text x="' + (w - pr + 4) + '" y="' + (y(80) + 4) + '" font-size="11" style="fill:var(--ink-2)">Target</text>';
    var line = pts.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join('');
    s += '<path d="' + line + 'L' + x(n - 1) + ' ' + y(lo) + 'L' + x(0) + ' ' + y(lo) + 'Z" style="fill:var(--accent)" fill-opacity=".10"/>';
    s += '<path d="' + line + '" fill="none" style="stroke:var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    var lastC = state.scenario ? 'var(--critical)' : 'var(--accent)';
    s += '<circle cx="' + x(n - 1) + '" cy="' + y(pts[n - 1]) + '" r="4.5" style="fill:' + lastC + ';stroke:var(--surface)" stroke-width="2"/>';
    s += '<text x="' + (x(n - 1) + 8) + '" y="' + (y(pts[n - 1]) - 6) + '" font-size="12" font-weight="600" style="fill:var(--ink)">' + Math.round(pts[n - 1]) + '</text>';
    [0, Math.floor((n - 1) / 2), n - 1].forEach(function (i, j) {
      var anchor = j === 0 ? 'start' : j === 2 ? 'end' : 'middle';
      s += '<text x="' + x(i) + '" y="' + (h - 6) + '" text-anchor="' + anchor + '" font-size="11" style="fill:var(--muted)">' + (i === n - 1 ? 'Today' : pointLabel(i, n)) + '</text>';
    });
    s += '<line id="xhair" y1="' + pt + '" y2="' + (h - pb) + '" style="stroke:var(--axis)" stroke-width="1" opacity="0"/>';
    s += '<circle id="xdot" r="4" style="fill:var(--accent);stroke:var(--surface)" stroke-width="2" opacity="0"/>';
    s += '<rect x="' + pl + '" y="0" width="' + (w - pl - pr) + '" height="' + h + '" fill="transparent" id="xhit" tabindex="0" aria-label="Move along the chart to read values"/>';
    s += '</svg><div class="tip" id="xtip"></div>';
    box.innerHTML = s;
    $('indexCaption').textContent = 'Index over the last ' + ({ '7d': '7 days', '30d': '30 days', '90d': '90 days', '12m': '12 months' })[state.range] + (state.scenario ? ' · last point = stress test' : '');

    var hit = $('xhit'), tip = $('xtip'), xh = $('xhair'), xd = $('xdot');
    function show(i) {
      xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('opacity', 1);
      xd.setAttribute('cx', x(i)); xd.setAttribute('cy', y(pts[i])); xd.setAttribute('opacity', 1);
      tip.innerHTML = '<strong>' + Math.round(pts[i]) + '</strong><span class="k"><span class="key"></span>Index · ' + (i === n - 1 ? 'today' : pointLabel(i, n)) + '</span>';
      var px = x(i) / w * box.clientWidth;
      tip.style.left = Math.min(box.clientWidth - 140, Math.max(0, px - 60)) + 'px';
      tip.style.top = '-6px';
      tip.style.opacity = 1;
    }
    function hide() { xh.setAttribute('opacity', 0); xd.setAttribute('opacity', 0); tip.style.opacity = 0; }
    hit.addEventListener('pointermove', function (e) {
      var r = box.getBoundingClientRect();
      var sx = (e.clientX - r.left) / r.width * w;
      show(Math.max(0, Math.min(n - 1, Math.round((sx - pl) / (w - pl - pr) * (n - 1)))));
    });
    hit.addEventListener('pointerleave', hide);
    var fi = n - 1;
    hit.addEventListener('focus', function () { fi = n - 1; show(fi); });
    hit.addEventListener('blur', hide);
    hit.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { fi = Math.max(0, fi - 1); show(fi); e.preventDefault(); }
      if (e.key === 'ArrowRight') { fi = Math.min(n - 1, fi + 1); show(fi); e.preventDefault(); }
    });

    var tb = '<table class="data"><thead><tr><th>Date</th><th class="n">Index</th></tr></thead><tbody>';
    for (var i = n - 1; i >= 0; i--) tb += '<tr><td>' + (i === n - 1 ? 'Today' : pointLabel(i, n)) + '</td><td class="n">' + Math.round(pts[i]) + '</td></tr>';
    $('indexTable').innerHTML = tb + '</tbody></table>';
  }

  // ---------- overview ----------
  var shownIndex = null;
  function animateNumber(node, from, to, ms) {
    var t0 = performance.now();
    function frame(t) {
      var p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      node.firstChild.nodeValue = String(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function renderOverview(m) {
    var num = $('heroNum');
    var goal = Math.round(m.index);
    if (shownIndex == null || shownIndex === goal) num.firstChild.nodeValue = String(goal);
    else animateNumber(num, shownIndex, goal, state.scenario ? 1400 : 500);
    shownIndex = goal;
    var lv = level(m.index);
    $('heroStatus').innerHTML = statusChip(lv);
    var dlt = Math.round(m.index - m.index0);
    var dEl = $('heroDelta');
    dEl.className = 'delta ' + (dlt > 0 ? 'up' : dlt < 0 ? 'down' : 'flat');
    dEl.textContent = (dlt > 0 ? '▲ +' : dlt < 0 ? '▼ ' : '● ') + dlt + ' vs ' + RANGES[state.range].label;
    var sorted = m.pillars.slice().sort(function (a, b) { return a.s - b.s; });
    var read = 'Weakest: ' + sorted[0].p.name + ' (' + Math.round(sorted[0].s) + ') and ' + sorted[1].p.name + ' (' + Math.round(sorted[1].s) + '). Strongest: ' + sorted[5].p.name + ' (' + Math.round(sorted[5].s) + ').';
    if (state.scenario) read = 'Stress test running. ' + read;
    $('heroRead').textContent = read;
    indexChart(m);

    var html = '';
    m.pillars.forEach(function (pl) {
      var lvp = level(pl.s), w = pl.weakest, d = Math.round(pl.s - pl.s0);
      html += '<button class="card pillar' + (pl.hit ? ' hit' : '') + '" data-pillar="' + pl.p.id + '" aria-label="' + pl.p.name + ', score ' + Math.round(pl.s) + ', ' + STATUS[lvp].label + '. Show its KPIs">' +
        '<div class="pillar-head">' + icon(pl.p.id) + '<h3>' + pl.p.name + '</h3></div>' +
        '<div class="pillar-score"><span class="v">' + Math.round(pl.s) + '</span>' + statusChip(lvp) +
        '<span class="delta ' + (d > 0 ? 'up' : d < 0 ? 'down' : 'flat') + '" style="font-size:12px">' + (d > 0 ? '▲ +' : d < 0 ? '▼ ' : '● ') + d + '</span></div>' +
        '<div class="meter s-' + lvp + '"><i style="width:' + Math.round(pl.s) + '%"></i></div>' +
        '<p class="weak">Weakest: <b>' + w.k.name + '</b> ' + fmtPlain(w.k, w.v) + ' (' + target(w.k).toLowerCase() + ')</p></button>';
    });
    $('pillars').innerHTML = html;
  }

  // ---------- stress test ----------
  function renderScenarioButtons() {
    $('scenarios').innerHTML = D.scenarios.map(function (s) {
      return '<button class="scn" data-scn="' + s.id + '" aria-pressed="' + (state.scenario === s.id) + '">' + icon(s.icon) + '<span>' + s.name + '</span></button>';
    }).join('');
  }
  var simTimer = null;
  function simHours(sc) {
    var secs = (performance.now() - state.simT0) / 1000;
    return Math.min(sc.stages.r * 1.02, secs / 16 * sc.stages.r);
  }
  function renderSim(m) {
    var box = $('sim'), sc = activeScenario();
    $('resetBtn').hidden = !sc;
    if (!sc) { box.className = 'sim'; box.innerHTML = ''; return; }
    var hitP = m.pillars.filter(function (p) { return p.hit; }).map(function (p) { return p.p.name; });
    var from = Math.round(state.simFrom), to = Math.round(m.index);
    var maxH = Math.max(sc.without, sc.rto) * 1.08;
    function bar(label, hrs) {
      var ok = hrs <= sc.rto;
      var lv = ok ? 'good' : 'critical';
      var txt = ok ? 'Within target' : fmtDur(hrs - sc.rto) + ' over target';
      return '<div><div class="rbar-label"><span>' + label + ' · <b>' + fmtDur(hrs) + '</b></span>' + statusChip(lv, txt) + '</div>' +
        '<div class="rtrack s-' + lv + '"><i style="width:' + (hrs / maxH * 100).toFixed(1) + '%"></i><span class="rto" style="left:' + (sc.rto / maxH * 100).toFixed(1) + '%"></span></div></div>';
    }
    box.className = 'sim on';
    box.innerHTML =
      '<div class="card">' +
        '<div class="sim-banner"><span class="pulse-dot"></span>Stress test running</div>' +
        '<h3>' + sc.name + '</h3><p class="blurb">' + sc.blurb + '</p>' +
        '<p class="bench">' + sc.benchmark + '</p>' +
        '<div class="cols2"><div><div class="h4">What breaks</div><ul class="list-x breaks">' +
          sc.breaks.map(function (b) { return '<li>' + icon('x') + '<span>' + b + '</span></li>'; }).join('') + '</ul></div>' +
        '<div><div class="h4">Playbook</div><ol class="list-x play">' +
          sc.playbook.map(function (b) { return '<li><span>' + b + '</span></li>'; }).join('') + '</ol></div></div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="h4">Impact on the index</div>' +
        '<div class="drop"><div><span class="muted" style="font-size:12px">Before</span><span class="big">' + from + '</span></div>' +
        '<div><span class="muted" style="font-size:12px">During the test</span><span class="big">' + to + '</span></div>' +
        '<div><span class="muted" style="font-size:12px">Change</span><span class="big delta down">' + (to - from) + '</span></div></div>' +
        '<p class="sub">Areas hit: ' + (hitP.join(', ') || 'none') + '</p>' +
        '<div class="h4" style="margin-top:16px">Time to recover vs target</div>' +
        '<div class="recov">' + bar('With the playbook', sc.stages.r) + bar('Without a playbook', sc.without) + '</div>' +
        '<p class="rto-key" style="margin-top:10px"><i></i>Recovery target: ' + fmtDur(sc.rto) + '</p>' +
      '</div>';
  }
  function startScenario(id) {
    if (state.scenario === id) { endScenario(); return; }
    state.simFrom = model(false).index;
    state.scenario = id;
    state.simT0 = performance.now();
    state.selInc = 'SIM';
    renderScenarioButtons();
    renderAll();
    clearInterval(simTimer);
    simTimer = setInterval(function () {
      var sc = activeScenario();
      if (!sc) return clearInterval(simTimer);
      renderTrace();
      if (simHours(sc) >= sc.stages.r) clearInterval(simTimer);
    }, 250);
  }
  function endScenario() {
    state.scenario = null; state.simFrom = null;
    if (state.selInc === 'SIM') state.selInc = null;
    clearInterval(simTimer);
    renderScenarioButtons();
    renderAll();
  }

  // ---------- challenges ----------
  function riskLevel(r) { var s = r.l * r.i; return s <= 4 ? 1 : s <= 9 ? 2 : s <= 14 ? 3 : 4; }
  function renderRisks() {
    var cells = '';
    for (var imp = 5; imp >= 1; imp--) {
      for (var lik = 1; lik <= 5; lik++) {
        var here = D.risks.filter(function (r) { return r.l === lik && r.i === imp; });
        cells += '<div class="cell lv' + riskLevel({ l: lik, i: imp }) + '">' + here.map(function (r) {
          return '<button class="rdot' + (state.selRisk === r.id ? ' on' : '') + '" data-risk="' + r.id + '" title="' + r.title + '">' + r.id + '</button>';
        }).join('') + '</div>';
      }
    }
    $('matrix').innerHTML = cells;
    var arrows = { up: '↑ rising', flat: '→ stable', down: '↓ falling' };
    $('riskList').innerHTML = D.risks.slice().sort(function (a, b) { return b.l * b.i - a.l * a.i || b.i - a.i; }).map(function (r) {
      return '<li data-risk="' + r.id + '" class="' + (state.selRisk === r.id ? 'on' : '') + '"><span class="rid">' + r.id + '</span>' +
        '<div><div>' + r.title + '</div><div class="fix">' + pillarName(r.pillar) + ' · Fix: ' + r.fix + '</div></div>' +
        '<div class="score">' + (r.l * r.i) + '<div class="arrow">' + arrows[r.move] + '</div></div></li>';
    }).join('');
  }

  // ---------- track & trace ----------
  function incidents() {
    var R = RANGES[state.range], now = Date.now();
    var list = D.incidents.filter(function (x) {
      var age = (now - new Date(x.start).getTime()) / 86400000;
      var inRange = age <= R.days || x.status !== 'closed';
      var inCampus = state.campus === 'All' || x.campus === 'Both' || x.campus === state.campus;
      return inRange && inCampus;
    });
    var sc = activeScenario();
    if (sc) {
      var pid = D.kpis.filter(function (k) { return sc.impact[k.id] != null; })[0].pillar;
      list.unshift({ id: 'SIM', sim: true, pillar: pid, campus: sc.id === 'power' ? 'Amsterdam' : 'Both', sev: 3, status: 'live',
        start: new Date(Date.now() - simHours(sc) * 3600000).toISOString(), title: sc.name + ' (stress test)',
        how: 'Started from this dashboard as a stress test. The clock runs fast: ' + fmtDur(sc.stages.r) + ' in about 16 seconds.',
        d: sc.stages.d, c: sc.stages.c, r: sc.stages.r, rto: sc.rto, cause: sc.blurb,
        lesson: 'Written after the test: which playbook step was slowest, and which KPI warned us first?' });
    }
    return list;
  }
  function elapsedH(x) {
    if (x.sim) return simHours(activeScenario());
    return (Date.now() - new Date(x.start).getTime()) / 3600000;
  }
  function renderTrace() {
    var list = incidents();
    var closed = list.filter(function (x) { return x.r != null && !x.sim; });
    var mttd = mean(list.filter(function (x) { return !x.sim; }).map(function (x) { return x.d; }));
    var mttr = mean(closed.map(function (x) { return x.r; }));
    var within = closed.length ? Math.round(closed.filter(function (x) { return x.r <= x.rto; }).length / closed.length * 100) : null;
    $('incStats').innerHTML =
      '<div class="stat"><div class="l">Mean time to detect</div><div class="v">' + (list.length ? fmtDur(mttd) : '–') + '</div></div>' +
      '<div class="stat"><div class="l">Mean time to recover</div><div class="v">' + (closed.length ? fmtDur(mttr) : '–') + '</div></div>' +
      '<div class="stat"><div class="l">Recovered within target</div><div class="v">' + (within == null ? '–' : within + '%') + '</div></div>';

    if (!list.some(function (x) { return x.id === state.selInc; })) state.selInc = list.length ? list[0].id : null;
    var labels = { live: 'Live test', open: 'Open', monitoring: 'Monitoring', closed: 'Closed' };
    $('incList').innerHTML = list.length ? list.map(function (x) {
      return '<li><button class="inc' + (x.sim ? ' live' : '') + '" data-inc="' + x.id + '" aria-pressed="' + (state.selInc === x.id) + '">' +
        '<span class="id">' + (x.sim ? 'TEST' : x.id.replace('INC-', '#')) + '</span>' +
        '<span style="min-width:0"><span class="t" style="display:block">' + x.title + '</span><span class="m">' + pillarName(x.pillar) + ' · ' + x.campus + ' · ' + (x.sim ? 'now' : fmtDate(new Date(x.start))) + '</span></span>' +
        '<span class="badge ' + x.status + '">' + labels[x.status] + '</span></button></li>';
    }).join('') : '<li class="empty">No incidents for this period and campus.</li>';

    var x = list.filter(function (i) { return i.id === state.selInc; })[0];
    var box = $('traceDetail');
    if (!x) { box.innerHTML = ''; return; }
    var el0 = elapsedH(x), t0 = new Date(x.start).getTime();
    var stamp = function (h) { return fmtDate(new Date(t0 + h * 3600000), true); };
    var stages = [
      { n: 'Started', h: 0 },
      { n: 'Detected', h: x.d },
      { n: 'Contained', h: x.c },
      { n: 'Recovered', h: x.r },
      { n: 'Lesson learned', h: x.status === 'closed' ? (x.r || 0) + 48 : null }
    ];
    var firstOpen = stages.findIndex(function (s) { return s.h == null || s.h > el0; });
    var steps = stages.map(function (s, i) {
      var done = s.h != null && s.h <= el0 && x.status !== 'live' ? true : s.h != null && s.h <= el0;
      var cls = done ? 'done' : (i === firstOpen ? 'now' : '');
      var when = done ? (x.sim ? (s.h ? 'T+' + fmtDur(s.h) : 'T+0') : stamp(s.h)) : (i === firstOpen ? 'In progress' : 'Waiting');
      var dur = done && i > 0 && !x.sim ? '+' + fmtDur(s.h) : '';
      return '<div class="step ' + cls + '"><span class="dot"></span><b>' + s.n + '</b><span>' + when + '</span><span class="mono" style="font-size:11px">' + dur + '</span></div>';
    }).join('');
    var recH = x.r != null && x.r <= el0 ? x.r : el0;
    var recovered = x.r != null && x.r <= el0;
    var ok = recH <= x.rto;
    var maxH = Math.max(recH, x.rto) * 1.15;
    var lv = ok ? (recovered ? 'good' : 'warning') : 'critical';
    var txt = recovered ? (ok ? 'Recovered within target' : 'Recovered ' + fmtDur(recH - x.rto) + ' late') : (ok ? fmtDur(x.rto - recH) + ' left to target' : fmtDur(recH - x.rto) + ' over target');
    var sev = ['', 'Low', 'Medium', 'High'][x.sev];
    box.innerHTML =
      '<div class="mono muted" style="font-size:12px">' + (x.sim ? 'STRESS TEST' : x.id) + ' · ' + pillarName(x.pillar) + ' · ' + x.campus + ' · ' + sev + ' impact</div>' +
      '<h4>' + x.title + '</h4>' +
      '<div class="steps">' + steps + '</div>' +
      '<div class="rbar-label" style="margin-top:6px"><span>' + (recovered ? 'Time to recover' : 'Time so far') + ' · <b>' + fmtDur(recH) + '</b> <span class="muted">(target ' + fmtDur(x.rto) + ')</span></span>' + statusChip(lv, txt) + '</div>' +
      '<div class="rtrack s-' + lv + '"><i style="width:' + (recH / maxH * 100).toFixed(1) + '%"></i><span class="rto" style="left:' + (x.rto / maxH * 100).toFixed(1) + '%"></span></div>' +
      '<dl class="facts"><dt>How we found out</dt><dd>' + x.how + '</dd><dt>Root cause</dt><dd>' + x.cause + '</dd><dt>Lesson</dt><dd>' + x.lesson + '</dd></dl>';
  }

  // ---------- KPI board ----------
  function renderKpis(m) {
    $('kpiBoard').innerHTML = m.pillars.map(function (pl) {
      var lv = level(pl.s);
      return '<div class="card kpi-card" id="k-' + pl.p.id + '"><div class="head">' + icon(pl.p.id) + '<h3>' + pl.p.name + '</h3><span style="margin-left:auto">' + statusChip(lv, Math.round(pl.s) + ' · ' + STATUS[lv].label) + '</span></div>' +
        '<p class="q">' + pl.p.question + '</p>' +
        pl.kpis.map(function (x) {
          var klv = kpiLevel(x.s);
          return '<div class="kpi' + (state.openKpi[x.k.id] ? ' open' : '') + (x.changed ? ' changed' : '') + '">' +
            '<button class="name-btn" data-kpi="' + x.k.id + '" aria-expanded="' + !!state.openKpi[x.k.id] + '"><span class="name">' + x.k.name + '</span><span class="tgt" style="display:block">' + target(x.k) + '</span></button>' +
            sparkline(x.pts, x.changed) +
            '<div style="text-align:right"><div class="val">' + fmt(x.k, x.v) + '</div>' + statusChip(klv) + '</div>' +
            '<p class="why">' + x.k.why + '</p></div>';
        }).join('') +
        '<p class="owner">Owner: ' + pl.p.owner + '</p></div>';
    }).join('');
  }

  // ---------- live reports ----------
  function rpc(name, body) {
    return fetch(CLOUD.rpc + name, {
      method: 'POST',
      headers: { apikey: CLOUD.key, Authorization: 'Bearer ' + CLOUD.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.message) || r.status); return j; });
    });
  }
  var SEV = { 1: 'Annoying', 2: 'Disruptive', 3: 'Stopped me' };
  function renderFeed() {
    var list = state.reports.filter(function (r) { return state.campus === 'All' || r.campus === 'Both' || r.campus === state.campus; });
    var feed = $('feed');
    feed.innerHTML = '';
    if (!list.length) {
      var li = el('li', 'empty', 'No reports yet. Scan the code and be the first.');
      li.style.display = 'block';
      feed.appendChild(li);
    }
    list.slice(0, 40).forEach(function (r) {
      var li = el('li', state.fresh && state.fresh[r.id] ? 'fresh' : '');
      li.appendChild(el('span', 'note', r.note));
      li.appendChild(el('span', 'meta', pillarName(r.pillar) + ' · ' + r.campus + ' · ' + SEV[r.severity] + ' · ' + ago(r.created_at)));
      if (state.pcode) {
        var b = el('button', 'hide-btn', 'Hide');
        b.addEventListener('click', function () {
          rpc('resilience_hide', { p_code: state.pcode, p_id: r.id }).then(function () {
            state.reports = state.reports.filter(function (x) { return x.id !== r.id; });
            renderFeed();
          }).catch(function (e) { toast('Could not hide', String(e.message || e)); });
        });
        li.appendChild(b);
      }
      feed.appendChild(li);
    });
    $('feedCount').textContent = String(list.length);
    var counts = D.pillars.map(function (p) { return { p: p, n: list.filter(function (r) { return r.pillar === p.id; }).length }; });
    var max = Math.max(1, Math.max.apply(null, counts.map(function (c) { return c.n; })));
    var bars = $('feedBars');
    bars.innerHTML = '';
    counts.forEach(function (c) {
      var row = el('div', 'bar-row');
      row.appendChild(el('span', '', c.p.name));
      var tr = el('span', 'track');
      var f = el('span', 'fill');
      f.style.width = (c.n / max * 78) + '%';
      tr.appendChild(f);
      tr.appendChild(el('span', 'n', String(c.n)));
      row.appendChild(tr);
      bars.appendChild(row);
    });
  }
  function poll() {
    if (document.hidden) return;
    rpc('resilience_feed').then(function (rows) {
      var fresh = {};
      if (state.seen) rows.forEach(function (r) { if (!state.seen[r.id]) fresh[r.id] = true; });
      state.seen = state.seen || {};
      rows.forEach(function (r) { state.seen[r.id] = true; });
      var sig = rows.map(function (r) { return r.id; }).join();
      var stale = Date.now() - (state.feedAt || 0) > 30000;
      state.fresh = fresh;
      state.reports = rows;
      var ids = Object.keys(fresh);
      if (ids.length) {
        var r = rows.filter(function (x) { return fresh[x.id]; })[0];
        toast('New report · ' + pillarName(r.pillar), r.note);
      }
      if (sig !== state.sig || stale) { state.sig = sig; state.feedAt = Date.now(); renderFeed(); }
      var d = new Date();
      $('feedState').textContent = 'Live · updated ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }).catch(function () { $('feedState').textContent = 'Offline: retrying…'; });
  }
  var toastTimer;
  function toast(title, text) {
    var t = $('toast');
    t.innerHTML = '';
    t.appendChild(el('b', '', title));
    t.appendChild(document.createTextNode(text));
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 5000);
  }

  // ---------- static parts ----------
  function renderStatic() {
    $('cases').innerHTML = D.marriott.map(function (c) {
      return '<div class="card case"><div class="yr">' + c.year + '</div><h3>' + c.title + '</h3><p>' + c.facts + '</p>' +
        '<p class="lesson">' + c.lesson + '</p><div class="h4" style="margin-top:12px">On this dashboard</div><div class="chips">' +
        c.kpis.map(function (k) { return '<span class="chip">' + k + '</span>'; }).join('') + '</div></div>';
    }).join('');
    $('sources').innerHTML = D.sources.map(function (s) { return '<li><b>' + s.name + ':</b> ' + s.from + '</li>'; }).join('');
    var url = new URL('report.html', location.href).href;
    $('qrUrl').textContent = url.replace(/^https?:\/\//, '');
    if (window.QRCode) {
      new window.QRCode($('qr'), { text: url, width: 204, height: 204, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    } else {
      $('qr').textContent = 'QR library did not load. Open the link below.';
    }
  }

  function setSeg(id, val) {
    Array.prototype.forEach.call($(id).querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === val)); });
  }
  function renderAll() {
    var m = model();
    renderOverview(m);
    renderSim(m);
    renderTrace();
    renderKpis(m);
    renderFeed();
  }

  // ---------- events ----------
  function wire() {
    $('rangeSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.range = b.dataset.v; setSeg('rangeSeg', state.range);
      if (state.scenario) state.simFrom = model(false).index;
      renderAll();
    });
    $('campusSeg').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.campus = b.dataset.v; setSeg('campusSeg', state.campus);
      if (state.scenario) state.simFrom = model(false).index;
      renderAll();
    });
    $('scenarios').addEventListener('click', function (e) {
      var b = e.target.closest('[data-scn]'); if (b) startScenario(b.dataset.scn);
    });
    $('resetBtn').addEventListener('click', endScenario);
    $('pillars').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pillar]'); if (!b) return;
      var card = $('k-' + b.dataset.pillar);
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.animate([{ boxShadow: '0 0 0 3px var(--accent)' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 1600, delay: 400 });
    });
    $('kpiBoard').addEventListener('click', function (e) {
      var b = e.target.closest('[data-kpi]'); if (!b) return;
      state.openKpi[b.dataset.kpi] = !state.openKpi[b.dataset.kpi];
      var row = b.parentNode;
      row.classList.toggle('open', state.openKpi[b.dataset.kpi]);
      b.setAttribute('aria-expanded', String(state.openKpi[b.dataset.kpi]));
    });
    function pickRisk(e) {
      var t = e.target.closest('[data-risk]'); if (!t) return;
      state.selRisk = state.selRisk === t.dataset.risk ? null : t.dataset.risk;
      renderRisks();
    }
    $('matrix').addEventListener('click', pickRisk);
    $('riskList').addEventListener('click', pickRisk);
    $('incList').addEventListener('click', function (e) {
      var b = e.target.closest('[data-inc]'); if (!b) return;
      state.selInc = b.dataset.inc; renderTrace();
    });
    $('indexTableBtn').addEventListener('click', function () {
      var t = $('indexTable'); t.hidden = !t.hidden;
      this.setAttribute('aria-expanded', String(!t.hidden));
      this.textContent = t.hidden ? 'View as table' : 'Hide table';
    });
    $('themeBtn').addEventListener('click', function () {
      var root = document.documentElement;
      var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      root.setAttribute('data-theme', dark ? 'light' : 'dark');
      try { localStorage.setItem('rr-theme', dark ? 'light' : 'dark'); } catch (e) {}
    });
    $('fsBtn').addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    });
    var pc = $('pcode');
    pc.value = state.pcode;
    pc.addEventListener('change', function () {
      state.pcode = pc.value.trim();
      try { sessionStorage.setItem('rr-pcode', state.pcode); } catch (e) {}
      renderFeed();
    });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { indexChart(model()); }, 150); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });

    // highlight the section in view
    var links = Array.prototype.slice.call(document.querySelectorAll('.subnav a'));
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['overview', 'stress', 'challenges', 'trace', 'kpis', 'live', 'marriott', 'about'].forEach(function (id) { io.observe($(id)); });
    }
  }

  function tick() {
    var d = new Date();
    $('clock').textContent = fmtDate(d) + ' · ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  setSeg('rangeSeg', state.range);
  setSeg('campusSeg', state.campus);
  renderScenarioButtons();
  renderRisks();
  renderStatic();
  wire();
  renderAll();
  tick();
  setInterval(tick, 1000);
  poll();
  setInterval(poll, 4000);
  setInterval(function () { if (!state.scenario) renderTrace(); }, 60000);
})();
