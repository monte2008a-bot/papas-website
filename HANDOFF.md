# Papa's Meat & Seafood — Project Handoff

> **New chat? Start here.** Read this file, then continue the work.
> Everything is on disk and pushed to GitHub — the website is safe regardless of any chat.

---

## What this is
A fashion-house-styled website for **Papa's Meat & Seafood** (butcher + deli; Burbank & La Crescenta, CA).
Design references: Jacquemus + John & Vinny's, Margiela, Nike merch, bourbonsteak.com.

## Where it lives
- **Project folder:** `/Users/monte/papas-website`
- **Live site (GitHub Pages):** https://monte2008a-bot.github.io/papas-website/
- **GitHub repo:** https://github.com/monte2008a-bot/papas-website
- **Single-file version:** `papas-website/papas-standalone.html` (CSS+JS inlined; regenerated on every change)

## Stack
- Plain **static HTML / CSS / JS** — no framework.
- **GSAP + ScrollTrigger** (animation) and **Lenis** (smooth scroll), loaded from CDN.
- Fonts from Google Fonts.
- Files: `index.html`, `css/site.css`, `js/site.js`, `assets/favicon.svg`.

---

## How to deploy a change (IMPORTANT)
After editing `index.html` / `css/site.css` / `js/site.js`:

1. **Regenerate the standalone bundle** (keeps `papas-standalone.html` in sync):
```bash
cd /Users/monte/papas-website
python3 - <<'PY'
import base64, pathlib
html=pathlib.Path("index.html").read_text(); css=pathlib.Path("css/site.css").read_text()
js=pathlib.Path("js/site.js").read_text(); svg=pathlib.Path("assets/favicon.svg").read_text()
fav="data:image/svg+xml;base64,"+base64.b64encode(svg.encode()).decode()
html=html.replace('href="assets/favicon.svg"','href="'+fav+'"')
html=html.replace('<link rel="stylesheet" href="css/site.css" />',"<style>\n"+css+"\n</style>")
html=html.replace('<script src="js/site.js"></script>',"<script>\n"+js+"\n</script>")
pathlib.Path("papas-standalone.html").write_text(html)
PY
```
2. **Commit + push** (this auto-redeploys GitHub Pages in ~1–2 min):
```bash
export PATH="$HOME/.local/bin:$PATH"     # gh CLI lives here (git credential helper)
git add -A && git commit -m "your message" && git push
```

## Tooling gotchas
- **git** = `/usr/bin/git` (system). **gh** = `~/.local/bin/gh`. **node/npm/npx** = via **nvm** (`export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20`). Node is only needed for npm/ruflo/muapi/Remotion — NOT for deploying.
- **Caching:** GitHub Pages serves HTML with `max-age=600` (10 min). After a push, the browser may show the OLD version. To force-see the new one, add a query string: `…/papas-website/?v=7` (bump the number), or use an incognito window. The code is almost always already correct — verify with `curl -s "<url>?nocache=$RANDOM" | grep "<text>"`.
- **Preview screenshots** (Claude Preview MCP): screenshots reliably capture the TOP of the page; scrolled sections often come back blank because Lenis/ScrollTrigger don't sync with programmatic scroll in headless. Workaround: temporarily `display:none` the sections above the one you want, so it renders at the top. Also cache-bust CSS via `link.href='css/site.css?v='+Date.now()` and reload the whole page (HTML) when you change HTML.

---

## Brand system (client-specified, 6/10/26)
**Palette (eyeballed from client swatches — confirm exact hex with client):**
- `--orange` **#D1572F** terracotta = PRIMARY pop (CTAs/buttons, the footer period)
- `--pop2` **#E08A33** orange = SECONDARY pop (prices, links, stars, the `&`)
- `--pop3` **#EFB23E** amber = EXTRA pop ("Most Ordered" badge)
- `--ink` **#16210F** dark green-black = primary-1 (text, footer, dark sections)
- `--egg` **#E3E1DA** off-white = primary-2 (page ground)

**Fonts:**
- **Bebas Neue** — the "PAPA'S" wordmark (client choice; note the apostrophe).
- **Figtree** — stand-in for **TT Commons Pro** (client's choice for "Meat & Seafood"). TT Commons Pro is a PAID font — needs the licensed font file to use for real.
- **Fraunces** — serif italic accents (section titles, prices, footer tagline).

**Signature device:** a **fixed vertical "PAPA'S" spine** on the left edge (Bebas Neue, rotated 90° reading top-to-bottom). It fills a reserved left "gutter" (`--gutter`) so content never overlaps it, **drifts/travels upward on scroll** (GSAP scrub in `js/site.js` §5b), and switches ink→egg over dark sections. On mobile (≤760px) the spine hides and a centered `.hero__mark` wordmark shows instead.

## Page structure (single-page scroll)
1. Intro **loader** (ink screen → "PAPA'S" + progress bar → curtain wipe). Failsafe-dismissed.
2. **Hero** — side spine + Order Now / View the Counter (no "Meat & Seafood" here anymore).
3. **The Sandos** (`#menu`) — Jacquemus-style editorial grid: 2 big Pastrami cards + 4 smaller, hover swaps to a 2nd "shot". Placeholders = CSS gradient frames (`.m-obj`); swap each for `<img>` later.
4. **Locations** (`#locations`) — cinematic dark section, title "Call us when you're hungry.", Burbank + La Crescenta cards.
5. **About** (`#about`) — title "Who, What, Where, When, Why."; image gallery; long brand essay (opens "What we create is deeply personal to us.").
6. **Reviews + info** (`#reviews`) — 3 placeholder Yelp reviews + Burbank/La Crescenta/Papa's info columns + Order buttons.
7. **Footer** — big "PAPA'S", "MEAT & SEAFOOD." (terracotta period), centered "Taste and see.." tagline.

Nav: Home · Locations · About Us · Reviews + Order Now. (Mobile nav links currently hide — no hamburger yet.)

---

## Open to-dos
- [ ] **Real photos** — replace placeholder gradient frames in the menu grid, locations bg, and about gallery (`.m-obj`, `.ph`, `.g`).
- [ ] **Real Yelp reviews** — replace the 3 placeholder reviews (client said she'll paste them).
- [ ] **Wire "Order Now" buttons** — currently `href="#"`; point to real online-ordering / phone links per location.
- [ ] **Exact brand hex** — confirm the 5 swatch hex with the client (currently eyeballed).
- [ ] **TT Commons Pro font file** — get the licensed file to replace Figtree on "Meat & Seafood".
- [ ] **Mobile nav** — add a hamburger menu (links hide < 900px).
- [ ] **Real addresses / hours / phone numbers** (placeholders in the info + location pages).
- [ ] `burbank.html` / `la-crescenta.html` — older v1 style; re-skin to match if/when needed.

## Other context
- A Remotion starter project exists at `/Users/monte/remotion-video` (for a future hero/promo video).
- ~60 muapi media-generation skills + design skills are installed globally in `~/.claude/skills/` (muapi needs a paid MuAPI API key to actually generate).
- Brand system also stored in Ruflo memory: namespace `patterns`, key `papas-brand-system`.
