import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  ShieldCheck,
  ArrowLeft, 
  ExternalLink, 
  Mail, 
  FileText, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Scale,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';
import Footer from '../components/Footer';
import { setTabSEO } from '../services/seoService';

export default function ComplianceView({ 
  onNavigateTab, 
  onNavigateCategory, 
  onNavigateSection,
  onOpenPrivacyPolicy,
  onOpenTerms
}) {
  const [copiedEmail, setCopiedEmail] = useState(null);

  useEffect(() => {
    setTabSEO('compliance');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleCopyEmail = (email) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-transparent select-text">
      
      {/* Top Banner Navigation Bar */}
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

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">Related Policies:</span>
            
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('privacy') : onOpenPrivacyPolicy?.()}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 transition"
            >
              <Shield size={12} />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('terms') : onOpenTerms?.()}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 transition"
            >
              <FileText size={12} />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Document Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-500/20 text-[#0071e3] dark:text-[#0a84ff] border border-blue-200 dark:border-blue-500/30 flex items-center gap-1.5">
              <ShieldCheck size={13} />
              <span>Apple App Store Guidelines 4.7 &amp; 5.2 Compliant</span>
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Last Updated: October 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            FirstPlay Game Licensing &amp; Content Policy
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl font-normal">
            Authoritative framework governing instant HTML5 game distribution, intellectual property rights, developer warranties, and our explicit 24-hour express removal guarantee.
          </p>

          {/* Quick Desk Contact Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <a
              href="/promote"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  onNavigateTab?.('promote');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 hover:text-[#0071e3] dark:hover:text-[#0a84ff] border border-zinc-200 dark:border-white/10 font-bold transition cursor-pointer"
            >
              <Layers size={13} className="text-[#0071e3]" />
              <span>Portal: firstplay.fun/promote</span>
              <ExternalLink size={11} className="text-zinc-400" />
            </a>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 font-mono text-[11px]">
              <Mail size={12} className="text-emerald-500" />
              <span>compliance@firstplay.fun</span>
              <button
                type="button"
                onClick={() => handleCopyEmail('compliance@firstplay.fun')}
                className="ml-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition cursor-pointer"
                title="Copy email address"
              >
                {copiedEmail === 'compliance@firstplay.fun' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 font-mono text-[11px]">
              <Mail size={12} className="text-emerald-500" />
              <span>privacy@firstplay.fun</span>
              <button
                type="button"
                onClick={() => handleCopyEmail('privacy@firstplay.fun')}
                className="ml-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition cursor-pointer"
                title="Copy email address"
              >
                {copiedEmail === 'privacy@firstplay.fun' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </header>

        {/* Section 1: Overview & Purpose */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center">
              <Scale size={16} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">1. Overview &amp; Purpose</h2>
          </div>

          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-3 font-normal pl-0 sm:pl-10">
            <p>
              FirstPlay is an instant, casual gaming discovery and tournament hub. All games available within the FirstPlay mobile application and web ecosystem are lightweight, web-based (HTML5/WebGL) experiences delivered strictly in compliance with <strong>Apple App Store Review Guideline 4.7 (Mini-Apps, Mini-Games, Streaming Games, Chatbots, and Plug-ins)</strong> and <strong>Guideline 5.2 (Intellectual Property)</strong>.
            </p>
            <p>
              FirstPlay <strong>does not host unauthorized ROMs, emulators, or scraped content</strong>. Every game surfaced in FirstPlay is sourced through direct developer submission, verified developer licensing agreements, or open-web public distribution authorizations.
            </p>
          </div>
        </section>

        {/* Section 2: How Games Are Sourced & Licensed */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers size={16} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">2. How Games Are Sourced &amp; Licensed</h2>
          </div>

          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-4 font-normal pl-0 sm:pl-10">
            <p>
              All games presented on FirstPlay are onboarded through our dedicated developer &amp; publisher portal:
            </p>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0071e3] dark:text-[#0a84ff]">
                  Official Creator &amp; Publisher Onboarding
                </span>
                <p className="font-bold text-sm text-zinc-900 dark:text-white">
                  firstplay.fun/promote
                </p>
              </div>
              <a
                href="/promote"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    onNavigateTab?.('promote');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs w-fit cursor-pointer"
              >
                <span>Visit Developer Portal</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <ol className="space-y-3 list-decimal list-inside pl-1 text-zinc-700 dark:text-zinc-300">
              <li className="leading-relaxed">
                <strong>Direct Developer Submissions:</strong> Game developers, studios, and authorized rights-holders register their profiles, submit their web-based games, and provide proof of ownership or distribution authority via <a href="/promote" onClick={(e) => { if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); onNavigateTab?.('promote'); } }} className="text-[#0071e3] dark:text-[#0a84ff] underline cursor-pointer">firstplay.fun/promote</a>.
              </li>
              <li className="leading-relaxed">
                <strong>Developer Warranty &amp; Representation:</strong> By submitting content through <code className="font-mono text-xs bg-zinc-100 dark:bg-white/10 px-1 py-0.5 rounded">firstplay.fun/promote</code>, each developer legally warrants and represents that:
                <ul className="list-disc list-inside mt-2 space-y-1.5 pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                  <li>They own all intellectual property, trademarks, assets, audio, and code utilized in the game, or hold valid worldwide distribution licenses.</li>
                  <li>The game contains no malicious code, external executable downloads, obfuscated payloads, or unauthorized tracking mechanisms.</li>
                  <li>The game complies with all local consumer protection and child safety laws.</li>
                </ul>
              </li>
              <li className="leading-relaxed">
                <strong>Mandatory Human Editorial Review:</strong> Prior to any game appearing in FirstPlay or being scheduled for a tournament, the FirstPlay trust &amp; safety team tests and reviews each submission for performance, content appropriateness (matching our 4+ / 12+ age rating), and compliance with Apple App Store Review Guidelines.
              </li>
            </ol>
          </div>
        </section>

        {/* Section 3: Apple App Store Guideline 4.7 Compliance Statement */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">3. Apple App Store Guideline 4.7 Compliance Statement</h2>
          </div>

          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-4 font-normal pl-0 sm:pl-10">
            <p>
              In strict adherence to <strong>Apple Guideline 4.7</strong>, FirstPlay guarantees that all games and interactive software accessed through the platform satisfy the following technical and operational standards:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>Operate Entirely Within WebKit</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  All games execute inside sandboxed WebKit environments adhering strictly to standard web technologies (HTML5, WebGL, JavaScript).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs">
                  <Cpu size={15} className="text-emerald-500 shrink-0" />
                  <span>No Native Code Injection</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Games never install native binaries, dylibs, frameworks, system extensions, or alter the host application's binary code.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs">
                  <Layers size={15} className="text-emerald-500 shrink-0" />
                  <span>No Alternative App Stores</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Games and listings are curated solely for instant casual gameplay within FirstPlay; they do not function as independent third-party software stores.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs">
                  <Lock size={15} className="text-emerald-500 shrink-0" />
                  <span>Privacy &amp; Zero Unauthorized Hardware Access</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Games are strictly restricted from accessing device hardware, user contacts, background location, camera, or microphone without explicit user and system consent.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white text-xs">
                  <Scale size={15} className="text-emerald-500 shrink-0" />
                  <span>Apple In-App Purchase Integrity</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Games offered within FirstPlay do not offer digital goods or bypass Apple's In-App Purchase mechanism.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: 24-Hour Express Removal & Takedown Guarantee */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">4. 24-Hour Express Removal &amp; Takedown Guarantee</h2>
          </div>

          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-4 font-normal pl-0 sm:pl-10">
            <p>
              FirstPlay operates a strict, zero-tolerance policy against intellectual property infringement, inappropriate content, and policy violations.
            </p>

            {/* SLA Callout Banner */}
            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-extrabold text-sm uppercase tracking-wide">
                <AlertTriangle size={16} />
                <span>Our 24-Hour Removal Commitment</span>
              </div>
              <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                FirstPlay explicitly guarantees that upon receiving credible notice from Apple, a copyright holder, a developer, or a user that a game violates Apple App Store policies, intellectual property rights, or safety standards, <strong>FirstPlay will immediately restrict, unpublish, and permanently remove the offending game from all servers, leaderboards, and client feeds within twenty-four (24) hours.</strong>
              </p>
            </div>

            {/* How to request removal */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                How to Request an Immediate Game Removal:
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                If you are a copyright owner, trademark holder, or represent Apple Review / App Store Trust &amp; Safety:
              </p>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">1. Direct Notice Email:</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Send your notice directly to <code className="font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-200/60 dark:bg-white/10 px-1 py-0.5 rounded">compliance@firstplay.fun</code> or <code className="font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-200/60 dark:bg-white/10 px-1 py-0.5 rounded">privacy@firstplay.fun</code> with the subject line:
                  </p>
                  <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs flex items-center justify-between">
                    <span>[URGENT] Game Takedown Request - [Game Name]</span>
                    <a
                      href="mailto:compliance@firstplay.fun?subject=%5BURGENT%5D%20Game%20Takedown%20Request%20-%20"
                      className="px-2 py-1 rounded bg-[#0071e3] text-white font-sans font-bold text-[11px] hover:bg-[#0077ed] transition"
                    >
                      Draft Email
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">2. Required Submission Details:</span>
                  <ul className="list-disc list-inside text-xs text-zinc-600 dark:text-zinc-400 pl-2 space-y-1">
                    <li>Name of the game and its URL or listing identifier on FirstPlay.</li>
                    <li>Reason for the removal request (e.g., Apple Guideline violation, copyright infringement, trademark dispute, bug/exploit).</li>
                    <li>Proof of identity or authorized representation of the rights-holder.</li>
                  </ul>
                </div>

                <div className="space-y-1 pt-1 border-t border-zinc-200/60 dark:border-white/10">
                  <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">3. Action Timeline:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Acknowledgment</span>
                      <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-100">Within 2 to 4 hours</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Full Removal / De-listing</span>
                      <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">Guaranteed within 24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Developer Self-Service De-Listing */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">5. Developer Self-Service De-Listing</h2>
          </div>

          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-3 font-normal pl-0 sm:pl-10">
            <p>
              Game developers who have onboarded their games via <a href="/promote" onClick={(e) => { if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); onNavigateTab?.('promote'); } }} className="text-[#0071e3] dark:text-[#0a84ff] underline cursor-pointer">firstplay.fun/promote</a> retain the right to edit, pause, or permanently delete their listings and games at any time through their developer dashboard.
            </p>
            <p>
              Deletion takes effect immediately across all active client installations, tournament schedules, and live server catalog feeds.
            </p>
          </div>
        </section>

        {/* Section 6: Official Contact Information */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10 pb-6">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Mail size={16} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">6. Official Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-10 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Developer Onboarding Portal
              </span>
              <p>
                <a 
                  href="/promote" 
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      onNavigateTab?.('promote');
                    }
                  }}
                  className="font-bold text-sm text-[#0071e3] dark:text-[#0a84ff] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>https://firstplay.fun/promote</span>
                  <ExternalLink size={12} />
                </a>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Legal, IP &amp; Compliance Inquiries
              </span>
              <p>
                <a 
                  href="mailto:compliance@firstplay.fun" 
                  className="font-bold text-sm text-zinc-900 dark:text-white hover:text-[#0071e3] transition font-mono"
                >
                  compliance@firstplay.fun
                </a>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                User Privacy &amp; Data Deletion
              </span>
              <p>
                <a 
                  href="mailto:privacy@firstplay.fun" 
                  className="font-bold text-sm text-zinc-900 dark:text-white hover:text-[#0071e3] transition font-mono"
                >
                  privacy@firstplay.fun
                </a>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Headquarters &amp; Production Site
              </span>
              <p>
                <a 
                  href="https://firstplay.fun" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-bold text-sm text-zinc-900 dark:text-white hover:text-[#0071e3] transition inline-flex items-center gap-1"
                >
                  <span>https://firstplay.fun</span>
                  <ExternalLink size={12} />
                </a>
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Persistent Page Footer */}
      <Footer
        onOpenPrivacyPolicy={() => onNavigateTab ? onNavigateTab('privacy') : onOpenPrivacyPolicy?.()}
        onOpenTerms={() => onNavigateTab ? onNavigateTab('terms') : onOpenTerms?.()}
        onNavigateTab={onNavigateTab}
        onNavigateCategory={onNavigateCategory}
        onNavigateSection={onNavigateSection}
      />
    </div>
  );
}
