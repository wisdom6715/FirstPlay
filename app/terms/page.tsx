import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText } from 'lucide-react';
import { Footer } from '@/components/discover/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | FirstPlay',
  description: 'FirstPlay Terms of Service and Terms of Use for web and mobile applications.'
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Simple Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-8 overflow-hidden rounded-xl shadow-sm transition group-hover:scale-105">
              <Image
                src="/icon.png"
                alt="FirstPlay Logo"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
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
            <FileText size={14} />
            <span>Terms of Use</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Terms of Service
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-500 font-medium">
            <span><strong>Effective Date:</strong> October 9, 2026</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> October 9, 2026</span>
            <span>•</span>
            <span><strong>Website:</strong> <a href="https://firstplay.fun" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://firstplay.fun</a></span>
            <span>•</span>
            <span><strong>Contact:</strong> <a href="mailto:legal@firstplay.fun" className="text-blue-600 underline">legal@firstplay.fun</a></span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By downloading, installing, accessing, or using the FirstPlay mobile application (the &quot;Application&quot; or &quot;App&quot;) or our web services, you agree to be bound by these Terms of Service (the &quot;Terms&quot;). If you do not agree to these Terms, do not use the Application.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              2. Description of Service
            </h2>
            <p>
              FirstPlay is a curated discovery and instant launcher platform for HTML5 web games, mobile-optimized web applications, and digital products. FirstPlay allows users to discover, preview, and launch curated digital experiences seamlessly without heavy native installations.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              3. Eligibility &amp; Age Requirements
            </h2>
            <p>
              You must be at least 13 years of age (or the minimum legal age in your jurisdiction) to use FirstPlay. If you are under 18, you may only use the Application with the consent of a parent or legal guardian who agrees to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              4. Fortune Gifts Spin &amp; Loyalty Rewards Program
            </h2>
            <p>
              FirstPlay provides an optional gamified loyalty rewards feature known as &quot;Fortune Gifts&quot; or &quot;Daily Spin&quot;.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900">4.1. Free Loyalty Reward — Not Gambling or Lottery</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>The Fortune Gifts wheel is strictly a free engagement reward mechanism designed to reward active users of the platform.</li>
                  <li><strong>NO PURCHASE, ENTRY FEE, OR PAYMENT OF ANY KIND IS EVER REQUIRED, ACCEPTED, OR PERMITTED.</strong></li>
                  <li>You cannot buy spins, chances, tokens, or entries with real money or digital currency.</li>
                  <li>FirstPlay does not offer real-money gambling, sports betting, casino games, or games of chance for monetary profit.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4">
                <h3 className="font-bold text-amber-900">4.2. Apple Inc. Non-Sponsorship Disclaimer</h3>
                <p className="mt-1 text-sm text-amber-800">
                  In accordance with Apple App Store Review Guideline 5.3:
                </p>
                <p className="mt-2 text-sm text-amber-900 font-semibold">
                  Apple Inc. is not a sponsor of, nor is it involved in any manner or capacity with, any promotions, reward spins, sweepstakes, giveaways, or mobile data distributions conducted within or through FirstPlay.
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  All rewards and promotions are sponsored exclusively and independently by FirstPlay Technologies.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">4.3. Participation Criteria &amp; Qualification</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>To unlock one (1) free spin, an eligible user must accumulate at least two (2) hours (120 minutes) of cumulative, active gameplay inside the Application within a 24-hour cycle.</li>
                  <li>The playtime counter resets every 24 hours.</li>
                  <li>Automated tools, emulators, auto-clickers, bot scripts, or manipulated clock settings intended to falsely inflate playtime are strictly prohibited and will void all rewards.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">4.4. Redemption Process &amp; Terms</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Winning a reward generates a unique, single-use cryptographic voucher code.</li>
                  <li>Vouchers have no cash value and cannot be exchanged, sold, or transferred for fiat currency.</li>
                  <li>Vouchers must be redeemed through our official website portal (<a href="https://firstplay.fun/redeem" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://firstplay.fun/redeem</a>).</li>
                  <li>Each voucher code can only be used once. Once marked as used in our database, it cannot be re-used.</li>
                  <li>Unredeemed voucher codes expire seven (7) days after issuance. FirstPlay reserves the right to verify voucher legitimacy and telecom network compatibility before provisioning.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              5. Intellectual Property &amp; Third-Party Content
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900">5.1. FirstPlay Property</h3>
                <p className="mt-1">
                  The FirstPlay name, logo, custom graphics, interface design, code, and trade dress are the exclusive property of FirstPlay Technologies and are protected under copyright, trademark, and intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">5.2. Third-Party Games and Apps</h3>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>All games, third-party applications, logos, and trademarks displayed within FirstPlay remain the intellectual property of their respective creators, publishers, or developers.</li>
                  <li>FirstPlay operates as an interactive showcase, directory, and webview launcher for partner and openly licensed web content.</li>
                  <li>If you are a copyright owner and believe any content listed on FirstPlay infringes your rights, please submit a notice to <a href="mailto:copyright@firstplay.fun" className="text-blue-600 underline">copyright@firstplay.fun</a> with proof of ownership, and we will expeditiously remove or disable access to the content.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              6. Prohibited Activities
            </h2>
            <p>You agree that you will not:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use automated scripts, bots, spiders, or scrapers to extract data or simulate user activity.</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Application.</li>
              <li>Interfere with, disrupt, or place an unreasonable load on the servers or networks connected to FirstPlay.</li>
              <li>Attempt to exploit, manipulate, or circumvent the Fortune Gifts eligibility system or voucher validation mechanisms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              7. Disclaimer of Warranties
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 uppercase font-semibold leading-relaxed">
              FIRSTPLAY IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED OR ERROR-FREE SERVICE. WE DO NOT WARRANT THAT ANY THIRD-PARTY WEBSITES OR GAMES WILL BE AVAILABLE AT ALL TIMES OR COMPATIBLE WITH EVERY HARDWARE CONFIGURATION.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              8. Limitation of Liability
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 uppercase font-semibold leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FIRSTPLAY TECHNOLOGIES, ITS DIRECTORS, EMPLOYEES, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, REVENUE, OR OPPORTUNITY, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO USE) THE APPLICATION.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              9. Modifications to the Terms
            </h2>
            <p>
              We reserve the right to amend or update these Terms at any time. When changes occur, we will update the &quot;Last Updated&quot; date at the top of this document. Continued use of FirstPlay after such updates signifies your agreement to the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              10. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to FirstPlay without prior notice if you violate these Terms or engage in conduct detrimental to the platform or other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
              11. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law principles. Any legal disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Lagos, Nigeria.
            </p>
          </section>

          <section className="rounded-2xl bg-slate-50 border border-slate-200/80 p-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              12. Contact Information
            </h2>
            <p>For any inquiries or legal notices regarding these Terms:</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p><strong>Email:</strong> <a href="mailto:legal@firstplay.fun" className="text-blue-600 underline">legal@firstplay.fun</a> / <a href="mailto:support@firstplay.fun" className="text-blue-600 underline">support@firstplay.fun</a></p>
              <p><strong>Website:</strong> <a href="https://firstplay.fun" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://firstplay.fun</a></p>
              <p><strong>Company:</strong> FirstPlay Technologies</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
