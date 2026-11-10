/* Builds the whole page from content.js. You do NOT need to edit this file. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (v = "") =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Edit mode (link ends with ?edit) ----------
     Your unpublished text changes are shown only in your own browser. */
  const EDIT = new URLSearchParams(location.search).has("edit");
  if (EDIT) {
    try {
      const d = JSON.parse(localStorage.getItem("pf-edit-draft") || "null");
      if (d && d.changes) Object.entries(d.changes).forEach(([p, v]) => {
        const keys = p.split("."), last = keys.pop();
        const o = get(SITE, keys.join("."));
        if (o && typeof o[last] === "string" && typeof v === "string") o[last] = v;
      });
    } catch (e) {}
  }

  const S = SITE.settings || {};
  const T = SITE.theme || {};
  const SEC = SITE.sections || {};
  const C = SITE.contact || {};
  const H = SITE.hero || {};
  const B = SITE.heroButtons || {};
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  root.classList.add("pre");

  /* ---------- Theme ---------- */
  const colourVars = { dark: "--c-dark", darkGrey: "--c-grey", light: "--c-light", white: "--c-white", textOnLight: "--c-ink-dark", textOnDark: "--c-ink-light" };
  Object.entries(colourVars).forEach(([k, v]) => { if (T[k]) root.style.setProperty(v, T[k]); });
  if (T.sansFont) root.style.setProperty("--sans", `"${T.sansFont}", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif`);
  if (T.serifFont) root.style.setProperty("--serif", `"${T.serifFont}", "Times New Roman", Georgia, serif`);
  if (S.thumbsBlackAndWhite !== false) root.classList.add("bw-thumbs");
  let fontLink = null;
  if (T.fontsUrl) {
    fontLink = document.createElement("link");
    fontLink.rel = "stylesheet"; fontLink.href = T.fontsUrl;
    document.head.appendChild(fontLink);
  }
  root.classList.add("photo-" + (S.photoStyle || "bw"));
  if (S.grain === false && $(".grain")) $(".grain").remove();

  /* ---------- Helpers: letters + fit-to-width text ---------- */
  // Splits a name into letters; the last word is set in italic
  const lettersHTML = (text) => {
    let i = 0;
    const words = String(text).trim().split(/\s+/);
    return words
      .map((w, wi) => `<span class="w${words.length > 1 && wi === words.length - 1 ? " it" : ""}">${[...w].map((ch) => `<span class="ch" style="--i:${i++}"><b>${esc(ch)}</b></span>`).join("")}</span>`)
      .join('<span class="sp"></span>');
  };
  const fitters = [];
  function fitText(el, o) {
    const inner = $(".fit", el);
    if (!inner) return;
    const run = () => {
      const box = el.clientWidth;
      if (!box) return;
      el.classList.remove("two");
      el.style.setProperty("--hs", "0");
      el.style.fontSize = "100px";
      let size = (100 * box * o.fill) / inner.getBoundingClientRect().width;
      if (o.two === true || (o.minOne && size < o.minOne)) {
        el.classList.add("two");
        const widest = Math.max(...$$(".w", inner).map((w) => w.getBoundingClientRect().width));
        size = (100 * box * o.fill) / widest;
      }
      el.style.fontSize = Math.min(size, typeof o.max === "function" ? o.max() : o.max) + "px";
      el.style.removeProperty("--hs");
    };
    fitters.push(run);
    run();
  }
  const refit = () => fitters.forEach((f) => f());

  /* ---------- Sections on/off, menu, labels ---------- */
  const order = ["work", "about", "services", "contact"];
  order.forEach((k) => { if (SEC[k] && SEC[k].show === false) { const s = $("#" + k); if (s) s.remove(); } });
  $("#nav-list").innerHTML = order
    .filter((k) => SEC[k] && SEC[k].show !== false && SEC[k].nav && $("#" + k))
    .map((k) => `<li><a href="#${k}" data-sec="${k}">${esc(SEC[k].nav)}</a></li>`)
    .join("");
  if (!$("#nav-list").children.length) $("#nav-list").remove();

  $$("[data-bind]").forEach((el) => {
    const v = get(SITE, el.dataset.bind);
    if (v) el.textContent = v;
    else if (el.hasAttribute("data-hide-empty")) el.remove();
  });

  // Section numbers "02 — Work"
  let secN = 1;
  $$("main > section:not(.hero)").forEach((s) => {
    const el = $(".sec-idx", s);
    if (!el) return;
    secN++;
    const cfg = SEC[s.id] || {};
    el.textContent = `${pad(secN)} — ${cfg.nav || cfg.title || s.id}`;
  });

  // Headings: words rise in one by one, the last word gets the glowing italic style
  const splitHeading = (el) => {
    const words = el.textContent.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    el.innerHTML = words
      .map((w, i) => {
        const tag = i === words.length - 1 ? "em" : "span";
        return `<span class="wm"><${tag} class="wi" style="--w:${i}">${esc(w)}</${tag}></span>`;
      })
      .join(" ");
  };
  $$(".section-head h2").forEach(splitHeading);

  /* ---------- Title, top bar ---------- */
  document.title = `${SITE.name} | ${SITE.role}`;
  const initials = SITE.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  $("#brand").innerHTML = `<span class="mark glass">${esc(initials)}</span><span class="bn">${esc(SITE.name)}</span>`;
  $("#nav-cta-text").textContent = B.talk || "Let's talk";

  /* ---------- Loading screen ---------- */
  let readyResolve;
  const ready = new Promise((r) => (readyResolve = r));
  let readyFired = false;
  const goReady = () => {
    if (readyFired) return;
    readyFired = true;
    root.classList.remove("pre");
    root.classList.add("ready");
    readyResolve();
  };
  const intro = $("#intro");
  let seen = false;
  try { seen = sessionStorage.getItem("introSeen") === "1"; } catch (e) {}
  if (EDIT) { seen = true; root.classList.add("pf-editing"); } // no loading screen or entry animations while editing
  if (intro && S.intro !== false && !reduced && !seen) {
    root.classList.add("is-loading");
    $("#intro-name").innerHTML = SITE.name.trim().split(/\s+/)
      .map((w, wi, arr) => [...w].map((ch) => `<span${arr.length > 1 && wi === arr.length - 1 ? ' class="it"' : ""}>${esc(ch)}</span>`).join("") + (wi < arr.length - 1 ? '<span class="sp"></span>' : ""))
      .join("");
    $$("#intro-name span").forEach((s, i) => s.style.setProperty("--i", i));
    $("#intro-role").textContent = SITE.role || "";
    const num = $("#intro-num"), bar = $("#intro-bar");
    const t0 = performance.now(), dur = 1700;
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      num.textContent = String(Math.round(e * 100)).padStart(3, "0");
      bar.style.transform = `scaleX(${e})`;
      if (p < 1) return requestAnimationFrame(step);
      intro.classList.add("done");
      try { sessionStorage.setItem("introSeen", "1"); } catch (err) {}
      setTimeout(goReady, 250);
      setTimeout(() => { intro.remove(); root.classList.remove("is-loading"); }, 1150);
    })(t0);
  } else {
    if (intro) intro.remove();
    requestAnimationFrame(() => requestAnimationFrame(goReady));
  }
  setTimeout(goReady, 5000); // safety net

  /* ---------- Smooth scrolling ---------- */
  let lenis = null;
  let modalOpen = false;
  const scrollToEl = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.5 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) { e.preventDefault(); lenis ? lenis.scrollTo(0, { duration: 1.5 }) : window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    scrollToEl(id === "#home" ? 0 : el);
    if (id === "#home") { lenis ? lenis.scrollTo(0, { duration: 1.5 }) : window.scrollTo({ top: 0, behavior: "smooth" }); }
  });
  if (S.smoothScroll === true && !reduced && fine) {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js";
    s.onload = () => {
      if (!window.Lenis) return;
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      if (modalOpen) lenis.stop();
    };
    document.head.appendChild(s);
  }

  /* =====================================================================
     HEADER
     ===================================================================== */
  const hero = $("#home");
  const setOrRemove = (sel, text, html) => {
    const el = $(sel);
    if (!el) return;
    if (text) { if (html) el.innerHTML = html; else el.textContent = text; }
    else el.remove();
  };
  setOrRemove("#hero-role", SITE.role);
  setOrRemove("#hero-year", H.year ? `Year ${H.year}.` : "");
  setOrRemove("#hero-label", H.label);
  setOrRemove("#hero-avail", SITE.availability, `<i class="dot"></i>${esc(SITE.availability)}`);
  setOrRemove("#hero-tagline", SITE.tagline);
  const disciplines = String(SITE.disciplines || "").split(/\s*[·•|,/]\s*/).filter(Boolean);
  // "Creative Director" line under the name
  setOrRemove("#hero-title", SITE.role || disciplines.length,
    `${SITE.role ? `<em>${esc(SITE.role)}</em>` : ""}${disciplines.length ? `<span>${disciplines.map(esc).join(" · ")}</span>` : ""}`);

  // Big name
  const nameEl = $("#hero-name");
  nameEl.innerHTML = `<span class="fit" aria-hidden="true">${lettersHTML(SITE.name)}</span>`;
  nameEl.setAttribute("aria-label", SITE.name);
  fitText(nameEl, { fill: 0.86, max: () => Math.max(60, Math.min(170, innerHeight * 0.17)), minOne: 46, two: S.nameOnTwoLines === true });

  // Photo
  const layoutRaw = H.layout || "center";
  const layout = !H.image ? "none" : layoutRaw === "background" ? "background" : layoutRaw === "none" ? "none" : "center";
  hero.classList.add("is-" + layout);
  if (layout === "center") {
    $("#hero-img").src = H.image;
    $("#hero-img").alt = H.alt || SITE.name;
    $("#hero-bg").remove();
  } else if (layout === "background") {
    $("#hero-bg-img").src = H.image;
    hero.style.setProperty("--hero-opacity", H.opacity ?? 0.35);
    $("#hero-media").remove();
  } else {
    $("#hero-media").remove();
    $("#hero-bg").remove();
  }

  // Floating glass cards (they glide away from the mouse; see the animation loop)
  $("#chips").innerHTML = (H.chips || []).slice(0, 4)
    .map((c, i) => `<div class="chip glass" style="--n:${i}"><span class="chip-in"><b>${esc(c.title || "")}</b><span>${esc(c.sub || "")}</span><i class="chip-folder"></i></span></div>`)
    .join("");
  const chipList = $$(".chip").map((el) => ({ el, x: 0, y: 0, r: 0 }));
  const stageEl = $("#hero-stage");

  // Photo: hover opens it wider and in colour, leaving closes it (tap on phones)
  const media = $("#hero-media");
  if (media) {
    if (fine) {
      media.addEventListener("pointerenter", () => hero.classList.add("is-open"));
      media.addEventListener("pointerleave", () => hero.classList.remove("is-open"));
    } else {
      media.addEventListener("click", () => hero.classList.toggle("is-open"));
    }
  }
  if (!fine && $("#about-img")) $("#about-img").addEventListener("click", () => $("#about-img").classList.toggle("color"));

  // "Currently" panel: a word that changes + a typed line
  if (H.nowLabel) $("#now-label").textContent = H.nowLabel;
  const prompts = (H.prompts || []).map((p) => (typeof p === "string" ? { text: p } : p)).filter((p) => p && p.text);
  if (!prompts.length && SITE.tagline) prompts.push({ text: SITE.tagline, status: SITE.role });
  const typed = $("#typed"), ghost = $("#ghost"), statusEl = $("#now-word"), ptext = $("#prompt-text");
  let promptVisible = true;
  const setWord = (w) => {
    if (statusEl.textContent === w) return;
    statusEl.textContent = w;
    statusEl.classList.remove("in");
    void statusEl.offsetWidth;
    statusEl.classList.add("in");
  };
  if (prompts.length) {
    ghost.textContent = prompts[0].text;
    statusEl.textContent = prompts[0].status || "";
    new IntersectionObserver(([en]) => (promptVisible = en.isIntersecting)).observe($("#now"));
    const runPrompts = async () => {
      let pi = 0;
      for (;;) {
        const p = prompts[pi++ % prompts.length];
        setWord(p.status || "");
        ptext.classList.remove("out");
        if (reduced) { typed.textContent = p.text; ghost.textContent = ""; await wait(5000); continue; }
        for (let i = 0; i <= p.text.length; i++) {
          while (!promptVisible || document.hidden) await wait(300);
          typed.textContent = p.text.slice(0, i);
          ghost.textContent = p.text.slice(i);
          const ch = p.text[i - 1];
          await wait(ch === "." || ch === "," ? 240 : 26 + Math.random() * 42);
        }
        await wait(2600);
        ptext.classList.add("out");
        await wait(550);
      }
    };
    ready.then(() => setTimeout(runPrompts, 1500));
  } else {
    $("#prompt-text").remove();
  }

  // Buttons: chat → contact, play → showreel (or work)
  const hasReel = !!SITE.showreel;
  const openReel = () => {
    const isFile = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(SITE.showreel);
    openModal({ title: "Showreel", youtube: isFile ? "" : SITE.showreel, video: isFile ? SITE.showreel : "", thumbnail: SITE.showreelThumbnail || "", format: SITE.showreelFormat || "horizontal" });
  };
  $("#talk-btn").setAttribute("aria-label", B.talk || "Let's talk");
  $("#talk-btn").dataset.cursor = B.talk || "Talk";
  const playBtn = $("#play-btn");
  playBtn.setAttribute("aria-label", hasReel ? B.showreel || "Watch showreel" : B.primary || "View work");
  playBtn.dataset.cursor = hasReel ? "Reel" : "Work";
  playBtn.addEventListener("click", () => (hasReel ? openReel() : scrollToEl("#work")));
  if (hasReel) {
    const b = $("#showreel-btn");
    b.hidden = false;
    b.addEventListener("click", openReel);
  }

  // Mouse over header: parallax + letters lift near the pointer
  const hm = { tx: 0, ty: 0, x: 0, y: 0, cx: -9999, cy: -9999, active: false };
  let heroInView = true;
  new IntersectionObserver(([en]) => (heroInView = en.isIntersecting)).observe(hero);
  if (fine && !reduced) {
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      hm.tx = (e.clientX / innerWidth) * 2 - 1;
      hm.ty = (e.clientY / innerHeight) * 2 - 1;
      hm.cx = e.clientX; hm.cy = e.clientY; hm.active = true; hm.moved = true;
    });
    hero.addEventListener("pointerleave", () => { hm.tx = 0; hm.ty = 0; hm.active = false; hm.moved = true; });
  }
  const nameChars = $$(".hero-name .ch").map((ch) => ({ ch, b: $("b", ch), h: 0 }));

  /* ---------- Floating light dust ---------- */
  let particles = null;
  if (S.particles !== false && !reduced && $("#particles")) particles = startParticles($("#particles"), hero);
  function startParticles(canvas, host) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const cols = ["#ffffff", "#d6d5d1", "#9a9995"];
    let w = 0, h = 0, pts = [], running = false, raf = 0;
    const mouse = { x: -9999, y: -9999 };
    const make = (y) => {
      const r = Math.random();
      return {
        x: Math.random() * w, y: y == null ? Math.random() * h : y, s: Math.random() * 1.5 + 0.35,
        vx: (Math.random() - 0.5) * 0.14, vy: -(Math.random() * 0.3 + 0.06), a: Math.random() * 0.55 + 0.15,
        c: r < 0.4 ? cols[0] : r < 0.72 ? cols[1] : cols[2], t: Math.random() * 6.28,
      };
    };
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp((w * h) / 8000, 40, fine ? 170 : 70));
      pts = Array.from({ length: n }, () => make());
    };
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of pts) {
        p.t += 0.015;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 25600) { const d = Math.sqrt(d2) || 1, f = (1 - d / 160) * 2.4; p.x += (dx / d) * f; p.y += (dy / d) * f; }
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) Object.assign(p, make(h + 10));
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(p.t));
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    host.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    host.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
      else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(host);
    size();
    return { size };
  }

  /* =====================================================================
     MOVING BAND
     ===================================================================== */
  const mq = $("#marquee");
  let mqRows = [];
  let mqInView = false, mqHover = false;
  {
    const big = (SITE.marquee && SITE.marquee.length ? SITE.marquee : [...disciplines, ...(SITE.services || []).map((s) => s.title)]).filter(Boolean);
    const small = (SITE.marqueeLines || []).filter(Boolean);
    if (!big.length || !mq) { if (mq) mq.remove(); }
    else {
      const unitBig = big.map((t, i) => `<span class="mq-item${i % 2 ? " alt" : ""}">${esc(t)}</span><span class="mq-sep"></span>`).join("");
      const unitSmall = small.map((t) => `<span class="mq-item">${esc(t)}</span>`).join("");
      const rep = (u, n) => Array(n).fill(u).join("");
      mq.innerHTML =
        `<div class="mq-row mq-big"><div class="mq-track">${rep(unitBig, 6)}</div></div>` +
        (small.length ? `<div class="mq-row mq-small"><div class="mq-track">${rep(unitSmall, 8)}</div></div>` : "");
      mqRows = $$(".mq-row", mq).map((row, i) => ({ track: $(".mq-track", row), x: 0, dir: i % 2 ? 1 : -1, w: 0, speed: i % 2 ? 0.45 : 0.7 }));
      new IntersectionObserver(([en]) => (mqInView = en.isIntersecting)).observe(mq);
      $(".mq-big", mq).addEventListener("mouseenter", () => (mqHover = true));
      $(".mq-big", mq).addEventListener("mouseleave", () => (mqHover = false));
    }
  }
  const measureMq = () => mqRows.forEach((r) => { r.w = r.track.scrollWidth / 2; if (r.dir > 0) r.x = -r.w; else r.x = 0; });

  /* =====================================================================
     WORK
     ===================================================================== */
  const works = (SITE.works || []).filter((w) => !w.hidden);
  const FOLDER = SITE.videoFolder ?? "videos/";
  const videoUrl = (v) => (!v ? "" : /^(https?:)?\/\//.test(v) || v.startsWith("/") || v.startsWith("./") ? v : FOLDER + v);
  const ytId = (v) => {
    if (!v) return "";
    v = String(v).trim();
    const m = v.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : "";
  };
  const thumbOf = (w) => w.thumbnail || (ytId(w.youtube) ? `https://img.youtube.com/vi/${ytId(w.youtube)}/maxresdefault.jpg` : "");
  const thumbFallback = (w) => (ytId(w.youtube) ? `https://img.youtube.com/vi/${ytId(w.youtube)}/hqdefault.jpg` : "");
  let moveInd = () => {};

  if ($("#work")) {
    const grid = $("#grid");
    const counts = {};
    works.forEach((w) => { if (w.category) counts[w.category] = (counts[w.category] || 0) + 1; });
    const categories = [SITE.filterAllLabel || "All", ...Object.keys(counts)];
    const all = categories[0];

    grid.innerHTML = works
      .map((w, i) => `
      <button class="card reveal ${w.format === "vertical" ? "vertical" : ""} ${ytId(w.youtube) || w.video ? "" : "missing"}" data-i="${i}" data-cat="${esc(w.category)}" aria-label="Play ${esc(w.title)}" style="--d:${(i % 4) * 90}ms" type="button">
        <div class="thumb">
          <img class="cover" src="${esc(thumbOf(w))}" data-fb="${esc(thumbFallback(w))}" alt="" loading="lazy" draggable="false">
          <div class="pv-slot"></div>
          <div class="shade"></div>
          <div class="glare"></div>
          <div class="t-top"><span class="t-title">${esc(w.title)}</span><span class="t-sub">${esc(w.category || "")}</span></div>
          <span class="t-mark">${esc(initials)}</span>
          <span class="t-num">${pad(i + 1)}</span>
          <div class="play"><span></span></div>
        </div>
        <div class="meta"><span>${esc(w.client || w.role || "")}</span><span>${esc(w.year || "")}</span></div>
      </button>`)
      .join("");
    const cards = $$(".card", grid);

    // Filters with a sliding pill
    const filters = $("#filters");
    if (S.showFilters === false || categories.length < 3) {
      filters.remove();
    } else {
      filters.innerHTML =
        '<span class="f-ind" aria-hidden="true"></span>' +
        categories.map((c, i) => `<button type="button" class="${i === 0 ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}<sup>${i === 0 ? works.length : counts[c]}</sup></button>`).join("");
      const ind = $(".f-ind", filters);
      moveInd = () => {
        const b = $("button.active", filters);
        if (!b) return;
        ind.style.width = b.offsetWidth + "px";
        ind.style.height = b.offsetHeight + "px";
        ind.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
      };
      moveInd();
      let fT;
      filters.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b || b.classList.contains("active")) return;
        $$("button", filters).forEach((x) => x.classList.toggle("active", x === b));
        moveInd();
        const cat = b.dataset.cat;
        clearTimeout(fT);
        grid.classList.add("fading");
        fT = setTimeout(() => {
          let n = 0;
          cards.forEach((c) => {
            const hide = cat !== all && c.dataset.cat !== cat;
            c.classList.toggle("hide", hide);
            c.classList.remove("pop");
            if (!hide) { c.classList.add("in"); c.style.setProperty("--pd", Math.min(n++, 10) * 60 + "ms"); }
          });
          void grid.offsetWidth;
          cards.forEach((c) => { if (!c.classList.contains("hide")) c.classList.add("pop"); });
          grid.classList.remove("fading");
        }, 280);
      });
    }

    grid.addEventListener("click", (e) => {
      const c = e.target.closest(".card");
      if (c) openModal(works[+c.dataset.i]);
    });
    $$("img.cover", grid).forEach((im) =>
      im.addEventListener("error", () => { if (im.dataset.fb && im.src !== im.dataset.fb) im.src = im.dataset.fb; })
    );

    // 3D tilt + glare under the mouse
    if (fine && S.tilt !== false && !reduced) {
      cards.forEach((card) => {
        const th = $(".thumb", card);
        card.addEventListener("pointermove", (e) => {
          if (e.pointerType !== "mouse") return;
          const r = th.getBoundingClientRect();
          const px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
          card.classList.add("tilting");
          th.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg");
          th.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
          th.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
          th.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        });
        card.addEventListener("pointerleave", () => {
          card.classList.remove("tilting");
          th.style.setProperty("--rx", "0deg");
          th.style.setProperty("--ry", "0deg");
        });
      });
    }

    // Hover preview: plays muted while the mouse is on the card. One at a time.
    const hoverOK = S.hoverPreview !== false && fine;
    let pv = null;
    const stopPreview = () => {
      if (!pv) return;
      pv.dead = true; clearTimeout(pv.timer);
      try { pv.player && pv.player.destroy(); } catch (e) {}
      if (pv.video) { pv.video.pause(); pv.video.removeAttribute("src"); pv.video.load(); }
      pv.slot.innerHTML = "";
      pv.card.classList.remove("previewing", "live");
      pv = null;
    };
    const startPreview = (card, w) => {
      stopPreview();
      const id = ytId(w.youtube), file = w.video ? videoUrl(w.video) : "";
      if (!id && !file) return;
      const slot = $(".pv-slot", card);
      const cur = (pv = { card, slot, dead: false });
      card.classList.add("previewing");
      cur.timer = setTimeout(() => {
        if (cur.dead) return;
        if (id) {
          slot.innerHTML = "<div></div>";
          loadYT().then((YT) => {
            if (cur.dead) return;
            cur.player = new YT.Player(slot.firstChild, {
              videoId: id, host: YTHOST,
              playerVars: ytVars({ autoplay: 1, mute: 1, loop: 1, playlist: id }),
              events: {
                onReady: (e) => { if (cur.dead) return; e.target.mute(); e.target.playVideo(); },
                onStateChange: (e) => { if (e.data === 1 && !cur.dead) card.classList.add("live"); },
              },
            });
          }).catch(() => {});
        } else {
          const v = document.createElement("video");
          v.muted = true; v.loop = true; v.playsInline = true; v.draggable = false; v.src = file;
          v.setAttribute("controlslist", "nodownload"); v.disablePictureInPicture = true;
          v.addEventListener("playing", () => { if (!cur.dead) card.classList.add("live"); });
          slot.appendChild(v); cur.video = v;
          const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
        }
      }, 220);
    };
    if (hoverOK) {
      cards.forEach((card) => {
        card.addEventListener("mouseenter", () => startPreview(card, works[+card.dataset.i]));
        card.addEventListener("mouseleave", stopPreview);
      });
    }
    grid.addEventListener("click", stopPreview, true);
  }

  /* =====================================================================
     ABOUT
     ===================================================================== */
  let aboutWords = [], aboutInView = false, litN = -1;
  if ($("#about")) {
    const A = SITE.about || {};
    const box = $("#about-img"), barsBox = $("#about-bars"), counter = $("#about-count");
    const fade = A.fadeSeconds ?? 1.2;
    const period = ((A.holdSeconds ?? 4) + fade) * 1000;
    box.style.setProperty("--fade", fade + "s");
    barsBox.style.setProperty("--period", period + "ms");
    const list = (A.images && A.images.length ? A.images : [A.image]).filter(Boolean);
    let slides = [], cur = 0, timer;
    const renderBars = () => {
      barsBox.innerHTML = slides.length > 1 ? slides.map((_, i) => `<button type="button" aria-label="Photo ${i + 1}"><i></i></button>`).join("") : "";
      counter.textContent = slides.length > 1 ? `${pad(cur + 1)} / ${pad(slides.length)}` : "";
    };
    const show = (i) => {
      if (!slides.length) return;
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle("active", j === cur));
      $$("button", barsBox).forEach((b, j) => {
        b.classList.toggle("done", j < cur);
        b.classList.remove("on");
        if (j === cur) { void b.offsetWidth; b.classList.add("on"); }
      });
      if (slides.length > 1) counter.textContent = `${pad(cur + 1)} / ${pad(slides.length)}`;
      clearTimeout(timer);
      if (slides.length > 1 && !reduced) timer = setTimeout(() => show(cur + 1), period);
    };
    const firstOverlay = $(".duo", box);
    list.forEach((src) => {
      const im = document.createElement("img");
      im.src = src;
      im.alt = A.imageAlt || SITE.name;
      im.draggable = false;
      im.onerror = () => { // a missing photo is skipped, never shown broken
        slides = slides.filter((s) => s !== im);
        im.remove();
        renderBars();
        show(Math.min(cur, slides.length - 1));
      };
      box.insertBefore(im, firstOverlay);
      slides.push(im);
    });
    renderBars();
    show(0);
    barsBox.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) show($$("button", barsBox).indexOf(b));
    });
    const vis = $("#about-visual");
    if (fine && !reduced) {
      vis.addEventListener("pointermove", (e) => {
        const r = vis.getBoundingClientRect();
        vis.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        vis.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      vis.addEventListener("pointerleave", () => { vis.style.setProperty("--px", 0); vis.style.setProperty("--py", 0); });
    }
    const badge = $("#about-badge");
    if (SITE.availability || SITE.role) {
      badge.innerHTML = `<b>${SITE.availability ? '<i class="dot"></i>' : ""}${esc(SITE.availability || SITE.role)}</b><span>${esc(SITE.availability ? SITE.role : SITE.disciplines || "")}</span>`;
    } else badge.remove();

    const heading = $("#about-heading");
    heading.textContent = A.heading || "";
    splitHeading(heading);
    $("#about-paras").innerHTML = (A.paragraphs || [])
      .map((p) => `<p>${String(p).trim().split(/\s+/).map((w) => `<span class="wd">${esc(w)}</span>`).join(" ")}</p>`)
      .join("");
    aboutWords = $$("#about-paras .wd");
    if (reduced) aboutWords.forEach((w) => w.classList.add("lit"));
    new IntersectionObserver(([en]) => (aboutInView = en.isIntersecting)).observe($("#about-paras"));

    if ((SITE.stats || []).length) {
      $("#stats").innerHTML = SITE.stats
        .map((s) => `<div><b data-value="${esc(s.value)}">${esc(s.value)}</b><span>${esc(s.label)}</span></div>`)
        .join("");
    } else $("#stats").remove();
  }

  /* =====================================================================
     SERVICES
     ===================================================================== */
  if ($("#services")) {
    if ((SITE.services || []).length) {
      $("#services-list").innerHTML = SITE.services
        .map((s, i) => `
        <article class="service glass reveal" style="--d:${i * 100}ms">
          <div class="s-top"><span class="n">${pad(i + 1)}</span><span class="s-arrow" aria-hidden="true">↗</span></div>
          <div class="folder" aria-hidden="true"><i class="f-back"></i><i class="f-paper"></i><i class="f-front"></i></div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </article>`)
        .join("");
      if (fine) {
        $$(".service").forEach((el) => {
          el.addEventListener("pointermove", (e) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--sx", e.clientX - r.left + "px");
            el.style.setProperty("--sy", e.clientY - r.top + "px");
          });
        });
      }
    } else $("#services").remove();
  }

  /* =====================================================================
     CONTACT + FOOTER
     ===================================================================== */
  if ($("#contact")) {
    $("#contact-big").innerHTML = `${esc(C.headingLine1 || "")}<br><em>${esc(C.headingLine2 || "")}</em>`;
    const mail = $("#email-link");
    mail.href = `mailto:${SITE.email}`;
    mail.innerHTML = `${esc(SITE.email)} <span aria-hidden="true">↗</span>`;
    const copy = $("#copy-btn");
    copy.textContent = C.copyLabel || "Copy";
    let cT;
    copy.addEventListener("click", async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(SITE.email); ok = true; } catch (e) {
        const t = document.createElement("textarea");
        t.value = SITE.email; t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        try { ok = document.execCommand("copy"); } catch (err) {}
        t.remove();
      }
      if (!ok) return;
      copy.textContent = (C.copiedLabel || "Copied") + " ✓";
      copy.classList.add("ok");
      clearTimeout(cT);
      cT = setTimeout(() => { copy.textContent = C.copyLabel || "Copy"; copy.classList.remove("ok"); }, 1800);
    });
    $("#form").action = SITE.formEndpoint;
  }
  const socialHTML = (SITE.social || [])
    .filter((s) => s && s.url)
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
    .join("");
  $("#socials").innerHTML = socialHTML;
  if ($("#contact-socials")) $("#contact-socials").innerHTML = socialHTML;
  $("#footer-copy").textContent = SITE.footerText || `© ${new Date().getFullYear()} ${SITE.name}`;
  $("#to-top").addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.8 }) : window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })));

  /* =====================================================================
     VIDEO PLAYER (built in, custom controls)
     ===================================================================== */
  const modal = $("#modal");
  const SKIP = S.skipSeconds ?? 10;
  const label = `<text x="12" y="16.3" font-size="6.5" font-weight="700" text-anchor="middle" font-family="sans-serif">${SKIP}</text>`;
  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    back: `<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/>${label}</svg>`,
    fwd: `<svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6h2c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8z"/>${label}</svg>`,
    vol: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.8-1-3.3-2.5-4v8c1.5-.7 2.5-2.2 2.5-4zM14 3.2v2.1c2.9.9 5 3.5 5 6.7s-2.1 5.8-5 6.7v2.1c4-.9 7-4.5 7-8.8s-3-7.9-7-8.8z"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.8-1-3.3-2.5-4v2.2l2.5 2.5V12zM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5c.7-1.2 1-2.6 1-4.1 0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3L3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.4.9-2.3 1.1v2.1c1.4-.3 2.6-1 3.7-1.8l2 2 1.3-1.3L4.3 3zM12 4L9.9 6.1 12 8.2V4z"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  };
  let active = null;

  const fmt = (t) => {
    if (!isFinite(t)) return "0:00";
    t = Math.max(0, Math.floor(t));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  };

  const YTHOST = "https://www.youtube-nocookie.com";
  let ytPromise = null;
  function loadYT() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (ytPromise) return ytPromise;
    ytPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => { ytPromise = null; reject(new Error("api")); };
      document.head.appendChild(s);
      setTimeout(() => { if (!(window.YT && window.YT.Player)) { ytPromise = null; reject(new Error("timeout")); } }, 12000);
    });
    return ytPromise;
  }
  function ytVars(extra) {
    const v = { controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, rel: 0, playsinline: 1, cc_load_policy: 0, enablejsapi: 1, ...extra };
    if (/^https?:$/.test(location.protocol)) v.origin = location.origin;
    return v;
  }
  if ((SITE.works || []).some((w) => ytId(w.youtube))) setTimeout(() => loadYT().catch(() => {}), 2500);

  function ytAdapter(id, slot, startMuted) {
    const m = { onevent() {}, ready: false, dead: false };
    const parent = slot.parentNode;
    let p, st = -2, poll, key = "", everPlayed = false, triedAlt = false;
    const call = (fn, ...a) => { try { return p && m.ready ? p[fn](...a) : undefined; } catch (e) { return undefined; } };
    const create = (YT, el, host) => {
      p = new YT.Player(el, {
        videoId: id, host,
        playerVars: ytVars({ autoplay: 1, mute: startMuted ? 1 : 0 }),
        events: {
          onReady: () => {
            if (m.dead) return;
            m.ready = true;
            call("playVideo");
            setTimeout(() => { if (!m.dead && !everPlayed && st !== 3) { call("mute"); call("playVideo"); } }, 1500);
            if (!poll) poll = setInterval(() => {
              m.onevent("tick");
              const k = m.isMuted() + "|" + m.vol();
              if (k !== key) { key = k; m.onevent("volume"); }
            }, 250);
            m.onevent("volume");
          },
          onStateChange: (e) => {
            st = e.data;
            if (st === 1) { everPlayed = true; m.onevent("play"); m.onevent("playing"); }
            else if (st === 2) m.onevent("pause");
            else if (st === 3) m.onevent("waiting");
            else if (st === 0) m.onevent("ended");
          },
          onError: (e) => {
            if (m.dead) return;
            const code = e && e.data;
            if ((code === 101 || code === 150 || code === 153) && !triedAlt) {
              triedAlt = true; m.ready = false;
              try { p.destroy(); } catch (x) {}
              const el2 = document.createElement("div");
              parent.appendChild(el2);
              create(YT, el2, "https://www.youtube.com");
              return;
            }
            m.onevent("error", code);
          },
        },
      });
    };
    loadYT().then((YT) => { if (!m.dead) create(YT, slot, YTHOST); }).catch(() => m.onevent("error", "api"));
    Object.assign(m, {
      kind: "yt",
      play: () => call("playVideo"),
      pause: () => call("pauseVideo"),
      seek: (t) => call("seekTo", t, true),
      time: () => call("getCurrentTime") || 0,
      dur: () => call("getDuration") || 0,
      buf: () => call("getVideoLoadedFraction") || 0,
      isMuted: () => !!call("isMuted"),
      vol: () => (call("getVolume") ?? 100) / 100,
      mute: (b) => call(b ? "mute" : "unMute"),
      setVol: (x) => call("setVolume", Math.round(x * 100)),
      destroy: () => { m.dead = true; clearInterval(poll); try { p && p.destroy(); } catch (e) {} },
    });
    return m;
  }

  function fileAdapter(src, slot, startMuted) {
    const m = { onevent() {}, kind: "file" };
    const v = document.createElement("video");
    v.className = "pv"; v.playsInline = true; v.preload = "auto"; v.draggable = false;
    v.setAttribute("controlslist", "nodownload noremoteplayback noplaybackrate");
    v.disablePictureInPicture = true; v.disableRemotePlayback = true;
    if (src) v.src = src;
    slot.replaceWith(v);
    const map = { play: "play", pause: "pause", waiting: "waiting", playing: "playing", ended: "ended", error: "error", volumechange: "volume",
      timeupdate: "tick", progress: "tick", loadedmetadata: "tick", durationchange: "tick", seeked: "tick", canplay: "playing", loadeddata: "playing" };
    Object.entries(map).forEach(([ev, out]) => v.addEventListener(ev, () => m.onevent(out)));
    v.muted = !!startMuted;
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => { v.muted = true; v.play().catch(() => {}); });
    Object.assign(m, {
      el: v,
      play: () => { const q = v.play(); if (q && q.catch) q.catch(() => {}); },
      pause: () => v.pause(),
      seek: (t) => { v.currentTime = t; },
      time: () => v.currentTime || 0,
      dur: () => (isFinite(v.duration) ? v.duration : 0),
      buf: () => (v.duration && v.buffered.length ? v.buffered.end(v.buffered.length - 1) / v.duration : 0),
      isMuted: () => v.muted,
      vol: () => v.volume,
      mute: (b) => { v.muted = b; },
      setVol: (x) => { v.volume = x; },
      destroy: () => { v.pause(); v.removeAttribute("src"); v.load(); },
    });
    if (!src) setTimeout(() => m.onevent("error"), 0);
    return m;
  }

  function buildPlayer(w, wrap) {
    const id = ytId(w.youtube), file = w.video ? videoUrl(w.video) : "";
    const cover = thumbOf(w);
    wrap.classList.add("paused", "loading");
    wrap.innerHTML = `
      <div class="p-stage"><div class="p-slot"></div></div>
      ${cover ? `<img class="p-cover" src="${esc(cover)}" alt="" draggable="false">` : ""}
      <div class="p-click"></div>
      <div class="p-big">${ICON.play}</div>
      <div class="p-spin"></div>
      <div class="p-msg" hidden></div>
      <div class="p-bar">
        <input class="p-seek" type="range" min="0" max="1000" step="1" value="0" aria-label="Seek">
        <div class="p-row">
          <button class="p-btn p-play" aria-label="Play">${ICON.play}</button>
          <button class="p-btn p-back" aria-label="Back ${SKIP} seconds">${ICON.back}</button>
          <button class="p-btn p-fwd" aria-label="Forward ${SKIP} seconds">${ICON.fwd}</button>
          <span class="p-time">0:00 / 0:00</span>
          <span class="p-gap"></span>
          <button class="p-btn p-mute" aria-label="Mute">${ICON.vol}</button>
          <input class="p-vol" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume">
          <button class="p-btn p-full" aria-label="Fullscreen">${ICON.full}</button>
        </div>
      </div>`;
    const cov = $(".p-cover", wrap);
    if (cov && w.thumbnail === "" && id) cov.addEventListener("error", () => { if (cov.src !== thumbFallback(w)) cov.src = thumbFallback(w); });

    const slot = $(".p-slot", wrap), seek = $(".p-seek", wrap), vol = $(".p-vol", wrap);
    const time = $(".p-time", wrap), msg = $(".p-msg", wrap), playBtnP = $(".p-play", wrap);
    const startMuted = !!S.viewerStartsMuted;
    const media = id ? ytAdapter(id, slot, startMuted) : fileAdapter(file, slot, startMuted);
    let playing = false, ended = false, scrubbing = false, idleT, fake = null, lastSeek = 0;

    const doSeek = (t) => {
      const d = media.dur();
      t = Math.max(0, d ? Math.min(t, d) : t);
      fake = { t, until: performance.now() + 800 };
      media.seek(t);
    };
    const toggle = () => {
      if (!playing) {
        if (ended) { ended = false; wrap.classList.remove("ended"); doSeek(0); }
        media.play();
      } else media.pause();
    };
    const skip = (sec) => { if (media.dur()) doSeek((fake && performance.now() < fake.until ? fake.t : media.time()) + sec); };
    const mute = () => {
      const off = media.isMuted() || media.vol() === 0;
      if (off) { media.mute(false); if (media.vol() === 0) media.setVol(0.6); } else media.mute(true);
    };
    const canFull = !!(wrap.requestFullscreen || wrap.webkitRequestFullscreen || (media.el && media.el.webkitEnterFullscreen));
    if (!canFull) $(".p-full", wrap).hidden = true;
    const full = () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      if (fs) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
      else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
      else if (media.el && media.el.webkitEnterFullscreen) media.el.webkitEnterFullscreen();
    };
    const wake = () => {
      wrap.classList.remove("idle");
      clearTimeout(idleT);
      if (playing) idleT = setTimeout(() => wrap.classList.add("idle"), 2500);
    };
    const paint = () => {
      const d = media.dur();
      const t = fake && performance.now() < fake.until ? fake.t : media.time();
      const p = d ? Math.min(100, (t / d) * 100) : 0;
      const bu = media.buf() * 100;
      if (!scrubbing) seek.value = d ? (t / d) * 1000 : 0;
      seek.style.setProperty("--p", p + "%");
      seek.style.setProperty("--b", Math.max(bu, p) + "%");
      time.textContent = `${fmt(t)} / ${fmt(d)}`;
    };
    const setPlayIcon = () => {
      playBtnP.innerHTML = playing ? ICON.pause : ICON.play;
      playBtnP.setAttribute("aria-label", playing ? "Pause" : "Play");
      wrap.classList.toggle("paused", !playing);
    };

    $(".p-click", wrap).addEventListener("click", toggle);
    $(".p-click", wrap).addEventListener("dblclick", full);
    playBtnP.addEventListener("click", toggle);
    $(".p-back", wrap).addEventListener("click", () => skip(-SKIP));
    $(".p-fwd", wrap).addEventListener("click", () => skip(SKIP));
    $(".p-mute", wrap).addEventListener("click", mute);
    $(".p-full", wrap).addEventListener("click", full);
    vol.addEventListener("input", () => { media.setVol(+vol.value); media.mute(+vol.value === 0); });
    seek.addEventListener("input", () => {
      scrubbing = true;
      const d = media.dur();
      if (d) {
        const t = (seek.value / 1000) * d;
        fake = { t, until: performance.now() + 800 };
        time.textContent = `${fmt(t)} / ${fmt(d)}`;
        if (performance.now() - lastSeek > 150) { lastSeek = performance.now(); media.seek(t); }
      }
      seek.style.setProperty("--p", seek.value / 10 + "%");
    });
    seek.addEventListener("change", () => {
      scrubbing = false;
      if (media.dur()) doSeek((seek.value / 1000) * media.dur());
      paint();
    });

    media.onevent = (type, arg) => {
      if (type === "tick") paint();
      else if (type === "play") { playing = true; ended = false; wrap.classList.remove("ended"); wrap.classList.add("started"); setPlayIcon(); wake(); }
      else if (type === "pause") { playing = false; setPlayIcon(); wake(); }
      else if (type === "waiting") wrap.classList.add("loading");
      else if (type === "playing") { wrap.classList.remove("loading"); paint(); }
      else if (type === "ended") { playing = false; ended = true; wrap.classList.add("ended"); setPlayIcon(); wake(); paint(); }
      else if (type === "volume") {
        const off = media.isMuted() || media.vol() === 0;
        $(".p-mute", wrap).innerHTML = off ? ICON.mute : ICON.vol;
        $(".p-mute", wrap).setAttribute("aria-label", off ? "Unmute" : "Mute");
        vol.value = off ? 0 : media.vol();
        vol.style.setProperty("--v", (off ? 0 : media.vol() * 100) + "%");
      } else if (type === "error") {
        wrap.classList.remove("loading");
        msg.hidden = false;
        let head, tip;
        if (!id) {
          head = "Video not found.";
          tip = `Check the file name in content.js and that the file is uploaded:<br>${esc(file || "(no video set)")}`;
        } else if (arg === "api") {
          head = "The YouTube player could not load.";
          tip = "Check your internet connection. If you use an ad-blocker or privacy extension, turn it off for this site and reload.";
        } else if (arg === 100) {
          head = "YouTube cannot find this video.";
          tip = "Check the video ID in content.js. The video may be private or deleted.";
        } else if (arg === 2) {
          head = "The video ID looks wrong.";
          tip = "Check the youtube value in content.js. It should be the 11-letter ID or the full link.";
        } else if (arg === 101 || arg === 150) {
          head = "This video is not allowed to be embedded.";
          tip = "In YouTube Studio open the video, click &quot;Show more&quot; and turn ON &quot;Allow embedding&quot;. The video must be Public or Unlisted.";
        } else if (location.protocol === "file:") {
          head = "YouTube videos do not play from a file on your computer.";
          tip = "Open the site through a local server (for example the VS Code &quot;Live Server&quot; extension) or open your GitHub Pages link.";
        } else if (arg === 153) {
          head = "YouTube could not verify this website.";
          tip = "Open the site from http://localhost or your GitHub Pages link, and make sure no privacy extension is blocking the referrer.";
        } else {
          head = "This video can't be played.";
          tip = "Check the video ID in content.js and that &quot;Allow embedding&quot; is ON in YouTube Studio.";
        }
        msg.innerHTML = `${head}<br><small>${tip}${arg !== undefined && arg !== "api" && id ? `<br>(YouTube error ${arg})` : ""}</small>`;
      }
    };
    ["mousemove", "pointerdown", "touchstart"].forEach((ev) => wrap.addEventListener(ev, wake, { passive: true }));
    wrap.addEventListener("click", (e) => { const b = e.target.closest(".p-btn"); if (b && e.detail > 0) b.blur(); });
    vol.addEventListener("change", () => vol.blur());
    vol.style.setProperty("--v", "100%");
    if (!id && !file) media.onevent("error");

    return { toggle, skip, mute, full, wake, destroy() { clearTimeout(idleT); media.destroy(); } };
  }

  let bigMode = false;
  const syncSize = () => {
    modal.classList.toggle("big", bigMode);
    $("#modal-size").setAttribute("aria-pressed", String(bigMode));
    $("#modal-size-label").textContent = bigMode ? "Show details" : "Expand video";
  };
  let lastFocus = null;
  function openModal(w) {
    if (active) { active.destroy(); active = null; }
    lastFocus = document.activeElement;
    const vertical = w.format === "vertical";
    const rows = [["Client", w.client], ["Role", w.role], ["Year", w.year], ["Type", w.category]]
      .filter((r) => r[1])
      .map((r) => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`)
      .join("");
    $("#modal-inner").className = "modal-inner " + (vertical ? "vertical" : "");
    $("#modal-inner").innerHTML = `
      <div class="player-col"><div class="player"></div></div>
      <div class="modal-info">
        <span class="eyebrow">${esc(w.category || "")}</span>
        <h3>${esc(w.title)}</h3>
        ${w.description ? `<p>${esc(w.description)}</p>` : ""}
        ${rows ? `<dl class="details">${rows}</dl>` : ""}
        ${(w.tools || []).length ? `<div class="tags">${w.tools.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      </div>`;
    modal.classList.add("open");
    modalOpen = true;
    syncSize();
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
    active = buildPlayer(w, $("#modal-inner .player"));
    $("#modal-close").focus({ preventScroll: true });
  }
  function closeModal() {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
    if (active) { active.destroy(); active = null; }
    modal.classList.remove("open");
    modalOpen = false;
    $("#modal-inner").innerHTML = "";
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  const toggleSize = () => { bigMode = !bigMode; syncSize(); };
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal-size").addEventListener("click", (e) => { toggleSize(); if (e.detail > 0) e.currentTarget.blur(); });
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.id === "modal-inner" || e.target.classList.contains("modal-top") || e.target.classList.contains("player-col")) closeModal();
  });

  // Keyboard: Space/K play-pause, Left/Right skip, M mute, F fullscreen, T expand, Esc close
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (!active) return;
    const k = e.key.toLowerCase();
    const onButton = e.target.closest && e.target.closest("button");
    if (k === "k" || (k === " " && !onButton)) { e.preventDefault(); active.toggle(); }
    else if (k === "arrowleft") { e.preventDefault(); active.skip(-SKIP); }
    else if (k === "arrowright") { e.preventDefault(); active.skip(SKIP); }
    else if (k === "m") active.mute();
    else if (k === "f") active.full();
    else if (k === "t") toggleSize();
    else return;
    active.wake();
  });

  if (S.protectVideos !== false) {
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest && e.target.closest("video, .player, .thumb")) e.preventDefault();
    });
    document.addEventListener("dragstart", (e) => {
      if (e.target.closest && e.target.closest("video, .player, .thumb")) e.preventDefault();
    });
  }

  /* ---------- Contact form ---------- */
  if ($("#form")) {
    $("#form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, btn = $("#send-btn"), lab = $("#send-label"), st = $("#status");
      const text = lab.textContent;
      btn.disabled = true; lab.textContent = C.sending || "Sending…";
      try {
        const r = await fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error();
        st.textContent = C.success || "Message sent."; f.reset();
      } catch (err) {
        st.textContent = C.error || "Something went wrong.";
      }
      btn.disabled = false; lab.textContent = text;
      setTimeout(() => (st.textContent = ""), 6000);
    });
  }

  /* ---------- Count-up numbers ---------- */
  const parts = (raw) => String(raw).match(/^(\D*)([\d.,]+)(\D*)$/);
  const countMs = Math.max(0.3, S.countUpSeconds ?? 1.6) * 1000;
  function countUp(el, delay) {
    const m = parts(el.dataset.value);
    if (!m || reduced) { el.textContent = el.dataset.value; return; }
    const [, pre, num, suf] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    const dec = (num.split(".")[1] || "").length;
    setTimeout(() => {
      const t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / countMs, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (target * e).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, delay);
  }
  const statEls = $$(".stats b");
  statEls.forEach((el) => { const m = parts(el.dataset.value); if (m && !reduced) el.textContent = m[1] + "0" + m[3]; });
  if ($("#stats")) {
    const statIO = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      statEls.forEach((el, i) => countUp(el, 250 + i * 140));
      statIO.disconnect();
    }, { threshold: 0.4 });
    statIO.observe($("#stats"));
  }

  /* =====================================================================
     CURSOR, MAGNETIC BUTTONS, MOUSE LIGHT
     ===================================================================== */
  const cur = { x: -100, y: -100, rx: -100, ry: -100, on: false };
  let dot = null, ring = null;
  if (S.customCursor !== false && fine) {
    dot = document.createElement("div"); dot.className = "cursor-dot";
    ring = document.createElement("div"); ring.className = "cursor-ring"; ring.innerHTML = "<span></span>";
    document.body.append(ring, dot);
    root.classList.add("has-cursor");
    const lab = $("span", ring);
    document.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      // follows the mouse instantly (no delay)
      const tr = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      dot.style.transform = tr;
      ring.style.transform = tr;
      if (!cur.on) { cur.on = true; root.classList.add("cursor-on"); }
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { cur.on = false; root.classList.remove("cursor-on"); });
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const inPlayer = !!t.closest(".player");
      const card = t.closest(".card"), tagged = t.closest("[data-cursor]");
      const text = card ? "Play" : tagged ? tagged.dataset.cursor : "";
      const link = !text && !!t.closest("a, button, [role=button], select, label[for], .mq-item");
      const typing = !text && !link && !!t.closest("input, textarea, [contenteditable=true]");
      ring.classList.toggle("hidden", inPlayer);
      dot.classList.toggle("hidden", inPlayer || !!text);
      ring.classList.toggle("label", !!text);
      lab.textContent = text;
      ring.classList.toggle("link", link);
      ring.classList.toggle("text", typing);
      dot.classList.toggle("text", typing);
    });
  }

  if (fine && !reduced) {
    $$("[data-magnetic]").forEach((el) => {
      const k = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - (r.left + r.width / 2)) * k).toFixed(1)}px ${((e.clientY - (r.top + r.height / 2)) * k).toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => (el.style.translate = ""));
    });
  }

  const glow = $("#mouse-glow");
  const gl = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
  if (glow && fine && S.mouseGlow !== false && !reduced) {
    document.addEventListener("pointermove", (e) => {
      gl.tx = e.clientX; gl.ty = e.clientY;
      glow.classList.add("on");
    }, { passive: true });
  } else if (glow) glow.remove();

  /* =====================================================================
     SCROLL: reveal, menu, progress, active link
     ===================================================================== */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { threshold: 0.05, rootMargin: "0px 0px 4% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  const navLinks = $$("#nav-list a");
  if (navLinks.length) {
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.dataset.sec === en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach((a) => { const s = $("#" + a.dataset.sec); if (s) secIO.observe(s); });
  }

  /* =====================================================================
     ONE ANIMATION LOOP FOR EVERYTHING
     ===================================================================== */
  const nav = $("#nav"), progress = $("#progress");
  // section positions are measured once (and on resize), not on every frame
  const themed = $$("[data-theme]").map((el) => ({ el, top: 0, bottom: 0, dark: el.dataset.theme !== "light" }));
  const measureThemes = () => themed.forEach((s) => { const r = s.el.getBoundingClientRect(); s.top = r.top + scrollY; s.bottom = r.bottom + scrollY; });
  measureThemes();
  let navDark = true, lastProg = -1, maxScroll = 1;
  const measureMax = () => (maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight));
  measureMax();
  let lastY = window.scrollY, vel = 0, lastT = performance.now(), scrollDir = 1, lastHs = -1, chipsMoving = false;
  function loop(t) {
    if (lenis) lenis.raf(t);
    const dt = Math.min(64, t - lastT) / 16.67;
    lastT = t;
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    vel = lerp(vel, dy, 0.12);

    // progress bar + menu
    if (dy !== 0 || lastProg < 0) {
      const prog = clamp(y / maxScroll, 0, 1);
      if (Math.abs(prog - lastProg) > 0.0005) { progress.style.transform = `scaleX(${prog.toFixed(4)})`; lastProg = prog; }
      nav.classList.toggle("scrolled", y > 30);
      if (!modalOpen) {
        if (dy > 3 && y > 240) nav.classList.add("hidden");
        else if (dy < -3 || y < 240) nav.classList.remove("hidden");
      }
      // the menu turns dark on light sections and light on dark sections
      const probe = y + 36;
      for (const s of themed) {
        if (s.top <= probe && s.bottom > probe) {
          if (s.dark !== navDark) { navDark = s.dark; nav.classList.toggle("t-dark", s.dark); nav.classList.toggle("t-light", !s.dark); }
          break;
        }
      }
    }

    // header scroll fade
    if (y < innerHeight * 1.3) {
      const hs = clamp(y / innerHeight, 0, 1);
      if (Math.abs(hs - lastHs) > 0.001) { hero.style.setProperty("--hs", hs.toFixed(3)); lastHs = hs; }
    }

    // header mouse parallax + letter lift
    const mouseMoved = hm.moved;
    hm.moved = false;
    if (heroInView && fine && !reduced && (mouseMoved || chipsMoving || Math.abs(hm.x - hm.tx) > 0.002 || Math.abs(hm.y - hm.ty) > 0.002)) {
      hm.x = lerp(hm.x, hm.tx, 0.12 * dt);
      hm.y = lerp(hm.y, hm.ty, 0.12 * dt);
      hero.style.setProperty("--mx", hm.x.toFixed(3));
      hero.style.setProperty("--my", hm.y.toFixed(3));
      if (nameChars.length && (mouseMoved || !hm.active)) {
        const rects = nameChars.map((c) => c.ch.getBoundingClientRect());
        nameChars.forEach((c, i) => {
          let h = 0;
          if (hm.active) {
            const r = rects[i];
            const d = Math.hypot(r.left + r.width / 2 - hm.cx, (r.top + r.height / 2 - hm.cy) * 1.3);
            h = clamp(1 - d / 240, 0, 1);
            h = h * h * (3 - 2 * h);
          }
          if (Math.abs(h - c.h) > 0.01) { c.h = h; c.b.style.setProperty("--h", h.toFixed(3)); }
        });
      }
      // glass cards glide away from the mouse and drift back
      if (chipList.length && stageEl) {
        const sr = stageEl.getBoundingClientRect();
        const R = 210;
        chipsMoving = false;
        chipList.forEach((c) => {
          let tx = 0, ty = 0;
          if (hm.active && !window.__pfEditOn) { // cards hold still in edit mode so they can be clicked
            const cx = sr.left + c.el.offsetLeft + c.el.offsetWidth / 2;
            const cy = sr.top + c.el.offsetTop + c.el.offsetHeight / 2;
            const dx = cx - hm.cx, dy = cy - hm.cy, d = Math.hypot(dx, dy) || 1;
            if (d < R) { const f = 1 - d / R, push = f * f * 90; tx = (dx / d) * push; ty = (dy / d) * push; }
          }
          const nx = lerp(c.x, tx, 0.22 * dt), ny = lerp(c.y, ty, 0.22 * dt);
          if (Math.abs(nx - c.x) > 0.05 || Math.abs(ny - c.y) > 0.05) {
            chipsMoving = true;
            c.x = nx; c.y = ny;
            c.el.style.setProperty("--dx", nx.toFixed(1) + "px");
            c.el.style.setProperty("--dy", ny.toFixed(1) + "px");
            c.el.style.setProperty("--dr", (nx * 0.12).toFixed(2) + "deg");
          }
        });
      }
    }

    // moving band
    if (mqInView && mqRows.length && !reduced) {
      if (vel < -0.3) scrollDir = -1; else if (vel > 0.3) scrollDir = 1;
      const skew = clamp(-vel * 0.25, -7, 7);
      mqRows.forEach((r) => {
        if (!r.w) return;
        const sp = (r.speed * (mqHover ? 0.25 : 1) + Math.min(Math.abs(vel) * 0.35, 14)) * dt;
        r.x += r.dir * scrollDir * sp;
        if (r.x <= -r.w) r.x += r.w;
        if (r.x > 0) r.x -= r.w;
        r.track.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      });
    }

    // about text lights up word by word while scrolling
    if (aboutInView && aboutWords.length && !reduced) {
      const r = $("#about-paras").getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.25), 0, 1);
      const n = Math.round(p * aboutWords.length * 1.1);
      if (n !== litN) {
        aboutWords.forEach((w, i) => w.classList.toggle("lit", i < n));
        litN = n;
      }
    }

    // mouse light
    if (glow && glow.isConnected) {
      gl.x = lerp(gl.x, gl.tx, 0.08 * dt);
      gl.y = lerp(gl.y, gl.ty, 0.08 * dt);
      glow.style.transform = `translate3d(${gl.x.toFixed(1)}px, ${gl.y.toFixed(1)}px, 0)`;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- Resize + fonts ---------- */
  const onLayout = () => { refit(); measureMq(); moveInd(); measureThemes(); measureMax(); if (particles) particles.size(); };
  let rz = 0, lastW = innerWidth;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      // phones fire resize when the address bar hides; only redo layout when the width changes
      if (innerWidth === lastW && !fine) { if (particles) particles.size(); return; }
      lastW = innerWidth;
      onLayout();
    });
  });
  if (fontLink) fontLink.addEventListener("load", () => document.fonts && document.fonts.ready.then(onLayout));
  if (document.fonts) {
    document.fonts.ready.then(onLayout);
    document.fonts.addEventListener && document.fonts.addEventListener("loadingdone", onLayout);
  }
  window.addEventListener("load", onLayout);
  // keep section positions right if the page height changes (images loading, filters)
  if (window.ResizeObserver) new ResizeObserver(() => { measureThemes(); measureMax(); }).observe(document.body);
  measureMq();

  if (EDIT) {
    const ed = document.createElement("script");
    ed.src = "editor.js";
    document.body.appendChild(ed);
  }
})();
