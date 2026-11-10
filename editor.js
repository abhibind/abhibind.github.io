/* =====================================================================
   EDIT MODE — you do NOT need to edit this file.
   Open your site with ?edit at the end of the link, e.g.
     https://yourname.github.io/portfolio/?edit
   Click any text to change it, then Publish (saves to GitHub) or
   Download (gives you a new content.js to upload yourself).
   Visitors never see this: without your GitHub key nothing is editable,
   and changes only reach the real site through your GitHub account.
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (v = "") =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getPath = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const root = document.documentElement;

  const K_DRAFT = "pf-edit-draft", K_GH = "pf-edit-github", K_SCROLL = "pf-edit-scroll", K_HINT = "pf-edit-hint";
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost)$/.test(location.hostname);

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "editor.css";
  document.head.appendChild(css);

  /* ---------------------------------------------------------------
     1. Read content.js and remember where every piece of text sits,
        so only the text changes when we save (your notes stay).
     --------------------------------------------------------------- */
  function parseSource(src) {
    const start = /\bSITE\s*=\s*\{/.exec(src);
    if (!start) throw new Error("content.js does not contain SITE = { ... }");
    let i = start.index + start[0].length - 1;
    const map = new Map(), order = [];
    const fail = (what) => new Error(`content.js looks broken near character ${i} (${what}).`);
    const ws = () => {
      for (;;) {
        const c = src[i];
        if (c === " " || c === "\n" || c === "\r" || c === "\t" || c === "﻿" || c === " ") { i++; continue; }
        if (c === "/" && src[i + 1] === "/") { const n = src.indexOf("\n", i); i = n < 0 ? src.length : n + 1; continue; }
        if (c === "/" && src[i + 1] === "*") { const n = src.indexOf("*/", i + 2); if (n < 0) throw fail("unclosed note"); i = n + 2; continue; }
        return;
      }
    };
    const str = () => {
      const q = src[i], from = i;
      let out = "";
      i++;
      while (i < src.length) {
        const c = src[i];
        if (c === q) { i++; return { start: from, end: i, value: out }; }
        if (c === "\\") {
          const n = src[i + 1];
          i += 2;
          if (n === "n") out += "\n";
          else if (n === "t") out += "\t";
          else if (n === "r") out += "\r";
          else if (n === "b") out += "\b";
          else if (n === "f") out += "\f";
          else if (n === "v") out += "\v";
          else if (n === "0") out += "\0";
          else if (n === "u") {
            if (src[i] === "{") { const e = src.indexOf("}", i); out += String.fromCodePoint(parseInt(src.slice(i + 1, e), 16)); i = e + 1; }
            else { out += String.fromCharCode(parseInt(src.substr(i, 4), 16)); i += 4; }
          } else if (n === "x") { out += String.fromCharCode(parseInt(src.substr(i, 2), 16)); i += 2; }
          else if (n === "\r") { if (src[i] === "\n") i++; }
          else if (n !== "\n") out += n;
          continue;
        }
        if (q !== "`" && c === "\n") throw fail("missing closing quote");
        out += c;
        i++;
      }
      throw fail("missing closing quote");
    };
    const ID = /[A-Za-z_$][\w$]*/y, LIT = /-?[\w.$+-]+/y;
    const value = (path) => {
      ws();
      const c = src[i];
      if (c === "{") {
        i++;
        for (;;) {
          ws();
          if (src[i] === "}") { i++; return; }
          let key;
          if (src[i] === '"' || src[i] === "'") key = str().value;
          else { ID.lastIndex = i; const m = ID.exec(src); if (!m) throw fail("unexpected character"); key = m[0]; i += key.length; }
          ws();
          if (src[i] !== ":") throw fail("missing :");
          i++;
          value(path ? path + "." + key : key);
          ws();
          if (src[i] === ",") { i++; continue; }
          if (src[i] === "}") { i++; return; }
          throw fail("missing comma");
        }
      }
      if (c === "[") {
        i++;
        let n = 0;
        for (;;) {
          ws();
          if (src[i] === "]") { i++; return; }
          value(path + "." + n++);
          ws();
          if (src[i] === ",") { i++; continue; }
          if (src[i] === "]") { i++; return; }
          throw fail("missing comma");
        }
      }
      if (c === '"' || c === "'" || c === "`") { const s = str(); map.set(path, s); order.push(path); return; }
      LIT.lastIndex = i;
      const m = LIT.exec(src);
      if (!m) throw fail("unexpected character");
      i += m[0].length;
    };
    value("");
    return { src, map, order };
  }

  // Swap only the changed text inside the original file
  function patchSource(src, changes) {
    const parsed = parseSource(src);
    const edits = [], missing = [];
    Object.entries(changes).forEach(([p, v]) => {
      const s = parsed.map.get(p);
      if (!s) { missing.push(p); return; }
      if (s.value !== v) edits.push({ start: s.start, end: s.end, text: JSON.stringify(v) });
    });
    edits.sort((a, b) => b.start - a.start);
    let text = src;
    edits.forEach((e) => (text = text.slice(0, e.start) + e.text + text.slice(e.end)));
    // safety check: the new file must read back exactly as intended
    const check = parseSource(text);
    Object.entries(changes).forEach(([p, v]) => {
      if (missing.includes(p)) return;
      const s = check.map.get(p);
      if (!s || s.value !== v) throw new Error("Safety check failed while saving. Nothing was changed.");
    });
    return { text, count: edits.length, missing };
  }

  /* ---------------------------------------------------------------
     2. Draft: your unpublished changes, kept in this browser only
     --------------------------------------------------------------- */
  let base = null; // the content.js the site is running on
  let draft = store.get(K_DRAFT);
  if (!draft || typeof draft.changes !== "object") draft = { changes: {}, published: {} };
  if (!draft.published) draft.published = {};
  const saveDraft = () => store.set(K_DRAFT, draft);
  const original = (p) => (base && base.map.get(p) ? base.map.get(p).value : "");
  const current = (p) => (p in draft.changes ? draft.changes[p] : original(p));
  const setValue = (p, v) => {
    if (v === original(p)) delete draft.changes[p];
    else draft.changes[p] = v;
    if (draft.published[p] !== draft.changes[p]) delete draft.published[p];
  };
  const unpublished = () => Object.keys(draft.changes).filter((p) => draft.published[p] !== draft.changes[p]);
  const waitingLive = () => Object.keys(draft.changes).filter((p) => draft.published[p] === draft.changes[p]);

  /* ---------------------------------------------------------------
     3. GitHub connection (your key is stored only in this browser)
     --------------------------------------------------------------- */
  let gh = store.get(K_GH);
  const guessRepo = () => {
    const m = /^([\w-]+)\.github\.io$/i.exec(location.hostname);
    if (!m) return { repo: "", path: "content.js" };
    const owner = m[1];
    const seg = location.pathname.split("/").filter(Boolean).filter((s) => !/\.html?$/i.test(s));
    if (!seg.length) return { repo: `${owner}/${owner}.github.io`, path: "content.js" };
    return { repo: `${owner}/${seg[0]}`, path: [...seg.slice(1), "content.js"].join("/") };
  };
  const ghHeaders = (token) => ({ Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" });
  const fileUrl = (g) => `https://api.github.com/repos/${g.repo}/contents/${g.path.split("/").map(encodeURIComponent).join("/")}`;
  const b64encode = (text) => {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(String(b64).replace(/\s/g, "")), (c) => c.charCodeAt(0)));

  async function connect(token, repo, branch, path) {
    repo = repo.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/, "").replace(/\/+$/, "");
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("Repository should look like  yourname/your-repo");
    const r = await fetch(`https://api.github.com/repos/${repo}`, { headers: ghHeaders(token), cache: "no-store" });
    if (r.status === 401) throw new Error("GitHub did not accept this key. Check that you copied all of it.");
    if (r.status === 404) throw new Error("Repository not found, or this key cannot see it.");
    if (!r.ok) throw new Error(`GitHub error (${r.status}). Try again in a minute.`);
    const info = await r.json();
    if (info.permissions && info.permissions.push === false) throw new Error("This GitHub account cannot change that repository.");
    const g = { token, repo, branch: (branch || "").trim() || info.default_branch || "main", path: (path || "").trim() || "content.js" };
    const f = await fetch(`${fileUrl(g)}?ref=${encodeURIComponent(g.branch)}`, { headers: ghHeaders(token), cache: "no-store" });
    if (f.status === 404) throw new Error(`Could not find ${g.path} on the ${g.branch} branch. Check "File" and "Branch" below.`);
    if (!f.ok) throw new Error(`GitHub error (${f.status}) while reading ${g.path}.`);
    return g;
  }

  async function publish() {
    if (!gh) { openSignIn(true); return; }
    if (!Object.keys(draft.changes).length) { toast("Nothing to publish yet. Click any text to change it."); return; }
    busy(true, "Publishing…");
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await fetch(`${fileUrl(gh)}?ref=${encodeURIComponent(gh.branch)}`, { headers: ghHeaders(gh.token), cache: "no-store" });
        if (r.status === 401) throw Object.assign(new Error("Your GitHub key has expired or was deleted. Sign in again."), { relogin: true });
        if (!r.ok) throw new Error(`Could not read ${gh.path} from GitHub (${r.status}).`);
        const file = await r.json();
        const res = patchSource(b64decode(file.content), draft.changes);
        if (!res.count) break; // GitHub already has these words
        const put = await fetch(fileUrl(gh), {
          method: "PUT",
          headers: { ...ghHeaders(gh.token), "Content-Type": "application/json" },
          body: JSON.stringify({ message: `Edit text on the website (${res.count} change${res.count > 1 ? "s" : ""})`, content: b64encode(res.text), sha: file.sha, branch: gh.branch }),
        });
        if (put.status === 409 && attempt === 0) continue; // file changed meanwhile, read it again
        if (put.status === 401) throw Object.assign(new Error("Your GitHub key has expired or was deleted. Sign in again."), { relogin: true });
        if (put.status === 403 || put.status === 404) throw new Error('This key cannot save files. When making the key, set "Contents" to "Read and write".');
        if (!put.ok) throw new Error(`GitHub did not save the file (${put.status}).`);
        break;
      }
      Object.keys(draft.changes).forEach((p) => (draft.published[p] = draft.changes[p]));
      saveDraft();
      refreshBar();
      notice("Published", "Your changes are saved on GitHub. The live website updates in 1–2 minutes (sometimes up to 10). Until then this browser keeps showing your new text.");
    } catch (err) {
      if (err.relogin) { store.del(K_GH); gh = null; refreshBar(); }
      notice("Not published", esc(err.message || "Something went wrong."));
    } finally {
      busy(false);
    }
  }

  function download() {
    if (!Object.keys(draft.changes).length) { toast("No changes yet. Click any text to change it."); return; }
    try {
      const res = patchSource(base.src, draft.changes);
      const url = URL.createObjectURL(new Blob([res.text], { type: "text/javascript;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: "content.js" });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      const repo = (gh && gh.repo) || guessRepo().repo;
      const up = repo ? `<a href="https://github.com/${esc(repo)}/upload/${esc((gh && gh.branch) || "main")}" target="_blank" rel="noopener">your repository's upload page</a>` : "your GitHub repository (Add file → Upload files)";
      notice("content.js downloaded", `Drag the new <b>content.js</b> into ${up} and press <b>Commit changes</b>. It replaces the old file. The live site updates in 1–2 minutes.`);
    } catch (err) {
      notice("Could not create the file", esc(err.message));
    }
  }

  /* ---------------------------------------------------------------
     4. Friendly names for fields
     --------------------------------------------------------------- */
  const NAMES = {
    name: "Your name", role: "Role", disciplines: "Disciplines (separate with ·)", tagline: "Intro line", email: "Email",
    availability: "Availability line", showreel: "Showreel video (YouTube link or ID)", showreelThumbnail: "Showreel cover image link",
    showreelFormat: "Showreel format (horizontal / vertical)", videoFolder: "Video folder", hero: "Header", image: "Photo link",
    alt: "Photo description", layout: "Photo layout (center / background / none)", year: "Year", label: "Label", chips: "Floating card",
    title: "Title", sub: "Small line", nowLabel: "Panel label", prompts: "Line", status: "Big word", text: "Text",
    heroButtons: "Buttons", primary: "Main button", talk: "Talk button", marquee: "Big word", marqueeLines: "Small line",
    sections: "Sections", work: "Work", about: "About", services: "Service", contact: "Contact", nav: "Menu word", subtitle: "Small line",
    filterAllLabel: "First filter button", images: "Photo link", imageAlt: "Photo description", heading: "Heading",
    paragraphs: "Paragraph", stats: "Number", value: "Number", category: "Category", client: "Client", format: "Format (horizontal / vertical)",
    youtube: "YouTube link or ID", video: "Video file", thumbnail: "Cover image link (empty = YouTube cover)", description: "Description",
    tools: "Tag", formEndpoint: "Form link (Formspree)", headingLine1: "Heading line 1", headingLine2: "Heading line 2 (italic)",
    labels: "Form", message: "Message box", button: "Send button", copyLabel: "Copy button", copiedLabel: "After copying",
    sending: "While sending", success: "Message sent", error: "Error message", social: "Social link", url: "Link",
    footerText: "Footer text (empty = automatic © year name)", theme: "Theme", settings: "Settings", photoStyle: "Photo style (bw / color)",
    fontsUrl: "Google Fonts link", serifFont: "Serif font", sansFont: "Main font", dark: "Dark colour", darkGrey: "Dark grey colour",
    light: "Off-white colour", white: "White colour", textOnDark: "Text on dark", textOnLight: "Text on light", works: "Video",
  };
  const human = (k) => NAMES[k] || k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  const labelFor = (parts) => parts.map((k) => (/^\d+$/.test(k) ? String(+k + 1) : human(k))).join(" · ");
  const GROUP = {
    name: "Basic info", role: "Basic info", disciplines: "Basic info", tagline: "Basic info", email: "Basic info", availability: "Basic info",
    showreel: "Basic info", showreelThumbnail: "Basic info", showreelFormat: "Basic info", hero: "Header", heroButtons: "Header buttons",
    marquee: "Moving band", marqueeLines: "Moving band", sections: "Section titles", filterAllLabel: "Section titles", about: "About",
    stats: "About numbers", services: "Services", works: "Videos", contact: "Contact", formEndpoint: "Contact", social: "Social links",
    footerText: "Footer",
  };
  const ADVANCED = new Set(["theme", "settings", "videoFolder"]);
  const FORM = { name: "Name box", email: "Email box", message: "Message box", button: "Send button" };
  // A readable label for a field. rel = the part of the path shown (e.g. ["chips","1","title"])
  function nice(full, rel) {
    const fm = /^contact\.labels\.(\w+)$/.exec(full);
    if (fm) return "Form · " + (FORM[fm[1]] || human(fm[1]));
    if (full === "heroButtons.showreel") return "Showreel button";
    if (rel.length === 1 && /^\d+$/.test(rel[0])) {
      const parts = full.split(".");
      return human(parts[parts.length - 2]) + " · " + (+rel[0] + 1);
    }
    return labelFor(rel);
  }

  // Fields under a path ("hero.chips.1" → its title and sub)
  const under = (prefix) =>
    base.order
      .filter((p) => p === prefix || p.startsWith(prefix + "."))
      .map((p) => ({ label: nice(p, p === prefix ? p.split(".").slice(-1) : p.slice(prefix.length + 1).split(".")), paths: [p] }));
  const one = (p, label) => (base.map.has(p) ? [{ label: label || nice(p, p.split(".").slice(-1)), paths: [p] }] : []);

  /* ---------------------------------------------------------------
     5. Link every part of the page to its text in content.js
     --------------------------------------------------------------- */
  let targets = [];
  function tag() {
    targets = [];
    $$("[data-pfe]").forEach((el) => el.removeAttribute("data-pfe"));
    const add = (el, title, fields, live) => {
      if (!el) return;
      const list = fields.flat().filter(Boolean);
      if (!list.length) return;
      el.setAttribute("data-pfe", targets.length);
      targets.push({ el, title, fields: list, live: live && list.length === 1 && list[0].paths.length === 1 ? live : null });
    };

    add($("#brand"), "Your name", one("name"));
    $$("#nav-list a").forEach((a) => add(a, "Menu", one(`sections.${a.dataset.sec}.nav`)));
    add($(".nav-cta"), "Talk button", one("heroButtons.talk"), $("#nav-cta-text"));

    add($("#hero-role"), "Role", one("role"));
    add($("#hero-year"), "Year", one("hero.year"));
    add($("#hero-label"), "Label", one("hero.label"), $("#hero-label"));
    add($("#hero-avail"), "Availability", one("availability"));
    add($("#hero-tagline"), "Intro line", one("tagline"), $("#hero-tagline"));
    $$(".chip").forEach((c, i) => add(c, `Floating card ${i + 1}`, under(`hero.chips.${i}`)));
    add($("#now-label"), "Panel label", one("hero.nowLabel"), $("#now-label"));
    const nowWord = $("#now-word");
    add(nowWord && nowWord.parentElement, "Changing words and lines", under("hero.prompts"));
    add($("#prompt-text"), "Changing words and lines", under("hero.prompts"));
    add($("#hero-name"), "Your name", one("name"));
    add($("#hero-title"), "Role and disciplines", [one("role"), one("disciplines")]);
    add($("#hero-media"), "Header photo", [one("hero.image"), one("hero.alt")]);
    add($(".hero-foot .btn"), "Main button", one("heroButtons.primary"), $(".hero-foot .btn span"));
    add($("#showreel-btn"), "Showreel", [one("heroButtons.showreel"), one("showreel")]);
    add($("#talk-btn"), "Talk button", one("heroButtons.talk"));
    add($("#play-btn"), "Showreel", [one("showreel"), one("heroButtons.showreel")]);

    add($("#marquee"), "Moving band", [under("marquee"), under("marqueeLines")]);

    ["work", "about", "services", "contact"].forEach((k) => {
      const s = $("#" + k);
      if (s) add($(".section-head", s), "Section heading", under(`sections.${k}`));
    });
    $$("#filters button").forEach((b, i) => {
      if (i === 0) { add(b, "Filter button", one("filterAllLabel")); return; }
      const paths = base.order.filter((p) => /^works\.\d+\.category$/.test(p) && getPath(SITE, p) === b.dataset.cat);
      if (paths.length) add(b, "Category", [{ label: "Category name (changes it on every video in this category)", paths }]);
    });
    const shown = (SITE.works || []).map((w, i) => [w, i]).filter(([w]) => w && !w.hidden).map(([, i]) => i);
    $$("#grid .card").forEach((c) => {
      const real = shown[+c.dataset.i];
      if (real != null) add(c, `Video ${real + 1} · ${(SITE.works[real] || {}).title || ""}`, under(`works.${real}`));
    });

    add($("#about-badge"), "Badge", [one("availability"), one("role")]);
    add($("#about-visual"), "About photos", [under("about.images"), one("about.imageAlt")]);
    add($("#about-heading"), "About heading", one("about.heading"));
    $$("#about-paras p").forEach((p, i) => add(p, `Paragraph ${i + 1}`, one(`about.paragraphs.${i}`, "Paragraph")));
    $$("#stats > div").forEach((d, i) => add(d, `Number ${i + 1}`, under(`stats.${i}`)));
    $$("#services-list .service").forEach((s, i) => add(s, `Service ${i + 1}`, under(`services.${i}`)));

    add($("#contact-big"), "Contact heading", [one("contact.headingLine1"), one("contact.headingLine2")]);
    add($("#email-link"), "Email", one("email"));
    add($("#copy-btn"), "Copy button", [one("contact.copyLabel"), one("contact.copiedLabel")]);
    add($("#form"), "Contact form", [under("contact.labels"), one("contact.sending"), one("contact.success"), one("contact.error")]);
    add($("#footer-copy"), "Footer", one("footerText"));
    add($("#socials"), "Social links", under("social"));
    add($("#contact-socials"), "Social links", under("social"));
  }

  /* ---------------------------------------------------------------
     6. Interface
     --------------------------------------------------------------- */
  const ui = document.createElement("div");
  ui.className = "pfe-ui";
  ui.innerHTML = `
    <div class="pfe-bar" role="toolbar" aria-label="Edit mode">
      <span class="pfe-brand"><i></i>Edit mode</span>
      <button type="button" class="pfe-switch" data-a="toggle" aria-pressed="true"><i></i><span>Click to edit</span></button>
      <button type="button" data-a="all">All text</button>
      <span class="pfe-count" aria-live="polite"></span>
      <button type="button" data-a="download">Download</button>
      <button type="button" class="pfe-primary" data-a="publish">Publish</button>
      <button type="button" class="pfe-more-btn" data-a="more" aria-label="More options">•••</button>
    </div>
    <div class="pfe-menu" hidden>
      <button type="button" data-a="discard">Discard all changes</button>
      <button type="button" data-a="signin">GitHub settings</button>
      <button type="button" data-a="signout">Forget GitHub key on this browser</button>
      <button type="button" data-a="exit">Exit edit mode</button>
    </div>
    <div class="pfe-tip" hidden></div>
    <div class="pfe-pop" role="dialog" aria-modal="false" hidden></div>
    <aside class="pfe-drawer" aria-label="All text" hidden></aside>
    <div class="pfe-modal" hidden></div>
    <div class="pfe-toast" role="status" aria-live="polite"></div>`;
  const bar = $(".pfe-bar", ui), menu = $(".pfe-menu", ui), tip = $(".pfe-tip", ui), pop = $(".pfe-pop", ui);
  const drawer = $(".pfe-drawer", ui), modalBox = $(".pfe-modal", ui), toastEl = $(".pfe-toast", ui);

  let editOn = true, unlocked = false, needsReload = false;
  const setEditOn = (on) => {
    editOn = on;
    window.__pfEditOn = on;
    root.classList.toggle("pfe-on", on);
    const sw = $(".pfe-switch", bar);
    sw.setAttribute("aria-pressed", String(on));
    if (!on) { hideTip(); closePop(); }
  };

  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }
  function busy(on, msg) {
    bar.classList.toggle("busy", on);
    $$("button", bar).forEach((b) => (b.disabled = on));
    if (on && msg) $(".pfe-count", bar).textContent = msg;
    if (!on) refreshBar();
  }
  function refreshBar() {
    const n = unpublished().length, live = waitingLive().length;
    const count = $(".pfe-count", bar);
    count.textContent = n ? `${n} unpublished change${n > 1 ? "s" : ""}` : live ? "Published · site updating" : "No changes";
    count.classList.toggle("has", n > 0);
    $('[data-a="signout"]', menu).hidden = !gh;
  }

  function notice(title, html, buttons) {
    modalBox.innerHTML = `<div class="pfe-card"><h3>${esc(title)}</h3><p>${html}</p><div class="pfe-actions">${buttons || '<button type="button" class="pfe-primary" data-close>OK</button>'}</div></div>`;
    modalBox.hidden = false;
    const first = $("[data-close], .pfe-primary", modalBox);
    if (first) first.focus();
  }
  const closeModal = () => { modalBox.hidden = true; modalBox.innerHTML = ""; };
  modalBox.addEventListener("click", (e) => { if (e.target === modalBox || e.target.closest("[data-close]")) closeModal(); });

  // Sign-in card
  function openSignIn(thenPublish) {
    const g = gh || guessRepo();
    modalBox.innerHTML = `
      <form class="pfe-card pfe-signin" autocomplete="off">
        <h3>${gh ? "GitHub settings" : "Owner sign-in"}</h3>
        <p>To publish from here, paste a GitHub key that can change this website's repository. It is saved only in this browser and is never added to your website.
        <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Make a key on GitHub ↗</a> (steps are in README.md).</p>
        <label>GitHub key<input type="password" name="token" placeholder="github_pat_…" ${gh ? 'value="••••••••" data-keep="1"' : ""} required></label>
        <label>Repository<input type="text" name="repo" placeholder="yourname/your-repo" value="${esc(g.repo || "")}" required></label>
        <details${g.repo ? "" : " open"}><summary>More settings</summary>
          <label>Branch<input type="text" name="branch" placeholder="automatic" value="${esc((gh && gh.branch) || "")}"></label>
          <label>File<input type="text" name="path" value="${esc(g.path || "content.js")}"></label>
        </details>
        <p class="pfe-err" hidden></p>
        <div class="pfe-actions">
          <button type="button" data-close>Cancel</button>
          <button type="submit" class="pfe-primary">${thenPublish ? "Sign in and publish" : "Save"}</button>
        </div>
      </form>`;
    modalBox.hidden = false;
    const form = $("form", modalBox), err = $(".pfe-err", form);
    const tokenIn = form.elements.token;
    tokenIn.addEventListener("focus", () => { if (tokenIn.dataset.keep) { tokenIn.value = ""; delete tokenIn.dataset.keep; } }, { once: true });
    (g.repo ? tokenIn : form.elements.repo).focus();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.hidden = true;
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.textContent = "Checking…";
      try {
        const token = tokenIn.dataset.keep && gh ? gh.token : tokenIn.value.trim();
        if (!token) throw new Error("Paste your GitHub key first.");
        gh = await connect(token, form.elements.repo.value, form.elements.branch.value, form.elements.path.value);
        store.set(K_GH, gh);
        closeModal();
        if (!unlocked) { unlocked = true; start(); }
        refreshBar();
        toast("Signed in. This browser can now publish.");
        if (thenPublish) publish();
      } catch (ex) {
        err.textContent = ex.message;
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = thenPublish ? "Sign in and publish" : "Save";
      }
    });
  }

  // Toolbar buttons
  let discardArmed = false;
  ui.addEventListener("click", (e) => {
    const b = e.target.closest(".pfe-bar button[data-a], .pfe-menu button[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    if (a !== "more") menu.hidden = true;
    if (a !== "discard") { discardArmed = false; $('[data-a="discard"]', menu).textContent = "Discard all changes"; }
    if (a === "toggle") setEditOn(!editOn);
    else if (a === "all") openDrawer();
    else if (a === "download") download();
    else if (a === "publish") publish();
    else if (a === "more") menu.hidden = !menu.hidden;
    else if (a === "signin") openSignIn(false);
    else if (a === "signout") { store.del(K_GH); gh = null; refreshBar(); toast("GitHub key removed from this browser."); if (!isLocal) location.reload(); }
    else if (a === "exit") { const u = new URL(location.href); u.searchParams.delete("edit"); location.href = u.toString(); }
    else if (a === "discard") {
      if (!Object.keys(draft.changes).length) { menu.hidden = true; toast("There are no changes to discard."); return; }
      if (!discardArmed) { discardArmed = true; b.textContent = "Click again to discard"; return; }
      draft = { changes: {}, published: {} };
      saveDraft();
      reloadKeepScroll();
    }
  });
  document.addEventListener("click", (e) => { if (!menu.hidden && !e.target.closest(".pfe-bar, .pfe-menu")) menu.hidden = true; });

  /* ---------- Hover outline + label ---------- */
  let hoverEl = null;
  const hideTip = () => { tip.hidden = true; if (hoverEl) hoverEl.classList.remove("pfe-hover"); hoverEl = null; };
  document.addEventListener("mouseover", (e) => {
    if (!editOn || !unlocked) return;
    if (e.target.closest && e.target.closest(".pfe-ui")) { hideTip(); return; }
    const t = e.target.closest && e.target.closest("[data-pfe]");
    if (t === hoverEl) return;
    hideTip();
    if (!t) return;
    hoverEl = t;
    t.classList.add("pfe-hover");
    const r = t.getBoundingClientRect();
    tip.textContent = "✎ " + targets[+t.dataset.pfe].title;
    if (!pop.hidden || !drawer.hidden) return;
    tip.hidden = false;
    tip.style.left = Math.max(8, Math.min(r.left, innerWidth - tip.offsetWidth - 8)) + "px";
    tip.style.top = Math.max(8, r.top - tip.offsetHeight - 6) + "px";
  });
  window.addEventListener("scroll", () => { if (hoverEl) hideTip(); }, { passive: true });

  /* ---------- Click on text → small editor ---------- */
  document.addEventListener("click", (e) => {
    if (!editOn || !unlocked || (e.target.closest && e.target.closest(".pfe-ui"))) return;
    const t = e.target.closest && e.target.closest("[data-pfe]");
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openPop(targets[+t.dataset.pfe]);
  }, true);
  // stop the form being sent while editing
  document.addEventListener("submit", (e) => { if (editOn && unlocked && !e.target.closest(".pfe-ui")) e.preventDefault(); }, true);

  const fieldHTML = (f, i) => {
    const v = current(f.paths[0]);
    const changed = f.paths.some((p) => p in draft.changes);
    return `<div class="pfe-field${changed ? " changed" : ""}" data-f="${i}">
      <label><span>${esc(f.label)}</span><button type="button" class="pfe-reset" title="Back to the published text" ${changed ? "" : "hidden"}>Undo</button></label>
      <textarea rows="1" spellcheck="true">${esc(v)}</textarea></div>`;
  };
  const grow = (ta) => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight + 2, 220) + "px"; };

  let popTarget = null, popBefore = null;
  function openPop(t) {
    closeDrawer();
    hideTip();
    popTarget = t;
    popBefore = {};
    t.fields.forEach((f) => f.paths.forEach((p) => (popBefore[p] = p in draft.changes ? draft.changes[p] : undefined)));
    pop.innerHTML = `
      <div class="pfe-pop-head"><b>${esc(t.title)}</b><button type="button" class="pfe-x" data-p="cancel" aria-label="Close">✕</button></div>
      <div class="pfe-fields">${t.fields.map(fieldHTML).join("")}</div>
      <div class="pfe-actions"><button type="button" data-p="cancel">Cancel</button><button type="button" class="pfe-primary" data-p="done">Done</button></div>`;
    pop.hidden = false;
    placePop(t.el);
    $$("textarea", pop).forEach(grow);
    const first = $("textarea", pop);
    if (first) { first.focus(); first.setSelectionRange(first.value.length, first.value.length); }
  }
  function placePop(el) {
    if (innerWidth < 640) { pop.classList.add("sheet"); pop.style.left = pop.style.top = ""; return; }
    pop.classList.remove("sheet");
    const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    let top = r.bottom + 10;
    if (top + h > innerHeight - 90) top = r.top - h - 10;
    if (top < 12) top = Math.max(12, Math.min(innerHeight - h - 90, innerHeight / 2 - h / 2));
    const left = Math.max(12, Math.min(r.left, innerWidth - w - 12));
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }
  function readFields(box, fields) {
    $$(".pfe-field", box).forEach((el) => {
      const f = fields[+el.dataset.f], v = $("textarea", el).value.replace(/\r?\n/g, " ");
      f.paths.forEach((p) => setValue(p, v));
    });
  }
  function closePop(commit) {
    if (pop.hidden) return;
    const t = popTarget;
    if (commit && t) {
      readFields(pop, t.fields);
      saveDraft();
      const changed = Object.keys(popBefore).some((p) => popBefore[p] !== (p in draft.changes ? draft.changes[p] : undefined));
      if (changed) {
        if (t.live) { t.live.textContent = current(t.fields[0].paths[0]); toast("Changed. Press Publish when you're ready."); }
        else needsReload = true;
      }
    } else if (t && t.live) {
      t.live.textContent = current(t.fields[0].paths[0]);
    }
    pop.hidden = true;
    pop.innerHTML = "";
    popTarget = null;
    refreshBar();
    if (needsReload) reloadKeepScroll();
  }
  pop.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.p === "done") closePop(true);
    else if (b.dataset.p === "cancel") closePop(false);
    else if (b.classList.contains("pfe-reset")) {
      const box = b.closest(".pfe-field"), f = popTarget.fields[+box.dataset.f];
      const ta = $("textarea", box);
      ta.value = original(f.paths[0]);
      grow(ta);
      ta.dispatchEvent(new Event("input"));
      b.hidden = true;
      box.classList.remove("changed");
    }
  });
  pop.addEventListener("input", (e) => {
    const ta = e.target.closest("textarea");
    if (!ta) return;
    grow(ta);
    if (popTarget && popTarget.live) popTarget.live.textContent = ta.value;
  });
  pop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && e.target.tagName === "TEXTAREA") { e.preventDefault(); closePop(true); }
    else if (e.key === "Escape") { e.preventDefault(); closePop(false); }
  });
  document.addEventListener("mousedown", (e) => {
    if (!pop.hidden && !e.target.closest(".pfe-pop, .pfe-bar, .pfe-menu, .pfe-modal")) closePop(true);
  }, true);

  /* ---------- "All text" drawer ---------- */
  let drawerFields = [];
  function openDrawer() {
    closePop(true);
    if (needsReload) return;
    const groups = new Map();
    const adv = [];
    drawerFields = [];
    base.order.forEach((p) => {
      const parts = p.split("."), top = parts[0];
      if (ADVANCED.has(top)) { adv.push({ label: labelFor(parts), paths: [p] }); return; }
      let g = GROUP[top] || human(top);
      let rel = parts.length > 1 ? parts.slice(1) : parts;
      if ((top === "works" || top === "services") && parts.length > 2) {
        g = top === "works" ? `Video ${+parts[1] + 1} · ${current(`works.${parts[1]}.title`)}` : `Service ${+parts[1] + 1}`;
        rel = parts.slice(2);
      }
      const f = { label: nice(p, rel), paths: [p] };
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(f);
    });
    let n = 0;
    const block = (name, list, open) => {
      const html = list.map((f) => { drawerFields.push(f); return fieldHTML(f, n++); }).join("");
      return `<details class="pfe-group"${open ? " open" : ""}><summary>${esc(name)}<small>${list.length}</small></summary>${html}</details>`;
    };
    drawer.innerHTML = `
      <div class="pfe-drawer-head"><b>All text</b><button type="button" class="pfe-x" data-d="close" aria-label="Close">✕</button></div>
      <input type="search" class="pfe-search" placeholder="Search text…" aria-label="Search text">
      <div class="pfe-groups">${[...groups].map(([g, list], i) => block(g, list, i < 2)).join("")}${adv.length ? block("Advanced: colours, fonts, settings", adv, false) : ""}</div>
      <p class="pfe-note">Changes here are saved as you type. The page refreshes when you close this panel.</p>`;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("open"));
    $$("textarea", drawer).forEach(grow);
    $(".pfe-search", drawer).focus();
  }
  let drawerDirty = false, drawerT;
  function closeDrawer() {
    if (drawer.hidden) return;
    clearTimeout(drawerT);
    readFields(drawer, drawerFields);
    saveDraft();
    drawer.classList.remove("open");
    drawer.hidden = true;
    drawer.innerHTML = "";
    refreshBar();
    if (drawerDirty) { drawerDirty = false; reloadKeepScroll(); }
  }
  drawer.addEventListener("input", (e) => {
    if (e.target.classList.contains("pfe-search")) {
      const q = e.target.value.trim().toLowerCase();
      $$(".pfe-group", drawer).forEach((g) => {
        let any = false;
        $$(".pfe-field", g).forEach((f) => {
          const hit = !q || $("textarea", f).value.toLowerCase().includes(q) || f.textContent.toLowerCase().includes(q);
          f.hidden = !hit;
          any = any || hit;
        });
        g.hidden = !any;
        if (q && any) g.open = true;
      });
      return;
    }
    const ta = e.target.closest("textarea");
    if (!ta) return;
    grow(ta);
    drawerDirty = true;
    const box = ta.closest(".pfe-field");
    box.classList.add("changed");
    $(".pfe-reset", box).hidden = false;
    clearTimeout(drawerT);
    drawerT = setTimeout(() => { readFields(drawer, drawerFields); saveDraft(); refreshBar(); }, 300);
  });
  drawer.addEventListener("click", (e) => {
    if (e.target.closest('[data-d="close"]')) { closeDrawer(); return; }
    const b = e.target.closest(".pfe-reset");
    if (!b) return;
    const box = b.closest(".pfe-field"), f = drawerFields[+box.dataset.f], ta = $("textarea", box);
    ta.value = original(f.paths[0]);
    grow(ta);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    b.hidden = true;
    box.classList.remove("changed");
  });
  drawer.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "TEXTAREA") { e.preventDefault(); e.target.blur(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!modalBox.hidden) closeModal();
    else if (!drawer.hidden) closeDrawer();
    else if (!menu.hidden) menu.hidden = true;
  });

  function reloadKeepScroll() {
    try { sessionStorage.setItem(K_SCROLL, String(Math.round(scrollY))); } catch (e) {}
    location.reload();
  }

  /* ---------------------------------------------------------------
     7. Start
     --------------------------------------------------------------- */
  function start() {
    bar.classList.remove("locked");
    $$(".pfe-bar > *:not(.pfe-lock)", ui).forEach((el) => (el.hidden = el.classList.contains("pfe-menu")));
    const lock = $(".pfe-lock", bar);
    if (lock) lock.remove();
    tag();
    setEditOn(true);
    refreshBar();
    if (!store.get(K_HINT)) { store.set(K_HINT, 1); setTimeout(() => toast("Click any text to change it. Press Publish when you're done."), 600); }
  }

  function showLocked() {
    bar.classList.add("locked");
    $$(".pfe-bar > *", ui).forEach((el) => (el.hidden = true));
    const lock = document.createElement("div");
    lock.className = "pfe-lock";
    lock.innerHTML = `<span class="pfe-brand"><i></i>Edit mode is for the site owner</span><button type="button" class="pfe-primary">Sign in</button>`;
    bar.appendChild(lock);
    $("button", lock).addEventListener("click", () => openSignIn(false));
    setEditOn(false);
  }

  async function init() {
    document.body.appendChild(ui);
    try {
      const r = await fetch("content.js", { cache: "no-store" });
      if (!r.ok) throw new Error("content.js could not be loaded (" + r.status + ").");
      base = parseSource(await r.text());
    } catch (err) {
      const msg = location.protocol === "file:" ? "Edit mode needs the site to run from a web address (GitHub Pages or a local server), not from a file." : err.message;
      bar.innerHTML = `<span class="pfe-brand"><i></i>Edit mode</span><span class="pfe-count">${esc(msg)}</span>`;
      return;
    }
    // drop changes that the live content.js already has
    Object.keys(draft.changes).forEach((p) => {
      if (!base.map.has(p) || base.map.get(p).value === draft.changes[p]) { delete draft.changes[p]; delete draft.published[p]; }
    });
    Object.keys(draft.published).forEach((p) => { if (!(p in draft.changes)) delete draft.published[p]; });
    saveDraft();

    unlocked = isLocal || !!(gh && gh.token);
    if (unlocked) start();
    else showLocked();

    let y = null;
    try { y = sessionStorage.getItem(K_SCROLL); sessionStorage.removeItem(K_SCROLL); } catch (e) {}
    if (y != null) {
      const go = () => window.scrollTo({ top: +y, behavior: "instant" });
      go();
      requestAnimationFrame(go);
      window.addEventListener("load", go, { once: true });
      setTimeout(go, 400);
    }
  }
  init();
})();
