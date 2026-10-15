import React, { useState } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  ExternalLink, 
  X 
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboardUtils';

export default function CongratulationsModal({
  wonItem,
  onClose,
  onRedeem
}) {
  const [copied, setCopied] = useState(false);

  if (!wonItem) return null;

  const isZero = !wonItem.code || wonItem.isSmallest === true || wonItem.amount === 0 || wonItem.amount_mb === 0;
  const giftName = wonItem.gift || `${wonItem.amountLabel || wonItem.amount} ${wonItem.subLabel || 'Data'}`;
  const code = wonItem.code || wonItem.redemptionCode || '';

  const handleCopy = async () => {
    if (!code) return;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRedeemAction = () => {
    if (onRedeem) {
      onRedeem(code);
      onClose?.();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = `/redeem?code=${encodeURIComponent(code)}`;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-text"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden text-zinc-900 dark:text-white">
        
        {/* Subtle Ambient Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl pointer-events-none ${
          isZero ? 'bg-zinc-400/10 dark:bg-zinc-600/10' : 'bg-blue-500/15 dark:bg-blue-600/20'
        }`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {isZero ? (
          /* 0 MB Result State */
          <>
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 shadow-xs">
              <span className="text-2xl font-black">0</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                No Reward This Spin
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xs mx-auto">
                Keep exploring and playing games to unlock your next daily spin pass.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          /* Winning Congratulation State */
          <>
            {/* Top Reward Icon */}
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-[#0071e3] dark:text-[#0a84ff] shadow-sm mx-auto">
              <Gift size={32} />
            </div>

            <div>
              <span className="inline-block text-[11px] font-black tracking-widest text-[#0071e3] dark:text-[#0a84ff] uppercase bg-blue-50 dark:bg-blue-500/15 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/30">
                LUCKY WINNER
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-2.5">
                Congratulations!
              </h3>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                You won {giftName}!
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                Copy your unique code and redeem your data gift on FirstPlay.
              </p>
            </div>

            {/* Redeem Code Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-2 text-left">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span>Your Unique Redemption Code</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Expires in 24h</span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/10 shadow-xs">
                <span className="font-mono text-base font-black text-zinc-900 dark:text-white tracking-widest truncate select-all px-1">
                  {code}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                  title="Copy code to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleRedeemAction}
                className="w-full h-12 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs tracking-wide transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Redeem Reward Now</span>
                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition border border-zinc-200 dark:border-transparent flex items-center justify-center cursor-pointer"
              >
                Done
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
