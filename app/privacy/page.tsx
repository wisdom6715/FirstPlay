import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Shield } from 'lucide-react';
import { Footer } from '@/components/discover/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | FirstPlay',
  description: 'FirstPlay Privacy Policy regarding data privacy, local device storage, and zero personal tracking.'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Simple Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#1422b8] text-white shadow-sm transition group-hover:scale-105">
              <Gamepad2 size={18} className="stroke-[2.2]" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              FirstPlay
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 pb-8 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 mb-4">
            <Shield size={14} />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Privacy Policy for FirstPlay
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-500 font-medium">
            <span><strong>Effective Date:</strong> October 9, 2026</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> October 9, 2026</span>
            <span>•</span>
            <span><strong>Website:</strong> <a href="https://firstplay.fun" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://firstplay.fun</a></span>
            <span>•</span>
            <span><strong>Contact:</strong> <a href="mailto:privacy@firstplay.fun" className="text-blue-600 underline">privacy@firstplay.fun</a></span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              1. Introduction &amp; Overview
            </h2>
            <p>
              Welcome to FirstPlay. Your privacy is fundamental to our design philosophy. FirstPlay is an instant web game, application, and digital product discovery platform.
            </p>
            <p className="mt-3">
              This Privacy Policy explains how we handle technical and operational data when you access or use the FirstPlay mobile application on iOS and Android devices, as well as our official web portal.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                Key Privacy Highlight
              </h3>
              <p className="text-sm text-slate-700">
                FirstPlay does <strong>NOT</strong> require user account creation, registration, or sign-in. We do <strong>NOT</strong> collect your name, email address, phone number, contacts, location, photos, or sensitive personal data within the mobile application.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              2. Information We DO NOT Collect
            </h2>
            <p>
              To maintain complete transparency and strictly comply with Apple App Store Review Guidelines (Guideline 5.1) and Google Play User Data Policies:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li><strong>No Personal Identifiers:</strong> We do not ask for or store your legal name, username, email address, password, or physical address.</li>
              <li><strong>No Contact Information:</strong> We do not collect phone numbers or address book contacts inside the mobile app.</li>
              <li><strong>No Financial / Payment Data:</strong> We do not process credit cards, bank account details, or in-app payments. FirstPlay contains zero in-app purchases (IAP).</li>
              <li><strong>No Device Tracking / Advertising Identifiers:</strong> We do not access or track your IDFA (Identifier for Advertisers) or GAID (Google Advertising ID) across third-party apps or websites.</li>
              <li><strong>No Precise Geolocation:</strong> We do not access GPS coordinates or location sensors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              3. Information Handled Strictly On Your Device (Local Storage)
            </h2>
            <p>
              To provide you with a fast, personalized experience, certain preference data is stored locally on your device via secure local storage (SharedPreferences / iOS NSUserDefaults):
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li><strong>Favourites &amp; Recents:</strong> A list of game and application IDs you bookmark or view, allowing you to return to them instantly.</li>
              <li><strong>Gameplay Time Counter:</strong> A local counter that aggregates the minutes you spend actively playing games in the app. This is used solely to verify eligibility for the daily reward spin (requiring 2 cumulative hours of daily activity).</li>
              <li><strong>Cache &amp; Performance Assets:</strong> Standard app cache (such as cached banner images) stored on your local device storage to minimize network bandwidth usage and prevent reloading delays.</li>
            </ul>
            <p className="mt-3 font-semibold text-slate-800">
              None of this local data is uploaded to our servers alongside your identity or sold to data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              4. Cloud Data &amp; Server Interactions (Google Firebase)
            </h2>
            <p>
              FirstPlay uses Google Cloud Firebase (Firestore) as its cloud infrastructure backend:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li><strong>Public Catalog Retrieval (Read-Only):</strong> The app reads curated game listings, app showcases, and promotional banners stored in public Firestore collections (<code>apps</code>, <code>promotion_banner</code>).</li>
              <li><strong>Anonymous Reward Voucher Generation:</strong> When an eligible user spins the daily reward wheel and wins a non-zero mobile data reward, the app generates a randomized, unlinked cryptographic voucher code (e.g. <code>FP-DATA-XXXXX</code>).</li>
              <li>The prize type (e.g., 500 MB, 1 GB) and the voucher code are stored in the Firestore <code>spin_gift</code> collection with a status of unused.</li>
              <li>No user identifiers, phone numbers, device serials, or identities are attached to this record in the mobile app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              5. External Web Redemption
            </h2>
            <p>If you win a reward code from the Fortune Gifts wheel:</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>The redemption code is displayed in the app with an external link to our official website (<a href="https://firstplay.fun/redeem" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://firstplay.fun/redeem</a>).</li>
              <li>You can copy the code and visit the website via your standard web browser (Safari, Chrome, etc.) to claim the mobile data package on your preferred telecom network.</li>
              <li>Any interaction on the external website is governed by the website&apos;s respective terms and secure web submission protocols.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              6. Third-Party Web Content &amp; In-App Browser (WebViews)
            </h2>
            <p>When you launch an instant game or view a partner app within FirstPlay:</p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>The content runs inside a secure, sandboxed mobile WebView (WKWebView on iOS, Android System WebView on Android).</li>
              <li>The web content is hosted on external partner game servers.</li>
              <li>These third-party game servers may process standard technical HTTP request headers (IP address, user-agent, session cookies necessary to render the game canvas and maintain high frame rates).</li>
              <li>We strongly recommend reviewing the privacy notices of any individual third-party web games you choose to play.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              7. Diagnostic &amp; Technical Log Data
            </h2>
            <p>
              Like most mobile applications, our infrastructure may receive transient network telemetry when requests are made to Firebase servers (such as IP address and timestamp) solely for network security, DDoS prevention, and rate-limiting. This telemetry is automatically handled by Google Cloud Firebase under Google&apos;s Privacy and Security standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              8. Children&apos;s Privacy (COPPA &amp; GDPR-K Compliance)
            </h2>
            <p>
              FirstPlay is designed for general audiences and does not knowingly collect personally identifiable information from children under the age of 13 (or under 16 in applicable European jurisdictions). Because we do not collect personal data from any user, we do not profile or track minors. If a parent or guardian believes their child has submitted personal information, please contact us immediately at <a href="mailto:privacy@firstplay.fun" className="text-blue-600 underline">privacy@firstplay.fun</a> and we will take prompt remedial action.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              9. Data Retention &amp; Deletion
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li><strong>Local Data:</strong> You may delete your local preferences (favorites, playtime counter, cache) at any time by clearing the app cache/data in your device settings or by uninstalling the application.</li>
              <li><strong>Voucher Data:</strong> Voucher codes stored in <code>spin_gift</code> are cryptographic reference records that contain no user identity or contact information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              10. Your Rights (GDPR, CCPA/CPRA, NDPR)
            </h2>
            <p>
              Depending on your jurisdiction, you may have legal rights regarding your personal data, including the right to know, access, correct, or delete personal data. Because FirstPlay does not collect or store your personal identity, we do not hold personal dossiers on individual users. For any privacy-related inquiries, reach out to <a href="mailto:privacy@firstplay.fun" className="text-blue-600 underline">privacy@firstplay.fun</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically to reflect app enhancements or legal requirements. Any modifications will be posted to this document with an updated &quot;Last Updated&quot; date. Continued use of FirstPlay constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="rounded-2xl bg-slate-50 border border-slate-200/80 p-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              12. Contact Information
            </h2>
            <p>If you have questions, feedback, or concerns regarding this Privacy Policy:</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p><strong>Email:</strong> <a href="mailto:privacy@firstplay.fun" className="text-blue-600 underline">privacy@firstplay.fun</a> / <a href="mailto:support@firstplay.fun" className="text-blue-600 underline">support@firstplay.fun</a></p>
              <p><strong>Website:</strong> <a href="https://firstplay.fun" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://firstplay.fun</a></p>
              <p><strong>Publisher:</strong> FirstPlay Technologies</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
