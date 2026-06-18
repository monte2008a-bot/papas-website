/* ============================================================
   Papa's — CMS content injection
   Reads editable copy from /content/*.json (managed by Sveltia CMS)
   and renders each homepage section. Every fetch falls back
   gracefully: if a file can't load, the hand-coded markup already
   in index.html stays in place, so a failed request never blanks
   the site.

   Exposes window.renderContent() -> Promise. The bootstrap in
   index.html waits for it to resolve, THEN starts the GSAP motion
   layer (window.__initMotion) so scroll-reveals bind to the freshly
   rendered elements. Every generated element keeps its original
   classes AND its data-reveal / data-hero attributes.
   ============================================================ */
(function () {
  "use strict";

  var BASE = "content/";

  function getJSON(name) {
    return fetch(BASE + name + ".json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    }
    return n;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Build "<line1> <em>line2</em>" title HTML.
     A "\n" inside line1 becomes <br>. If line1 ends with a newline,
     the <em> line2 follows directly (its own line, e.g. Reviews);
     otherwise it joins with a space (inline, e.g. "The Sandos."). */
  function titleHTML(line1, line2) {
    var h = esc(line1).replace(/\n/g, "<br>");
    if (line2) {
      var ownLine = /\n\s*$/.test(String(line1 == null ? "" : line1));
      h += (ownLine ? "" : " ") + "<em>" + esc(line2) + "</em>";
    }
    return h;
  }

  /* Optional kicker above a .section-title (only injected if provided). */
  function applyKicker(headEl, titleEl, kicker) {
    if (!headEl || !titleEl) return;
    var existing = headEl.querySelector(".kicker");
    if (kicker) {
      if (!existing) {
        existing = el("span", "kicker", { "data-reveal": "" });
        headEl.insertBefore(existing, titleEl);
      }
      existing.textContent = kicker;
    } else if (existing) {
      existing.parentNode.removeChild(existing);
    }
  }

  /* ---------- Menu sections (Sandos / Bowls / Meats / Seafoods) ---------- */
  function menuCard(item) {
    var card = el("article", "m-card", { "data-reveal": "" });
    if (item && item.tag) {
      var tag = el("span", "m-card__tag" + (item.feature ? " m-card__tag--feature" : ""));
      tag.textContent = item.tag;
      card.appendChild(tag);
    }
    var a = el("div", "m-card__shot m-card__shot--a");
    a.appendChild(el("div", "m-obj m-obj--" + ((item && item.style_a) || "char")));
    var b = el("div", "m-card__shot m-card__shot--b");
    b.appendChild(el("div", "m-obj m-obj--" + ((item && item.style_b) || "meat")));
    var meta = el("div", "m-card__meta");
    var name = el("span", "name"); name.textContent = (item && item.name) || "";
    var price = el("span", "price"); price.textContent = (item && item.price) || "";
    meta.appendChild(name); meta.appendChild(price);
    card.appendChild(a); card.appendChild(b); card.appendChild(meta);
    return card;
  }

  function renderMenu(section, data) {
    if (!section || !data) return;
    var title = section.querySelector(".section-title");
    if (title && (data.title_line1 || data.title_line2)) {
      title.innerHTML = titleHTML(data.title_line1, data.title_line2);
    }
    applyKicker(section.querySelector(".section-head"), title, data.kicker);

    var heroWrap = section.querySelector(".menu-hero");
    if (heroWrap && Array.isArray(data.hero_items) && data.hero_items.length) {
      heroWrap.innerHTML = "";
      data.hero_items.forEach(function (it) { heroWrap.appendChild(menuCard(it)); });
    }
    var gridWrap = section.querySelector(".menu-grid");
    if (gridWrap && Array.isArray(data.grid_items) && data.grid_items.length) {
      gridWrap.innerHTML = "";
      data.grid_items.forEach(function (it) { gridWrap.appendChild(menuCard(it)); });
    }
    var cta = section.querySelector(".counter__cta");
    if (cta && data.cta) cta.textContent = data.cta;
  }

  /* ---------- Hero ---------- */
  function renderHero(data) {
    var hero = document.getElementById("hero");
    if (!hero || !data) return;
    var eyebrow = hero.querySelector(".hero__eyebrow");
    if (eyebrow && data.tagline) eyebrow.textContent = data.tagline;
    var ctas = hero.querySelectorAll(".hero__cta a");
    if (ctas[0] && data.cta_primary) {
      if (data.cta_primary.label) ctas[0].textContent = data.cta_primary.label;
      if (data.cta_primary.href) ctas[0].setAttribute("href", data.cta_primary.href);
    }
    if (ctas[1] && data.cta_secondary) {
      if (data.cta_secondary.label) ctas[1].textContent = data.cta_secondary.label;
      if (data.cta_secondary.href) ctas[1].setAttribute("href", data.cta_secondary.href);
    }
  }

  /* ---------- Locations ---------- */
  function renderLocations(data) {
    var section = document.getElementById("locations");
    if (!section || !data) return;
    var title = section.querySelector(".locations__intro .section-title");
    if (title && (data.title_line1 || data.title_line2)) {
      title.innerHTML = titleHTML(data.title_line1, data.title_line2);
    }
    applyKicker(section.querySelector(".locations__intro"), title, data.kicker);

    var bgTag = section.querySelector(".locations__bg .ph__tag");
    if (bgTag && data.bg_tag) bgTag.textContent = data.bg_tag;

    var grid = section.querySelector(".loc-grid");
    if (grid && Array.isArray(data.cards) && data.cards.length) {
      grid.innerHTML = "";
      data.cards.forEach(function (c) {
        var a = el("a", "loc-card", { href: c.href || "#", "data-reveal": "" });
        var num = el("span", "loc-card__num"); num.textContent = c.num || "";
        var name = el("h3", "loc-card__name"); name.textContent = c.name || "";
        var tag = el("p", "loc-card__tag"); tag.textContent = c.tag || "";
        var link = el("span", "loc-card__link"); link.textContent = c.link_label || "";
        a.appendChild(num); a.appendChild(name); a.appendChild(tag); a.appendChild(link);
        grid.appendChild(a);
      });
    }
  }

  /* ---------- About ---------- */
  function renderAbout(data) {
    var section = document.getElementById("about");
    if (!section || !data) return;
    var title = section.querySelector(".about__head .section-title");
    if (title && (data.title_line1 || data.title_line2)) {
      title.innerHTML = titleHTML(data.title_line1, data.title_line2);
    }
    applyKicker(section.querySelector(".about__head"), title, data.kicker);

    var essay = section.querySelector(".about__essay");
    if (essay && Array.isArray(data.paragraphs) && data.paragraphs.length) {
      essay.innerHTML = "";
      data.paragraphs.forEach(function (p) {
        var para = document.createElement("p");
        para.textContent = p;
        essay.appendChild(para);
      });
    }

    /* Optional facts list — only rendered when present. */
    if (Array.isArray(data.facts) && data.facts.length) {
      var facts = section.querySelector(".about__facts");
      if (!facts) {
        facts = el("dl", "about__facts", { "data-reveal": "" });
        if (essay && essay.parentNode) essay.parentNode.insertBefore(facts, essay.nextSibling);
        else section.appendChild(facts);
      }
      facts.innerHTML = "";
      data.facts.forEach(function (f) {
        var dt = document.createElement("dt"); dt.textContent = (f && f.label) || "";
        var dd = document.createElement("dd"); dd.textContent = (f && f.detail) || "";
        facts.appendChild(dt); facts.appendChild(dd);
      });
    }
  }

  /* ---------- Reviews ---------- */
  function renderReviews(data) {
    var section = document.getElementById("reviews");
    if (!section || !data) return;
    var title = section.querySelector(".section-head .section-title");
    if (title && (data.title_line1 || data.title_line2)) {
      title.innerHTML = titleHTML(data.title_line1, data.title_line2);
    }
    applyKicker(section.querySelector(".section-head"), title, data.kicker);

    var grid = document.getElementById("review-grid");
    if (grid && Array.isArray(data.items) && data.items.length) {
      grid.innerHTML = "";
      data.items.forEach(function (rv) {
        var n = Math.max(1, Math.min(5, parseInt(rv && rv.stars, 10) || 5));
        var fig = el("figure", "review", { "data-reveal": "" });
        var stars = el("div", "review__stars");
        stars.textContent = "★★★★★".slice(0, n);
        var quote = document.createElement("blockquote");
        quote.textContent = "“" + ((rv && rv.quote) || "") + "”";
        var cap = document.createElement("figcaption");
        cap.textContent = "— " + ((rv && rv.source) || "");
        fig.appendChild(stars); fig.appendChild(quote); fig.appendChild(cap);
        grid.appendChild(fig);
      });
    }
  }

  /* ---------- Info / Order columns ---------- */
  function renderInfo(data) {
    var info = document.getElementById("order");
    if (!info || !data || !Array.isArray(data.columns) || !data.columns.length) return;
    info.innerHTML = "";
    data.columns.forEach(function (col) {
      var div = el("div", "info__col" + (col.note ? " info__col--note" : ""), { "data-reveal": "" });
      var h3 = document.createElement("h3"); h3.textContent = col.title || "";
      div.appendChild(h3);
      var p = document.createElement("p");
      p.innerHTML = (col.lines || []).map(esc).join("<br>");
      div.appendChild(p);
      if (col.cta && col.cta.label) {
        var a = el("a", "btn btn--order", { href: col.cta.href || "#" });
        a.textContent = col.cta.label;
        div.appendChild(a);
      }
      info.appendChild(div);
    });
  }

  /* ---------- Orchestrate ---------- */
  function safely(fn, data) {
    try { fn(data); } catch (e) { /* keep the fallback markup */ }
  }

  window.renderContent = function () {
    var jobs = [
      getJSON("hero").then(function (d) { safely(renderHero, d); }),
      getJSON("counter").then(function (d) { safely(function (x) { renderMenu(document.getElementById("menu"), x); }, d); }),
      getJSON("bowls").then(function (d) { safely(function (x) { renderMenu(document.getElementById("bowls"), x); }, d); }),
      getJSON("meats").then(function (d) { safely(function (x) { renderMenu(document.getElementById("meats"), x); }, d); }),
      getJSON("seafoods").then(function (d) { safely(function (x) { renderMenu(document.getElementById("seafoods"), x); }, d); }),
      getJSON("locations").then(function (d) { safely(renderLocations, d); }),
      getJSON("about").then(function (d) { safely(renderAbout, d); }),
      getJSON("reviews").then(function (d) { safely(renderReviews, d); }),
      getJSON("info").then(function (d) { safely(renderInfo, d); })
    ];
    return Promise.all(jobs.map(function (p) { return p.catch(function () {}); }));
  };
})();
