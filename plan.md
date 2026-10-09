# FirstPlay Advertiser Portal — implementation plan

## Product scope

A separate web portal for the FirstPlay mobile and desktop apps. It contains two primary experiences:

1. **Promote** — a responsive advertiser submission flow for apps, games, and products.
2. **Protected dashboard** — Firebase Authentication with one allowlisted admin email and a growth metrics view.

The existing mobile and desktop products stay outside this repository.

## Design direction

### Design movement

**Editorial SaaS / quiet utility**: the dark reference’s sharp card structure, campaign-preview focus, and high-contrast labels are retained, but translated into a light surface system that feels more trustworthy for payments and submissions.

### Core principles

- **Signal before chrome** — form labels, required states, and pricing are more prominent than decoration.
- **Soft structure** — warm-white canvases, thin graphite borders, and generous whitespace replace heavy dark panels.
- **Preview as proof** — the live campaign card mirrors the information being entered so advertisers know exactly what will be placed.
- **Operational clarity** — Firebase/Bacs configuration states are explicit, never hidden behind a broken button.

### Color philosophy

Warm white keeps the portal approachable; ink navy provides authority and readable contrast; electric blue is the ownable action color for links, focus rings, and active states; a restrained lime accent signals live, verified, or complete states. Coral is reserved for validation and blocking errors.

### Layout paradigm

A **split-workbench layout**: a dominant editorial form rail on the left and a sticky proof/payment rail on the right. On small screens, the proof rail moves above the form so the user sees the outcome before investing in data entry.

### Signature elements

- A small cobalt **pulse mark** beside FirstPlay’s wordmark.
- Fine **blueprint rules** and eyebrow labels that make the interface feel like a campaign operations desk.
- A live preview card with a subtle radial glow and poster-style media frame, echoing the supplied reference without copying its dark theme.

### Interaction and animation

Inputs lift their border color on focus, category tabs slide a short cobalt underline, and the preview updates immediately with no dramatic motion. Use 160–220ms transitions, no looping motion, and respect `prefers-reduced-motion`. Submission progress is a three-step status line: preparing, uploading, ready for payment.

### Typography system

Use a clean system sans stack with bold, slightly tight display headings and normal-weight body copy. Eyebrows are uppercase, 11px, letter-spaced. Body copy is 14–16px with a 1.55 line-height. Metrics use tabular numerals for scanning.

### Brand essence

**FirstPlay helps creators turn good digital products into visible, measurable campaigns.** Personality: precise, encouraging, credible.

### Brand voice

Direct, warm, and specific. Example lines: “Put your next release in front of daily players.” and “Your campaign is saved; connect Bacs to publish the placement.”

### Wordmark and logo

A custom-feeling wordmark pairs the FirstPlay name with a two-line cobalt pulse mark: two offset vertical bars that suggest a launch signal and a playhead.

### Signature brand color

**FirstPlay Cobalt — `#2563EB`**. It is bright enough to guide action on white without turning the portal into a generic fintech interface.

## Implementation

### Frontend

- Next.js App Router with TypeScript.
- Tailwind CSS for layout and utility styling, with a small global CSS layer for the visual system.
- Client-side form state for instant preview and validation.
- Firebase client SDK for the admin sign-in entry point and optional client-side status checks.

### Server boundaries

- `POST /api/listings`: accepts a multipart form, validates `full_name`, `category`, category-dependent fields, and media; when Firebase Admin credentials exist, uploads to Firebase Storage at `uploads/{category}/{document_id}/{logo-or-flyer}` and writes one Firestore document to `apps` using lowercase snake_case, server-derived timestamps, and a seven-day expiry. Without keys, returns a clear configuration error rather than pretending to save.
- `POST /api/payments/bacs/checkout`: provider boundary for Bacs. It never exposes credentials to the browser and reports an explicit unconfigured state until Bacs keys are present.
- `GET /api/dashboard/metrics`: server-side Firebase Admin read for listing counts, active listings, daily metrics, and recent submissions. It returns a setup state when Firebase Admin is not configured.

### Firebase data contract

- Firestore primary collection: `apps`.
- Listing fields: `full_name`, `category`, `app_name`, `game_name`, `product_name`, `app_url`, `game_url`, `product_url`, `logo`, `flyer`, `created_at`, `expiry_date`.
- Unused category fields are `null`; missing product URL is `null`.
- Media is stored in Firebase Storage; Firestore holds download URLs only.
- Metrics are read from `metrics_daily/{yyyy-mm-dd}` with `daily_active_users`, `total_app_openings`, and `daily_app_openings`. The mobile app can write compatible documents independently.

### Protected dashboard

`/pilotapp/firstplay/dashboard/authentication` is the only sign-in entry. Firebase client auth observes the session, verifies the exact `NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL`, and redirects only that email to `/pilotapp/firstplay/dashboard`. Any other account is signed out and shown a rejection state. The dashboard route repeats the client-side guard and never renders metrics for unauthenticated or non-allowlisted users. Production hardening should additionally enforce the same allowlist in Firebase Security Rules and/or a server token verifier once the real project keys are supplied.

### Project structure

```text
app/
  api/listings/route.ts              Firebase Storage + Firestore listing boundary
  api/payments/bacs/checkout/route.ts Bacs provider boundary
  api/dashboard/metrics/route.ts     Admin metrics boundary
  promote/page.tsx                   Advertiser workbench
  pilotapp/firstplay/dashboard/authentication/page.tsx
  pilotapp/firstplay/dashboard/page.tsx
  layout.tsx, page.tsx, globals.css
components/
  BrandMark.tsx, CampaignPreview.tsx, MetricCard.tsx, StatusPill.tsx
lib/
  firebase.ts                        Browser Firebase initialization
  firebase-admin.ts                  Server Firebase Admin initialization
  listing-schema.ts                   Shared validation and snake_case contract
  bacs.ts                             Server-safe Bacs readiness helper
public/manus-routes.json              Route declaration for Preview
.env.example                          Firebase/Bacs configuration contract
```

## Material constraints

Firebase project keys, Firebase Admin service account details, the one admin email, and Bacs credentials are not available yet. The portal must remain runnable and visually testable without them, but every persistence/auth/payment path must fail closed with a useful setup state instead of silently using fake data.
