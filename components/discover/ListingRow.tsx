'use client';

import { CATEGORY_ACTION, CATEGORY_SINGULAR, type Listing } from '@/lib/discover';
import { Icon } from './Art';

/** One line in a charts-style list: icon, name, studio, action pill. */
export function ListingRow({
  item,
  onClick
}: {
  item: Listing;
  onClick?: (item: Listing) => void;
}) {
  const content = (
    <>
      <Icon
        item={item}
        className="h-[60px] w-[60px] sm:h-[66px] sm:w-[66px] shrink-0 shadow-[0_6px_16px_rgba(20,24,70,0.22)] ring-1 ring-white/15 text-2xl"
      />
      <div className="min-w-0 flex-1 text-left">
        <b className="block truncate text-base font-extrabold tracking-tight text-fp-text group-hover:text-fp-accent transition">
          {item.name}
        </b>
        <span className="block truncate text-xs sm:text-sm text-fp-muted">
          {item.studio || CATEGORY_SINGULAR[item.category]}
        </span>
      </div>
      <span className="shrink-0 rounded-full bg-fp-pill px-5 py-1.5 text-xs sm:text-sm font-extrabold text-fp-pill-text backdrop-blur-md transition group-hover:bg-fp-accent group-hover:text-white">
        {CATEGORY_ACTION[item.category]}
      </span>
    </>
  );

  const cls =
    'group flex w-full min-w-0 snap-start items-center gap-4 border-b border-fp-line py-[14px] transition hover:bg-fp-glass/40 rounded-2xl px-2 [.fp-rail_&:nth-child(3n)]:border-transparent cursor-pointer';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(item)}
        className={cls}
        aria-label={`${CATEGORY_ACTION[item.category]} ${item.name}`}
      >
        {content}
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
        aria-label={`${CATEGORY_ACTION[item.category]} ${item.name}`}
      >
        {content}
      </a>
    );
  }

  return <div className={cls}>{content}</div>;
}
