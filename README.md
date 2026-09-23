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

### Production Build

```bash
npm run build
npm start
```

---

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| **Guest / Customer** | Browse products, use voice search, save wishlist, place orders, view personal order history, write voice reviews. |
| **Store Administrator** | Access Admin Dashboard, create/edit/delete products, manage inventory stock, update order statuses, view revenue metrics. |

---

## 📄 License
MIT
