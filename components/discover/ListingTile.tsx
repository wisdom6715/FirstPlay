'use client';

import { artStyle, CATEGORY_ACTION, CATEGORY_SINGULAR, type Listing } from '@/lib/discover';
import { Cover, Icon } from './Art';

/** Large artwork tile with a frosted caption and optional modal launch. */
export function ListingTile({
  item,
  onClick
}: {
  item: Listing;
  onClick?: (item: Listing) => void;
}) {
  const flyer = item.category === 'product' && item.image;
  const coverSrc = item.coverImage || item.image;

  const body = (
    <>
      {flyer ? (
        <Cover src={item.image} className="absolute inset-0 h-full w-full object-cover" />
      ) : coverSrc ? (
        <Cover
          src={coverSrc}
          className="absolute inset-0 h-full w-full object-cover brightness-[0.85] transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: 'var(--g)' }} />
      )}
      {!flyer && item.image && !item.coverImage && (
        <Icon
          item={item}
          className="absolute left-1/2 top-[44%] w-[38%] -translate-x-1/2 -translate-y-1/2 text-5xl shadow-[0_20px_44px_rgba(0,0,0,0.5)] ring-2 ring-white/20"
        />
      )}
      <div className="fp-glass-on-art absolute inset-x-3 bottom-3 rounded-2xl px-4 py-2.5">
        <b className="block truncate text-base tracking-tight">{item.name}</b>
        <span className="block truncate text-[13px] opacity-85">
          {item.studio || CATEGORY_SINGULAR[item.category]}
        </span>
      </div>
    </>
  );

  const cls =
    'group relative block aspect-[4/3] snap-start overflow-hidden rounded-[28px] shadow-glass transition duration-300 hover:-translate-y-1 isolate cursor-pointer border border-fp-border/60';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(item)}
        className={cls}
        style={artStyle(item.name)}
        aria-label={`${CATEGORY_ACTION[item.category]} ${item.name}`}
      >
        {body}
      </button>
    );
  }

  if (item.category === 'product' && item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        style={artStyle(item.name)}
        aria-label={`${CATEGORY_ACTION[item.category]} ${item.name}`}
      >
        {body}
      </a>
    );
  }

  return (
    <div className={cls} style={artStyle(item.name)}>
      {body}
    </div>
  );
}
