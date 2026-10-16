import React, { useState } from 'react';
import CongratulationsModal from '../components/CongratulationsModal';
import { rewardService } from '../services/rewardService';
import { 
  Gift, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboardUtils';

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.firstplay.firstplay_app';
const APP_STORE_URL = 'https://apps.apple.com/app/firstplay/id6470000000';

/**
 * High-precision Google Play triangular vector icon
 */
function GooglePlayIcon({ className = "w-4 h-4 shrink-0" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a2.072 2.072 0 0 1-.22-.962V2.776c0-.36.08-.69.22-.962z" fill="#2196F3" />
      <path d="M17.432 8.36L5.342.3c-.562-.375-1.196-.4-1.733-.2L13.792 12l3.64-3.64z" fill="#4CAF50" />
      <path d="M13.792 12l-10.183 11.9c.537.2 1.17.175 1.733-.2l12.09-8.06-3.64-3.64z" fill="#F44336" />
      <path d="M21.708 11.23l-4.276-2.87-3.64 3.64 3.64 3.64 4.276-2.87c.78-.52 1.292-1.35 1.292-2.27s-.512-1.75-1.292-2.27z" fill="#FFEB3B" />
    </svg>
  );
}

/**
 * Authentic Apple silhouette icon
 */
function AppleIcon({ className = "w-4 h-4 shrink-0" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#ffffff" style={{ fill: '#ffffff' }} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.9.04-2 .61-2.65 1.36-.58.65-1.08 1.71-.94 2.74 1.01.08 2.02-.54 2.58-1.23z" fill="#ffffff" />
    </svg>
  );
}

export default function GiftsView({ onNavigateTab }) {
  const [myGifts, setMyGifts] = useState(() => rewardService.getLocalWonGifts());
  const [copiedCode, setCopiedCode] = useState(null);
  const [wonModalItem, setWonModalItem] = useState(null);

  const refreshGifts = () => {
    setMyGifts(rewardService.getLocalWonGifts());
  };

  const handleCopyCode = async (code) => {
    if (!code) return;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleRedeemClick = (code) => {
    if (onNavigateTab) {
      onNavigateTab('redeem', true, { code });
    } else if (typeof window !== 'undefined') {
      window.location.href = `/redeem?code=${encodeURIComponent(code)}`;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8 select-none">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[#0071e3] dark:text-[#0a84ff] text-xs font-bold">
          <Sparkles size={13} />
          <span>Fortune Gifts & Rewards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
          Rewards Wheel
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium">
          Spin the lucky wheel and win mobile data and gifts on FirstPlay
        </p>
      </div>

      {/* =========================================================================
          MOBILE APP EXCLUSIVE DOWNLOAD BANNER (REPLACES THE WEB SPIN WHEEL)
          Matches tournament behavior: Spin & Win is exclusively inside the mobile app
          ========================================================================= */}
      <div className="max-w-xl mx-auto">
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#16161b] p-6 sm:p-8 text-center space-y-5 shadow-sm text-zinc-900 dark:text-white relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-32 rounded-full blur-3xl pointer-events-none bg-blue-500/10 dark:bg-blue-600/15" />

          {/* Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-[#0071e3] dark:text-[#0a84ff] flex items-center justify-center mx-auto shadow-sm">
            <Smartphone size={28} />
          </div>

          {/* Headline & Description */}
          <div className="space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0071e3]/15 text-[#0071e3] dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
              Mobile App Exclusive
            </span>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Download the Mobile App to Spin
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-sm mx-auto">
              <strong>The Rewards Wheel can only be spun from the mobile app, not the web app.</strong> Play games, unlock daily spin passes, and win real rewards.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="text-left space-y-2 text-xs text-zinc-600 dark:text-zinc-300 bg-blue-50/60 dark:bg-blue-500/5 border border-blue-200/60 dark:border-blue-500/10 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Daily lucky spins unlocked by cumulative gameplay</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Instant mobile data and airtime awards across all networks</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Direct voucher redemption with instant fulfillment</span>
            </div>
          </div>

          {/* Store Download Buttons: Download on Playstore and Download on App Store */}
          <div className="space-y-2.5 pt-1">
            {/* Download on Playstore */}
            <a
              href={PLAYSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-keep-white="true"
              style={{ backgroundColor: '#000000', color: '#ffffff' }}
              className="store-badge w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-zinc-900 border border-white/15 text-white flex items-center justify-center gap-2.5 shadow-md shadow-black/20 cursor-pointer active:scale-[0.98] transition-all"
            >
              <GooglePlayIcon className="w-5 h-5 shrink-0" />
              <span data-keep-white="true" style={{ color: '#ffffff' }} className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Download on Playstore
              </span>
            </a>

            {/* Download on App Store */}
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-keep-white="true"
              style={{ backgroundColor: '#000000', color: '#ffffff' }}
              className="store-badge w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-zinc-900 border border-white/15 text-white flex items-center justify-center gap-2.5 shadow-md shadow-black/20 cursor-pointer active:scale-[0.98] transition-all"
            >
              <AppleIcon className="w-5 h-5 shrink-0" />
              <span data-keep-white="true" style={{ color: '#ffffff' }} className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Download on App Store
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* "My Won Gifts" Section (Remains visible so players can review & redeem won prizes on web) */}
      <div className="max-w-xl mx-auto space-y-4 pt-4 border-t border-zinc-200 dark:border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <Gift size={16} className="text-[#0071e3] dark:text-[#0a84ff]" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
              My Won Gifts ({myGifts.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">24h Expiry</span>
        </div>

        {myGifts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#16161a]/60 border border-zinc-200 dark:border-white/[0.06] text-center space-y-1">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No rewards won yet</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Spin the wheel on the FirstPlay mobile app to win instant mobile data and gifts.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myGifts.map((item, idx) => {
              const isUsed = item.status === 'used' || item.isUsed === true;
              return (
                <div
                  key={item.id || item.code || `gift-${idx}`}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#16161a] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUsed 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500' 
                        : 'bg-blue-50 dark:bg-blue-500/15 text-[#0071e3] dark:text-[#0a84ff]'
                    }`}>
                      <Gift size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-white truncate">{item.gift || item.amountLabel}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUsed 
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' 
                            : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                        }`}>
                          {isUsed ? 'Redeemed' : 'Active (Valid 24h)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 select-all">
                          {item.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.code)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-[10px] font-semibold border border-zinc-200 dark:border-transparent"
                          title="Copy Code"
                        >
                          {copiedCode === item.code ? (
                            <>
                              <Check size={11} className="text-emerald-600 stroke-[3]" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {!isUsed && (
                      <button
                        type="button"
                        onClick={() => handleRedeemClick(item.code)}
                        className="px-3.5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
                      >
                        <span>Redeem</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Won Congratulations Modal (if needed for any direct award callbacks) */}
      {wonModalItem && (
        <CongratulationsModal
          wonItem={wonModalItem}
          onClose={() => {
            setWonModalItem(null);
            refreshGifts();
          }}
          onRedeem={(code) => {
            setWonModalItem(null);
            handleRedeemClick(code);
          }}
        />
      )}

    </div>
  );
}
