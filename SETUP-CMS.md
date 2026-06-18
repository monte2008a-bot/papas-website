# Papa's — CMS Setup (one-time, owner)

The site now has a no-code editor at **`/admin`** (Sveltia CMS). Once the
one-time login below is wired up, the shop owner can edit the homepage text,
prices, menu items, reviews, hours and addresses, then press **Publish** —
changes commit to `main` and auto-deploy to both GitHub Pages and Netlify.

Live editor URLs (after setup):
- https://ubiquitous-biscotti-0a0e98.netlify.app/admin/
- https://monte2008a-bot.github.io/papas-website/admin/

---

## Why this setup

Login is via **GitHub OAuth**, brokered by a tiny free **Cloudflare Worker**
(`sveltia-cms-auth`). We use it because Netlify Identity + Git Gateway (the old
one-click login) are deprecated. The worker only handles the OAuth handshake;
it stores nothing.

---

## One-time steps

### 1. Deploy the auth worker
1. Go to **https://github.com/sveltia/sveltia-cms-auth**.
2. Click the **"Deploy to Cloudflare Workers"** button and follow the prompts
   (free Cloudflare account is fine).
3. Note the worker URL, e.g. `https://sveltia-cms-auth.<your-subdomain>.workers.dev`.

### 2. Create a GitHub OAuth App
1. Go to **https://github.com/settings/applications/new**.
2. Fill in:
   - **Application name:** `Papa's CMS`
   - **Homepage URL:** `https://ubiquitous-biscotti-0a0e98.netlify.app/`
   - **Authorization callback URL:** `<WORKER_URL>/callback`
     (e.g. `https://sveltia-cms-auth.<sub>.workers.dev/callback`)
3. Register, then **generate a client secret**. Copy the **Client ID** and
   **Client Secret**.

### 3. Set the worker's environment variables
In the Cloudflare dashboard → your worker → **Settings → Variables**:
- `GITHUB_CLIENT_ID` = the Client ID
- `GITHUB_CLIENT_SECRET` = the Client Secret — click **Encrypt**
- `ALLOWED_DOMAINS` = `ubiquitous-biscotti-0a0e98.netlify.app,monte2008a-bot.github.io`

Deploy/save the worker so the variables take effect.

### 4. Point the CMS at the worker
Edit **`admin/config.yml`** and replace the placeholder:
```yaml
backend:
  name: github
  repo: monte2008a-bot/papas-website
  branch: main
  base_url: https://sveltia-cms-auth.<your-subdomain>.workers.dev   # <-- your worker URL
```
Commit and push to `main`.

### 5. Give the owner write access
The owner logs in with their **GitHub account**, so that account must be a
repo **collaborator with write access**:
GitHub repo → **Settings → Collaborators → Add people** → invite the owner.
The owner accepts the emailed invite.

---

## Using the editor (owner)
1. Visit `…/admin/` and click **"Sign in with GitHub"** (authorize once).
2. Pick a section under **Site Content** (Hero, The Sandos, The Bowls, The
   Meats, The Seafoods, Locations, About, Reviews, Info & order columns).
3. Edit the fields. For menu items, the **front/hover image style** dropdowns
   pick which placeholder frame shows (`char`, `meat`, `sear`, `bowl`, `sea`,
   `cream`).
4. Press **Publish**. Live in ~1–2 min on Pages, instant on Netlify.

---

## How it works under the hood
- Editable copy lives in **`/content/*.json`** (one file per homepage section).
- **`js/content.js`** fetches those files on load and renders each section,
  keeping the hand-coded markup in `index.html` as a graceful fallback — a
  failed fetch never blanks the site.
- The GSAP motion layer (`js/site.js`) is exposed as `window.__initMotion` and
  only starts **after** content renders (bootstrap at the bottom of
  `index.html`: `renderContent().then(__initMotion)`), so scroll-reveals bind
  to the freshly rendered elements.
- `admin/index.html` loads Sveltia CMS; `admin/config.yml` defines the fields.

To add a new editable section later: add a `content/<name>.json`, a `files:`
entry in `admin/config.yml`, and a render function in `js/content.js`.
