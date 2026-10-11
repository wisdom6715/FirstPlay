import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, ExternalLink, Mail } from 'lucide-react';

export default function LegalModal({ 
  isOpen, 
  initialDoc = 'privacy', 
  onClose 
}) {
  const [activeDoc, setActiveDoc] = useState(initialDoc || 'privacy');

  useEffect(() => {
    if (initialDoc) {
      setActiveDoc(initialDoc);
    }
  }, [initialDoc, isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#121217] border border-white/[0.14] shadow-2xl shadow-black/80 overflow-hidden text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/[0.08] bg-[#16161d]/80 backdrop-blur-xl shrink-0">
          {/* Document Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveDoc('privacy')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeDoc === 'privacy'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Shield size={13} />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDoc('terms')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeDoc === 'terms'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <FileText size={13} />
              <span>Terms of Service</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-300">
          {activeDoc === 'privacy' ? (
            /* ================= PRIVACY POLICY ================= */
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Privacy Policy for FirstPlay
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-2 font-mono">
                  <span>Effective Date: October 9, 2026</span>
                  <span>•</span>
                  <span>Last Updated: October 9, 2026</span>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  <span>Application: </span>
                  <span className="text-white font-medium">FirstPlay ("FirstPlay", "we", "our", or "us")</span>
                  <span className="mx-2">•</span>
                  <span>Official Website: </span>
                  <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-[#0a84ff] hover:underline font-medium">
                    https://firstplay.fun
                  </a>
                  <span className="mx-2">•</span>
                  <span>Contact: </span>
                  <a href="mailto:privacy@firstplay.fun" className="text-[#0a84ff] hover:underline font-medium">
                    privacy@firstplay.fun
                  </a>
                </div>
              </div>

              {/* Highlight Box */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs sm:text-sm space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Shield size={14} className="text-blue-400" />
                  <span>Key Privacy Highlight</span>
                </div>
                <p>
                  FirstPlay does <strong>NOT</strong> require user account creation, registration, or sign-in. We do <strong>NOT</strong> collect your name, email address, phone number, contacts, location, photos, or sensitive personal data within the application.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">1. Introduction & Overview</h3>
                <p>
                  Welcome to FirstPlay. Your privacy is fundamental to our design philosophy. FirstPlay is an instant web game, application, and digital product discovery platform.
                </p>
                <p>
                  This Privacy Policy explains how we handle technical and operational data when you access or use the FirstPlay platform on mobile, desktop, or web.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">2. Information We DO NOT Collect</h3>
                <p>
                  To maintain complete transparency and strictly comply with Apple App Store Review Guidelines (Guideline 5.1) and Google Play User Data Policies:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li><strong>No Personal Identifiers:</strong> We do not ask for or store your legal name, username, email address, password, or physical address.</li>
                  <li><strong>No Contact Information:</strong> We do not collect phone numbers or address book contacts inside the application.</li>
                  <li><strong>No Financial / Payment Data:</strong> We do not process credit cards, bank account details, or in-app payments. FirstPlay contains zero in-app purchases (IAP).</li>
                  <li><strong>No Device Tracking / Advertising Identifiers:</strong> We do not access or track your IDFA (Identifier for Advertisers) or GAID (Google Advertising ID) across third-party apps or websites.</li>
                  <li><strong>No Precise Geolocation:</strong> We do not access GPS coordinates or location sensors.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">3. Information Handled Strictly On Your Device (Local Storage)</h3>
                <p>
                  To provide you with a fast, personalized experience, certain preference data is stored locally on your device via secure local storage (localStorage / IndexedDB):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li><strong>Favourites & Recents:</strong> A list of game and application IDs you bookmark or view, allowing you to return to them instantly.</li>
                  <li><strong>Gameplay Time Counter:</strong> A local counter that aggregates the minutes you spend actively playing games in the app. This is used solely to verify eligibility for the daily reward spin (requiring 2 cumulative hours of daily activity).</li>
                  <li><strong>Cache & Performance Assets:</strong> Standard app cache (such as cached banner images) stored on your local device storage to minimize network bandwidth usage and prevent reloading delays.</li>
                </ul>
                <p className="text-zinc-400 italic">
                  None of this local data is uploaded to our servers alongside your identity or sold to data brokers.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">4. Cloud Infrastructure & Secure Data</h3>
                <p>
                  FirstPlay uses secure encrypted cloud infrastructure:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li><strong>Public Catalog Retrieval:</strong> The app securely synchronizes curated game listings, app showcases, and promotional banners.</li>
                  <li><strong>Anonymous Reward Voucher Generation:</strong> When an eligible user spins the daily reward wheel and wins a mobile data reward, the app generates a randomized, unlinked cryptographic voucher code (e.g. <code className="text-zinc-200 bg-white/10 px-1 py-0.5 rounded">FP-DATA-XXXXX</code>). The prize type and voucher code are securely registered with an unused status. No user identifiers, phone numbers, device serials, or personal identities are attached to this record in the app.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">5. External Web Redemption</h3>
                <p>
                  If you win a reward code from the Fortune Gifts wheel:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>The redemption code is displayed in the app with an external link to our official website (e.g., <a href="https://firstplay.fun/redeem" target="_blank" rel="noreferrer" className="text-[#0a84ff] hover:underline">https://firstplay.fun/redeem</a>).</li>
                  <li>You can copy the code and visit the website via your standard web browser (Safari, Chrome, etc.) to claim the mobile data package on your preferred telecom network.</li>
                  <li>Any interaction on the external website is governed by the website’s respective terms and secure web submission protocols.</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">6. Third-Party Web Content & In-App Browser (WebViews / Iframes)</h3>
                <p>
                  When you launch an instant game or view a partner app within FirstPlay:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>The content runs inside a secure, sandboxed container (iframe on web, WKWebView on iOS, Android System WebView on Android).</li>
                  <li>The web content is hosted on external partner game servers.</li>
                  <li>These third-party game servers may process standard technical HTTP request headers (IP address, user-agent, session cookies necessary to render the game canvas and maintain high frame rates).</li>
                  <li>We strongly recommend reviewing the privacy notices of any individual third-party web games you choose to play.</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">7. Diagnostic & Technical Log Data</h3>
                <p>
                  Like most applications, our infrastructure may receive transient network telemetry when requests are made to cloud servers (such as IP address and timestamp) solely for network security, DDoS prevention, and rate-limiting. This telemetry is automatically handled under industry-standard cloud security protocols.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">8. Children’s Privacy (COPPA & GDPR-K Compliance)</h3>
                <p>
                  FirstPlay is designed for general audiences and does not knowingly collect personally identifiable information from children under the age of 13 (or under 16 in applicable European jurisdictions). Because we do not collect personal data from any user, we do not profile or track minors. If a parent or guardian believes their child has submitted personal information, please contact us immediately at <a href="mailto:privacy@firstplay.fun" className="text-[#0a84ff] hover:underline">privacy@firstplay.fun</a> and we will take prompt remedial action.
                </p>
              </div>

              {/* Section 9 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">9. Data Retention & Deletion</h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li><strong>Local Data:</strong> You may delete your local preferences (favorites, playtime counter, cache) at any time by clearing the browser cache/data in your device settings or by resetting application storage.</li>
                  <li><strong>Voucher Data:</strong> Voucher codes stored in <code className="text-zinc-200 bg-white/10 px-1 py-0.5 rounded">spin_gift</code> are cryptographic reference records that contain no user identity or contact information.</li>
                </ul>
              </div>

              {/* Section 10 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">10. Your Rights (GDPR, CCPA/CPRA, NDPR)</h3>
                <p>
                  Depending on your jurisdiction, you may have legal rights regarding your personal data, including the right to know, access, correct, or delete personal data. Because FirstPlay does not collect or store your personal identity, we do not hold personal dossiers on individual users. For any privacy-related inquiries, reach out to <a href="mailto:privacy@firstplay.fun" className="text-[#0a84ff] hover:underline">privacy@firstplay.fun</a>.
                </p>
              </div>

              {/* Section 11 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">11. Changes to This Privacy Policy</h3>
                <p>
                  We may update this Privacy Policy periodically to reflect app enhancements or legal requirements. Any modifications will be posted to this document with an updated "Last Updated" date. Continued use of FirstPlay constitutes acceptance of the revised policy.
                </p>
              </div>

              {/* Section 12 */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <h3 className="text-base font-bold text-white">12. Contact Information</h3>
                <p>If you have questions, feedback, or concerns regarding this Privacy Policy:</p>
                <div className="space-y-1 text-zinc-300 pl-2">
                  <p><strong>Email:</strong> <a href="mailto:privacy@firstplay.fun" className="text-[#0a84ff] hover:underline">privacy@firstplay.fun</a> / <a href="mailto:support@firstplay.fun" className="text-[#0a84ff] hover:underline">support@firstplay.fun</a></p>
                  <p><strong>Website:</strong> <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-[#0a84ff] hover:underline">https://firstplay.fun</a></p>
                  <p><strong>Publisher:</strong> FirstPlay Technologies</p>
                </div>
              </div>
            </div>
          ) : (
            /* ================= TERMS OF SERVICE ================= */
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Terms of Service (Terms of Use)
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-2 font-mono">
                  <span>Effective Date: October 9, 2026</span>
                  <span>•</span>
                  <span>Last Updated: October 9, 2026</span>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  <span>Application: </span>
                  <span className="text-white font-medium">FirstPlay</span>
                  <span className="mx-2">•</span>
                  <span>Official Website: </span>
                  <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-[#0a84ff] hover:underline font-medium">
                    https://firstplay.fun
                  </a>
                  <span className="mx-2">•</span>
                  <span>Contact: </span>
                  <a href="mailto:legal@firstplay.fun" className="text-[#0a84ff] hover:underline font-medium">
                    legal@firstplay.fun
                  </a>
                </div>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">1. Acceptance of Terms</h3>
                <p>
                  By downloading, installing, accessing, or using the FirstPlay application (the "Application" or "App"), you agree to be bound by these Terms of Service (the "Terms"). If you do not agree to these Terms, do not use the Application.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">2. Description of Service</h3>
                <p>
                  FirstPlay is a curated discovery and instant launcher platform for HTML5 web games, mobile-optimized web applications, and digital products. FirstPlay allows users to discover, preview, and launch curated digital experiences seamlessly without heavy native installations.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">3. Eligibility & Age Requirements</h3>
                <p>
                  You must be at least 13 years of age (or the minimum legal age in your jurisdiction) to use FirstPlay. If you are under 18, you may only use the Application with the consent of a parent or legal guardian who agrees to be bound by these Terms.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">4. Fortune Gifts Spin & Loyalty Rewards Program</h3>
                <p>
                  FirstPlay provides an optional gamified loyalty rewards feature known as "Fortune Gifts" or "Daily Spin".
                </p>

                <div className="space-y-1.5 pl-3 border-l-2 border-white/15">
                  <h4 className="font-semibold text-white">4.1. Free Loyalty Reward — Not Gambling or Lottery</h4>
                  <p>The Fortune Gifts wheel is strictly a free engagement reward mechanism designed to reward active users of the platform.</p>
                  <p className="font-semibold text-zinc-100">NO PURCHASE, ENTRY FEE, OR PAYMENT OF ANY KIND IS EVER REQUIRED, ACCEPTED, OR PERMITTED.</p>
                  <p>You cannot buy spins, chances, tokens, or entries with real money or digital currency. FirstPlay does not offer real-money gambling, sports betting, casino games, or games of chance for monetary profit.</p>
                </div>

                <div className="space-y-1.5 pl-3 border-l-2 border-white/15">
                  <h4 className="font-semibold text-white">4.2. Apple Inc. Non-Sponsorship Disclaimer</h4>
                  <p>In accordance with Apple App Store Review Guideline 5.3:</p>
                  <p className="italic text-zinc-300">
                    Apple Inc. is not a sponsor of, nor is it involved in any manner or capacity with, any promotions, reward spins, sweepstakes, giveaways, or mobile data distributions conducted within or through FirstPlay. All rewards and promotions are sponsored exclusively and independently by FirstPlay Technologies.
                  </p>
                </div>

                <div className="space-y-1.5 pl-3 border-l-2 border-white/15">
                  <h4 className="font-semibold text-white">4.3. Participation Criteria & Qualification</h4>
                  <p>To unlock one (1) free spin, an eligible user must accumulate at least two (2) hours (120 minutes) of cumulative, active gameplay inside the Application within a 24-hour cycle. The playtime counter resets every 24 hours.</p>
                  <p>Automated tools, emulators, auto-clickers, bot scripts, or manipulated clock settings intended to falsely inflate playtime are strictly prohibited and will void all rewards.</p>
                </div>

                <div className="space-y-1.5 pl-3 border-l-2 border-white/15">
                  <h4 className="font-semibold text-white">4.4. Redemption Process & Terms</h4>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                    <li>Winning a reward generates a unique, single-use cryptographic voucher code.</li>
                    <li>Vouchers have no cash value and cannot be exchanged, sold, or transferred for fiat currency.</li>
                    <li>Vouchers must be redeemed through our official website portal (e.g., <a href="https://firstplay.fun/redeem" target="_blank" rel="noreferrer" className="text-[#0a84ff] hover:underline">https://firstplay.fun/redeem</a>).</li>
                    <li>Each voucher code can only be used once. Once marked as used in our database, it cannot be re-used.</li>
                    <li>Unredeemed voucher codes expire seven (7) days after issuance. FirstPlay reserves the right to verify voucher legitimacy and telecom network compatibility before provisioning.</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">5. Intellectual Property & Third-Party Content</h3>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-white">5.1. FirstPlay Property</h4>
                  <p>
                    The FirstPlay name, logo, custom graphics, interface design, code, and trade dress are the exclusive property of FirstPlay Technologies and are protected under copyright, trademark, and intellectual property laws.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-white">5.2. Third-Party Games and Apps</h4>
                  <p>
                    All games, third-party applications, logos, and trademarks displayed within FirstPlay remain the intellectual property of their respective creators, publishers, or developers.
                  </p>
                  <p>
                    FirstPlay operates as an interactive showcase, directory, and webview launcher for partner and openly licensed web content.
                  </p>
                  <p>
                    If you are a copyright owner and believe any content listed on FirstPlay infringes your rights, please submit a notice to <a href="mailto:copyright@firstplay.fun" className="text-[#0a84ff] hover:underline">copyright@firstplay.fun</a> with proof of ownership, and we will expeditiously remove or disable access to the content.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">6. Prohibited Activities</h3>
                <p>You agree that you will not:</p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                  <li>Use automated scripts, bots, spiders, or scrapers to extract data or simulate user activity.</li>
                  <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Application.</li>
                  <li>Interfere with, disrupt, or place an unreasonable load on the servers or networks connected to FirstPlay.</li>
                  <li>Attempt to exploit, manipulate, or circumvent the Fortune Gifts eligibility system or voucher validation mechanisms.</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">7. Disclaimer of Warranties</h3>
                <p className="uppercase text-[11px] leading-relaxed text-zinc-400 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                  FIRSTPLAY IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED OR ERROR-FREE SERVICE. WE DO NOT WARRANT THAT ANY THIRD-PARTY WEBSITES OR GAMES WILL BE AVAILABLE AT ALL TIMES OR COMPATIBLE WITH EVERY HARDWARE CONFIGURATION.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">8. Limitation of Liability</h3>
                <p className="uppercase text-[11px] leading-relaxed text-zinc-400 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FIRSTPLAY TECHNOLOGIES, ITS DIRECTORS, EMPLOYEES, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, REVENUE, OR OPPORTUNITY, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO USE) THE APPLICATION.
                </p>
              </div>

              {/* Section 9 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">9. Modifications to the Terms</h3>
                <p>
                  We reserve the right to amend or update these Terms at any time. When changes occur, we will update the "Last Updated" date at the top of this document. Continued use of FirstPlay after such updates signifies your agreement to the modified Terms.
                </p>
              </div>

              {/* Section 10 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">10. Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your access to FirstPlay without prior notice if you violate these Terms or engage in conduct detrimental to the platform or other users.
                </p>
              </div>

              {/* Section 11 */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">11. Governing Law & Jurisdiction</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law principles. Any legal disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Lagos, Nigeria.
                </p>
              </div>

              {/* Section 12 */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <h3 className="text-base font-bold text-white">12. Contact Information</h3>
                <p>For any inquiries or legal notices regarding these Terms:</p>
                <div className="space-y-1 text-zinc-300 pl-2">
                  <p><strong>Email:</strong> <a href="mailto:legal@firstplay.fun" className="text-[#0a84ff] hover:underline">legal@firstplay.fun</a> / <a href="mailto:support@firstplay.fun" className="text-[#0a84ff] hover:underline">support@firstplay.fun</a></p>
                  <p><strong>Website:</strong> <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-[#0a84ff] hover:underline">https://firstplay.fun</a></p>
                  <p><strong>Company:</strong> FirstPlay Technologies</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 sm:px-7 py-3 border-t border-white/[0.08] bg-[#16161d]/90 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Official FirstPlay Legal Repository</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
