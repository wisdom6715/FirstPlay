# FirstPlay Advertiser Portal

A separate Next.js, Tailwind CSS, and TypeScript web portal for FirstPlay promotion operations. The existing mobile and desktop apps remain outside this project.

## Routes

- `/` — public discovery page (App Store-style hero carousel, category chips, charts-style rows, product tiles). Dark/light glass UI. Reads the `apps` and `promotion_banner` Firestore collections via the public REST API (cached for 60s) and shows sample listings if none are live.
- `/promote` — responsive white advertiser workbench with category-specific listing fields, Firebase Storage media upload flow, live preview, placement rates, and Bacs handoff state.
- `/pilotapp/firstplay/dashboard/authentication` — Firebase email/password sign-in entry restricted to one configured email.
- `/pilotapp/firstplay/dashboard` — protected growth dashboard for listing and app-activity metrics.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The development server listens on port `3000`.

## Firebase values

Fill the browser variables in `.env.local` with the Firebase web app configuration:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL
```

Fill the server variables with the Firebase Admin service account values. Keep them out of browser code and source control:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
FIREBASE_STORAGE_BUCKET
FIREBASE_ADMIN_EMAIL
```

The single admin email must also be provisioned as a Firebase Authentication email/password user. The dashboard API verifies the Firebase ID token server-side and compares the token email to the configured allowlist.

## Firestore and Storage contract

Listings are written only to the `apps` collection with lowercase snake_case fields:

```text
full_name, category,
app_name, game_name, product_name,
app_url, game_url, product_url,
logo, flyer, created_at, expiry_date
```

`category` is limited to `app`, `game`, or `product`. Unused category fields and a missing product URL are `null`. Media is uploaded before the Firestore write under:

```text
uploads/{category}/{document_id}/{logo-or-flyer}
```

Firestore stores the resulting Firebase Storage download URL only. `created_at` is derived on the server and `expiry_date` is exactly seven days later. Expired listings remain in Firestore; active means `expiry_date` is later than the current server time.

The dashboard reads daily activity from `metrics_daily/{yyyy-mm-dd}` using UTC date IDs and expects `daily_active_users`, `daily_app_openings`, and a cumulative `total_app_openings` value for the current day’s metrics document.

## Bacs boundary

Set these server variables when the merchant account is available:

```text
BACS_API_BASE_URL
BACS_PUBLIC_KEY
BACS_SECRET_KEY
BACS_MERCHANT_ID
```

The server derives the payment amount from the saved Firestore listing’s category; browser-provided amounts are ignored. The Bacs adapter remains explicitly unavailable until the exact merchant API/checkout contract is supplied, so the UI will never claim a payment is ready while returning a null checkout URL.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```
