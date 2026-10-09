'use client';

import { AppWindow, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import type { Listing } from '@/lib/discover';
import { artStyle, initials } from '@/lib/discover';

export function AppsSection({
  apps,
  onOpenModal,
  onSeeAll
}: {
  apps: Listing[];
  onOpenModal: (app: Listing) => void;
  onSeeAll?: () => void;
}) {
  return (
    <section id="web-apps" className="mt-10 sm:mt-14" aria-labelledby="web-apps-heading">
      <div className="mb-4 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="web-apps-heading" className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-[-0.03em] text-slate-900">
              Web Applications
            </h2>
            <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
              <AppWindow size={12} />
              Apps
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Handpicked web apps, browser tools, and interactive digital experiences
          </p>
        </div>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs sm:text-sm font-bold text-blue-600 transition hover:opacity-80"
          >
            See all ›
          </button>
        )}
      </div>

      {apps.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200/90 bg-white/90 p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-700">No web applications listed yet.</p>
          <p className="mt-1 text-xs text-slate-500">Promote your web app to reach thousands of users!</p>
          <a
            href="/promote"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Promote Your App ↗
          </a>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => onOpenModal(app)}
              className="group relative flex cursor-pointer flex-col justify-between rounded-[22px] sm:rounded-[26px] border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:bg-white hover:border-indigo-300 hover:shadow-[0_8px_24px_rgba(79,70,229,0.08)]"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  {/* App Icon */}
                  <div className="relative shrink-0">
                    {app.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={app.image}
                        alt={app.name}
                        className="h-13 w-13 sm:h-14 sm:w-14 rounded-[22.5%] object-cover shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105"
                      />
                    ) : (
                      <div
                        style={artStyle(app.name)}
                        className="grid h-13 w-13 sm:h-14 sm:w-14 place-items-center rounded-[22.5%] text-lg font-black text-white shadow-sm"
                      >
                        {initials(app.name)}
                      </div>
                    )}
                  </div>

                  {/* App Title & Studio */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-base font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                        {app.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                        App
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>{app.studio}</span>
                      <span>•</span>
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span className="text-[11px] text-emerald-600">Verified</span>
                    </p>
                  </div>
                </div>

                {/* App Description */}
                <p className="mt-3 text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
                  {app.description || `${app.name} is a high-performance web application accessible instantly in any browser.`}
                </p>
              </div>

              {/* Action Bar */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold text-slate-400">
                  {app.plays || '1.8k'} monthly users
                </span>

                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-indigo-50 px-3.5 py-1.5 text-xs font-extrabold text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-sm"
                >
                  <ExternalLink size={12} />
                  Open App ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
