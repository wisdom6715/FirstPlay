import { Play } from 'lucide-react';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-white shadow-sm">
        <span className="absolute left-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-cobalt" />
        <span className="absolute bottom-[7px] right-[7px] h-1.5 w-1.5 rounded-full bg-lime" />
        <Play size={12} fill="currentColor" strokeWidth={1.6} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-black tracking-[-0.04em] text-ink">FirstPlay</span>
        {!compact && <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Advertiser portal</span>}
      </span>
    </span>
  );
}
