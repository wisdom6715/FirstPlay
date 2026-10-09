# FirstPlay Advertiser Portal — delivery outcomes

- [ ] Build a separate responsive web portal using Next.js, Tailwind CSS, and TypeScript; keep the existing mobile and desktop apps outside this project; make the two primary experiences the promote page and the protected dashboard.
- [ ] Build the promote page on a white background with a responsive split layout: advertiser information and upload form on the left, live campaign card preview, placement rates, and Bacs payment summary on the right; adapt cleanly to mobile, tablet, and desktop.
- [ ] Restrict listing category values to `app`, `game`, and `product`; collect `full_name`, the category-specific name and URL, description/tagline, and the category-specific logo or flyer with conditional validation.
- [ ] Upload media to Firebase Storage before creating the listing document; use a predictable `uploads/{category}/{document_id}/{logo-or-flyer}` path and store only the Firebase Storage download URL in Firestore.
- [ ] Create one Firestore document per listing in the `apps` collection using lowercase snake_case fields: `full_name`, `category`, `app_name`/`game_name`/`product_name`, `app_url`/`game_url`/`product_url`, `logo`, `flyer`, `created_at`, and `expiry_date`; write null for unused category fields and for a missing optional `product_url`.
- [ ] Use a trusted server timestamp for `created_at` and set `expiry_date` to exactly seven days after the trusted creation timestamp for apps, games, and products.
- [ ] Provide a server-safe Bacs payment integration boundary that uses environment-based credentials, keeps secrets out of browser code, and shows a clear unconfigured state until production Bacs keys are supplied.
- [ ] Add Firebase Authentication at `/pilotapp/firstplay/dashboard/authentication`, allow exactly one environment-configured email address, reject every other signed-in Firebase email, and redirect an authorized account into `/pilotapp/firstplay/dashboard` only after authentication.
- [ ] Protect the dashboard route against unauthenticated and non-allowlisted access; do not render dashboard metrics for rejected accounts.
- [ ] Build dashboard metrics for total listings, active listings, daily active users, total app openings, daily app opens, and recent listing submissions, reading compatible Firebase/Firestore metrics documents.
- [ ] Keep Firebase project configuration, the single admin email, and Bacs credentials in environment configuration only; do not hardcode secrets.
