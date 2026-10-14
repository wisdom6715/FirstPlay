import React, { useEffect } from 'react';
import { 
  Shield, 
  ArrowLeft, 
  ExternalLink, 
  Mail, 
  FileText, 
  Lock, 
  Smartphone, 
  Database, 
  Globe, 
  Users, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Footer from '../components/Footer';
import { setTabSEO } from '../services/seoService';

export default function PrivacyView({ onNavigateTab, onNavigateCategory, onNavigateSection }) {
  useEffect(() => {
    setTabSEO('privacy');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-transparent select-text">
      {/* Top Banner Navigation */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-zinc-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => onNavigateTab?.('discover')}
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10"
          >
            <ArrowLeft size={14} />
            <span>Back to FirstPlay</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">Also see:</span>
            <button
              type="button"
              onClick={() => onNavigateTab?.('terms')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0071e3] dark:text-[#0a84ff] hover:underline cursor-pointer px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
            >
              <FileText size={13} />
              <span>Terms of Service</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Container */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Document Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#0071e3] dark:text-[#0a84ff] border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Shield size={13} />
            <span>FirstPlay Legal Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
            <span>Effective Date: October 9, 2026</span>
            <span>•</span>
            <span>Last Updated: October 9, 2026</span>
            <span>•</span>
            <span className="text-[#0071e3] dark:text-[#0a84ff] font-sans font-bold">https://firstplay.fun/privacy</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 space-y-2">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <Lock size={16} className="text-[#0071e3] dark:text-blue-400" />
              <span>Core Privacy Commitment</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              FirstPlay does <strong>NOT</strong> require account creation, registration, passwords, or personal sign-in. We do <strong>NOT</strong> collect your legal name, email address, phone number, device contacts, GPS coordinates, camera roll, or private files within the application.
            </p>
          </div>
        </header>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            1. Introduction & Overview
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Welcome to FirstPlay ("FirstPlay", "we", "our", or "us"), available on the web at{' '}
            <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-[#0071e3] dark:text-[#0a84ff] font-semibold hover:underline">
              https://firstplay.fun
            </a>
            . FirstPlay is an instant web game, application, and digital product discovery platform.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            This Privacy Policy explains how we handle technical and operational data when you access or use the FirstPlay platform on mobile, desktop, or web. Your privacy is fundamental to our architecture and user experience.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            2. Information We DO NOT Collect
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            To maintain complete transparency and strictly comply with international privacy standards, Apple App Store Review Guidelines (Guideline 5.1), and Google Play User Data Policies:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <li><strong>No Personal Identifiers:</strong> We do not ask for or store your legal name, username, email address, password, or physical address.</li>
            <li><strong>No Contact Information:</strong> We do not collect phone numbers or address book contacts inside the browsing application.</li>
            <li><strong>No Financial / Payment Data:</strong> We do not process credit cards, bank account details, or in-app payments for catalog access. FirstPlay contains zero mandatory in-app purchases (IAP).</li>
            <li><strong>No Cross-App Advertising Tracking:</strong> We do not access or track your IDFA (Identifier for Advertisers) or GAID (Google Advertising ID) across third-party apps or websites.</li>
            <li><strong>No Precise Geolocation:</strong> We do not query GPS coordinates or device location sensors.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            3. Information Handled Strictly On Your Device (Local Storage)
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            To provide a fast, personalized experience, certain preference data is stored locally on your device via secure client storage (localStorage / IndexedDB):
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <li><strong>Favourites & Recents:</strong> A list of game and application IDs you bookmark or view, allowing you to return to them instantly.</li>
            <li><strong>Gameplay Time Counter:</strong> A local counter that aggregates the minutes you spend actively playing games in the app. This is used solely to verify eligibility for the daily reward spin (requiring 2 cumulative hours of daily activity).</li>
            <li><strong>Cache & Performance Assets:</strong> Standard app cache (such as cached banner images) stored on your local device storage to minimize network bandwidth usage and prevent reloading delays.</li>
          </ul>
          <p className="text-xs text-zinc-500 italic">
            None of this local data is uploaded to our servers alongside your identity or sold to third-party data brokers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            4. Cloud Infrastructure & Secure Data
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            FirstPlay uses encrypted cloud infrastructure powered by Firebase and Cloudflare:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <li><strong>Public Catalog Retrieval:</strong> The app securely synchronizes curated game listings, app showcases, and promotional banners.</li>
            <li><strong>Anonymous Reward Voucher Generation:</strong> When an eligible user spins the daily reward wheel and wins a mobile data or airtime reward, the server generates a randomized, unlinked cryptographic voucher code (e.g. <code>FP-DATA-XXXXX</code> or 8-character token). The prize type and voucher code are securely registered with an unused status. No personal identities, phone numbers, or device serials are attached to this spin record.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            5. External Web Redemption
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            When you win a reward code from the Rewards Wheel or tournament prize:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <li>The redemption code is displayed in the app with an external link to our official redemption portal at{' '}
              <a href="https://firstplay.fun/redeem" target="_blank" rel="noreferrer" className="text-[#0071e3] dark:text-[#0a84ff] font-semibold hover:underline">
                https://firstplay.fun/redeem
              </a>.
            </li>
            <li>You can copy the code and enter it into our single-field validation portal.</li>
            <li>For mobile data and airtime delivery, the recipient phone number and telecom network provided during fulfillment are used solely for the technical execution of the automated VTU delivery via authorized billing gateways (Flutterwave) and are never sold or used for marketing.</li>
            <li>Users may optionally submit a WhatsApp phone number to receive VIP tournament alerts and drop notices; this step is entirely optional and can be skipped.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            6. Third-Party Web Content & In-App Browser (WebViews / Iframes)
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            When you launch an instant game or view a partner app within FirstPlay:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <li>The content executes inside a secure, sandboxed container (iframe on web, WKWebView on iOS, Android System WebView on Android).</li>
            <li>The web content is hosted on external partner game servers.</li>
            <li>These third-party game servers may process standard technical HTTP request headers (IP address, user-agent, session cookies necessary to render the game canvas and maintain high frame rates).</li>
            <li>We strongly recommend reviewing the privacy notices of any individual third-party web games you choose to play.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            7. Diagnostic & Technical Log Data
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Like all modern web infrastructure, our servers receive transient network telemetry when requests are made (such as IP address, browser type, and timestamp) solely for network security, DDoS mitigation, and rate-limiting. This telemetry is automatically handled under industry-standard cloud security protocols and purged regularly.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            8. Children’s Privacy (COPPA & GDPR-K Compliance)
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            FirstPlay is designed for general audiences and does not knowingly collect personally identifiable information from children under the age of 13 (or under 16 in applicable European jurisdictions). Because we do not collect personal data from any user, we do not profile or track minors. If a parent or guardian believes their child has submitted personal information, please contact us immediately at{' '}
            <a href="mailto:privacy@firstplay.fun" className="text-[#0071e3] dark:text-[#0a84ff] font-semibold hover:underline">
              privacy@firstplay.fun
            </a>{' '}
            and we will take prompt remedial action.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            9. Data Retention & Deletion
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <li><strong>Local Data:</strong> You may delete your local preferences (favorites, playtime counter, cache) at any time by clearing the browser cache/data in your device settings or by resetting application storage in Settings.</li>
            <li><strong>Voucher Data:</strong> Voucher codes stored in the database are cryptographic reference records that contain no user identity or contact information.</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            10. Your Rights (NDPR, GDPR, CCPA/CPRA)
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Depending on your jurisdiction, you may have legal rights regarding your personal data, including the right to know, access, correct, or delete personal data under the Nigeria Data Protection Act (NDPA/NDPR), European GDPR, and California Consumer Privacy Act. Because FirstPlay does not collect or store your personal identity, we do not hold personal dossiers on individual users. For any privacy-related inquiries, reach out to{' '}
            <a href="mailto:privacy@firstplay.fun" className="text-[#0071e3] dark:text-[#0a84ff] font-semibold hover:underline">
              privacy@firstplay.fun
            </a>.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            11. Changes to This Privacy Policy
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            We may update this Privacy Policy periodically to reflect app enhancements or legal requirements. Any modifications will be posted to this document with an updated "Last Updated" date at the top of this page. Continued use of FirstPlay constitutes acceptance of the revised policy.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            12. Contact Information & Legal Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            If you have questions, feedback, or concerns regarding this Privacy Policy:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Privacy Email</span>
              <a href="mailto:privacy@firstplay.fun" className="text-xs sm:text-sm font-bold text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-1.5">
                <Mail size={14} />
                <span>privacy@firstplay.fun</span>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Official Portal</span>
              <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-bold text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-1.5">
                <Globe size={14} />
                <span>https://firstplay.fun</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Embedded Footer */}
      <Footer
        onOpenPrivacyPolicy={() => onNavigateTab?.('privacy')}
        onOpenTerms={() => onNavigateTab?.('terms')}
        onNavigateCategory={onNavigateCategory}
        onNavigateTab={onNavigateTab}
        onNavigateSection={onNavigateSection}
      />
    </div>
  );
}
