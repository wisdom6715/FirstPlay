import type { LucideIcon } from 'lucide-react';

export function MetricCard({ label, value, detail, icon: Icon, accent = 'blue' }: { label: string; value: string; detail: string; icon: LucideIcon; accent?: 'blue' | 'green' | 'ink' }) {
  const accentClass = accent === 'green' ? 'bg-[#eef8e9] text-[#5c9c38]' : accent === 'ink' ? 'bg-[#eef1f6] text-ink' : 'bg-[#edf4ff] text-cobalt';
  return (
    <div className="rounded-[15px] border border-line bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${accentClass}`}><Icon size={17} strokeWidth={1.8} /></span>
        <span className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">Live</span>
      </div>
      <p className="mt-5 text-[12px] font-semibold text-slate-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2"><p className="font-mono text-[28px] font-bold tracking-[-.06em] text-ink">{value}</p><span className="text-[11px] text-slate-400">{detail}</span></div>
    </div>
  );
}
