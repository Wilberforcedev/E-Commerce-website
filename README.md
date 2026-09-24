# NovaMart

A full-stack e-commerce app — React frontend, Express backend, Firebase for auth and data, and a voice search / voice review feature powered by Gemini's audio transcription. Built as a real store, not a demo: proper stock tracking, atomic checkout, role-based admin access, the works.

## What it does

- Browse a product catalog with filtering, search, price ranges, and stock indicators
- Search or leave a review by talking instead of typing (Gemini transcribes it)
- Sign in with Google or email/password
- Live inventory that stays in sync across users
- Wishlists and order history, plus public order tracking by order ID
- An admin dashboard for managing products, stock, and order status
- **Checkout that won't oversell** — stock and pricing are re-verified server-side inside a Firestore transaction at the moment of purchase, so two people can't buy the last item at once and prices can't be tampered with client-side

## How the security actually works

A couple of things worth knowing if you're touching the checkout or auth code:

- **Roles aren't trusted from the client.** Whether someone's an admin lives in Firestore under `/users/{userId}` and gets checked server-side — nobody can just claim admin by editing a request.
- **Firestore rules do the heavy lifting.** Users can only write their own profile. Only admins can create or delete products. Orders can only be created with valid data and start as `Pending` — only admins can change that after.
- **Checkout is atomic.** Placing an order reads live prices and stock, recalculates the total against real server data (not whatever the client sent), and decrements inventory all inside one Firestore `runTransaction`, so it can't half-succeed or get raced by a concurrent order.
- **The transcription endpoint is rate-limited** (30 requests / 15 min per IP) since it's the one route burning Gemini API quota, and request sizes are capped per-route (1MB normal, 25MB for audio).

## Stack

React 19, TypeScript, Tailwind, Vite on the frontend. Express + `tsx` on the backend, serving both the built frontend and the `/api/*` routes from one process. Firebase Auth + Firestore for data. `@google/genai` for the Gemini transcription calls.

## Running it locally

You'll need Node 18+ (or Bun) and a Firebase project with Firestore + Auth turned on.

```bash
git clone https://github.com/Wilberforcedev/E-Commerce-website.git
cd E-Commerce-website
npm install
cp .env.example .env
```

Fill in `.env`:

```env
VITE_STORE_NAME=NovaMart
VITE_CURRENCY_SYMBOL=$
GEMINI_API_KEY=your_gemini_api_key_here

# only matters in production — who's allowed to call the API cross-origin
ALLOWED_ORIGIN=https://your-production-domain.com
```

Make sure `firebase-applet-config.json` is in the project root (it's just the public client config, safe to commit), then push the Firestore rules:

```bash
firebase deploy --only firestore:rules
```

Then:

```bash
npm run dev
```

Runs on `http://localhost:3000` — Express handles `/api/*`, Vite handles everything else with hot reload.

For a production build:

```bash
npm run build
npm start
```

This builds the frontend into `dist/` and starts the one Express process that serves it plus the API. `GET /api/health` is there for uptime checks.

## Deploying

This is a real server, not a static site — it needs somewhere that keeps a Node process running, so Netlify/GitHub Pages won't work here.

Render is the easiest option — there's a `render.yaml` at the repo root already. Push to GitHub, create a Render Blueprint pointing at the repo, set `GEMINI_API_KEY` and `ALLOWED_ORIGIN` as secrets in the Render dashboard (they're deliberately left out of the committed config), and deploy. It'll run the build, start the server, and health-check `/api/health` automatically.

Any other Node host (Railway, Fly.io, a plain VPS) works the same way — `npm install && npm run build` to build, `npm start` to run. Just set these env vars:

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | Defaults to 3000; most hosts set their own anyway |
| `GEMINI_API_KEY` | Yes | Server-side only, never sent to the client |
| `VITE_STORE_NAME` | No | Defaults to `NovaMart` |
| `VITE_CURRENCY_SYMBOL` | No | Defaults to `$` |
| `ALLOWED_ORIGIN` | Recommended | Comma-separated origins allowed to call `/api/*`. Leave unset and it defaults to same-origin only, which is fine if nothing external needs to call the API |

One easy thing to forget: after deploying, add your production domain as an authorized domain in Firebase Auth settings — otherwise Google Sign-In will just fail on the live site with no obvious reason why.

## Roles

| Role | Can do |
|---|---|
| Customer | Browse, voice search, wishlist, checkout, view their own order history, leave voice reviews |
| Admin | Everything above, plus manage the product catalog, update stock, change order status, view sales numbers |

## License

MIT
