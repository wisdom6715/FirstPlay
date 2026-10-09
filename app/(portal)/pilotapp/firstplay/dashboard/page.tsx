'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Activity, BarChart3, CalendarDays, ExternalLink, LogOut, MousePointerClick, PackageCheck, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MetricCard } from '@/components/MetricCard';
import { StatusPill } from '@/components/StatusPill';
import { configuredAdminEmail, firebaseAuth, firebaseConfigured } from '@/lib/firebase';

type DashboardData = { metrics: { total_listings: number; active_listings: number; daily_active_users: number; total_app_openings: number; daily_app_openings: number }; recent_listings: Array<{ id: string; full_name: string; category: string; name: string; created_at: string; expiry_date: string; is_active: boolean }>; setup?: string };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = firebaseAuth;
    if (!auth || !firebaseConfigured || !configuredAdminEmail) {
      setError('Firebase is not configured for this dashboard yet.');
      return;
    }
    return onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || currentUser.email?.toLowerCase() !== configuredAdminEmail) {
        if (currentUser) await signOut(auth);
        router.replace('/pilotapp/firstplay/dashboard/authentication');
        return;
      }
      setUser(currentUser);
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch('/api/dashboard/metrics', { headers: { Authorization: `Bearer ${token}` } });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Metrics could not be loaded.');
        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Metrics could not be loaded.');
      }
    });
  }, [router]);

  async function handleSignOut() {
    const auth = firebaseAuth;
    if (auth) await signOut(auth);
    router.replace('/pilotapp/firstplay/dashboard/authentication');
  }

  if (error) return <div className="mx-auto flex min-h-[calc(100vh-150px)] max-w-[700px] items-center px-5 py-16"><div className="w-full rounded-[18px] border border-[#f0dfb6] bg-[#fff9ec] p-8 text-center"><StatusPill tone="warning">Setup needed</StatusPill><h1 className="mt-4 text-2xl font-black tracking-[-.05em] text-ink">The dashboard is waiting for Firebase.</h1><p className="mx-auto mt-3 max-w-[480px] text-sm leading-6 text-slate-500">{error} Add the browser and server Firebase environment values, then return to the protected authentication route.</p><button className="portal-button portal-button-secondary mt-6" onClick={() => router.replace('/pilotapp/firstplay/dashboard/authentication')}>Back to authentication</button></div></div>;

  if (!user || !data) return <div className="mx-auto flex min-h-[calc(100vh-150px)] max-w-[1100px] items-center justify-center px-5 py-16 text-sm text-slate-400">Checking your private workspace…</div>;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-10 sm:px-8 lg:px-14 lg:pt-14">
      <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end"><div><p className="eyebrow">FirstPlay / Private dashboard</p><h1 className="mt-3 text-[clamp(2.3rem,5vw,4.2rem)] font-black leading-[.95] tracking-[-.07em] text-ink">Growth, without the guesswork.</h1><p className="mt-4 text-sm leading-6 text-slate-500">A compact view of listings, activity, and app openings across the FirstPlay ecosystem.</p></div><div className="flex items-center gap-3"><StatusPill tone="success">Authorized</StatusPill><button className="portal-button portal-button-secondary" onClick={handleSignOut}><LogOut size={14} /> Sign out</button></div></div>
      <div className="mt-8 flex items-center justify-between gap-4"><div><div className="section-kicker">At a glance</div><p className="mt-2 text-xs text-slate-400">Last sync from Firebase metrics collections</p></div><span className="text-xs font-semibold text-slate-400">{user.email}</span></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><MetricCard label="Total listings" value={data.metrics.total_listings.toLocaleString()} detail="all time" icon={PackageCheck} accent="ink" /><MetricCard label="Active listings" value={data.metrics.active_listings.toLocaleString()} detail="not expired" icon={Activity} accent="green" /><MetricCard label="Daily active users" value={data.metrics.daily_active_users.toLocaleString()} detail="today" icon={UsersRound} /><MetricCard label="Total app openings" value={data.metrics.total_app_openings.toLocaleString()} detail="all time" icon={BarChart3} /><MetricCard label="Daily app opens" value={data.metrics.daily_app_openings.toLocaleString()} detail="today" icon={MousePointerClick} /></div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[16px] border border-line bg-white p-5 shadow-card sm:p-6"><div className="flex items-center justify-between"><div><div className="section-kicker">Recent submissions</div><h2 className="mt-2 text-xl font-black tracking-[-.04em] text-ink">Latest campaign activity</h2></div><CalendarDays size={18} className="text-cobalt" /></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead><tr className="border-b border-line text-[10px] uppercase tracking-[.12em] text-slate-400"><th className="pb-3 font-bold">Listing</th><th className="pb-3 font-bold">Category</th><th className="pb-3 font-bold">Created</th><th className="pb-3 text-right font-bold">State</th></tr></thead><tbody>{data.recent_listings.map((listing) => <tr key={listing.id} className="border-b border-line last:border-0"><td className="py-4"><div className="text-xs font-bold text-ink">{listing.name || 'Untitled listing'}</div><div className="mt-1 text-[11px] text-slate-400">{listing.full_name}</div></td><td className="py-4 text-xs capitalize text-slate-500">{listing.category}</td><td className="py-4 text-xs text-slate-500">{listing.created_at}</td><td className="py-4 text-right"><StatusPill tone={listing.is_active ? 'success' : 'danger'}>{listing.is_active ? 'Active' : 'Expired'}</StatusPill></td></tr>)}</tbody></table>{data.recent_listings.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No listings have been submitted yet.</p>}</div></section>
        <section className="rounded-[16px] border border-line bg-mist/60 p-5 sm:p-6"><div className="section-kicker">Collection map</div><h2 className="mt-2 text-xl font-black tracking-[-.04em] text-ink">Metrics are ready for Firebase.</h2><p className="mt-3 text-sm leading-6 text-slate-500">The app can write daily activity into `metrics_daily/{'{yyyy-mm-dd}'}` while listings remain in the single `apps` collection.</p><div className="mt-6 space-y-3">{[['apps', 'Listings, timestamps, media URLs'], ['metrics_daily', 'Daily active users and app opens'], ['Firebase Auth', 'Single-email private access']].map(([name, detail]) => <div key={name} className="flex items-start gap-3 rounded-[11px] border border-white bg-white/75 p-3"><span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-[8px] bg-cobalt-soft text-cobalt"><Activity size={14} /></span><div><p className="text-xs font-bold text-ink">{name}</p><p className="mt-1 text-[11px] leading-4 text-slate-400">{detail}</p></div></div>)}</div><div className="mt-6 border-t border-line pt-5"><a href="/promote" className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt">Open promote flow <ExternalLink size={13} /></a></div></section>
      </div>
    </div>
  );
}
