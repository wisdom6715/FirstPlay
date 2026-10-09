export function StatusPill({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger'; children: React.ReactNode }) {
  const colors = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-500',
    success: 'border-[#d6ebc8] bg-[#f2faed] text-[#5c9c38]',
    warning: 'border-[#f0dfb6] bg-[#fff9ec] text-[#a57616]',
    danger: 'border-[#f0caca] bg-[#fff4f4] text-[#c24b4b]'
  } as const;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${colors[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}
