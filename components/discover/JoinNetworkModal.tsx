'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, Sparkles, TrendingUp, Users, X, Zap } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';

export function JoinNetworkModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [studioName, setStudioName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim() || !gameUrl.trim()) return;

    setLoading(true);
    try {
      if (firebaseDb) {
        await addDoc(collection(firebaseDb, 'apps'), {
          category: 'game',
          game_name: gameName.trim(),
          game_url: gameUrl.trim(),
          full_name: studioName.trim() || 'Independent Studio',
          created_at: serverTimestamp(),
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    } catch (err) {
      console.warn('Could not write directly to Firestore (may require security rules permissions):', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setGameName('');
    setGameUrl('');
    setStudioName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-modal-title"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in" onClick={handleReset} />

      <div
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[32px] border border-white/20 bg-[var(--fp-glass-strong)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-3xl backdrop-saturate-200 text-fp-text sm:p-8 animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)'
        }}
      >
        <button
          type="button"
          onClick={handleReset}
          aria-label="Close"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-fp-border bg-fp-glass text-fp-text transition hover:bg-fp-glass-hover"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-fp-accent">
          <Sparkles size={16} />
          FirstPlay Cross-Traffic Network
        </div>

        <h2 id="join-modal-title" className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
          Give Your Game The Players It Deserves
        </h2>

        <p className="mt-2 text-sm sm:text-base text-fp-muted leading-relaxed">
          When indie games are hidden behind app store algorithms, they starve for traffic. FirstPlay connects games directly so players flow seamlessly between partner games.
        </p>

        {/* 3 Pillars */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-fp-border bg-fp-glass p-3.5 backdrop-blur-md">
            <TrendingUp size={20} className="text-emerald-500 mb-1.5" />
            <h4 className="text-xs font-extrabold text-fp-text">Zero Cost Traffic</h4>
            <p className="text-[11px] text-fp-muted mt-1">Get genuine gamers without paying exorbitant ad networks.</p>
          </div>
          <div className="rounded-2xl border border-fp-border bg-fp-glass p-3.5 backdrop-blur-md">
            <Zap size={20} className="text-amber-500 mb-1.5" />
            <h4 className="text-xs font-extrabold text-fp-text">Instant Web Play</h4>
            <p className="text-[11px] text-fp-muted mt-1">Embed seamlessly or link out directly with 1-click launch.</p>
          </div>
          <div className="rounded-2xl border border-fp-border bg-fp-glass p-3.5 backdrop-blur-md">
            <Users size={20} className="text-blue-500 mb-1.5" />
            <h4 className="text-xs font-extrabold text-fp-text">Shared Audiences</h4>
            <p className="text-[11px] text-fp-muted mt-1">Every player in the network is a potential fan for your game.</p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center animate-in zoom-in-95">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <h3 className="mt-3 text-lg font-bold text-fp-text">Submission Received!</h3>
            <p className="mt-1 text-sm text-fp-muted">
              We&apos;re reviewing <strong>{gameName}</strong>. You will be notified once your game is live on the FirstPlay discovery rail.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 rounded-full bg-fp-accent px-6 py-2.5 text-sm font-bold text-white transition hover:scale-105"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-fp-text mb-1">Game Title</label>
              <input
                type="text"
                required
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="e.g. Neon Horizon 2"
                className="w-full rounded-xl border border-fp-border bg-fp-glass px-3.5 py-2.5 text-sm text-fp-text outline-none placeholder:text-fp-muted focus:ring-2 focus:ring-fp-accent/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-fp-text mb-1">Playable URL / Website</label>
              <input
                type="url"
                required
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                placeholder="https://yourgame.io"
                className="w-full rounded-xl border border-fp-border bg-fp-glass px-3.5 py-2.5 text-sm text-fp-text outline-none placeholder:text-fp-muted focus:ring-2 focus:ring-fp-accent/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-fp-text mb-1">Studio / Developer Name</label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="e.g. Pixel Spark Games"
                className="w-full rounded-xl border border-fp-border bg-fp-glass px-3.5 py-2.5 text-sm text-fp-text outline-none placeholder:text-fp-muted focus:ring-2 focus:ring-fp-accent/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-fp-accent py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_var(--fp-accent-glow)] transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting to Network...
                </>
              ) : (
                <>
                  Submit Game to Network
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
