'use client';

import { FormEvent, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { StatusPill } from '@/components/StatusPill';
import { configuredAdminEmail, firebaseAuth, firebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardAuthenticationPage() {
  const router = useRouter();
  const [email, setEmail] = useState(configuredAdminEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = firebaseAuth;
    if (!auth || !configuredAdminEmail) return;
    return onAuthStateChanged(auth, async (user) => {
      if (user?.email?.toLowerCase() === configuredAdminEmail) router.replace('/pilotapp/firstplay/dashboard');
      else if (user) await signOut(auth);
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (!firebaseConfigured || !firebaseAuth || !configuredAdminEmail) {
      setMessage('Firebase is not configured yet. Add the browser Firebase keys and the single admin email to continue.');
      return;
    }
    const auth = firebaseAuth;
    if (email.trim().toLowerCase() !== configuredAdminEmail) {
      setMessage('This dashboard is restricted to the configured administrator email.');
      return;
    }
    setBusy(true);
    try {
      const credentials = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (credentials.user.email?.toLowerCase() !== configuredAdminEmail) {
        await signOut(auth);
        throw new Error('This account is not allowlisted for the dashboard.');
      }
      router.replace('/pilotapp/firstplay/dashboard');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center px-5 py-16 sm:px-8">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-[22px] border border-line bg-white shadow-soft md:grid-cols-[.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-ink p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cobalt/30 blur-2xl" />
          <BrandMark compact />
          <div className="relative mt-20 max-w-[300px]"><p className="eyebrow text-blue-300">Restricted workspace</p><h1 className="mt-4 text-4xl font-black leading-[.98] tracking-[-.07em]">A clear view of how FirstPlay is growing.</h1><p className="mt-5 text-sm leading-6 text-white/55">The dashboard is a private operations surface for the one configured FirstPlay administrator.</p></div>
          <div className="relative mt-20 flex items-center gap-3 text-xs text-white/55"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><ShieldCheck size={15} className="text-lime" /></span> Firebase Authentication · single email allowlist</div>
        </div>
        <div className="p-8 sm:p-12">
          <div className="flex items-center justify-between gap-4"><div><p className="section-kicker">Dashboard authentication</p><h2 className="mt-3 text-2xl font-black tracking-[-.05em] text-ink">Sign in to continue.</h2></div><StatusPill tone={firebaseConfigured ? 'success' : 'warning'}>{firebaseConfigured ? 'Firebase ready' : 'Setup needed'}</StatusPill></div>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <label><span className="field-label">Admin email <span className="field-required">*</span></span><input className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" autoComplete="email" /></label>
            <label><span className="field-label">Password <span className="field-required">*</span></span><div className="relative"><KeyRound size={15} className="absolute left-3 top-3.5 text-slate-400" /><input className="field-input pl-9" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your Firebase password" autoComplete="current-password" /></div></label>
            <div className="rounded-[10px] border border-line bg-mist p-3 text-[11px] leading-5 text-slate-500"><LockKeyhole size={13} className="mr-1 inline text-cobalt" />Only the one environment-configured email can enter this workspace. Other Firebase accounts are signed out immediately.</div>
            {message && <div className="rounded-[10px] border border-[#f0caca] bg-[#fff4f4] px-4 py-3 text-xs leading-5 text-[#c24b4b]">{message}</div>}
            <button className="portal-button portal-button-cobalt w-full" type="submit" disabled={busy}>{busy ? 'Checking credentials…' : <>Open dashboard <ArrowRight size={15} /></>}</button>
          </form>
          <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">Private route: /pilotapp/firstplay/dashboard/authentication</p>
        </div>
      </div>
    </div>
  );
}
