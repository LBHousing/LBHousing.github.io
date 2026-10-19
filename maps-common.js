/* LiBRE — helpers shared by the migrated data-map pages */
window.LB = (function () {
  var DIST_URL = 'data/code-enforcement/lb_council_districts.geojson';
  function baseMap(id, opts) {
    var m = L.map(id, Object.assign({ preferCanvas: true, zoomControl: true, attributionControl: true }, opts || {}))
      .setView([33.80, -118.17], 12);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri, HERE, Garmin, © OpenStreetMap' }).addTo(m);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, pane: 'shadowPane' }).addTo(m);
    return m;
  }
  var cache = {};
  function getJSON(url) {
    if (!cache[url]) cache[url] = fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
    return cache[url];
  }
  function districts(map, style) {
    return getJSON(DIST_URL).then(function (gj) {
      var lyr = L.geoJSON(gj, {
        style: Object.assign({ color: '#F7BA21', weight: 1.4, fill: false, opacity: .75 }, style || {}),
        interactive: false
      }).addTo(map);
      gj.features.forEach(function (f) {
        var c = L.geoJSON(f).getBounds().getCenter();
        L.marker(c, { icon: L.divIcon({ className: 'dlabel', html: '<span style="font:600 12px Outfit,sans-serif;color:#F7BA21;text-shadow:0 0 4px #000">D' + f.properties.COUNCIL_NUMBER + '</span>' }), interactive: false }).addTo(map);
      });
      return { layer: lyr, data: gj };
    });
  }
  function fmt(n, d) { return n == null || isNaN(n) ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: d == null ? 0 : d }); }
  function pct(n, d) { return n == null || isNaN(n) ? '—' : (n * 100).toFixed(d == null ? 1 : d) + '%'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function seg(el, cb) {
    el.setAttribute('role', 'group');
    el.querySelectorAll('button').forEach(function (x) { x.type = 'button'; x.setAttribute('aria-pressed', x.classList.contains('on') ? 'true' : 'false'); });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cb(b.dataset.v, b);
    });
  }
  function ramp(stops, colors) { return function (v) { if (v == null || isNaN(v)) return '#2a3247'; for (var i = 0; i < stops.length; i++) if (v <= stops[i]) return colors[i]; return colors[colors.length - 1]; }; }
  function legend(el, items) { el.innerHTML = items.map(function (i) { return '<div><span class="sw" style="background:' + i[0] + '"></span>' + esc(i[1]) + '</div>'; }).join(''); }
  if (window.Chart) { Chart.defaults.color = '#94a3b8'; Chart.defaults.font.family = 'Outfit, sans-serif'; Chart.defaults.borderColor = 'rgba(255,255,255,.07)'; }
  return { baseMap: baseMap, getJSON: getJSON, districts: districts, fmt: fmt, pct: pct, esc: esc, seg: seg, ramp: ramp, legend: legend };
})();
