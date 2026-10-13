import React, { useState } from 'react';
import {
  CreditCard,
  Sparkles,
  ExternalLink,
  Eye,
  FileImage,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebaseConfig';
import { emailService } from '../services/emailService';
import Footer from '../components/Footer';

const BACHS_PAYMENT_LINKS = {
  app: 'https://checkout.bachs.io/pay/pl_fb788898fc46',
  product: 'https://checkout.bachs.io/pay/pl_051e5550c4f6'
};

/**
 * Uploads a file directly to Firebase Storage under the 'promotions' folder
 * Bucket: firstplay-7bd63.firebasestorage.app/promotions
 */
async function uploadToPromotionsFolder(file, prefix) {
  if (!file) return '';
  const timestamp = Date.now();
  const cleanName = (file.name || 'image').replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `promotions/${timestamp}_${prefix}_${cleanName}`;

  if (storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || (prefix === 'logo' ? 'image/png' : 'image/jpeg')
      });
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn('[FirstPlay Storage] Upload returned, using local fallback:', err);
    }
  }

  // Graceful fallback to data URL if direct upload is blocked
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function PromoteView({
  currentTheme,
  onNavigateDiscover,
  onOpenPrivacyPolicy,
  onOpenTerms,
  onNavigateTab
}) {
  const [category, setCategory] = useState('game'); // 'game' | 'app' | 'product'
  const [studioName, setStudioName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [openInApp, setOpenInApp] = useState(true); // true = play in app, false = open in new tab

  // Icon / Logo State
  const [iconMode, setIconMode] = useState('upload'); // 'upload' | 'url'
  const [iconUrl, setIconUrl] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');

  // Banner / Showcase State
  const [bannerMode, setBannerMode] = useState('upload'); // 'upload' | 'url'
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [submissionState, setSubmissionState] = useState('form'); // 'form' | 'free_success' | 'awaiting_payment' | 'verified_success'
  const [pendingRef, setPendingRef] = useState('');
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [checkMessage, setCheckMessage] = useState(null);

  // Handle Icon file selection
  const handleIconFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => setIconPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Banner file selection
  const handleBannerFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const effectiveIcon = iconMode === 'url' ? iconUrl : iconPreview;
  const effectiveBanner =
    bannerMode === 'url'
      ? bannerUrl
      : bannerPreview ||
        'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&auto=format&fit=crop&q=80';

  const resetForm = () => {
    setSubmissionState('form');
    setTitle('');
    setUrl('');
    setStudioName('');
    setEmail('');
    setTagline('');
    setDescription('');
    setIconFile(null);
    setIconPreview('');
    setIconUrl('');
    setBannerFile(null);
    setBannerPreview('');
    setBannerUrl('');
    setPendingRef('');
    setOpenInApp(true);
    setErrorMessage(null);
    setCheckMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid publisher email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setCheckMessage(null);

    try {
      let finalIconUrl = iconMode === 'url' ? iconUrl.trim() : '';
      let finalBannerUrl = bannerMode === 'url' ? bannerUrl.trim() : '';

      // 1. Upload icon to cloud storage
      if (iconMode === 'upload' && iconFile) {
        setLoadingStep('Uploading project icon artwork...');
        finalIconUrl = await uploadToPromotionsFolder(iconFile, 'logo');
      }

      // 2. Upload banner to cloud storage
      if (bannerMode === 'upload' && bannerFile) {
        setLoadingStep('Uploading showcase banner artwork...');
        finalBannerUrl = await uploadToPromotionsFolder(bannerFile, 'banner');
      }

      setLoadingStep('Saving campaign listing...');

      if (category === 'game') {
        // Upload strictly to 'under_review' collection in Firebase
        if (db) {
          await addDoc(collection(db, 'under_review'), {
            category: 'game',
            title: title.trim(),
            name: title.trim(),
            game_name: title.trim(),
            game_url: url.trim(),
            url: url.trim(),
            email: email.trim().toLowerCase(),
            publisher_email: email.trim().toLowerCase(),
            full_name: studioName.trim() || 'Independent Studio',
            studioName: studioName.trim() || 'Independent Studio',
            tagline: tagline.trim(),
            description: description.trim(),
            logo: finalIconUrl || null,
            logo_url: finalIconUrl || null,
            flyer: finalBannerUrl || null,
            banner: finalBannerUrl || null,
            banner_url: finalBannerUrl || null,
            payment_status: 'free',
            open_in_app: Boolean(openInApp),
            status: 'under_review',
            active: false,
            created_at: serverTimestamp()
          });
        }

        // Send Under Review confirmation email via Resend
        try {
          await emailService.sendUnderReviewEmail({
            to: email.trim().toLowerCase(),
            gameTitle: title.trim(),
            studioName: studioName.trim() || 'Independent Studio',
            gameUrl: url.trim()
          });
          console.info('[PromoteView] Under review email notification sent to', email);
        } catch (mailErr) {
          console.warn('[PromoteView] Email notification notice:', mailErr);
        }

        setSubmissionState('under_review_success');
      } else {
        // Paid App or Product -> write draft to pending_campaigns collection
        const prefix = category === 'app' ? 'FP-APP' : 'FP-PROD';
        const refCode = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        setPendingRef(refCode);

        if (db) {
          await addDoc(collection(db, 'pending_campaigns'), {
            reference: refCode,
            category,
            title: title.trim(),
            email: email.trim().toLowerCase(),
            publisher_email: email.trim().toLowerCase(),
            studioName: studioName.trim() || 'Independent Studio',
            tagline: tagline.trim(),
            url: url.trim(),
            description: description.trim(),
            icon: finalIconUrl || null,
            banner: finalBannerUrl || null,
            open_in_app: Boolean(openInApp),
            paymentStatus: 'pending',
            paymentLinkId: category === 'app' ? 'pl_fb788898fc46' : 'pl_051e5550c4f6',
            amount: category === 'app' ? 10000 : 5000,
            created_at: serverTimestamp()
          });
        }

        setSubmissionState('awaiting_payment');
      }
    } catch (err) {
      console.error('Submission or upload error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('storage/unauthorized') || msg.includes('permission')) {
        setErrorMessage('Upload notice: Please ensure your image file is PNG, JPG, or WebP and under 5MB.');
      } else {
        setErrorMessage(`Upload notice: ${msg}`);
      }
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const checkPaymentStatus = async () => {
    if (!pendingRef) return;
    setCheckingPayment(true);
    setCheckMessage(null);
    try {
      const res = await fetch(`/api/bachs/payment?check_ref=${encodeURIComponent(pendingRef)}`);
      const data = await res.json();
      if (data.status === 'paid' || data.status === 'completed') {
        setSubmissionState('verified_success');
      } else {
        setCheckMessage('Payment is still pending. Once you complete checkout on Bachs, your listing will be automatically activated.');
      }
    } catch {
      setCheckMessage('Payment verification check complete. If you just paid, your campaign will be activated shortly.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const paymentUrl = category === 'app' ? BACHS_PAYMENT_LINKS.app : BACHS_PAYMENT_LINKS.product;

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onNavigateDiscover}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-all cursor-pointer border border-black/5 dark:border-white/10"
        >
          <ArrowLeft size={13} />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Discovery</span>
        </button>
      </div>

      {/* Hero Header Block */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
          Promote Your Game
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Publish browser games 100% free to thousands of active FirstPlay players and gaming enthusiasts.
        </p>
      </div>

      {submissionState === 'awaiting_payment' ? (
        /* ================= Awaiting Bachs Payment ================= */
        <div className="rounded-3xl border border-blue-400/30 bg-white dark:bg-[#16161d] p-6 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-4 promote-card">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-500/15 text-blue-500 dark:text-blue-400 mb-2">
            <CreditCard size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Sparkles size={13} />
            <span>Draft Queued • Ref #{pendingRef}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Complete Payment with Bachs
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-lg mx-auto">
            Your campaign details for <strong>{title}</strong> are saved. Complete payment on Bachs to automatically publish your listing.
          </p>

          <div className="my-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] p-4 sm:p-5 text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-white/[0.08] text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Listing Name</span>
              <span className="font-bold text-zinc-900 dark:text-white">{title}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-white/[0.08] text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Category</span>
              <span className="font-bold text-zinc-900 dark:text-white capitalize">
                {category === 'app' ? 'Web Application' : 'Digital Product'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-white/[0.08] text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Placement Period</span>
              <span className="font-bold text-zinc-900 dark:text-white">7 Days</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-sm font-bold">
              <span className="text-zinc-900 dark:text-white">Amount Due</span>
              <span className="text-[#0071e3] text-base">
                {category === 'app' ? '₦10,000' : '₦5,000'}
              </span>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3 px-6 text-xs sm:text-sm font-bold text-white shadow-lg transition-all cursor-pointer"
              data-keep-white="true"
            >
              <span className="text-white">Pay with Bachs Checkout</span>
              <ExternalLink size={14} />
            </a>

            <button
              type="button"
              onClick={checkPaymentStatus}
              disabled={checkingPayment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 dark:border-white/15 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 px-6 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={checkingPayment ? 'animate-spin text-blue-500' : ''} />
              <span>{checkingPayment ? 'Verifying payment status...' : 'I Have Paid — Verify Confirmation'}</span>
            </button>
          </div>

          {checkMessage && (
            <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/25 rounded-xl p-3 max-w-md mx-auto">
              {checkMessage}
            </p>
          )}

          <div className="pt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-[#0071e3] dark:text-blue-400" />
            <span>Powered by Bachs Payment</span>
          </div>
        </div>
      ) : (submissionState === 'under_review_success' || submissionState === 'free_success') ? (
        /* ================= Under Review Success ================= */
        <div className="rounded-3xl border border-amber-500/40 bg-white dark:bg-[#16161d] p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-2xl space-y-4 promote-card">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            Status: Under Review
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Game Submitted for Review!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-lg mx-auto">
            Your game <strong>{title}</strong> has been uploaded to the <em>under_review</em> queue. To protect platform quality and safety, all games must be reviewed and approved by an administrator before appearing live on FirstPlay.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNavigateDiscover}
              className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
              data-keep-white="true"
            >
              <span className="text-white">Return to Discovery</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-white/15 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer"
            >
              Submit Another Game
            </button>
          </div>
        </div>
      ) : (
        /* ================= Two-Column Form & Live Preview ================= */
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-8 items-start">
          
          {/* Left Column: Campaign Information Form */}
          <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#16161d]/90 p-5 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 promote-card">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Campaign Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* TARGET CATEGORY */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                  Target Category
                </label>
                <div className="rounded-2xl bg-zinc-100 dark:bg-white/[0.04] p-1.5 border border-zinc-200 dark:border-white/10 category-track">
                  <button
                    type="button"
                    onClick={() => setCategory('game')}
                    className="w-full rounded-xl py-2.5 text-xs sm:text-sm font-extrabold bg-[#0071e3] text-white shadow-md active-category flex items-center justify-center gap-2 cursor-pointer"
                    data-keep-white="true"
                  >
                    <span>Game (FREE)</span>
                  </button>
                  {/* Web App (₦10k) & Product (₦5k) preserved in code for later re-enabling:
                  <button
                    type="button"
                    onClick={() => setCategory('app')}
                    className={`rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      category === 'app'
                        ? 'bg-[#0071e3] text-white shadow-md active-category'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                    data-keep-white={category === 'app' ? "true" : undefined}
                  >
                    Web App (₦10k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('product')}
                    className={`rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      category === 'product'
                        ? 'bg-[#0071e3] text-white shadow-md active-category'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                    data-keep-white={category === 'product' ? "true" : undefined}
                  >
                    Product (₦5k)
                  </button>
                  */}
                </div>
              </div>

              {/* Advertiser or Studio Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
                  Advertiser or Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="e.g. Lagos Interactive or Paystack Studio"
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              {/* Publisher Contact Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5 flex items-center justify-between">
                  <span>Publisher Email Address *</span>
                  <span className="text-[10px] text-zinc-500 font-normal">For review updates &amp; status notifications</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 dark:text-zinc-500">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="publisher@yourstudio.com"
                    className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
                  {category === 'game' ? 'Game Title *' : category === 'app' ? 'Application Name *' : 'Product Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lagos Run"
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              {/* Short Editorial Tagline */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
                  Short Editorial Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Catchy, high-impact headline for the showcase card."
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              {/* Destination URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
                  Destination URL (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                />
              </div>

              {/* Launch Behavior: Open in App vs New Tab */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
                  Launch Experience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOpenInApp(true)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      openInApp
                        ? 'bg-blue-50 dark:bg-blue-100/90 border-[#0071e3] shadow-xs'
                        : 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${openInApp ? '!text-black' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        Play Inside FirstPlay
                      </span>
                      {openInApp && <CheckCircle2 size={14} className="!text-black shrink-0" />}
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${openInApp ? '!text-black opacity-90' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      Loads inside FirstPlay built-in player with sandboxed controls.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenInApp(false)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !openInApp
                        ? 'bg-blue-50 dark:bg-blue-100/90 border-[#0071e3] shadow-xs'
                        : 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${!openInApp ? '!text-black' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        Open in New Tab
                      </span>
                      {!openInApp && <CheckCircle2 size={14} className="!text-black shrink-0" />}
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${!openInApp ? '!text-black opacity-90' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      Redirects directly to the website in a new browser tab.
                    </p>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed breakdown of features and experience. Be specific and grounded."
                  className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition resize-none shadow-xs"
                />
              </div>

              {/* Project Icon / Logo */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    <FileImage size={14} className="text-[#0071e3]" />
                    <span>Project Icon / Logo *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIconMode(iconMode === 'upload' ? 'url' : 'upload')}
                    className="text-xs font-semibold text-[#0071e3] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LinkIcon size={11} />
                    <span>{iconMode === 'upload' ? 'Use image URL' : 'Upload file'}</span>
                  </button>
                </div>

                {iconMode === 'upload' ? (
                  <label className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.05] cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconFile}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        <Upload size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-zinc-900 dark:text-white">
                          {iconFile
                            ? `${iconFile.name} (Ready to upload)`
                            : iconPreview
                            ? 'Logo Attached (Click to change)'
                            : 'Upload Logo Artwork'}
                        </span>
                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                          PNG, JPG, or WebP recommended (up to 5MB)
                        </span>
                      </div>
                    </div>
                  </label>
                ) : (
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                  />
                )}
              </div>

              {/* Showcase Banner / Cover Art */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    <ImageIcon size={14} className="text-purple-600 dark:text-purple-400" />
                    <span>Showcase Banner / Cover Art *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setBannerMode(bannerMode === 'upload' ? 'url' : 'upload')}
                    className="text-xs font-semibold text-[#0071e3] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LinkIcon size={11} />
                    <span>{bannerMode === 'upload' ? 'Use image URL' : 'Upload file'}</span>
                  </button>
                </div>

                {bannerMode === 'upload' ? (
                  <label className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.05] cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFile}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        <Upload size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-zinc-900 dark:text-white">
                          {bannerFile
                            ? `${bannerFile.name} (Ready to upload)`
                            : bannerPreview
                            ? 'Banner Attached (Click to change)'
                            : 'Upload Showcase Artwork'}
                        </span>
                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                          High-resolution landscape banner (16:9 recommended)
                        </span>
                      </div>
                    </div>
                  </label>
                ) : (
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition shadow-xs"
                  />
                )}
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                  data-keep-white="true"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>{loadingStep || 'Processing submission...'}</span>
                    </span>
                  ) : category === 'game' ? (
                    'Publish Game (Free) ›'
                  ) : (
                    `Continue to Bachs Checkout (${category === 'app' ? '₦10,000' : '₦5,000'}) ›`
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Live Card Preview & Placement Rates */}
          <div className="space-y-6">
            
            {/* Live Card Preview Box */}
            <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#16161d]/90 p-5 sm:p-7 shadow-xl dark:shadow-2xl space-y-4 promote-card">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-extrabold text-zinc-900 dark:text-white">
                  <Eye size={14} className="text-[#0071e3] dark:text-blue-400" />
                  <span>Live Card Preview</span>
                </span>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Discovery & Category Rail
                </span>
              </div>

              {/* Rail Row Item Preview */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] p-3">
                {effectiveIcon ? (
                  <img
                    src={effectiveIcon}
                    alt=""
                    className="h-12 w-12 rounded-2xl object-cover border border-black/5 dark:border-white/10"
                  />
                ) : (
                  <div data-keep-white="true" className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0a84ff] text-white font-black text-sm shadow-md">
                    {title ? title.slice(0, 2).toUpperCase() : 'FP'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                    {title || 'Your Campaign Name'}
                  </b>
                  <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {tagline || 'Editorial pitch preview...'}
                  </span>
                </div>
                <span data-keep-white="true" className="rounded-full bg-[#0a84ff] px-3.5 py-1 text-xs font-bold text-white shadow-sm">
                  {category === 'product' ? 'View' : category === 'app' ? 'Open' : 'Play'}
                </span>
              </div>

              {/* Showcase Banner Card Preview */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 bg-black/10 shadow-lg">
                <img
                  src={effectiveBanner}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div data-keep-white="true" className="absolute bottom-3 left-3 right-3 text-white">
                  <div 
                    className="p-3 sm:p-3.5 rounded-xl bg-black/35 backdrop-blur-2xl border border-white/25 shadow-xl space-y-0.5"
                    style={{
                      backdropFilter: 'blur(20px) saturate(170%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(170%)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)'
                    }}
                  >
                    <span className="block text-[10px] font-black uppercase tracking-wider text-white/80">
                      {category === 'game'
                        ? 'GAME SHOWCASE'
                        : category === 'app'
                        ? 'WEB APP SHOWCASE'
                        : 'PRODUCT SHOWCASE'}
                    </span>
                    <h3 className="text-sm sm:text-base font-black tracking-tight drop-shadow text-white truncate">
                      {title || 'Campaign Title'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Placement Rates Card */}
            <div className="rounded-3xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#16161d]/90 p-5 sm:p-7 shadow-xl dark:shadow-2xl space-y-4 promote-card">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/[0.08] pb-3">
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white">Placement Rates</h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Campaign Rates</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 p-3">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">Browser Games:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">100% FREE</span>
                </div>
                {/* Preserved for re-enabling later:
                <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 p-3">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">Web Applications:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">₦10,000 / 7 Days</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 p-3">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">Digital Products:</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">₦5,000 / 7 Days</span>
                </div>
                */}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 pt-3 border-t border-black/5 dark:border-white/[0.08]">
                <ShieldCheck size={15} className="text-[#0071e3] dark:text-blue-400 shrink-0" />
                <span>Powered by Bachs Payment</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Operational Disclaimer Line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-black/10 dark:border-white/[0.08] text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>FirstPlay Advertiser & Promotion Operations</span>
        <span>All campaigns subject to verification before catalog dispatch</span>
      </div>

      {/* Standard Platform Footer */}
      <Footer
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onOpenTerms={onOpenTerms}
        onNavigateTab={onNavigateTab}
      />

    </div>
  );
}
