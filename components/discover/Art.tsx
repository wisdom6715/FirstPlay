/* eslint-disable @next/next/no-img-element -- listing artwork comes from arbitrary hosts (Firebase Storage or studio sites) */
import { artStyle, initials, type Listing } from '@/lib/discover';

/** Square app/game icon. Falls back to an initials badge when a studio has not uploaded a logo. */
export function Icon({ item, className = '' }: { item: Listing; className?: string }) {
  if (item.image) {
    return <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" className={`aspect-square rounded-[22.5%] object-cover ${className}`} />;
  }
  return (
    <div
      style={{ ...artStyle(item.name), background: 'var(--g2)' }}
      className={`grid aspect-square place-items-center rounded-[22.5%] font-extrabold text-white ${className}`}
      aria-hidden="true"
    >
      {initials(item.name)}
    </div>
  );
}

export function Cover({ src, className = '' }: { src: string; className?: string }) {
  return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className={className} />;
}
