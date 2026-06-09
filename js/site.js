/* ============================================================
   PAPAS — motion layer
   Lenis smooth scroll + GSAP ScrollTrigger
   Cinematic reveals, parallax, floating menu, nav states
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    window.__lenis = lenis;
    if (hasST) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); });
    }
  }

  /* ---------- anchor links -> smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.3 });
      else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- 2. Nav states ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (hasST) {
    var dark = document.getElementById("locations");
    if (dark && nav) {
      ScrollTrigger.create({
        trigger: dark, start: "top 70px", end: "bottom 70px",
        onToggle: function (self) { nav.classList.toggle("is-dark", self.isActive); }
      });
    }
  }

  /* ---------- 3. Intro loader -> hero reveal ---------- */
  var loader = document.getElementById("loader");

  function heroIntro() {
    if (hasGSAP && !reduce) {
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from("[data-hero-line]", { yPercent: 115, opacity: 0, duration: 1.1, stagger: 0.12 })
        .from("[data-hero]", { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 }, "-=0.7");
    }
    if (hasST) ScrollTrigger.refresh();
  }

  function dismissLoader() {
    if (loader) { loader.classList.add("is-done"); loader.style.display = "none"; }
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  }

  if (loader && hasGSAP && !reduce) {
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
    var countEl = document.querySelector(".loader__count");
    var counter = { v: 0 };
    gsap.timeline()
      .set(loader, { autoAlpha: 1 })
      .from(".loader__word span", { yPercent: 115, duration: 0.9, ease: "power4.out" })
      .to(".loader__bar i", { width: "100%", duration: 1.1, ease: "power2.inOut" }, "-=0.55")
      .to(counter, { v: 100, duration: 1.1, ease: "power2.inOut",
        onUpdate: function () { if (countEl) countEl.textContent = String(Math.round(counter.v)).padStart(2, "0"); } }, "<")
      .to(".loader__inner", { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "+=0.15")
      .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut",
        onComplete: function () { dismissLoader(); heroIntro(); } });
  } else {
    if (loader) loader.style.display = "none";
    heroIntro();
  }

  // hard safety net: never let the loader trap the page
  setTimeout(function () { if (loader && loader.style.display !== "none") dismissLoader(); }, 5200);

  /* ---------- 4. Reveal on scroll ---------- */
  if (hasST && !reduce) {
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%" }
      });
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 5. Locations cinematic background parallax + scale ---------- */
  if (hasST && !reduce) {
    var bg = document.querySelector("[data-loc-bg]");
    if (bg) {
      gsap.fromTo(bg, { scale: 1.25, yPercent: -6 }, {
        scale: 1, yPercent: 8, ease: "none",
        scrollTrigger: { trigger: "#locations", start: "top bottom", end: "bottom top", scrub: true }
      });
    }
  }

  /* ---------- 6. About gallery parallax ---------- */
  if (hasST && !reduce) {
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.1;
      gsap.fromTo(el, { yPercent: speed * -100 }, {
        yPercent: speed * 100, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ---------- 7. Floating menu — idle float + pointer parallax ---------- */
  if (hasGSAP && !reduce) {
    gsap.utils.toArray(".float-item").forEach(function (item, i) {
      gsap.to(item, {
        y: "+=14", duration: 2.6 + (i % 3) * 0.5, ease: "sine.inOut",
        repeat: -1, yoyo: true, delay: i * 0.18
      });
    });

    var field = document.getElementById("floatField");
    if (field) {
      field.addEventListener("pointermove", function (e) {
        var r = field.getBoundingClientRect();
        var cx = (e.clientX - r.left) / r.width - 0.5;
        var cy = (e.clientY - r.top) / r.height - 0.5;
        gsap.utils.toArray(".float-item .shot").forEach(function (shot, i) {
          var depth = ((i % 3) + 1) * 6;
          gsap.to(shot, { x: cx * depth, y: cy * depth, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        });
      });
      field.addEventListener("pointerleave", function () {
        gsap.to(".float-item .shot", { x: 0, y: 0, duration: 0.9, ease: "power2.out" });
      });
    }
  }

  /* ---------- 8. refresh after fonts load (avoids trigger drift) ---------- */
  if (hasST && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
