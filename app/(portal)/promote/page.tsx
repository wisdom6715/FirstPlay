'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Eye,
  FileImage,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebaseDb, firebaseStorage } from '@/lib/firebase';
import { BACHS_PAYMENT_LINKS } from '@/lib/bachs';

type CategoryKey = 'game' | 'app' | 'product';
type SubmissionState = 'form' | 'free_success' | 'awaiting_payment' | 'verified_success';

/**
 * Uploads a file directly to Firebase Storage bucket (firstplay-7bd63.firebasestorage.app)
 * inside the 'promotions' folder and returns the public download URL.
 */
async function uploadToPromotionsFolder(file: File, prefix: 'logo' | 'banner'): Promise<string> {
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  // Upload strictly to folder: promotions in firstplay-7bd63.firebasestorage.app
  const storagePath = `promotions/${timestamp}_${prefix}_${cleanName}`;
  const storageRef = ref(firebaseStorage, storagePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || (prefix === 'logo' ? 'image/png' : 'image/jpeg')
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

export default function PromotePage() {
  const [category, setCategory] = useState<CategoryKey>('game');
  const [studioName, setStudioName] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  // Icon / Logo State
  const [iconMode, setIconMode] = useState<'upload' | 'url'>('upload');
  const [iconUrl, setIconUrl] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState('');

  // Banner / Showcase State
  const [bannerMode, setBannerMode] = useState<'upload' | 'url'>('upload');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('form');
  const [pendingRef, setPendingRef] = useState('');
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  // Handle Icon file selection
  const handleIconFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle Banner file selection
  const handleBannerFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
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
    setTagline('');
    setDescription('');
    setIconFile(null);
    setIconPreview('');
    setBannerFile(null);
    setBannerPreview('');
    setPendingRef('');
    setErrorMessage(null);
    setCheckMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setCheckMessage(null);

    try {
      let finalIconUrl = iconMode === 'url' ? iconUrl.trim() : '';
      let finalBannerUrl = bannerMode === 'url' ? bannerUrl.trim() : '';

      // 1. Upload icon to promotions folder in Firebase Storage
      if (iconMode === 'upload' && iconFile) {
        setLoadingStep('Uploading icon/logo to promotions folder in Firebase Storage...');
        finalIconUrl = await uploadToPromotionsFolder(iconFile, 'logo');
      }

      // 2. Upload banner to promotions folder in Firebase Storage
      if (bannerMode === 'upload' && bannerFile) {
        setLoadingStep('Uploading banner to promotions folder in Firebase Storage...');
        finalBannerUrl = await uploadToPromotionsFolder(bannerFile, 'banner');
      }

      setLoadingStep('Saving campaign data with Firebase Storage URLs to Firestore...');

      if (category === 'game') {
        // Free game submission -> direct write to Firestore apps
        if (firebaseDb) {
          await addDoc(collection(firebaseDb, 'apps'), {
            category: 'game',
            game_name: title.trim(),
            app_name: null,
            product_name: null,
            game_url: url.trim(),
            app_url: null,
            product_url: null,
            full_name: studioName.trim() || 'Independent Studio',
            tagline: tagline.trim(),
            description: description.trim(),
            logo: finalIconUrl || null,
            flyer: finalBannerUrl || null,
            banner_url: finalBannerUrl || null,
            payment_status: 'free',
            created_at: serverTimestamp(),
            expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          });

          if (finalBannerUrl) {
            await addDoc(collection(firebaseDb, 'promotion_banner'), {
              title: title.trim(),
              subtitle: tagline.trim() || description.trim().slice(0, 80),
              badge_text: 'GAME SHOWCASE',
              image_url: finalBannerUrl,
              target_url: url.trim(),
              placement: 'all',
              active: true,
              created_at: serverTimestamp()
            });
          }
        }
        setSubmissionState('free_success');
      } else {
        // Paid App or Product -> write draft to pending_campaigns collection with Firebase Storage URLs
        const prefix = category === 'app' ? 'FP-APP' : 'FP-PROD';
        const ref = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        setPendingRef(ref);

        if (firebaseDb) {
          await addDoc(collection(firebaseDb, 'pending_campaigns'), {
            reference: ref,
            category,
            title: title.trim(),
            studioName: studioName.trim() || 'Independent Studio',
            tagline: tagline.trim(),
            url: url.trim(),
            description: description.trim(),
            icon: finalIconUrl || null,
            banner: finalBannerUrl || null,
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
      if (msg.includes('storage/unauthorized')) {
        setErrorMessage(
          "Firebase Storage permission notice: Ensure your Firebase Storage rules permit writing to the 'promotions' folder: match /promotions/{allPaths=**} { allow read, write: if true; }"
        );
      } else {
        setErrorMessage(`Upload error: ${msg}`);
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
        setCheckMessage('Payment is still pending. Once you complete checkout on Bachs, the webhook will automatically verify and activate your listing.');
      }
    } catch {
      setCheckMessage('Could not verify status at this moment. You can check again in a few moments.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const paymentUrl = category === 'app' ? BACHS_PAYMENT_LINKS.app : BACHS_PAYMENT_LINKS.product;

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 mb-3">
          <Megaphone size={14} className="-rotate-12" />
          FirstPlay Promotion & Listing Hub
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.035em] text-slate-900">
          Promote Your Game, App, or Product
        </h1>
        <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
          Feature your web game, browser application, or digital product to thousands of active FirstPlay players and tech early adopters. Images are stored securely in Cloud Firebase Storage under the <code className="rounded bg-slate-100 px-1 py-0.5 text-blue-600 font-bold">promotions</code> folder.
        </p>
      </div>

      {submissionState === 'awaiting_payment' ? (
        /* Bachs Payment Handoff & Webhook Verification Screen */
        <div className="rounded-[32px] border border-blue-200 bg-white/95 p-6 sm:p-12 text-center max-w-2xl mx-auto shadow-sm backdrop-blur-2xl animate-in zoom-in-95">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <CreditCard size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 mb-3">
            <Sparkles size={13} />
            Draft Queued • Ref #{pendingRef}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Payment with Bachs
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
            Your campaign details and Firebase Storage images for <strong>{title}</strong> are saved. Complete payment on Bachs to automatically publish your listing.
          </p>

          <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 text-left max-w-md mx-auto">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/80 text-xs sm:text-sm">
              <span className="text-slate-500">Listing Name</span>
              <span className="font-bold text-slate-900">{title}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/80 text-xs sm:text-sm">
              <span className="text-slate-500">Category</span>
              <span className="font-bold text-slate-900 capitalize">
                {category === 'app' ? 'Web Application' : 'Digital Product'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/80 text-xs sm:text-sm">
              <span className="text-slate-500">Placement Period</span>
              <span className="font-bold text-slate-900">7 Days</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-sm sm:text-base">
              <span className="font-extrabold text-slate-900">Amount Due</span>
              <span className="font-black text-blue-600 text-lg">
                {category === 'app' ? '₦10,000' : '₦5,000'}
              </span>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 py-3.5 px-6 text-sm sm:text-base font-extrabold text-white shadow-md transition hover:bg-blue-700 hover:scale-[1.01] active:scale-98"
            >
              <span>Pay with Bachs Checkout</span>
              <ExternalLink size={16} />
            </a>

            <button
              type="button"
              onClick={checkPaymentStatus}
              disabled={checkingPayment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 px-6 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <RefreshCw size={14} className={checkingPayment ? 'animate-spin text-blue-600' : ''} />
              <span>{checkingPayment ? 'Checking Bachs Webhook...' : 'I Have Paid — Verify Confirmation'}</span>
            </button>
          </div>

          {checkMessage && (
            <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-md mx-auto">
              {checkMessage}
            </p>
          )}

          <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
            <span>Automated webhook verification active at: </span>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">/api/bachs/payment</code>
          </div>
        </div>
      ) : submissionState === 'verified_success' ? (
        /* Paid Verified Success */
        <div className="rounded-[32px] border border-emerald-500/25 bg-white/95 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-sm backdrop-blur-2xl animate-in zoom-in-95">
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payment Verified & Campaign Live!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Your Bachs payment was confirmed via webhook and your campaign for <strong>{title}</strong> is now live in the FirstPlay catalog!
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/"
              className="rounded-full bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-blue-700 hover:scale-105"
            >
              View on Discovery
            </a>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Submit Another Campaign
            </button>
          </div>
        </div>
      ) : submissionState === 'free_success' ? (
        /* Free Game Success */
        <div className="rounded-[32px] border border-emerald-500/25 bg-white/95 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-sm backdrop-blur-2xl animate-in zoom-in-95">
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Game Listed Successfully!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Your game <strong>{title}</strong> and Firebase Storage images are now published in the FirstPlay catalog with your 7-day free trial active.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/"
              className="rounded-full bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-blue-700 hover:scale-105"
            >
              Return to Discovery
            </a>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Submit Another Game
            </button>
          </div>
        </div>
      ) : (
        /* Form & Live Preview Layout */
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-8 items-start">
          {/* Left Column: Campaign Information Form */}
          <div className="rounded-[28px] border border-slate-200/90 bg-white/95 p-5 sm:p-8 shadow-sm backdrop-blur-2xl">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mb-6">
              Campaign Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Category Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Target Category
                </label>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCategory('game')}
                    className={`rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition ${
                      category === 'game'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Game (7d FREE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('app')}
                    className={`rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition ${
                      category === 'app'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Web App (₦10k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('product')}
                    className={`rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition ${
                      category === 'product'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Product (₦5k)
                  </button>
                </div>
              </div>

              {/* Advertiser or Studio Name */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Advertiser or Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="e.g. Lagos Interactive or Paystack Studio"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  {category === 'game' ? 'Game Title *' : category === 'app' ? 'Application Name *' : 'Product Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lagos Run"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              {/* Short Editorial Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Short Editorial Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Catchy, high-impact headline for the showcase card."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              {/* Experience URL */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Destination URL (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed breakdown of features and experience. Be specific and grounded."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                />
              </div>

              {/* Upload 1: Project Icon / Logo */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <FileImage size={15} className="text-blue-500" />
                    Project Icon / Logo *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIconMode(iconMode === 'upload' ? 'url' : 'upload')}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon size={12} />
                    {iconMode === 'upload' ? 'Use image URL' : 'Upload file'}
                  </button>
                </div>

                {iconMode === 'upload' ? (
                  <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconFile}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <Upload size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-900">
                          {iconFile
                            ? `${iconFile.name} (Ready for Firebase Storage)`
                            : iconPreview
                            ? 'Logo Attached (Click to change)'
                            : 'Upload Logo Artwork'}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Uploads directly to <strong className="text-blue-600">promotions</strong> folder in Firebase Storage
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                )}
              </div>

              {/* Upload 2: Showcase Banner / Cover Art */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <ImageIcon size={15} className="text-purple-500" />
                    Showcase Banner / Cover Art *
                  </label>
                  <button
                    type="button"
                    onClick={() => setBannerMode(bannerMode === 'upload' ? 'url' : 'upload')}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon size={12} />
                    {bannerMode === 'upload' ? 'Use image URL' : 'Upload file'}
                  </button>
                </div>

                {bannerMode === 'upload' ? (
                  <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFile}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
                        <Upload size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-900">
                          {bannerFile
                            ? `${bannerFile.name} (Ready for Firebase Storage)`
                            : bannerPreview
                            ? 'Banner Attached (Click to change)'
                            : 'Upload Showcase Artwork'}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Uploads directly to <strong className="text-purple-600">promotions</strong> folder in Firebase Storage
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                )}
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Upload Notice</strong>
                    <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-blue-600 py-4 text-sm sm:text-base font-extrabold text-white shadow-lg transition hover:bg-blue-700 hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      {loadingStep || 'Uploading to Firebase Storage (promotions folder)...'}
                    </span>
                  ) : category === 'game' ? (
                    'Publish Game (7 Days Free) ›'
                  ) : (
                    `Continue to Bachs Checkout (${category === 'app' ? '₦10,000' : '₦5,000'}) ›`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Card Preview & Placement Rates */}
          <div className="space-y-6">
            {/* Live Card Preview */}
            <div className="rounded-[28px] border border-slate-200/90 bg-white/95 p-5 sm:p-7 shadow-sm backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                  <Eye size={15} className="text-blue-500" />
                  Live Card Preview
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Discovery & Category Rail
                </span>
              </div>

              {/* Compact Rail Card Preview */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50 p-3 mb-4">
                {effectiveIcon ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={effectiveIcon}
                    alt=""
                    className="h-12 w-12 rounded-[22%] object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-[22%] bg-blue-600 text-white font-black text-sm shadow-sm">
                    {title ? title.slice(0, 2).toUpperCase() : 'FP'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-bold text-slate-900">
                    {title || 'Your Campaign Name'}
                  </b>
                  <span className="block truncate text-xs text-slate-500">
                    {tagline || 'Editorial pitch preview...'}
                  </span>
                </div>
                <span className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-extrabold text-white shadow-sm">
                  {category === 'product' ? 'View' : category === 'app' ? 'Open' : 'Play'}
                </span>
              </div>

              {/* Cinematic Showcase Banner Card Preview */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={effectiveBanner}
                  alt=""
                  className="h-full w-full object-cover brightness-[0.85]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-white/70">
                    {category === 'game'
                      ? 'GAME SHOWCASE'
                      : category === 'app'
                      ? 'WEB APP SHOWCASE'
                      : 'PRODUCT SHOWCASE'}
                  </span>
                  <h3 className="text-lg font-black tracking-tight drop-shadow">
                    {title || 'Campaign Title'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Placement Rates Card */}
            <div className="rounded-[28px] border border-slate-200/90 bg-white/95 p-5 sm:p-7 shadow-sm backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                <h3 className="text-sm font-extrabold text-slate-900">Placement Rates</h3>
                <span className="text-xs text-slate-500">7-Day Period</span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                  <span className="font-semibold text-slate-800">Browser Games:</span>
                  <span className="font-extrabold text-emerald-600">7 Days FREE</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                  <span className="font-semibold text-slate-800">Web Applications:</span>
                  <span className="font-extrabold text-blue-600">₦10,000 / 7 Days</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                  <span className="font-semibold text-slate-800">Digital Products:</span>
                  <span className="font-extrabold text-purple-600">₦5,000 / 7 Days</span>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2.5 text-xs text-slate-500 pt-4 border-t border-slate-200/80">
                <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Images are stored in Firebase Storage bucket <code className="text-blue-600 font-bold">firstplay-7bd63.firebasestorage.app/promotions</code> and verified via Bachs Webhook <code className="text-slate-700">/api/bachs/payment</code>.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
