# Dr. Juice — new marketing website

A conversion-first, single-page site for **Dr. Juice** (Glendale, CA) — cold-pressed
juice, smoothies, açaí bowls and wellness shots. Built as a self-contained static site
so it can be dropped on any host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, plain S3).

## Why it looks the way it does (the marketing brief)

This site was designed to fix the specific gaps found in the current `drjuice.menu`
landing page and `@dr.juice.usa` Instagram:

| Problem on the old site | What this site does instead |
|---|---|
| App download was the only real CTA (high friction) | **"Order Now" is the primary CTA everywhere**; the app is the secondary/retention layer |
| Ordering only lived on 3rd-party marketplaces (15–30% fees) | Direct **call-to-order + Get Directions** up top; delivery apps listed but not the front door |
| The 5.0★ / 140+ reviews were nowhere on the page | **Reviews + rating are surfaced** in the hero badge and a dedicated Reviews section |
| No story, no education, thin content (bad for SEO) | **Our Story** + ingredient/differentiator content, richer copy for search |
| No email capture | **Newsletter signup** wired to Web3Forms |
| No structured data | **LocalBusiness + AggregateRating JSON-LD** for local SEO / rich results |
| Fragmented brand (many domains + IG handles) | One clean brand system, one canonical URL in the `<head>` |

## Structure

```
drjuice/
├── index.html      # the whole page (content is inline, easy to edit)
├── css/site.css    # bright wellness design system
├── js/site.js      # GSAP + Lenis motion layer (loader, reveals, parallax)
└── assets/
    └── favicon.svg
```

The motion layer degrades gracefully: if the CDN scripts (GSAP/Lenis) don't load,
the loader dismisses itself and all content shows normally.

## Before launch — swap these in

1. **Photos.** Every colored gradient block is a placeholder marked "swap me".
   Replace `<div class="ph ph--…"></div>` with `<img src="assets/your-photo.jpg" alt="…">`
   (hero, menu items, story gallery, storefront in the Visit band).
2. **Menu + prices.** Item names come from the real menu, prices are best-effort —
   confirm and adjust in `index.html`. A note on the page already tells visitors the
   live menu is authoritative.
3. **Reviews.** Quotes are representative, not verbatim — paste real Google/Yelp reviews.
4. **Order links.** Point "Order Now" / "Call to Order" at the real online-ordering flow
   (or the app deep-link). Delivery links are pre-filled for Uber Eats / Grubhub / Postmates.
5. **Newsletter.** Replace `YOUR-WEB3FORMS-KEY` in the newsletter form with a real
   [Web3Forms](https://web3forms.com) access key to receive signups by email.
6. **Canonical domain + OG image.** Set the final domain in the `<link rel="canonical">`,
   `og:url`, and add `assets/og.jpg` (1200×630) for social sharing.

## Local preview

Any static server works, e.g.:

```
cd drjuice && python3 -m http.server 8080
# open http://localhost:8080
```
