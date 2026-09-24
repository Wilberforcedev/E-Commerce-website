# NovaMart — Full-Stack E-Commerce Platform

NovaMart is a production-grade, full-stack e-commerce application built with React, Vite, Express, Firebase Authentication, Cloud Firestore, and Google Gemini AI speech transcription.

---

## 🌟 Key Features

- **Storefront & Catalog**: Product catalog with category filtering, instant search, price ranges, rating filters, and stock indicators.
- **Microphone Audio Transcription**: Built-in voice search and voice product reviews powered by Google Gemini (`gemini-3.5-transcribe`).
- **Firebase Authentication**: Secure Google Sign-In and email/password authentication.
- **Persistent Cloud Firestore**:
  - Live inventory tracking with real-time stock sync.
  - User profiles and saved wishlists.
  - Order history and public order tracking by Order ID.
- **Store Administration Portal**: Inventory management, product creation, real-time stock updates, order status management, and sales analytics guarded by strict role-based access control.
- **Atomic Checkout & Data Integrity**: Concurrency-safe order placement powered by Firestore `runTransaction` with server-side price recalculation and atomic stock decrements.

---

## 🔒 Security Architecture

### 1. Role-Based Access Control (RBAC) & Anti-Privilege Escalation
- Administrative privileges are never inferred from client-supplied emails or input patterns.
- Roles are strictly stored in the server-managed Firestore `/users/{userId}` collection and verified against authenticated credentials.
- Firestore Security Rules forbid non-administrators from assigning or escalating their own `role` field on creation or update.

### 2. Firestore Security Rules (`firestore.rules`)
- **Users Collection (`/users/{userId}`)**: Write access is strictly limited to the document owner (`isOwner(userId)`). Unauthenticated requests are completely blocked from profile mutations.
- **Products Catalog (`/products/{productId}`)**: Create and delete permissions require administrator privileges. Customers are strictly constrained to decrementing stock during verified purchases.
- **Orders Collection (`/orders/{orderId}`)**: Orders can only be placed with validated schemas, non-negative totals, and initial `Pending` status. Modifying or deleting orders is restricted to administrators.

### 3. Concurrency & Race Condition Defense
- Order placement executes inside an atomic Firestore transaction (`runTransaction`):
  1. Reads all cart items from Firestore to verify actual live pricing and stock availability.
  2. Protects against price tampering by recalculating line items and discounts against server data.
  3. Atomically decrements item inventory and writes the order document simultaneously.

### 4. API Rate Limiting & Protection
- The `/api/transcribe` endpoint is protected by `express-rate-limit` (30 requests per 15-minute window per IP) to safeguard Gemini API quotas against abuse.
- Request payload sizes are route-scoped: non-audio routes use a conservative 1MB parser, while audio upload endpoints allow up to 25MB.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, `tsx`
- **Database & Auth**: Firebase Auth, Google Sign-In, Cloud Firestore
- **AI & Audio**: `@google/genai` TypeScript SDK (`gemini-3.5-transcribe`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher) or Bun
- A Firebase project with Firestore and Authentication enabled

### Installation

1. Clone repository and install dependencies:
   ```bash
   git clone https://github.com/Wilberforcedev/E-Commerce-website.git
   cd E-Commerce-website
   npm install
   ```

2. Configure environment variables in `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide the following configuration:
   ```env
   VITE_STORE_NAME=NovaMart
   VITE_CURRENCY_SYMBOL=$
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Ensure Firebase configuration is present:
   - Verify `firebase-applet-config.json` is located in the project root.
   - Deploy Firestore rules:
     ```bash
     firebase deploy --only firestore:rules
     ```

### Development

Run the full-stack dev server:
```bash
npm run dev
```
The server will start on `http://localhost:3000` with Express handling backend routes (`/api/*`) and Vite serving frontend assets with hot reload.

### Production Build & Local Run

```bash
npm install
npm run build
NODE_ENV=production npm start
```
The server will bind to `0.0.0.0:${PORT:-3000}`, serving compiled frontend SPA assets from `dist/` and mounting API endpoints on `/api`.

---

## 🌐 Production Deployment

NovaMart runs an Express 5 application that both serves the SPA and processes server-side API requests (including Gemini audio transcription). It requires a **persistent Node.js process or container environment** (e.g., Render, Railway, Fly.io, Google Cloud Run, or a VPS) rather than a purely static host (like Netlify or GitHub Pages).

### Option A: Render (Web Service)
1. Connect your GitHub repository (`Wilberforcedev/E-Commerce-website`) to Render.
2. Render will automatically detect `render.yaml`, or create a **Web Service**:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
3. In the Render Dashboard **Environment** tab, set:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (or leave default assigned by Render)
   - `CORS_ORIGIN`: Your production custom domain or Render URL
   - `VITE_STORE_NAME`: `NovaMart`
   - `VITE_CURRENCY_SYMBOL`: `$`

### Option B: Docker Container (Fly.io / Cloud Run / VPS)
Build and run using the multi-stage `Dockerfile`:
```bash
# Build production image
docker build -t novamart-ecommerce:latest .

# Run container with environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  -e CORS_ORIGIN="https://your-domain.com" \
  novamart-ecommerce:latest
```

### Option C: Railway
1. Create a new project on [Railway.app](https://railway.app) and link the repository.
2. Railway detects `railway.json` and runs `npm run build && npm start`.
3. Add `GEMINI_API_KEY`, `NODE_ENV=production`, and any branding overrides in Railway's variables panel.

---

## 🔑 Environment Variables Reference

| Variable | Scope | When Set | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Server-Side Only | Runtime | Google Gemini API key used by `/api/transcribe` for audio transcription. Never expose with `VITE_` prefix. |
| `NODE_ENV` | Server-Side | Runtime | Set to `production` in live environments to enable static asset caching and error suppression. |
| `PORT` | Server-Side | Runtime | Port the Express server listens on (defaults to `3000`). |
| `CORS_ORIGIN` | Server-Side | Runtime | Allowed origins for CORS (e.g. `https://novamart.com`). Leave empty or `*` for open access. |
| `VITE_STORE_NAME` | Client-Side | Build-Time | Store brand name bundled into Vite bundle (defaults to `NovaMart`). |
| `VITE_CURRENCY_SYMBOL` | Client-Side | Build-Time | Currency display symbol bundled into Vite bundle (defaults to `$`). |

---

## 📋 Post-Deployment Manual Checklist
1. **Firebase Authentication Authorized Domains**: In the [Firebase Console](https://console.firebase.google.com/) under **Authentication > Settings > Authorized domains**, add your production domain (e.g., `novamart.onrender.com` or your custom domain).
2. **Deploy Firestore Rules**: Ensure the rules in `firestore.rules` are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. **Configure DNS & SSL**: If using a custom domain, point your DNS A/CNAME records to your host provider and enable HTTPS.

---

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| **Guest / Customer** | Browse products, use voice search, save wishlist, place orders, view personal order history, write voice reviews. |
| **Store Administrator** | Access Admin Dashboard, create/edit/delete products, manage inventory stock, update order statuses, view revenue metrics. |

---

## 📄 License
MIT
