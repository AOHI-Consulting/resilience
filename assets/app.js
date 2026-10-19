(function () {
  'use strict';

  var D = window.RR;
  var CLOUD = { rpc: 'https://fziyuauwrfdmiomwelij.supabase.co/rest/v1/rpc/', key: 'sb_publishable_ADg1MNwF3XHtn0bdRYv8cw_NfdZomZ6' };
  var $ = function (id) { return document.getElementById(id); };
  var TABS = ['overview', 'simulate', 'incidents', 'live'];
  var state = { tab: 'overview', sel: null, scenario: null, simT0: 0, simFrom: null, reports: [], quiz: null, seen: null, fresh: {}, sig: '', feedAt: 0, pcode: '' };
  try { state.pcode = sessionStorage.getItem('rr-pcode') || ''; } catch (e) {}

  // ---------- icons + status ----------
  var ICON = {
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.75 3.75 0 0 1 17.5 18z"/><path d="M10 12l4 4M14 12l-4 4"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>'; }
  var STATUS = {
    good: { label: 'On target', svg: '<circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M4.8 8.3l2.1 2.1 4.3-4.6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    warning: { label: 'Watch', svg: '<path d="M8 1.2l7.2 13H.8z" fill="currentColor" stroke="currentColor" stroke-linejoin="round"/><path d="M8 5.6v4" stroke="#111" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="12" r="1" fill="#111"/>' },
    serious: { label: 'At risk', svg: '<path d="M8 .6l7.4 7.4L8 15.4.6 8z" fill="currentColor"/><path d="M8 4.6v4.2" stroke="#111" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.2" r="1" fill="#111"/>' },
    critical: { label: 'Critical', svg: '<path d="M5 1h6l4 4v6l-4 4H5l-4-4V5z" fill="currentColor"/><path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' }
  };
  var COLOR = { good: 'var(--good)', warning: 'var(--warning)', serious: 'var(--serious)', critical: 'var(--critical)' };
  function level(s) { return s >= 80 ? 'good' : s >= 60 ? 'warning' : s >= 40 ? 'serious' : 'critical'; }
  function kpiLevel(s) { return s >= 99.99 ? 'good' : s >= 60 ? 'warning' : s >= 40 ? 'serious' : 'critical'; }
  function chip(lv, text) { return '<span class="status s-' + lv + '"><svg viewBox="0 0 16 16" aria-hidden="true">' + STATUS[lv].svg + '</svg>' + (text || STATUS[lv].label) + '</span>'; }

  // ---------- numbers ----------
  function score(k, v) { return Math.max(0, Math.min(1, (v - k.bad) / (k.good - k.bad))) * 100; }
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / (a.length || 1); }
  function scn() { return state.scenario ? D.scenarios.filter(function (s) { return s.id === state.scenario; })[0] : null; }
  function fnById(id) { return D.functions.filter(function (f) { return f.id === id; })[0]; }
  function model(withScenario) {
    var sc = withScenario === false ? null : scn();
    var ks = D.kpis.map(function (k) {
      var v = sc && sc.impact[k.id] != null ? sc.impact[k.id] : k.value;
      return { k: k, v: v, s: score(k, v), changed: v !== k.value };
    });
    var fns = D.functions.map(function (f) {
      var mine = ks.filter(function (x) { return x.k.fn === f.id; });
      return { f: f, kpis: mine, s: mean(mine.map(function (x) { return x.s; })), hit: mine.some(function (x) { return x.changed; }) };
    });
    var by = {}; fns.forEach(function (x) { by[x.f.id] = x; });
    var kb = {}; ks.forEach(function (x) { kb[x.k.id] = x; });
    return { fns: fns, by: by, kb: kb, score: mean(fns.map(function (x) { return x.s; })) };
  }
  function unitOf(k) { return k.unit === '%' ? '%' : k.unit === 'h' ? ' h' : k.unit; }
  function fmt(k, v) { return (k.dec ? v.toFixed(1) : String(Math.round(v))) + unitOf(k); }
  function target(k) { if (k.good === 0) return 'target 0'; return 'target ' + (k.good < k.bad ? '≤ ' : '≥ ') + (k.dec ? k.good.toFixed(1) : k.good) + unitOf(k); }
  function fmtDur(h) {
    if (h == null) return '–';
    if (h < 1) return Math.max(1, Math.round(h * 60)) + ' min';
    if (h < 72) return (Math.round(h * 10) / 10) + ' h';
    return Math.round(h / 24) + ' days';
  }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function pad(x) { return (x < 10 ? '0' : '') + x; }
  function fmtDate(d) { return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago'; return Math.floor(s / 86400) + ' days ago';
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function riskLevel(sc) { return sc >= 15 ? 'critical' : sc >= 10 ? 'serious' : sc >= 5 ? 'warning' : 'good'; }

  // ---------- the NIST CSF 2.0 wheel ----------
  function P(r, a) { var t = a * Math.PI / 180; return (r * Math.cos(t)).toFixed(2) + ' ' + (r * Math.sin(t)).toFixed(2); }
  function sector(r0, r1, a0, a1) {
    var large = a1 - a0 > 180 ? 1 : 0;
    return 'M' + P(r1, a0) + 'A' + r1 + ' ' + r1 + ' 0 ' + large + ' 1 ' + P(r1, a1) + 'L' + P(r0, a1) + 'A' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + P(r0, a0) + 'Z';
  }
  function wheel(m, opts) {
    opts = opts || {};
    var R0 = 92, R1 = 182, ring = ['identify', 'protect', 'detect', 'respond', 'recover'];
    var s = '<svg viewBox="-270 -255 540 510" role="group" aria-label="NIST Cybersecurity Framework wheel">';
    ring.forEach(function (id, i) {
      var x = m.by[id], lv = level(x.s), mid = -90 + i * 72, a0 = mid - 34, a1 = mid + 34;
      var rf = R0 + (R1 - R0) * Math.max(0.04, x.s / 100);
      var cls = 'seg' + (state.sel === id && !opts.mini ? ' sel' : '') + (x.hit ? ' hit' : '');
      s += '<g class="' + cls + '" data-fn="' + id + '" tabindex="0" role="button" aria-label="' + x.f.name + ', ' + Math.round(x.s) + ' out of 100, ' + STATUS[lv].label + '">' +
        '<path class="trk" d="' + sector(R0, R1, a0, a1) + '"/>' +
        '<path class="fill" d="' + sector(R0, rf, a0, a1) + '" style="fill:' + COLOR[lv] + '"/>' +
        '<path class="edge" d="' + sector(R0, R1, a0, a1) + '"/></g>';
      var c = Math.cos(mid * Math.PI / 180), sn = Math.sin(mid * Math.PI / 180), lr = R1 + 22;
      var anchor = c > 0.35 ? 'start' : c < -0.35 ? 'end' : 'middle';
      var lx = (lr * c).toFixed(1), ly = (lr * sn + (sn > 0.5 ? 14 : sn < -0.5 ? -12 : 4)).toFixed(1);
      s += '<text class="wl-name" x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '">' + x.f.name.toUpperCase() + '</text>' +
        '<text class="wl-sub" x="' + lx + '" y="' + (+ly + 17) + '" text-anchor="' + anchor + '">' + Math.round(x.s) + ' · ' + STATUS[lv].label + '</text>';
    });
    var g = m.by.govern, glv = level(g.s), rr = 66, circ = 2 * Math.PI * rr;
    s += '<g class="seg' + (state.sel === 'govern' && !opts.mini ? ' sel' : '') + (g.hit ? ' hit' : '') + '" data-fn="govern" tabindex="0" role="button" aria-label="Govern, ' + Math.round(g.s) + ' out of 100, ' + STATUS[glv].label + '">' +
      '<circle class="trk" r="80"/><circle r="' + rr + '" fill="none" style="stroke:var(--panel)" stroke-width="10"/>' +
      '<circle r="' + rr + '" fill="none" style="stroke:' + COLOR[glv] + '" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (circ * g.s / 100).toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90)"/>' +
      '<circle class="edge" r="80"/>' +
      '<text y="-18" text-anchor="middle" class="wl-name" style="font-size:12px">GOVERN</text>' +
      '<text y="20" text-anchor="middle" style="font-size:38px;font-weight:700;fill:var(--ink)">' + Math.round(g.s) + '</text>' +
      '<text y="40" text-anchor="middle" class="wl-sub" style="font-size:11px">' + STATUS[glv].label + '</text></g>';
    return s + '</svg>';
  }
  var legend = '<div class="wheel-legend"><span><i style="background:var(--good)"></i>On target</span><span><i style="background:var(--warning)"></i>Watch</span><span><i style="background:var(--serious)"></i>At risk</span><span><i style="background:var(--critical)"></i>Critical</span></div>';

  // ---------- overview ----------
  function renderOverview() {
    var m = model(), sorted = m.fns.slice().sort(function (a, b) { return a.s - b.s; });
    if (!state.sel) state.sel = sorted[0].f.id;
    var x = m.by[state.sel], lv = level(x.s), olv = level(m.score);
    $('t-overview').innerHTML =
      '<div class="intro"><h1>How cyber-resilient is the Hotelschool?</h1><p>Scored on the <b>NIST Cybersecurity Framework 2.0</b>, the framework security professionals use. <b>Govern</b> sits in the middle because it steers the other five. The fuller a slice, the stronger we are. <b>Tap a slice</b> to see what is behind it.</p></div>' +
      '<div class="ov">' +
        '<div class="card wheel-card"><div class="wheel" id="wheel">' + wheel(m) + '</div>' + legend + '</div>' +
        '<div class="side">' +
          '<div class="card"><span class="label">Overall cyber resilience' + (state.scenario ? ' · during the simulation' : '') + '</span><div class="score-row" style="margin-top:10px"><span class="big">' + Math.round(m.score) + '<small>/100</small></span>' +
            '<div>' + chip(olv) + '<p>Strongest at <b>' + sorted[5].f.name + '</b> (' + Math.round(sorted[5].s) + '). Weakest at <b>' + sorted[0].f.name + '</b> (' + Math.round(sorted[0].s) + ') and <b>' + sorted[1].f.name + '</b> (' + Math.round(sorted[1].s) + ').</p></div></div></div>' +
          '<div class="card fn-panel"><div class="fn-head"><div><span class="label">' + (D.functions.indexOf(x.f) + 1) + ' of 6 · ' + x.f.plain + '</span><h2>' + x.f.name + '</h2></div><div style="text-align:right"><span class="n">' + Math.round(x.s) + '</span><div>' + chip(lv) + '</div></div></div>' +
            '<p class="fn-q">' + x.f.q + '</p>' +
            x.kpis.map(function (y) {
              var kl = kpiLevel(y.s);
              return '<div class="kpi' + (y.changed ? ' changed' : '') + '"><div class="r1"><span class="nm">' + y.k.name + '</span><span class="v">' + fmt(y.k, y.v) + '</span></div>' +
                '<div class="bar s-' + kl + '"><i style="width:' + Math.max(2, y.s) + '%"></i></div>' +
                '<div class="r2"><span class="why">' + y.k.why + '</span>' + chip(kl, target(y.k)) + '</div></div>';
            }).join('') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ch-head"><h2>The five biggest cyber challenges for the school</h2><p>Score = likelihood × impact, out of 25</p></div>' +
      '<div class="chs">' + D.challenges.map(function (c, i) {
        var rl = riskLevel(c.score);
        return '<button class="ch" data-pick="' + c.fn + '"><span class="rank">#' + (i + 1) + '</span><h3>' + c.title + '</h3><p>' + c.why + '</p>' +
          '<div class="ft"><span class="pill fn">' + fnById(c.fn).name + '</span>' + chip(rl, c.score + '/25') + '</div></button>';
      }).join('') + '</div>' +
      '<div class="ch-head"><h2>What we would fix first</h2><p>Three actions, in this order. Each one moves a KPI on this dashboard.</p></div>' +
      '<div class="fixgrid">' + D.fixFirst.map(function (f, i) {
        return '<div class="card fx"><div class="fx-top"><span class="fx-n">' + (i + 1) + '</span><span class="pill fn">' + fnById(f.fn).name + '</span></div>' +
          '<h3>' + f.t + '</h3><p>' + f.why + '</p>' +
          '<div class="fx-m"><div class="fx-l"><span>' + f.metric + '</span><b>' + f.from + '% <span class="muted">→</span> ' + f.to + '%</b></div>' +
          '<div class="bar s-' + kpiLevel(f.from >= 60 ? 60 : 40) + '"><i style="width:' + f.from + '%"></i><span class="tg" style="left:calc(' + f.to + '% - 2px)"></span></div></div></div>';
      }).join('') + '</div>';
  }

  // ---------- simulate ----------
  function renderSimulate() {
    var sc = scn(), m = model();
    var html = '<div class="intro"><h1>What happens when we are attacked?</h1><p>Pick an attack. Watch which parts of the wheel get hit, follow the attack step by step, and see <b>what would have stopped it</b>.</p></div>' +
      '<div class="atk">' + D.scenarios.map(function (s) {
        return '<button data-scn="' + s.id + '" aria-pressed="' + (state.scenario === s.id) + '">' + icon(s.icon) + '<b>' + s.name + '</b><span>Hits: ' + s.system + '</span></button>';
      }).join('') + '</div>';
    if (!sc) { $('t-simulate').innerHTML = html + '<div class="empty"><b>Choose an attack above</b>The whole dashboard reacts while the simulation runs.</div>'; return; }
    var from = Math.round(state.simFrom), to = Math.round(m.score), maxH = Math.max(sc.without, sc.rto) * 1.08;
    function rec(label, h) {
      var ok = h <= sc.rto, lv = ok ? 'good' : 'critical';
      return '<div><div class="lab"><span>' + label + ': <b>' + fmtDur(h) + '</b></span>' + chip(lv, ok ? 'Within target' : fmtDur(h - sc.rto) + ' too late') + '</div>' +
        '<div class="bar s-' + lv + '"><i style="width:' + (h / maxH * 100).toFixed(1) + '%"></i><span class="tg" style="left:' + (sc.rto / maxH * 100).toFixed(1) + '%"></span></div></div>';
    }
    html += '<div class="sim">' +
      '<div class="card wheel-card"><span class="label">Parts of the wheel that get hit</span><div class="wheel" style="max-width:420px">' + wheel(m, { mini: true }) + '</div>' +
        '<div class="drop"><div><span class="label">Before</span><div class="x">' + from + '</div></div><span class="arrow">→</span><div><span class="label">During</span><div class="x">' + to + '</div></div><div><span class="label">Change</span><div class="x neg">' + (to - from) + '</div></div></div>' +
        '<button class="icon-btn" data-end="1" style="margin-top:10px">End the simulation</button></div>' +
      '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="label">The attack, step by step</span><span class="pill live">Running</span></div>' +
        '<h2 style="font-size:24px;margin-top:8px">' + sc.name + '</h2><p class="blurb">' + sc.blurb + '</p>' +
        '<ol class="path">' + sc.chain.map(function (c, i) {
          var x = c.kpi ? m.kb[c.kpi] : null;
          return '<li><span class="no">' + (i + 1) + '</span><b>' + c.step + '</b><div class="stop">Could be stopped by: ' + c.control + (x ? ' ' + chip(kpiLevel(x.s), 'now ' + fmt(x.k, x.v)) : ' <span class="muted">(not measured yet)</span>') + '</div></li>';
        }).join('') + '</ol>' +
        '<span class="label">Time to recover (target ' + fmtDur(sc.rto) + ')</span><div class="rec" style="margin-top:12px">' + rec('With a plan', sc.stages.r) + rec('Without a plan', sc.without) + '</div>' +
        '<p class="bench">' + sc.benchmark + '</p></div>' +
      '</div>';
    $('t-simulate').innerHTML = html;
  }

  // ---------- incidents ----------
  function simHours(sc) { return Math.min(sc.stages.r * 1.02, (performance.now() - state.simT0) / 1000 / 16 * sc.stages.r); }
  function renderIncidents() {
    var sc = scn(), list = D.incidents.slice();
    if (sc) list.unshift({ sim: true, id: 'SIM', kind: 'Simulation', status: 'live', start: new Date().toISOString(), title: sc.name + ' (simulation)', d: sc.stages.d, c: sc.stages.c, r: sc.stages.r, rto: sc.rto, lesson: 'Clock runs fast: ' + fmtDur(sc.stages.r) + ' in about 16 seconds.' });
    var real = D.incidents, closed = real.filter(function (x) { return x.status === 'closed'; });
    var within = Math.round(closed.filter(function (x) { return x.r <= x.rto; }).length / closed.length * 100);
    var labels = { live: 'Live', open: 'Open', monitoring: 'Monitoring', closed: 'Closed' };
    $('t-incidents').innerHTML =
      '<div class="intro"><h1>Every incident, from first signal to lesson learned</h1><p>Track &amp; trace: when did we notice, when did we stop it, when were we back, and <b>what did we change</b>?</p></div>' +
      '<div class="stats">' +
        '<div class="card stat"><span class="label">Time to notice</span><span class="v">' + fmtDur(mean(real.map(function (x) { return x.d; }))) + '</span><span class="s">average across incidents</span></div>' +
        '<div class="card stat"><span class="label">Time to recover</span><span class="v">' + fmtDur(mean(closed.map(function (x) { return x.r; }))) + '</span><span class="s">average, closed incidents</span></div>' +
        '<div class="card stat"><span class="label">Back on time</span><span class="v">' + within + '%</span><span class="s">recovered within the target time</span></div></div>' +
      '<div class="two"><div class="incs">' + list.map(function (x) {
        var el0 = x.sim ? simHours(sc) : (Date.now() - new Date(x.start).getTime()) / 3600000;
        var st = [['Started', 0], ['Noticed', x.d], ['Stopped', x.c], ['Recovered', x.r], ['Learned', x.status === 'closed' ? x.r + 48 : null]];
        var first = st.findIndex(function (s) { return s[1] == null || s[1] > el0; });
        return '<div class="card inc' + (x.sim ? ' live' : '') + '" id="inc-' + x.id + '"><div class="r1"><div><h3>' + x.title + '</h3><div class="meta"><span class="pill' + (x.cyber || x.sim ? ' fn' : '') + '">' + x.kind + '</span>' + (x.sim ? 'now' : fmtDate(new Date(x.start)) + ' · ' + x.id) + '</div></div><span class="pill ' + x.status + '">' + labels[x.status] + '</span></div>' +
          '<div class="track">' + st.map(function (s, i) {
            var done = s[1] != null && s[1] <= el0;
            return '<div class="st ' + (done ? 'done' : i === first ? 'now' : '') + '"><span class="dot"></span><b>' + s[0] + '</b><span>' + (done ? (i ? '+' + fmtDur(s[1]) : 'T+0') : i === first ? 'in progress' : '') + '</span></div>';
          }).join('') + '</div><p class="lesson"><b>Lesson:</b> ' + x.lesson + '</p></div>';
      }).join('') + '</div>' +
      '<div class="incs">' + D.marriott.map(function (c) {
        return '<div class="card"><span class="label">Learning from Marriott · ' + c.year + '</span><h3 style="font-size:18px;margin-top:4px">' + c.title + '</h3><ol class="tl">' +
          c.timeline.map(function (t) { return '<li><span class="w">' + t.t + '</span>' + t.e + '</li>'; }).join('') + '</ol><div class="lesson-box">' + c.lesson + '</div></div>';
      }).join('') + '</div></div>';
  }

  // ---------- live ----------
  var AREAS = { cyber: 'Cyber & data', learning: 'Platform & communication', campus: 'Campus & outlets', people: 'People', finance: 'Finance & intake', reputation: 'Reputation & trust' };
  function renderLiveShell() {
    var url = new URL('report.html', location.href).href;
    $('t-live').innerHTML =
      '<div class="intro"><h1>Spot the phish: test the room</h1><p>Scan the code. Three e-mails: <b>real or fake?</b> Then tell us a problem you have run into at school. Results appear here within seconds.</p></div>' +
      '<div class="livegrid">' +
        '<div class="card qr-card"><div class="qr" id="qr"></div><div><b>Scan to join</b><p class="qr-url">' + url.replace(/^https?:\/\//, '') + '</p></div></div>' +
        '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px"><span class="label">The room’s score</span><span class="label" id="quizState">connecting</span></div><div id="quizBox" style="margin-top:12px"></div></div>' +
        '<div style="display:flex;flex-direction:column;gap:20px">' +
          '<div class="card why-card"><span class="label">Why this matters</span><h3>A confusing platform is a security risk.</h3><p>Many students struggle to find their way around MyHotelschool: lots of sections, information in different places. If you do not know what the real thing looks like, <b style="color:var(--ink)">a fake login page looks just as real</b>.</p>' +
            '<ul class="fixes">' + D.fixes.slice(0, 3).map(function (f, i) { return '<li><span class="k">' + (i + 1) + '</span><span><b>' + f.t + '.</b> ' + f.d + '</span></li>'; }).join('') + '</ul></div>' +
          '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px"><span class="label">Problems you reported</span><span class="label" id="feedState"></span></div><ul class="feed" id="feed"></ul>' +
            '<div class="presenter"><label for="pcode">Presenter code</label><input id="pcode" type="password" autocomplete="off" placeholder="to hide posts"></div></div>' +
        '</div></div>';
    if (window.QRCode) new window.QRCode($('qr'), { text: url, width: 248, height: 248, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    else $('qr').textContent = 'QR library did not load. Use the link below.';
    var pc = $('pcode'); pc.value = state.pcode;
    pc.addEventListener('change', function () { state.pcode = pc.value.trim(); try { sessionStorage.setItem('rr-pcode', state.pcode); } catch (e) {} renderFeed(); });
  }
  function renderQuiz() {
    var q = state.quiz, box = $('quizBox'); if (!box) return;
    if (!q || !q.n) { box.innerHTML = '<ul class="feed" style="margin:0"><li class="none">Nobody has played yet. Scan the code.</li></ul>'; return; }
    var pcts = [q.q1, q.q2, q.q3].map(function (c) { return Math.round(c / q.n * 100); }), worst = pcts.indexOf(Math.min.apply(null, pcts));
    box.innerHTML = '<div style="display:flex;gap:30px;align-items:flex-end;margin-bottom:12px"><div><span class="big-n">' + q.n + '</span><div class="label">played</div></div><div><span class="big-n">' + Math.round(q.all3 / q.n * 100) + '%</span><div class="label">all three right</div></div></div>' +
      D.quiz.map(function (m, i) {
        var lv = kpiLevel(pcts[i] >= 90 ? 100 : pcts[i]);
        return '<div class="qrow"><div class="r"><b>' + (i + 1) + '. ' + m.subject + '</b><span>' + pcts[i] + '% right</span></div><div class="bar s-' + lv + '"><i style="width:' + Math.max(2, pcts[i]) + '%"></i></div>' +
          '<span class="mono">' + (m.fake ? 'FAKE' : 'REAL') + ' · ' + m.addr + (i === worst && pcts[i] < 100 ? ' · fooled the most people' : '') + '</span></div>';
      }).join('');
  }
  function renderFeed() {
    var feed = $('feed'); if (!feed) return;
    feed.innerHTML = '';
    if (!state.reports.length) feed.appendChild(el('li', 'none', 'No reports yet.'));
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

  // ---------- simulation ----------
  var simTimer = null;
  function renderSimbar() {
    var sc = scn(), bar = $('simbar');
    if (!sc) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.innerHTML = '<span class="tag">Simulation</span><span><b>' + sc.name + '</b> · score ' + Math.round(state.simFrom) + ' → ' + Math.round(model().score) + '</span><span class="mono" id="simClock">T+' + fmtDur(simHours(sc)) + '</span>' +
      '<span class="sp"><a class="icon-btn" href="#simulate" style="text-decoration:none">Open</a><button class="icon-btn" data-end="1">End</button></span>';
  }
  function renderDynamic() { renderOverview(); renderSimulate(); renderIncidents(); renderSimbar(); }
  function startScenario(id) {
    if (state.scenario === id) { endScenario(); return; }
    state.simFrom = model(false).score; state.scenario = id; state.simT0 = performance.now();
    renderDynamic();
    clearInterval(simTimer);
    simTimer = setInterval(function () {
      var sc = scn(); if (!sc) return clearInterval(simTimer);
      var c = $('simClock'); if (c) c.textContent = 'T+' + fmtDur(simHours(sc));
      if (state.tab === 'incidents') renderIncidents();
      if (simHours(sc) >= sc.stages.r) { clearInterval(simTimer); renderIncidents(); }
    }, 300);
  }
  function endScenario() { state.scenario = null; state.simFrom = null; clearInterval(simTimer); renderDynamic(); }

  // ---------- live data ----------
  function rpc(name, body) {
    return fetch(CLOUD.rpc + name, { method: 'POST', headers: { apikey: CLOUD.key, Authorization: 'Bearer ' + CLOUD.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.message) || r.status); return j; }); });
  }
  function poll() {
    if (document.hidden) return;
    var d = new Date(), stamp = 'live · ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
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
    }).catch(function () { if ($('feedState')) $('feedState').textContent = 'offline, retrying'; });
    rpc('resilience_quiz_results').then(function (rows) {
      var q = rows && rows[0] ? { n: +rows[0].n, q1: +rows[0].q1, q2: +rows[0].q2, q3: +rows[0].q3, all3: +rows[0].all3 } : null;
      var changed = !state.quiz || !q || state.quiz.n !== q.n;
      if (state.quiz && q && q.n > state.quiz.n && state.tab !== 'live') toast('Spot the phish', q.n === 1 ? '1 person has played' : q.n + ' people have played');
      state.quiz = q;
      if (changed) renderQuiz();
      if ($('quizState')) $('quizState').textContent = stamp;
      $('liveCount').textContent = q && q.n ? String(q.n) : '';
    }).catch(function () { if ($('quizState')) $('quizState').textContent = 'offline, retrying'; });
  }
  var toastTimer;
  function toast(title, text) {
    var t = $('toast'); t.innerHTML = ''; t.appendChild(el('b', '', title)); t.appendChild(document.createTextNode(text));
    t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 5000);
  }

  // ---------- navigation + events ----------
  function go(t) {
    if (TABS.indexOf(t) < 0) t = 'overview';
    state.tab = t;
    TABS.forEach(function (x) { $('t-' + x).classList.toggle('on', x === t); });
    Array.prototype.forEach.call(document.querySelectorAll('#tabs a'), function (a) { a.classList.toggle('on', a.dataset.t === t); });
    if (t === 'incidents') renderIncidents();
    window.scrollTo(0, 0);
  }
  function pick(id) {
    state.sel = id; renderOverview();
    if (state.tab !== 'overview') location.hash = 'overview';
    var w = $('wheel'); if (w && window.innerWidth < 900) w.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', function (e) {
    var f = e.target.closest('#wheel [data-fn]'); if (f) { pick(f.getAttribute('data-fn')); return; }
    var p = e.target.closest('[data-pick]'); if (p) { pick(p.dataset.pick); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var s = e.target.closest('[data-scn]'); if (s) { startScenario(s.dataset.scn); return; }
    if (e.target.closest('[data-end]')) { endScenario(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    var fn = e.target.closest && e.target.closest('#wheel [data-fn]');
    if (fn && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(fn.getAttribute('data-fn')); return; }
    var i = TABS.indexOf(state.tab);
    if (e.key === 'ArrowRight') { location.hash = TABS[Math.min(TABS.length - 1, i + 1)]; e.preventDefault(); }
    if (e.key === 'ArrowLeft') { location.hash = TABS[Math.max(0, i - 1)]; e.preventDefault(); }
    if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
    if (e.key === 'Escape' && state.scenario) endScenario();
  });
  window.addEventListener('hashchange', function () { go(location.hash.slice(1)); });
  $('themeBtn').addEventListener('click', function () {
    var root = document.documentElement, next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next); try { localStorage.setItem('rr-theme', next); } catch (e) {}
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
  function tick() { var d = new Date(); $('clock').textContent = fmtDate(d) + ' · ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  renderDynamic(); renderLiveShell(); renderFeed(); renderQuiz();
  go(location.hash.slice(1) || 'overview');
  tick(); setInterval(tick, 10000);
  poll(); setInterval(poll, 4000);
})();
