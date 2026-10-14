import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
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

  const isZero = wonItem.amount === 0 || wonItem.amount_mb === 0;
  const giftName = wonItem.gift || `${wonItem.amountLabel || wonItem.amount} ${wonItem.subLabel || 'Data'}`;
  const code = wonItem.code || wonItem.redemptionCode || '';
  const redeemUrl = wonItem.redeem_url || `/redeem?code=${code}`;

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#16161b] border border-white/15 rounded-3xl p-6 sm:p-7 text-center space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full blur-3xl pointer-events-none ${
          isZero ? 'bg-zinc-600/10' : 'bg-blue-600/25'
        }`} />

        {/* Close Icon Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {isZero ? (
          /* 0 GB Result State */
          <>
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
              <span className="text-2xl font-bold">0</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                No Data This Time
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Don't worry! Keep exploring and playing games to unlock your next daily spin.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-full bg-white text-black font-bold text-xs tracking-wide hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          /* Winning Congratulation State */
          <>
            {/* Top Celebration Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0066ff]/20 border border-[#0066ff]/40 flex items-center justify-center text-[#0a84ff] shadow-lg shadow-blue-500/20">
                <Gift size={32} />
              </div>
              <Sparkles size={18} className="absolute -top-1 -right-1 text-amber-400 animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#0a84ff] uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                LUCKY WINNER
              </span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight mt-2.5">
                Congratulations!
              </h3>
              <p className="text-sm font-semibold text-emerald-400 mt-1">
                You won {giftName}!
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Copy your unique code and visit our website to redeem your data gift.
              </p>
            </div>

            {/* Redeem Code Card */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                Your Unique Redemption Code
              </span>
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <span className="font-mono text-sm font-bold text-white tracking-wider truncate select-all">
                  {code}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-[11px] font-semibold text-[#0a84ff] hover:text-blue-300 transition-colors shrink-0 cursor-pointer"
                  title="Copy code to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleRedeemAction}
                className="w-full h-11 rounded-full bg-[#0066ff] hover:bg-[#0055dd] text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Redeem Reward Now</span>
                <ExternalLink size={13} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center cursor-pointer"
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
