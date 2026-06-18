# Papa's Meat & Seafood — Project Handoff

> **New chat? Read this file first, then continue.** Everything is on disk and pushed to GitHub — the site is safe regardless of any chat.

> **🟡 CURRENT TASK (in progress): Setting up Sveltia CMS so the shop OWNER can edit the site themselves.** See the "CMS" section below — it's the active work.

---

## What this is
A fashion-house-styled website for **Papa's Meat & Seafood** (family butcher + deli; Burbank & La Crescenta, CA).
Design references: Jacquemus + John & Vinny's, Margiela, Nike merch.

## Where it lives
- **Project folder:** `/Users/monte/papas-website`
- **Live (GitHub Pages):** https://monte2008a-bot.github.io/papas-website/
- **Live (Netlify — now also connected, instant deploys):** https://ubiquitous-biscotti-0a0e98.netlify.app/
- **GitHub repo:** https://github.com/monte2008a-bot/papas-website
- **Single-file version:** `papas-standalone.html` (CSS+JS inlined; regenerated on every change)

## Stack
- Plain **static HTML / CSS / JS** — no framework, no build step.
- **GSAP + ScrollTrigger** (animation) + **Lenis** (smooth scroll), from CDN.
- Files: `index.html`, `contact.html`, `request.html`, `css/site.css`, `js/site.js`, `js/content.js`, `assets/favicon.svg`.
- Hosted on **both** GitHub Pages and Netlify (same repo auto-deploys to both).

---

## How to deploy a change (IMPORTANT)
After editing `index.html` / `css/site.css` / `js/site.js` / `js/content.js`:
1. **Regenerate the standalone bundle** (inlines css + js + content.js + favicon):
```bash
cd /Users/monte/papas-website
python3 - <<'PY'
import base64, pathlib
html=pathlib.Path("index.html").read_text(); css=pathlib.Path("css/site.css").read_text()
js=pathlib.Path("js/site.js").read_text(); cjs=pathlib.Path("js/content.js").read_text()
svg=pathlib.Path("assets/favicon.svg").read_text()
fav="data:image/svg+xml;base64,"+base64.b64encode(svg.encode()).decode()
html=html.replace('href="assets/favicon.svg"','href="'+fav+'"')
html=html.replace('<link rel="stylesheet" href="css/site.css" />',"<style>\n"+css+"\n</style>")
html=html.replace('<script src="js/content.js"></script>',"<script>\n"+cjs+"\n</script>")
html=html.replace('<script src="js/site.js"></script>',"<script>\n"+js+"\n</script>")
pathlib.Path("papas-standalone.html").write_text(html)
PY
```
2. **Commit + push** (auto-redeploys both Pages + Netlify, ~1–2 min for Pages, instant for Netlify):
```bash
export PATH="$HOME/.local/bin:$PATH"     # gh CLI lives here (git credential helper)
git add -A && git commit -m "your message" && git push
```

## Tooling gotchas
- **git** = `/usr/bin/git`. **gh** = `~/.local/bin/gh`. **node/npm/npx** = via **nvm** (`export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20`) — only needed for npm tools, NOT for deploying.
- **Caching:** GitHub Pages HTML is cached 10 min. After a push, the browser may show the OLD version. Force-see the new one with a query string: `…/papas-website/?v=99` (bump the number) or an incognito window. **Verify what's deployed** with `curl -s "<url>?nc=$RANDOM" | grep "<text>"` — the deploy is almost always already correct; it's a browser cache. (The Netlify URL deploys instantly and avoids this.)
- **Preview screenshots** (Claude Preview MCP): reliably capture the TOP of the page; scrolled sections often come back blank (Lenis/ScrollTrigger don't sync with programmatic scroll headlessly). Workaround: temporarily `display:none` the sections above the target so it renders at the top. Cache-bust CSS via `link.href='css/site.css?v='+Date.now()` and full-reload when you change HTML.

---

## 🟡 CMS — Sveltia CMS (ACTIVE TASK)
**Goal:** give the shop owner a no-code editor at `/admin` to change content themselves.
Chose **Sveltia CMS** (modern Decap/Netlify-CMS successor) because Netlify Identity + Git Gateway are now DEPRECATED. Owner logs in with a **GitHub account** (the simple email login no longer exists post-Identity; owner confirmed GitHub login is OK).

**DONE (already in the repo):**
- `admin/index.html` — loads Sveltia from `https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`.
- `admin/config.yml` — backend `github`, repo `monte2008a-bot/papas-website`, branch `main`, `publish_mode: simple`. **`base_url` is a PLACEHOLDER** (`https://YOUR-WORKER-SUBDOMAIN.workers.dev`) waiting for the real Cloudflare Worker URL.
- **FULL content refactor complete.** All editable homepage copy now lives in `/content/*.json` — one file per section: `hero.json`, `counter.json` (Sandos), `bowls.json`, `meats.json`, `seafoods.json`, `locations.json`, `about.json`, `reviews.json`, `info.json`.
- One **"Site Content"** collection in `config.yml` with a `files:` entry per JSON (list widgets for repeating items; `style_a`/`style_b` are select widgets: char/meat/sear/bowl/sea/cream). The four menu sections share field definitions via YAML anchors.
- `js/content.js` — exposes `window.renderContent()` (Promise). Fetches every `content/*.json` and renders each section, **keeping the hand-coded markup in `index.html` as a graceful fallback** (a failed fetch never blanks the site). Generated elements keep their original classes AND `data-reveal` attributes.
- `js/site.js` motion layer is now `window.__initMotion` (NOT auto-run). A bootstrap at the bottom of `index.html` runs `renderContent().then(__initMotion)` so scroll-reveals bind AFTER content renders.
- `SETUP-CMS.md` — documents the owner's one-time OAuth setup.
- Verified by rendering `index.html` in jsdom (`verify-cms.mjs`, fetch stubbed to read local JSON): all sections populate and `data-reveal` attributes are present (58 checks pass).

**PENDING — the owner/user must do this (their accounts), then report back:**
1. Deploy the **`sveltia-cms-auth` Cloudflare Worker** (free) — repo: https://github.com/sveltia/sveltia-cms-auth (has a "Deploy to Cloudflare Workers" button). Get the worker URL `https://sveltia-cms-auth.<sub>.workers.dev`.
2. Create a **GitHub OAuth App** (github.com/settings/applications/new): callback URL = `<WORKER_URL>/callback`. Get Client ID + Secret.
3. Set Worker env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (encrypted), `ALLOWED_DOMAINS=ubiquitous-biscotti-0a0e98.netlify.app,monte2008a-bot.github.io`.
4. **Give the worker URL → put it in `admin/config.yml` `base_url`** (one-line edit), commit, push.
5. Then: owner goes to `…/admin/`, "Sign in with GitHub", edits, Publish → live. (Owner's GitHub account must be a repo **collaborator** with write access.)

**NEXT after login works:** content refactor is done — the owner can already edit hours/phones/addresses, menu items + prices, hero, about, locations and reviews. Remaining: **photo slots** (swap the `.m-obj` / `.ph` / `.g` placeholder frames for real `<img>`; the CMS `media_folder` is `assets/uploads` and ready for uploads).

---

## Brand system (client-specified)
**Palette (CSS vars in `css/site.css` `:root`):**
- `--orange` **#D1572F** terracotta = PRIMARY pop (CTAs/buttons, the FOOTER background)
- `--pop2` **#E08A33** orange = SECONDARY pop (prices, links, stars, the `&`)
- `--pop3` **#EFB23E** amber = EXTRA pop (the "Most Ordered" badge)
- `--ink` **#16210F** dark green-black = primary-1 (text, dark sections)
- `--egg` **#E3E1DA** off-white = primary-2 (page ground)
- Intro **loader** background = **#242528** (dark charcoal grey, NOT the green ink)

**Fonts:** **Bebas Neue** = "PAPA'S" wordmark; **Figtree** = stand-in for **TT Commons Pro** (paid; file still needed for the "Meat & Seafood" line); **Fraunces** = serif italic accents.

**Signature device:** fixed vertical **"PAPA'S" spine** on the left edge (Bebas, rotated -90° = **P at bottom, S at top**, reading bottom-to-top). Fills a reserved left gutter (`--gutter`), **drifts DOWNWARD on scroll** (GSAP scrub, `js/site.js` §5b), has a **27vh height cap** so it never crowds the header, switches ink→egg over dark sections. Mobile (≤760px): spine hides, centered `.hero__mark` shows.

**Header:** **PAPAS.** wordmark top-left (Archivo bold + orange period, `.nav__brand`).

## Pages / sections
**index.html (single-page scroll):**
1. Intro **loader** (charcoal screen → "PAPA'S" + orange bar → wipe).
2. **Hero** — side spine + a **BURBANK · LA CRESCENTA** label + Order Now/View the Counter on the left, a large **hero image/video panel** on the right (placeholder, swap-ready: replace the `.ph` div in `.hero__media` with `<img>` or `<video>`).
3. **The Sandos** (`#menu`), **The Bowls** (`#bowls`), **The Meats** (`#meats`), **The Seafoods** (`#seafoods`) — identical Jacquemus-style editorial grids (2 big + 4 small cards, hover swaps to a 2nd "shot"). Placeholders = CSS gradient frames (`.m-obj`); swap each for `<img>`.
4. **Locations** (`#locations`) — cinematic dark section, title "Call us when you're hungry.", Burbank + La Crescenta cards.
5. **About** (`#about`) — title "Who, What, Where, / When, Why."; gallery; long brand essay (opens "What we create is deeply personal to us.").
6. **Reviews + info** (`#reviews`) — **reviews now CMS-driven** (`content/reviews.json` via `js/content.js`); info columns have REAL data (below).
7. **Footer** — **terracotta (swatch 5) background**, cream text, big PAPA'S, "MEAT & SEAFOOD." (dark period), centered "Taste and see.." tagline.

**Nav:** Home · Locations · About Us · Reviews · Contact · Requests + Order Now. **Mobile = hamburger dropdown** (`#navToggle` / `#mobileMenu`, toggle JS in `js/site.js`).

**contact.html** — Contact page (form + location info). **request.html** — "Special Requests" page (locals request products/cuts/produce). Both match the brand (header, spine, footer). Forms currently submit via **Web3Forms** (placeholder key `YOUR_WEB3FORMS_ACCESS_KEY`) with a **mailto fallback** (placeholder email `INFO@PAPASMEATSEAFOOD.COM`). **NOTE:** now that the site is on Netlify, these could switch to free **Netlify Forms** instead — TBD.

## REAL business info (already in the site)
- **Burbank:** 445 S Glenoaks Blvd, Burbank, CA 91506 · Open 7 days 11am–7pm · (818) 476-2168
- **La Crescenta:** 3857 Foothill Blvd, Glendale, CA 91214 · Open 7 days 10am–8pm · (818) 930-9923

## Open to-dos
- [ ] **FINISH the Sveltia CMS login** — content refactor is done; owner still needs the one-time OAuth setup in `SETUP-CMS.md` (deploy worker → set vars → put worker URL in `config.yml` `base_url` → add owner as collaborator).
- [ ] **Forms delivery:** add the Web3Forms key OR switch Contact/Requests to Netlify Forms; set the real shop email.
- [ ] **Real photos** — swap placeholder frames in the menu grids, hero panel, locations bg, about gallery (`.m-obj`, `.ph`, `.g`, `.hero__media`).
- [ ] **Real reviews** — owner will replace placeholders (now editable via CMS once login works).
- [ ] **Wire "Order Now"** buttons (currently `href="#"`) to real ordering / `tel:` links.
- [ ] **Exact brand hex** (palette is eyeballed from client swatches) + **TT Commons Pro font file**.
- [ ] Optional: custom domain (Pages + Netlify both support it).

## Other context
- Remotion starter at `/Users/monte/remotion-video` (future promo video).
- Brand system also stored in Ruflo memory: namespace `patterns`, key `papas-brand-system`.
- Local preview server (cache-free): `cd /Users/monte/papas-website && python3 -m http.server 8080` → http://localhost:8080 (background servers from the Bash tool don't persist; run it in a real Terminal).
