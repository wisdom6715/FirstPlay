import React, { useState } from 'react';
import SpinWheel from '../components/SpinWheel';
import CongratulationsModal from '../components/CongratulationsModal';
import { 
  spinGiftService, 
  calculateSpinOutcome, 
  WHEEL_SEGMENTS 
} from '../services/spinGiftService';
import { 
  RotateCw, 
  Clock, 
  Gift, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboardUtils';

export default function GiftsView({ onNavigateGames }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetOutcome, setTargetOutcome] = useState(null);
  const [wonModalItem, setWonModalItem] = useState(null);
  const [myGifts, setMyGifts] = useState(() => spinGiftService.getLocalWonGifts());
  const [playtimeSeconds, setPlaytimeSeconds] = useState(() => spinGiftService.getPlaytimeSeconds());
  const [copiedCode, setCopiedCode] = useState(null);

  // Playtime requirement: 2 hours = 7200 seconds
  const REQUIRED_PLAYTIME_SECONDS = 7200;
  const isPlaytimeUnlocked = playtimeSeconds >= REQUIRED_PLAYTIME_SECONDS;

  // Sync gifts when needed
  const refreshGifts = () => {
    setMyGifts(spinGiftService.getLocalWonGifts());
  };

  const handleStartSpin = () => {
    if (isSpinning) return;

    // Pick outcome with the strict requested probability:
    // 30% for 0GB, 50% for 500MB-2GB, 20% for 3GB+
    const outcome = calculateSpinOutcome();
    setIsSpinning(true);
    setTargetOutcome(outcome);
  };

  const handleSpinEnd = async (wonSegment) => {
    setIsSpinning(false);
    setTargetOutcome(null);

    if (wonSegment.amount > 0) {
      // Record won gift in Firebase collection 'spin_gift'
      const savedGift = await spinGiftService.recordWonGift(wonSegment);
      refreshGifts();
      setWonModalItem(savedGift || wonSegment);
    } else {
      // 0 GB
      setWonModalItem(wonSegment);
    }

    spinGiftService.recordSpinTime();
  };

  const handleCopyCode = async (code) => {
    if (!code) return;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleOpenRedeem = (item) => {
    const url = item.redeem_url || `https://firstplay.fun/redeem?code=${item.code}`;
    if (window.firstPlayAPI?.openExternal) {
      window.firstPlayAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleGrantTestPlaytime = () => {
    const updated = spinGiftService.addPlaytimeSeconds(REQUIRED_PLAYTIME_SECONDS);
    setPlaytimeSeconds(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-6 space-y-8 select-none">
      
      {/* Header matching media_1791543505455.png */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Gifts & Rewards
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium">
          Play any game for 2h to unlock spin
        </p>
      </div>

      {/* Spinning Wheel Section */}
      <div className="flex flex-col items-center justify-center">
        <SpinWheel
          isSpinning={isSpinning}
          targetOutcome={targetOutcome}
          onSpinStart={handleStartSpin}
          onSpinEnd={handleSpinEnd}
          disabled={isSpinning}
        />

        {/* Action Button matching media_1791543505455.png */}
        <div className="w-full max-w-md mt-6 px-4 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={handleStartSpin}
            disabled={isSpinning}
            className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
              isSpinning
                ? 'bg-zinc-700/60 text-zinc-400 cursor-not-allowed'
                : 'bg-[#52525b]/80 hover:bg-[#60606a] text-white active:scale-[0.99] border border-white/10'
            }`}
          >
            <RotateCw size={16} className={isSpinning ? 'animate-spin' : ''} />
            <span>
              {isSpinning 
                ? 'Spinning the Wheel...' 
                : isPlaytimeUnlocked 
                ? 'Spin Wheel (Unlocked!)' 
                : 'Play any game for 2h to unlock'}
            </span>
          </button>

          {/* Playtime Progress & Quick Spin Pass */}
          <div className="flex items-center justify-between w-full text-[11px] text-zinc-400 px-1">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#0a84ff]" />
              <span>
                Playtime: {Math.floor(playtimeSeconds / 3600)}h {Math.floor((playtimeSeconds % 3600) / 60)}m / 2h
              </span>
            </span>

            {!isPlaytimeUnlocked && (
              <button
                type="button"
                onClick={handleGrantTestPlaytime}
                className="text-[#0a84ff] hover:text-blue-300 transition-colors underline cursor-pointer text-[10px]"
                title="Instant test pass for gameplay unlocked status"
              >
                Claim instant spin pass
              </button>
            )}
          </div>
        </div>
      </div>

      {/* "My Won Gifts" Section */}
      <div className="max-w-xl mx-auto space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <Gift size={16} className="text-[#0a84ff]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              My Won Gifts ({myGifts.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">Rewards History</span>
        </div>

        {myGifts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#16161a]/60 border border-white/[0.06] text-center space-y-1">
            <p className="text-xs font-medium text-zinc-300">No reward vouchers won yet</p>
            <p className="text-[11px] text-zinc-500">Spin the wheel to win instant data gifts and vouchers.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myGifts.map((item, idx) => {
              const isUsed = item.status === 'used';
              return (
                <div
                  key={item.id || `gift-${idx}`}
                  className="p-3.5 rounded-2xl bg-[#16161a] border border-white/[0.08] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUsed ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-500/15 text-[#0a84ff]'
                    }`}>
                      <Gift size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{item.gift}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isUsed 
                            ? 'bg-zinc-800 text-zinc-400' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isUsed ? 'Already Redeemed' : 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-zinc-300 font-semibold select-all">
                          {item.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.code)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors cursor-pointer text-[10px]"
                          title="Copy Code"
                        >
                          {copiedCode === item.code ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
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
                        onClick={() => handleOpenRedeem(item)}
                        className="px-3.5 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0055dd] text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/30"
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

      {/* Won Congratulations Modal */}
      {wonModalItem && (
        <CongratulationsModal
          wonItem={wonModalItem}
          onClose={() => {
            setWonModalItem(null);
            refreshGifts();
          }}
        />
      )}

    </div>
  );
}
