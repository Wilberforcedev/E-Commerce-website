# NovaMart

A full-stack e-commerce app — React frontend, Express backend, Firebase Auth and Firestore, plus voice search powered by Gemini transcription. Checkout runs through the server so product prices, discounts, shipping, tax, and stock are checked against current store data.

## What it does

- Browse a product catalog with filtering, search, price ranges, and stock indicators
- Search or leave a review by talking instead of typing (Gemini transcribes it)
- Sign in with Google or email/password
- Live inventory that stays in sync across users
- Wishlists, private order history, and order tracking for your own orders
- An admin dashboard for managing products, stock, and order status
- **Server-validated checkout** — the server reads current product records, recalculates the total, and commits the order and stock decrements atomically with Firestore update-time preconditions.

## Security model

- **Checkout runs on the server.** The client sends product IDs, quantities, address, shipping choice, payment type, and an optional coupon code. The server verifies any Firebase ID token, reads current prices and stock, applies known coupons, calculates shipping and tax, then commits the order and stock changes as one Firestore write with update-time preconditions.
- **Orders are private.** Firestore allows a signed-in customer to read only orders whose `userId` matches their Firebase UID. Admins can read all orders. Guest checkout returns its confirmation to that browser session, but guest orders cannot be fetched later.
- **Catalog writes are restricted.** Customers can read products. Only admins can create, edit, seed, or delete products. Direct customer writes to orders and stock are denied.
- **Admin API actions require a verified Firebase ID token and an admin role.** Server identity comes from the signed token and the server-side user profile, not a role supplied in a request body.
- **Production CORS uses an exact origin allow-list.** An unset allow-list blocks cross-origin browser access; wildcard origins are rejected. Transcription is rate-limited to 30 requests per 15 minutes, and its JSON payload is limited to 25 MB.

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

Fill in `.env`. Keep the service account JSON private; do not commit it. Give the service account Firestore read/write permissions in the Firebase project.

```env
VITE_STORE_NAME=NovaMart
VITE_CURRENCY_SYMBOL=$
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_DATABASE_ID=(default)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ...}'

# only matters in production — who's allowed to call the API cross-origin
ALLOWED_ORIGIN=https://your-production-domain.com
```

Make sure `firebase-applet-config.json` is in the project root (it contains public client configuration), then deploy the Firestore rules:

```bash
firebase deploy --only firestore:rules
```

Then:

```bash
npm run dev
```

Runs on `http://localhost:3000` — Express handles `/api/*`, Vite handles everything else with hot reload.

On an empty Firestore database, sign in with an administrator account to seed the sample product catalog. The admin account must be designated in the Firestore user profile or use the configured administrator email.\n\nFor a production build:

```bash
npm run build
npm start
```

This builds the frontend into `dist/` and starts the one Express process that serves it plus the API. `GET /api/health` is there for uptime checks.

## Deploying

This is a real server, not a static site — it needs somewhere that keeps a Node process running, so Netlify/GitHub Pages won't work here.

Render is the easiest option — there's a `render.yaml` at the repo root already. Push to GitHub, create a Render Blueprint pointing at the repo, set `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON`, and the exact `ALLOWED_ORIGIN` in the Render dashboard, and deploy. Set the service account JSON as a secret. The service account needs Firestore read/write IAM access. It'll run the build, start the server, and health-check `/api/health` automatically.

Any other Node host (Railway, Fly.io, a plain VPS) works the same way — `npm install && npm run build` to build, `npm start` to run. Just set these env vars:

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | Defaults to 3000; most hosts set their own anyway |
| `GEMINI_API_KEY` | Yes | Server-side only, never sent to the client |\n| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID used to verify sign-in tokens |\n| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes | Server-side service account JSON with Firestore read/write access |\n| `FIREBASE_DATABASE_ID` | No | Defaults to `(default)`; set it if the app uses a named Firestore database |
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
