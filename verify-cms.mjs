// jsdom verification: stub fetch to read local content/*.json, run content.js +
// site.js + the bootstrap, and confirm every section populates with data-reveal.
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const vc = new VirtualConsole();
vc.on("jsdomError", () => {}); // ignore failed CDN <script> loads (gsap/lenis)

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: undefined,
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const { window } = dom;

// matchMedia stub (jsdom lacks it)
window.matchMedia = (q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });

// fetch stub -> read local files
window.fetch = async (url) => {
  const rel = String(url).replace(/^.*?(content\/)/, "$1");
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return { ok: false, status: 404, json: async () => null };
  const text = fs.readFileSync(file, "utf8");
  return { ok: true, status: 200, json: async () => JSON.parse(text) };
};

// manually load the local scripts (jsdom won't fetch CDN ones, and local
// src= aren't auto-resolved here), in document order, then run bootstrap.
function loadLocal(src) {
  const code = fs.readFileSync(path.join(root, src), "utf8");
  const s = window.document.createElement("script");
  s.textContent = code;
  window.document.body.appendChild(s);
}
loadLocal("js/content.js");
loadLocal("js/site.js");

// run renderContent().then(initMotion), wait for it
await window.renderContent();
if (typeof window.__initMotion === "function") {
  try { window.__initMotion(); } catch (e) { /* gsap absent in jsdom */ }
}

const doc = window.document;
const fail = [];
const ok = [];
function check(label, cond, detail) {
  (cond ? ok : fail).push(label + (detail ? ` (${detail})` : ""));
}

// HERO
check("hero tagline", doc.querySelector("#hero .hero__eyebrow")?.textContent.includes("Burbank"));
const heroCtas = doc.querySelectorAll("#hero .hero__cta a");
check("hero cta_primary", heroCtas[0]?.textContent === "Order Now" && heroCtas[0]?.getAttribute("href") === "#order");
check("hero cta_secondary", heroCtas[1]?.textContent === "View the Counter");

// MENU sections
for (const [id, line2, firstName] of [
  ["menu", "Sandos.", "Pastrami on Rye"],
  ["bowls", "Bowls.", "The Steak Bowl"],
  ["meats", "Meats.", "Dry-Aged Ribeye"],
  ["seafoods", "Seafoods.", "Day-Boat Salmon"],
]) {
  const sec = doc.getElementById(id);
  const title = sec.querySelector(".section-title");
  check(`${id} title em`, title?.querySelector("em")?.textContent === line2, title?.innerHTML);
  const heroCards = sec.querySelectorAll(".menu-hero .m-card");
  const gridCards = sec.querySelectorAll(".menu-grid .m-card");
  check(`${id} hero cards = 2`, heroCards.length === 2, `got ${heroCards.length}`);
  check(`${id} grid cards = 4`, gridCards.length === 4, `got ${gridCards.length}`);
  check(`${id} first name`, heroCards[0]?.querySelector(".name")?.textContent === firstName);
  check(`${id} feature badge`, heroCards[0]?.querySelector(".m-card__tag--feature") != null);
  check(`${id} style classes`, heroCards[0]?.querySelector(".m-card__shot--a .m-obj")?.className.startsWith("m-obj m-obj--"));
  const allReveal = [...heroCards, ...gridCards].every((c) => c.hasAttribute("data-reveal"));
  check(`${id} cards data-reveal`, allReveal);
  check(`${id} cta text`, sec.querySelector(".counter__cta")?.textContent === "Order the Counter");
}

// LOCATIONS
const loc = doc.getElementById("locations");
check("locations title em", loc.querySelector(".section-title em")?.textContent === "hungry.");
check("locations bg tag", loc.querySelector(".locations__bg .ph__tag")?.textContent.includes("most-ordered"));
const locCards = loc.querySelectorAll(".loc-grid .loc-card");
check("locations 2 cards", locCards.length === 2, `got ${locCards.length}`);
check("locations card href", locCards[0]?.getAttribute("href") === "burbank.html");
check("locations cards data-reveal", [...locCards].every((c) => c.hasAttribute("data-reveal")));

// ABOUT
const about = doc.getElementById("about");
check("about title br+em", /Who, What, Where,<br>When, <em>Why\.<\/em>/.test(about.querySelector(".section-title")?.innerHTML || ""), about.querySelector(".section-title")?.innerHTML);
const paras = about.querySelectorAll(".about__essay p");
check("about 7 paragraphs", paras.length === 7, `got ${paras.length}`);
check("about first paragraph", paras[0]?.textContent.startsWith("What we create"));
check("about essay data-reveal", about.querySelector(".about__essay")?.hasAttribute("data-reveal"));

// REVIEWS
const rev = doc.getElementById("reviews");
check("reviews title em", rev.querySelector(".section-head .section-title em")?.textContent === "neighborhood.");
check("reviews title br", /Loved by the<br>/.test(rev.querySelector(".section-head .section-title")?.innerHTML || ""));
const figs = doc.querySelectorAll("#review-grid .review");
check("reviews 3 items", figs.length === 3, `got ${figs.length}`);
check("reviews stars", figs[0]?.querySelector(".review__stars")?.textContent === "★★★★★");
check("reviews source", figs[0]?.querySelector("figcaption")?.textContent.includes("Yelp · Burbank"));
check("reviews data-reveal", [...figs].every((f) => f.hasAttribute("data-reveal")));

// INFO
const info = doc.getElementById("order");
const cols = info.querySelectorAll(".info__col");
check("info 3 columns", cols.length === 3, `got ${cols.length}`);
check("info burbank address", cols[0]?.querySelector("p")?.innerHTML.includes("445 S Glenoaks"));
check("info burbank br lines", (cols[0]?.querySelector("p")?.innerHTML.match(/<br>/g) || []).length === 2);
check("info note column", cols[2]?.classList.contains("info__col--note"));
check("info note no button", cols[2]?.querySelector("a.btn") == null);
check("info has order button", cols[0]?.querySelector("a.btn")?.textContent === "Order Burbank");
check("info cols data-reveal", [...cols].every((c) => c.hasAttribute("data-reveal")));

// data-reveal global presence
check("data-reveal present overall", doc.querySelectorAll("[data-reveal]").length > 20, `count ${doc.querySelectorAll("[data-reveal]").length}`);

console.log("PASS:", ok.length);
ok.forEach((o) => console.log("  ✓", o));
if (fail.length) {
  console.log("\nFAIL:", fail.length);
  fail.forEach((f) => console.log("  ✗", f));
  process.exit(1);
} else {
  console.log("\nALL CHECKS PASSED ✅");
}
