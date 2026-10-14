import React, { useState, useEffect } from 'react';
import SpinWheel from '../components/SpinWheel';
import CongratulationsModal from '../components/CongratulationsModal';
import { rewardService } from '../services/rewardService';
import { 
  RotateCw, 
  Clock, 
  Gift, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboardUtils';

export default function GiftsView({ onNavigateTab, onNavigateGames }) {
  const [segments, setSegments] = useState([]);
  const [isLoadingWheel, setIsLoadingWheel] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetOutcome, setTargetOutcome] = useState(null);
  const [wonModalItem, setWonModalItem] = useState(null);
  const [myGifts, setMyGifts] = useState(() => rewardService.getLocalWonGifts());
  const [playtimeSeconds, setPlaytimeSeconds] = useState(() => rewardService.getPlaytimeSeconds());
  const [copiedCode, setCopiedCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Playtime requirement: 2 hours = 7200 seconds
  const REQUIRED_PLAYTIME_SECONDS = 7200;
  const isPlaytimeUnlocked = playtimeSeconds >= REQUIRED_PLAYTIME_SECONDS;

  // Load active 6-segment configuration on mount
  useEffect(() => {
    async function fetchWheel() {
      setIsLoadingWheel(true);
      try {
        const res = await rewardService.getWheelConfig();
        if (res?.segments && Array.isArray(res.segments) && res.segments.length === 6) {
          setSegments(res.segments);
        }
      } catch (err) {
        console.error('[GiftsView] Failed to load wheel:', err);
      } finally {
        setIsLoadingWheel(false);
      }
    }
    fetchWheel();
  }, []);

  const refreshGifts = () => {
    setMyGifts(rewardService.getLocalWonGifts());
  };

  const handleStartSpin = async () => {
    if (isSpinning) return;
    setErrorMessage(null);
    setIsSpinning(true);

    try {
      // Authoritative spin resolution on backend
      const res = await rewardService.executeSpin('player_session', 'Player');
      
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to spin wheel. Please try again.');
        setIsSpinning(false);
        return;
      }

      // Pass outcome to SpinWheel component to animate
      setTargetOutcome({
        segmentIndex: res.segmentIndex,
        segment: res.segment,
        reward: res.reward
      });
    } catch (err) {
      console.error('[GiftsView] Spin error:', err);
      setErrorMessage('Network error while spinning. Please try again.');
      setIsSpinning(false);
    }
  };

  const handleSpinEnd = (wonSegment) => {
    setIsSpinning(false);
    const currentTarget = targetOutcome;
    setTargetOutcome(null);

    refreshGifts();

    if (currentTarget?.reward) {
      // Won positive reward with generated 24h code
      setWonModalItem({
        ...wonSegment,
        code: currentTarget.reward.redemptionCode,
        redemptionCode: currentTarget.reward.redemptionCode,
        gift: `${currentTarget.reward.quantity} ${currentTarget.reward.unit || 'MB'}`
      });
    } else {
      // 0 MB or zero outcome
      setWonModalItem(wonSegment);
    }
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

  const handleGrantTestPlaytime = () => {
    const updated = rewardService.addPlaytimeSeconds(REQUIRED_PLAYTIME_SECONDS);
    setPlaytimeSeconds(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8 select-none">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#0a84ff] text-xs font-semibold">
          <Sparkles size={13} />
          <span>Dynamic Spin & Win</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Rewards Wheel
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium">
          Play any game for 2 hours to unlock your daily lucky spin
        </p>
      </div>

      {errorMessage && (
        <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Six-Segment Wheel Section */}
      <div className="flex flex-col items-center justify-center">
        {isLoadingWheel ? (
          <div className="w-[340px] h-[340px] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Loading rewards...</p>
          </div>
        ) : (
          <SpinWheel
            segments={segments}
            isSpinning={isSpinning}
            targetOutcome={targetOutcome}
            onSpinStart={handleStartSpin}
            onSpinEnd={handleSpinEnd}
            disabled={isSpinning}
          />
        )}

        {/* Action Button & Gameplay Progress */}
        <div className="w-full max-w-md mt-6 px-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleStartSpin}
            disabled={isSpinning || isLoadingWheel}
            className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
              isSpinning || isLoadingWheel
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                : 'bg-[#0066ff] hover:bg-[#0055dd] text-white active:scale-[0.99] border border-blue-400/30 shadow-blue-600/30'
            }`}
          >
            <RotateCw size={16} className={isSpinning ? 'animate-spin' : ''} />
            <span>
              {isSpinning 
                ? 'Spinning the Wheel...' 
                : isPlaytimeUnlocked 
                ? 'Spin Now!' 
                : 'Play 2h to Unlock Spin'}
            </span>
          </button>

          {/* Playtime Progress & Instant Spin Unlock */}
          <div className="flex items-center justify-between w-full text-[11px] text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#0a84ff]" />
              <span>
                Playtime: {Math.floor(playtimeSeconds / 3600)}h {Math.floor((playtimeSeconds % 3600) / 60)}m / 2h
              </span>
            </span>

            {!isPlaytimeUnlocked && (
              <button
                type="button"
                onClick={handleGrantTestPlaytime}
                className="text-[#0a84ff] hover:text-blue-300 transition-colors underline cursor-pointer text-[11px] font-semibold"
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
          <span className="text-[11px] text-zinc-500 font-mono">24h Expiry</span>
        </div>

        {myGifts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#16161a]/60 border border-white/[0.06] text-center space-y-1">
            <p className="text-xs font-semibold text-zinc-300">No rewards won yet</p>
            <p className="text-[11px] text-zinc-500">Spin the wheel to win instant mobile data and gifts.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myGifts.map((item, idx) => {
              const isUsed = item.status === 'used' || item.isUsed === true;
              return (
                <div
                  key={item.id || item.code || `gift-${idx}`}
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
                        <span className="font-bold text-white truncate">{item.gift || item.amountLabel}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isUsed 
                            ? 'bg-zinc-800 text-zinc-400' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isUsed ? 'Redeemed' : 'Active (Valid 24h)'}
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
                        onClick={() => handleRedeemClick(item.code)}
                        className="px-3.5 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0055dd] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/30"
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
          onRedeem={(code) => {
            setWonModalItem(null);
            handleRedeemClick(code);
          }}
        />
      )}

    </div>
  );
}
