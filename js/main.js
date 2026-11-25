/* Personal Brand — language toggle, mobile menu, filters, reveal animation */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY = "pb-lang";

  function getLang() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === "fa" || s === "en") return s;
    } catch (e) {}
    return "fa";
  }

  function applyLang(lang) {
    var dict = (window.I18N || {})[lang];
    if (!dict) return;
    root.lang = lang;
    root.dir = lang === "fa" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (dict[k] !== undefined) el.textContent = dict[k];
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-alt");
      if (dict[k] !== undefined) el.setAttribute("alt", dict[k]);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      if (dict[k] !== undefined) el.setAttribute("aria-label", dict[k]);
    });

    var titleEl = document.querySelector("title[data-i18n]");
    if (titleEl && dict[titleEl.getAttribute("data-i18n")]) {
      document.title = dict[titleEl.getAttribute("data-i18n")];
    }
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  applyLang(getLang());

  var langBtn = document.getElementById("lang-btn");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      applyLang(root.lang === "fa" ? "en" : "fa");
    });
  }

  /* Mobile menu */
  var menuBtn = document.getElementById("menu-btn");
  var links = document.getElementById("nav-links");
  function closeMenu() {
    if (!menuBtn) return;
    menuBtn.setAttribute("aria-expanded", "false");
    links.classList.remove("open");
  }
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("open", !open);
    });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (menuBtn.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
      var pc = document.querySelector(".page-close"); if (pc && !pc.hidden) pc.click();
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* Notes filter */
  var filters = document.querySelectorAll(".filter");
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.classList.toggle("active", b === btn); });
        document.querySelectorAll(".note").forEach(function (n) {
          n.hidden = !(f === "all" || n.getAttribute("data-cat") === f);
        });
      });
    });
  }



  /* Starry Night sky: painted swirling strokes (canvas) + glowing stars + crescent moon */
  (function () {
    function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var DARK = ["#0a1a3f", "#0c2352", "#102c66", "#163a7a"];
    var MID = ["#1f55a3", "#2e74c0", "#3c86cf", "#4a93d6"];
    var LIGHT = ["#7fb4e4", "#a9d0ee", "#6fa6dc", "#8fc1e8", "#e8d57c", "#f2c94c"];
    var SW = [ /* swirl centres (x,y fractions), radius, direction */
      [0.30, 0.34, 0.20, 1], [0.66, 0.26, 0.15, -1], [0.50, 0.62, 0.13, 1], [0.86, 0.60, 0.11, -1], [0.10, 0.70, 0.12, -1]
    ];
    function paint(cv, seed, base) {
      var W = cv.width = Math.max(320, window.innerWidth), H = cv.height = Math.max(480, window.innerHeight);
      var g = cv.getContext("2d"), R = rng(seed), M = Math.min(W, H);
      if (base) { var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#081433"); gr.addColorStop(1, "#0d2252"); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
      g.lineCap = "round"; g.lineJoin = "round";
      function field(x, y) {
        var vx = Math.cos(Math.sin(y / H * 5 + x / W * 2.2) * 0.7) * 0.55, vy = Math.sin(Math.sin(y / H * 5 + x / W * 2.2) * 0.7) * 0.55, inf = 0;
        for (var i = 0; i < SW.length; i++) {
          var s = SW[i], dx = x - s[0] * W, dy = y - s[1] * H, d = Math.sqrt(dx * dx + dy * dy), Rr = s[2] * M * 2.2;
          var w = Math.exp(-(d * d) / (Rr * Rr)), a = Math.atan2(dy, dx) + s[3] * (Math.PI / 2 + Math.min(d / Rr, 2) * 0.9);
          vx += Math.cos(a) * w * 2.2; vy += Math.sin(a) * w * 2.2; if (w > inf) inf = w;
        }
        return [Math.atan2(vy, vx), inf];
      }
      function stroke(x, y, lw, steps, pal) {
        var f = field(x, y), col = pal[(R() * pal.length) | 0];
        g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y);
        for (var k = 0; k < steps; k++) { var ff = field(x, y); x += Math.cos(ff[0]) * 5; y += Math.sin(ff[0]) * 5; g.lineTo(x, y); }
        g.stroke();
      }
      var n = (W * H) / 38, i, x, y, f, t;
      if (base) {
        g.globalAlpha = .9;
        for (i = 0; i < n; i++) {
          x = R() * W; y = R() * H; f = field(x, y); t = f[1] + (R() - .5) * .35;
          stroke(x, y, 2.4 + R() * 3, 9 + (R() * 9 | 0), t < .22 ? DARK : t < .5 ? MID : t < .75 ? MID.concat(LIGHT.slice(0, 2)) : LIGHT);
        }
      }
      g.globalAlpha = base ? .85 : .9;
      var m = base ? n * .35 : n * .45;
      for (i = 0; i < m; i++) {
        x = R() * W; y = R() * H; f = field(x, y);
        if (f[1] < (base ? .35 : .22)) continue;
        stroke(x, y, 1.6 + R() * 2.2, 10 + (R() * 10 | 0), base ? LIGHT : LIGHT.slice(0, 4));
      }
      g.globalAlpha = 1;
    }
    var sky = document.createElement("div"); sky.className = "sky"; sky.setAttribute("aria-hidden", "true");
    var a = document.createElement("canvas"); a.className = "paint-a";
    var b = document.createElement("canvas"); b.className = "paint-b";
    sky.appendChild(a); sky.appendChild(b);
    var STARS = [[11, 16, 26, 5.5, 0], [24, 9, 18, 7, -2], [39, 21, 30, 6, -4], [53, 11, 20, 8, -1], [66, 25, 24, 6.5, -3], [79, 14, 28, 7.5, -5], [17, 38, 20, 6, -2.500], [90, 35, 18, 5, -1.500], [34, 46, 16, 9, -6], [72, 47, 22, 7, -3.500]];
    STARS.forEach(function (d) {
      var e = document.createElement("div"); e.className = "star";
      e.style.cssText = "--x:" + d[0] + "%;--y:" + d[1] + "%;--s:" + d[2] + "px;--s0:" + d[2] + "px;--t:" + d[3] + "s;--delay:" + d[4] + "s";
      sky.appendChild(e);
    });
    var moon = document.createElement("div"); moon.className = "moon"; sky.appendChild(moon);
    document.body.insertBefore(sky, document.body.firstChild);
    var lastW = 0;
    function render() { lastW = window.innerWidth; paint(a, 7, true); paint(b, 91, false); }
    render();
    var tm; window.addEventListener("resize", function () { clearTimeout(tm); tm = setTimeout(function () { if (Math.abs(window.innerWidth - lastW) > 80) render(); }, 250); });
  })();

  /* Floating Persepolis columns background */
  (function () {
    var NS = "http://www.w3.org/2000/svg";
    var COLUMN =
      '<svg viewBox="0 0 60 240" aria-hidden="true">' +
      '<path d="M8 238h44M10 232h40"/>' +                                   /* plinth */
      '<path d="M16 232Q13 218 20 208h20q7 10 4 24"/>' +                     /* bell base */
      '<path d="M20 208V74M40 208V74M24 206V76M28 206V76M32 206V76M36 206V76"/>' + /* fluted shaft */
      '<path d="M18 74h24M17 70h26M18 66h24"/>' +                            /* collar rings */
      '<path d="M22 66q-2-10 2-16h12q4 6 2 16M26 64V52M30 64V50M34 64V52"/>' + /* fluted vase */
      '<circle cx="14" cy="43" r="7"/><circle cx="14" cy="43" r="3"/>' +      /* volutes */
      '<circle cx="46" cy="43" r="7"/><circle cx="46" cy="43" r="3"/>' +
      '<path d="M21 43h18M20 50h20"/>' +
      '<path d="M6 34h48v8H6zM8 26h44M10 18h40M12 10h36"/>' +                 /* abacus / capital block */
      '</svg>';
    /* x%, y%, width px, opacity, blur px, duration s, delay s, dx vw, dy vh, rotation deg */
    var SPEC = [
      [4, 6, 54, .20, 0, 38, 0, 9, 7, 7],
      [20, 58, 40, .13, 1, 46, -8, 12, 6, -9],
      [38, 12, 66, .16, 0, 52, -20, 14, 8, 6],
      [58, 52, 48, .20, 0, 42, -5, 10, 6, -7],
      [74, 8, 60, .15, 1, 50, -14, 13, 7, 8],
      [88, 48, 38, .12, 2, 44, -30, 8, 5, -10],
      [48, 70, 34, .10, 2, 56, -12, 12, 5, 9]
    ];
    var wrap = document.createElement("div");
    wrap.className = "bg-columns";
    wrap.setAttribute("aria-hidden", "true");
    SPEC.forEach(function (s) {
      var c = document.createElement("div");
      c.className = "bg-col";
      c.style.cssText = "--x:" + s[0] + "%;--y:" + s[1] + "%;--w:" + s[2] + "px;--o:" + s[3] +
        ";--b:" + s[4] + "px;--d:" + s[5] + "s;--delay:" + s[6] + "s;--dx:" + s[7] + "vw;--dy:" + s[8] + "vh;--r:" + s[9] + "deg";
      c.innerHTML = COLUMN;
      wrap.appendChild(c);
    });
    document.body.insertBefore(wrap, document.body.firstChild);
  })();

  /* Reveal on scroll */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }
})();
