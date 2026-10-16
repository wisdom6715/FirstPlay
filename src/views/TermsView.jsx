import React, { useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  ExternalLink, 
  Mail, 
  Shield, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  Trophy, 
  Globe, 
  ChevronRight,
  Gift
} from 'lucide-react';
import Footer from '../components/Footer';
import { setTabSEO } from '../services/seoService';

export default function TermsView({ onNavigateTab, onNavigateCategory, onNavigateSection }) {
  useEffect(() => {
    setTabSEO('terms');
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
              onClick={() => onNavigateTab?.('privacy')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0071e3] dark:text-[#0a84ff] hover:underline cursor-pointer px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
            >
              <Shield size={13} />
              <span>Privacy Policy</span>
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
            <Scale size={13} />
            <span>FirstPlay Terms of Use</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            Terms of Service
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
            <span>Effective Date: October 9, 2026</span>
            <span>•</span>
            <span>Last Updated: October 9, 2026</span>
            <span>•</span>
            <span className="text-[#0071e3] dark:text-[#0a84ff] font-sans font-bold">https://firstplay.fun/terms-of-service</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#0071e3] dark:text-blue-400" />
              <span>Summary of Terms</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              By accessing or using FirstPlay via the web, desktop, or mobile applications, you agree to be bound by these Terms. FirstPlay is an instant web game, application, and digital product showcase. All rewards, spins, and giveaways are strictly free loyalty engagement mechanisms — no purchase is ever required or permitted.
            </p>
          </div>
        </header>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            1. Acceptance of Terms
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            By downloading, installing, accessing, browsing, or using the FirstPlay application, progressive web app, or website at{' '}
            <a href="https://firstplay.fun" target="_blank" rel="noreferrer" className="text-[#0071e3] dark:text-[#0a84ff] font-semibold hover:underline">
              https://firstplay.fun
            </a>{' '}
            (collectively, the "Application" or "Platform"), you agree to be bound by these Terms of Service (the "Terms"). If you do not agree to these Terms in full, do not access or use the Application.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            2. Description of Service
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            FirstPlay is a curated discovery and instant launcher platform for HTML5 web games, mobile-optimized web applications, and digital creations. FirstPlay allows users to discover, preview, and launch curated digital experiences seamlessly with zero installation friction.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            3. Eligibility & Age Requirements
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            You must be at least 13 years of age (or the minimum legal age required in your country of residence) to use FirstPlay. If you are under 18, you may only use the Application with the consent of a parent or legal guardian who agrees to be bound by these Terms.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            4. Rewards Wheel & Loyalty Rewards Program
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            FirstPlay provides an optional gamified loyalty rewards feature known as "Fortune Gifts", "Rewards Wheel", or "Daily Spin".
          </p>

          <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                4.1. Free Loyalty Reward — Strictly Not Gambling or Lottery
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                The Rewards Wheel is strictly a free engagement reward mechanism designed to reward active players of the platform.
              </p>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                NO PURCHASE, ENTRY FEE, OR PAYMENT OF ANY KIND IS EVER REQUIRED, ACCEPTED, OR PERMITTED.
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                You cannot buy spins, chances, tokens, or entries with real money or digital currency. FirstPlay does not offer real-money gambling, sports betting, casino games, or games of chance for monetary profit.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                4.2. Apple Inc. Non-Sponsorship Disclaimer
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                In strict accordance with Apple App Store Review Guideline 5.3:
              </p>
              <p className="text-xs sm:text-sm italic text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-white/[0.03] p-3 rounded-xl border border-zinc-200 dark:border-white/10">
                Apple Inc. is not a sponsor of, nor is it involved in any manner or capacity with, any promotions, reward spins, sweepstakes, giveaways, or mobile data distributions conducted within or through FirstPlay. All rewards and promotions are sponsored exclusively and independently by FirstPlay Technologies.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                4.3. Participation Criteria & 2-Hour Playtime Rule
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                To unlock one (1) free spin on the Rewards Wheel, an eligible user must accumulate at least two (2) hours (120 minutes) of cumulative, active gameplay inside the Application within a 24-hour cycle.
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Automated tools, headless emulators, auto-clickers, bot scripts, or manipulated clock settings intended to falsely inflate playtime are strictly prohibited and will void all rewards and codes.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                4.4. Single-Use Redemption Process & 24-Hour Expiration
              </h3>
              <ul className="list-disc pl-4 space-y-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                <li>Winning a reward generates a unique, single-use cryptographic voucher code stored securely in the FirstPlay database.</li>
                <li>Vouchers have no cash value and cannot be sold, auctioned, or traded for fiat currency.</li>
                <li>Vouchers must be redeemed through our single-field validation portal at{' '}
                  <a href="https://firstplay.fun/redeem" target="_blank" rel="noreferrer" className="text-[#0071e3] dark:text-[#0a84ff] font-semibold hover:underline">
                    https://firstplay.fun/redeem
                  </a>.
                </li>
                <li>Each redemption code expires exactly twenty-four (24) hours after generation. Codes not redeemed within 24 hours become void automatically.</li>
                <li>Each voucher code can only be used once. Once consumed via atomic database transaction, the code cannot be reused.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            5. Intellectual Property & Third-Party Content
          </h2>
          
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              5.1. FirstPlay Property
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              The FirstPlay brand, name, logo, custom graphics, interface design, code, design system, and trade dress are the exclusive property of FirstPlay Technologies and are protected under copyright, trademark, and intellectual property laws.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              5.2. Third-Party Games and Apps
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              All games, third-party applications, logos, and trademarks displayed within FirstPlay remain the intellectual property of their respective creators, publishers, or developers. FirstPlay operates as an interactive showcase, directory, and webview launcher for partner and openly licensed web content.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              If you are a copyright owner and believe any content listed on FirstPlay infringes your rights, please submit a notice to{' '}
              <a href="mailto:copyright@firstplay.fun" className="text-[#0071e3] dark:text-[#0a84ff] font-semibold hover:underline">
                copyright@firstplay.fun
              </a>{' '}
              with proof of ownership, and we will expeditiously remove or disable access to the content.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            6. Prohibited Activities
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            You agree that you will not:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <li>Use automated scripts, bots, spiders, or scrapers to extract data or simulate user activity.</li>
            <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Application.</li>
            <li>Interfere with, disrupt, or place an unreasonable load on the servers or networks connected to FirstPlay.</li>
            <li>Attempt to exploit, manipulate, or circumvent the Rewards Wheel eligibility system or voucher validation mechanisms.</li>
            <li>Submit fraudulent, deceptive, or abusive game submissions through the promotion portal.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            7. Disclaimer of Warranties
          </h2>
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed uppercase font-mono">
            FIRSTPLAY IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED OR ERROR-FREE SERVICE. WE DO NOT WARRANT THAT ANY THIRD-PARTY WEBSITES OR GAMES WILL BE AVAILABLE AT ALL TIMES OR COMPATIBLE WITH EVERY HARDWARE CONFIGURATION.
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            8. Limitation of Liability
          </h2>
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed uppercase font-mono">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FIRSTPLAY TECHNOLOGIES, ITS DIRECTORS, EMPLOYEES, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, REVENUE, OR OPPORTUNITY, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO USE) THE APPLICATION.
          </div>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            9. Modifications to the Terms
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            We reserve the right to amend or update these Terms at any time. When changes occur, we will update the "Last Updated" date at the top of this document. Continued use of FirstPlay after such updates signifies your agreement to the modified Terms.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            10. Termination
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            We reserve the right to suspend or terminate your access to FirstPlay without prior notice if you violate these Terms or engage in conduct detrimental to the platform or other users.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            11. Governing Law & Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law principles. Any legal disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Lagos, Nigeria.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            12. Contact Information & Legal Notices
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            For any legal inquiries, copyright notices, or official communications regarding these Terms:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Legal Inquiries Email</span>
              <a href="mailto:legal@firstplay.fun" className="text-xs sm:text-sm font-bold text-[#0071e3] dark:text-[#0a84ff] hover:underline flex items-center gap-1.5">
                <Mail size={14} />
                <span>legal@firstplay.fun</span>
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
