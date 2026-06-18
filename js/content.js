/* ============================================================
   Papa's — CMS content injection
   Reads editable content from /content/*.json (managed by Sveltia CMS)
   and renders it into the page. If a file can't load, the hard-coded
   fallback markup already in the HTML stays in place.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Reviews ---------- */
  var grid = document.getElementById("review-grid");
  if (grid) {
    fetch("content/reviews.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.reviews) || !data.reviews.length) return;
        grid.innerHTML = "";
        data.reviews.forEach(function (rv) {
          var n = Math.max(1, Math.min(5, parseInt(rv.rating, 10) || 5));
          var fig = document.createElement("figure");
          fig.className = "review";
          var stars = document.createElement("div");
          stars.className = "review__stars";
          stars.textContent = "★★★★★".slice(0, n);
          var quote = document.createElement("blockquote");
          quote.textContent = "“" + (rv.quote || "") + "”";
          var cap = document.createElement("figcaption");
          cap.textContent = "— " + (rv.name || "") + (rv.location ? " · " + rv.location : "");
          fig.appendChild(stars);
          fig.appendChild(quote);
          fig.appendChild(cap);
          grid.appendChild(fig);
        });
      })
      .catch(function () { /* keep the fallback reviews already in the HTML */ });
  }
})();
