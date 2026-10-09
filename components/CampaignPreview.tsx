/* eslint-disable @next/next/no-img-element */
'use client';

import { ExternalLink, ImagePlus, Play, Sparkles } from 'lucide-react';

export type CampaignPreviewProps = {
  category: 'app' | 'game' | 'product';
  title: string;
  advertiser: string;
  tagline: string;
  description: string;
  url: string;
  mediaUrl?: string;
  mediaLabel?: string;
};

const categoryLabel: Record<CampaignPreviewProps['category'], string> = {
  game: 'Game showcase',
  app: 'Web application',
  product: 'Digital product'
};

export function CampaignPreview({ category, title, advertiser, tagline, description, url, mediaUrl, mediaLabel }: CampaignPreviewProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#dfe6f0] bg-[#111a2b] shadow-[0_18px_45px_rgba(23,32,51,.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-white/55">
        <span className="inline-flex items-center gap-1.5 text-blue-300"><Sparkles size={12} /> Live card preview</span>
        <span>Discover / categories</span>
      </div>
      <div className="relative m-3 overflow-hidden rounded-[13px] bg-[#1d2a40]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(37,99,235,.46),transparent_42%),linear-gradient(140deg,#1c304a,#172033_65%)]" />
        {mediaUrl ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={mediaUrl} alt="Campaign artwork preview" className="relative h-[205px] w-full object-cover opacity-80 mix-blend-screen" /></> : <div className="relative flex h-[205px] items-center justify-center text-white/20"><ImagePlus size={38} strokeWidth={1} /></div>}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d1421] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[.16em] text-blue-300">{categoryLabel[category]}</div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[21px] font-black tracking-[-.04em] text-white">{title || 'Your campaign name'}</h3>
              <p className="mt-1 truncate text-[11px] text-white/55">{tagline || description || 'Editorial pitch preview...'}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-ink"><Play size={10} fill="currentColor" /> Play</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-1 text-[11px] text-white/55">
        <span className="truncate">{advertiser || 'Advertiser or studio name'}</span>
        {url ? <span className="inline-flex shrink-0 items-center gap-1 text-blue-300"><ExternalLink size={11} /> Visit link</span> : <span>URL pending</span>}
      </div>
      {mediaLabel && <div className="border-t border-white/10 px-4 py-2 text-[10px] text-white/40">Media ready: {mediaLabel}</div>}
    </div>
  );
}
