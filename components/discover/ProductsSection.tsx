'use client';

import { ExternalLink, Package, ShieldCheck, Sparkles } from 'lucide-react';
import type { Listing } from '@/lib/discover';
import { artStyle, initials } from '@/lib/discover';

export function ProductsSection({
  products,
  onOpenModal,
  onSeeAll
}: {
  products: Listing[];
  onOpenModal: (product: Listing) => void;
  onSeeAll?: () => void;
}) {
  return (
    <section id="digital-products" className="mt-10 sm:mt-14" aria-labelledby="products-heading">
      <div className="mb-4 flex items-baseline justify-between border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="products-heading" className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-[-0.03em] text-slate-900">
              Digital Products
            </h2>
            <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-100">
              <Package size={12} />
              Products
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Featured digital goods, subscriptions, and tools curated for creators and developers
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

      {products.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200/90 bg-white/90 p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-700">No products listed yet.</p>
          <p className="mt-1 text-xs text-slate-500">Promote your digital product to reach high-intent customers!</p>
          <a
            href="/promote"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Promote Your Product ↗
          </a>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((prod) => (
            <div
              key={prod.id}
              onClick={() => onOpenModal(prod)}
              className="group relative flex cursor-pointer flex-col justify-between rounded-[22px] sm:rounded-[26px] border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:bg-white hover:border-purple-300 hover:shadow-[0_8px_24px_rgba(147,51,234,0.08)]"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  {/* Product Icon */}
                  <div className="relative shrink-0">
                    {prod.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-13 w-13 sm:h-14 sm:w-14 rounded-[22.5%] object-cover shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105"
                      />
                    ) : (
                      <div
                        style={artStyle(prod.name)}
                        className="grid h-13 w-13 sm:h-14 sm:w-14 place-items-center rounded-[22.5%] text-lg font-black text-white shadow-sm"
                      >
                        {initials(prod.name)}
                      </div>
                    )}
                  </div>

                  {/* Product Title & Brand */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-base font-extrabold tracking-tight text-slate-900 group-hover:text-purple-600 transition">
                        {prod.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                        Product
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>{prod.studio}</span>
                      <span>•</span>
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span className="text-[11px] text-emerald-600">Verified</span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
                  {prod.description || `${prod.name} is an official digital product featured on FirstPlay.`}
                </p>
              </div>

              {/* Action Bar */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold text-slate-400">
                  Direct Verified Link
                </span>

                <a
                  href={prod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-full border border-purple-200/80 bg-purple-50 px-3.5 py-1.5 text-xs font-extrabold text-purple-700 transition group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:shadow-sm"
                >
                  <ExternalLink size={12} />
                  View Product ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
