'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft, 
  Mail, 
  FileText, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink,
  Info,
  HelpCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import { setTabSEO } from '../services/seoService';

const DELETION_REASONS = [
  'No longer using FirstPlay',
  'Privacy or data security concerns',
  'Temporary break / digital detox',
  'Creating a new account',
  'Technical issues with games or performance',
  'Too many notifications / emails',
  'Other'
];

export default function AccountRemovalView({ 
  onNavigateTab, 
  onOpenPrivacyPolicy, 
  onOpenTerms,
  onNavigateCategory,
  onNavigateSection
}) {
  // Form State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState(DELETION_REASONS[0]);
  const [details, setDetails] = useState('');
  const [confirmUnderstand, setConfirmUnderstand] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copiedReference, setCopiedReference] = useState(false);
  const [copiedDeskEmail, setCopiedDeskEmail] = useState(false);

  useEffect(() => {
    setTabSEO('account-removal');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleCopyDeskEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('privacy@firstplay.fun');
      setCopiedDeskEmail(true);
      setTimeout(() => setCopiedDeskEmail(false), 2000);
    }
  };

  const handleCopyTicket = (ticketId) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ticketId);
      setCopiedReference(true);
      setTimeout(() => setCopiedReference(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid account email address.');
      return;
    }

    if (!confirmUnderstand) {
      setErrorMessage('You must confirm that you understand account deletion is permanent and irreversible.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/request/account-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          username: username.trim(),
          phone: phone.trim(),
          reason,
          details: details.trim(),
          confirmUnderstand,
          website_hp: honeypot
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit account deletion request. Please try again or reach out to privacy@firstplay.fun.');
      }

      setSuccessData({
        ticketId: data.ticketId || `FP-DEL-${Date.now().toString(36).toUpperCase()}`,
        message: data.message || 'Your account deletion request has been submitted successfully.',
        submittedEmail: cleanEmail,
        timestamp: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('[AccountRemovalView] Submission error:', err);
      setErrorMessage(err.message || 'Unable to submit your deletion request at this time. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              <Lock size={12} />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('compliance') : null}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 transition"
            >
              <FileText size={12} />
              <span>Licensing &amp; Compliance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Document Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1.5">
              <ShieldAlert size={13} />
              <span>Apple App Store Review Guideline 5.1.1(v) Compliant</span>
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Data Privacy &amp; Self-Service Eradication
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Request Account &amp; Personal Data Deletion
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl font-normal">
            FirstPlay respects your right to control your digital footprint. In strict adherence to <strong>Apple App Store Review Guideline 5.1.1(v)</strong>, Google Play Data Safety policies, and global privacy frameworks (GDPR, CCPA, NDPA), you can initiate complete account eradication and personal data removal through this verified self-service portal.
          </p>

          {/* Quick Desk Contact Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 font-mono text-[11px]">
              <Mail size={12} className="text-emerald-500" />
              <span>privacy@firstplay.fun</span>
              <button
                type="button"
                onClick={handleCopyDeskEmail}
                className="ml-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition cursor-pointer"
                title="Copy privacy desk email"
              >
                {copiedDeskEmail ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 text-xs">
              <Clock size={12} className="text-[#0071e3] dark:text-[#0a84ff]" />
              <span>SLA: Purged within 48 to 72 hours</span>
            </div>
          </div>
        </header>

        {/* Section 1: Transparent Overview Cards */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Info size={18} className="text-[#0071e3] dark:text-[#0a84ff]" />
            <span>1. What Happens When You Delete Your Account</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Permanently Deleted */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">
                <Trash2 size={15} />
                <span>Permanently Purged</span>
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Account profile &amp; credentials</li>
                <li>Saved favorites &amp; game libraries</li>
                <li>Tournament high scores &amp; ranks</li>
                <li>Unclaimed reward wheel vouchers</li>
                <li>Notification &amp; device tokens</li>
              </ul>
            </div>

            {/* Card 2: Legal Retention */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                <ShieldCheck size={15} />
                <span>Statutory Retention</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Completed mobile airtime and data fulfillment receipts may be retained strictly for financial auditing and telecom gateway fraud prevention as mandated by Nigerian and international banking regulations. All records are anonymized.
              </p>
            </div>

            {/* Card 3: In-App Alternative */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[#0071e3] dark:text-[#0a84ff] font-bold text-xs uppercase tracking-wide">
                <Smartphone size={15} />
                <span>Delete In-App</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                If you have the FirstPlay mobile application installed on iOS or Android, you can also initiate deletion instantly without leaving the app:
              </p>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-[11px] font-mono text-zinc-800 dark:text-zinc-200">
                Settings → Security &amp; Privacy → Delete My Account
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Interactive Web Request Form or Success Card */}
        <section className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock size={18} className="text-emerald-500" />
              <span>2. Direct Deletion Request Form</span>
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Zero login required to submit
            </span>
          </div>

          {successData ? (
            /* =========================================================================
               SUCCESS CONFIRMATION CARD
               ========================================================================= */
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-6 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100">
                    Account Deletion Request Logged
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-200 leading-relaxed">
                    We have successfully queued your request for account eradication. All personal identifiers, progress, and activity records associated with <strong>{successData.submittedEmail}</strong> will be permanently wiped.
                  </p>
                </div>
              </div>

              {/* Reference ID Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Deletion Ticket Reference ID
                  </span>
                  <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    {successData.ticketId}
                  </p>
                  <span className="text-[11px] text-zinc-500">
                    Submitted: {successData.timestamp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyTicket(successData.ticketId)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-800 dark:text-zinc-200 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer w-fit"
                >
                  {copiedReference ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedReference ? 'Reference Copied' : 'Copy Reference ID'}</span>
                </button>
              </div>

              {/* Steps After Submission */}
              <div className="text-xs text-emerald-950 dark:text-emerald-200 space-y-2 leading-relaxed">
                <p>
                  • A confirmation email has been dispatched to <strong>{successData.submittedEmail}</strong>.
                </p>
                <p>
                  • If you submitted this request by mistake and wish to abort deletion, reply to your confirmation receipt with your Reference ID within 24 hours.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('discover')}
                  className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Return to FirstPlay Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setEmail('');
                    setUsername('');
                    setPhone('');
                    setDetails('');
                    setConfirmUnderstand(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 font-bold text-xs transition cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               REQUEST SUBMISSION FORM
               ========================================================================= */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 space-y-6">
              
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Bot Honeypot */}
              <input
                type="text"
                name="website_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Field 1: Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="del-email" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Account Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="del-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  The email address associated with your FirstPlay account or tournament submissions.
                </p>
              </div>

              {/* Field 2 & 3: Username & Phone (2-col grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="del-username" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Username / Player ID <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="del-username"
                    type="text"
                    placeholder="e.g. LagosGamer22"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="del-phone" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Phone Number for Rewards <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="del-phone"
                    type="tel"
                    placeholder="e.g. +234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition"
                  />
                </div>
              </div>

              {/* Field 4: Reason for Deletion */}
              <div className="space-y-1.5">
                <label htmlFor="del-reason" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Primary Reason for Leaving
                </label>
                <select
                  id="del-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#18181b] border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition cursor-pointer"
                >
                  {DELETION_REASONS.map((r) => (
                    <option key={r} value={r} className="bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 5: Additional Details */}
              <div className="space-y-1.5">
                <label htmlFor="del-details" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Additional Feedback or Requests <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="del-details"
                  rows={3}
                  placeholder="Share any specific notes or questions for our data privacy desk..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition resize-y"
                />
              </div>

              {/* Mandatory Irreversible Checkbox */}
              <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmUnderstand}
                    onChange={(e) => setConfirmUnderstand(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300 cursor-pointer"
                  />
                  <span className="text-xs text-rose-950 dark:text-rose-200 font-medium leading-relaxed">
                    <strong>I understand that account deletion is permanent and irreversible.</strong> All my saved favorite games, tournament rankings, playtime points, and unredeemed rewards will be permanently deleted and cannot be recovered.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !confirmUnderstand}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                    confirmUnderstand && !isSubmitting
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Request Permanent Account Deletion</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab?.('discover')}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 font-bold text-xs transition cursor-pointer text-center"
                >
                  Cancel &amp; Keep Account
                </button>
              </div>

            </form>
          )}

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
