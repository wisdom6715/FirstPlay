import type { CSSProperties } from 'react';
import { categoryNameField, categoryUrlField, isHttpUrl, isListingCategory, type ListingCategory } from '@/lib/listing-schema';

export type DiscoverFilter =
  | 'all'
  | 'game'
  | 'app'
  | 'product'
  | 'action'
  | 'adventure'
  | 'casual'
  | 'multiplayer'
  | 'puzzle'
  | 'racing'
  | 'simulation'
  | 'sports'
  | 'retro';

export type GameGenre = DiscoverFilter;

export type Listing = {
  id: string;
  category: ListingCategory;
  name: string;
  studio: string;
  url: string;
  image: string;
  coverImage?: string;
  description?: string;
  genre?: GameGenre;
  plays?: string;
  rating?: number;
  rank?: number;
  tags?: string[];
  createdAt: number;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  url: string;
  placement: 'all' | 'discover' | 'category';
};

export type DiscoverData = { listings: Listing[]; banners: Banner[]; demo: boolean };

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'firstplay-7bd63';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDzEwZ17vr_dQr4GwKt7g9_HJyNg1dZvaQ';
const REVALIDATE_SECONDS = 60;

type FsValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  timestampValue?: string;
  nullValue?: null;
};
type FsDoc = { name: string; fields?: Record<string, FsValue> };

const str = (v?: FsValue) => v?.stringValue ?? '';
const ms = (v?: FsValue) => (v?.timestampValue ? Date.parse(v.timestampValue) : 0);
const safeUrl = (value: string) => {
  if (!value) return '';
  if (value.startsWith('data:image/')) return value;
  return isHttpUrl(value) ? value : '';
};

/** Known domains that block iframes via X-Frame-Options: SAMEORIGIN / CSP frame-ancestors */
export const FRAME_RESTRICTED_DOMAINS = new Set([
  'lagoslife.app',
  'www.lagoslife.app'
]);

export function isFrameRestricted(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return FRAME_RESTRICTED_DOMAINS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Resolves play URL: Returns clean direct URL for native iframe loading. */
export function resolvePlayUrl(_category: ListingCategory, rawUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.includes('/api/play?url=')) {
    const idx = rawUrl.indexOf('url=');
    const encoded = rawUrl.slice(idx + 4);
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }
  return rawUrl;
}

// Public reads go through the Firestore REST API so the page is cached by Next (ISR)
async function listCollection(name: string): Promise<FsDoc[]> {
  const params = new URLSearchParams({ pageSize: '300' });
  if (API_KEY) params.set('key', API_KEY);
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${name}?${params}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  if (!res.ok) throw new Error(`Firestore ${name} responded ${res.status}`);
  const json = (await res.json()) as { documents?: FsDoc[] };
  return json.documents ?? [];
}

function toListing(doc: FsDoc, index = 0): Listing | null {
  const f = doc.fields ?? {};
  const category = str(f.category);
  if (!isListingCategory(category)) return null;
  const expires = ms(f.expiry_date);
  if (expires && expires < Date.now()) return null;
  const name = str(f[categoryNameField(category)]);
  if (!name) return null;
  const rawUrl = safeUrl(str(f[categoryUrlField(category)]));

  const bannerImg = safeUrl(str(f.banner_url));
  const logoImg = safeUrl(str(category === 'product' ? f.flyer : f.logo));
  const ratingNum = Number(f.rating?.integerValue || f.rating?.stringValue) || 5.0;
  const playsCount = str(f.plays_count) || (f.plays_count?.integerValue ? `${f.plays_count.integerValue} plays` : '1.2k');

  return {
    id: doc.name.split('/').pop() ?? name,
    category,
    name,
    studio: str(f.full_name) || 'Independent Studio',
    url: resolvePlayUrl(category, rawUrl),
    image: logoImg || bannerImg,
    coverImage: bannerImg || logoImg,
    description: str(f.description) || str(f.tagline),
    rating: ratingNum,
    plays: playsCount,
    rank: index + 1,
    genre: (str(f.genre) as GameGenre) || 'action',
    createdAt: ms(f.created_at)
  };
}

function toBanner(doc: FsDoc): (Banner & { createdAt: number }) | null {
  const f = doc.fields ?? {};
  if (f.active?.booleanValue !== true) return null;
  const image = safeUrl(str(f.image_url));
  if (!image) return null;
  const placement = str(f.placement);
  return {
    id: doc.name.split('/').pop() ?? image,
    title: str(f.title),
    subtitle: str(f.subtitle),
    badge: str(f.badge_text) || 'PROMOTED',
    image,
    url: safeUrl(str(f.target_url)),
    placement: placement === 'discover' || placement === 'category' ? placement : 'all',
    createdAt: ms(f.created_at)
  };
}

export async function getDiscoverData(): Promise<DiscoverData> {
  try {
    const [apps, promos] = await Promise.all([listCollection('apps'), listCollection('promotion_banner')]);
    const liveListings = apps
      .map((doc, idx) => toListing(doc, idx))
      .filter((x): x is Listing => x !== null)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const liveBanners = promos
      .map(toBanner)
      .filter((x): x is Banner & { createdAt: number } => x !== null)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(({ createdAt: _createdAt, ...banner }) => banner);

    return {
      listings: liveListings,
      banners: liveBanners,
      demo: false
    };
  } catch (error) {
    console.warn('FirstPlay: could not read Firestore apps/banners.', error);
    return {
      listings: [],
      banners: [],
      demo: false
    };
  }
}

/* ---------- presentation helpers ---------- */

export const CATEGORY_LABEL: Record<ListingCategory, string> = { game: 'Games', app: 'Apps', product: 'Products' };
export const CATEGORY_SINGULAR: Record<ListingCategory, string> = { game: 'Game', app: 'App', product: 'Product' };
export const CATEGORY_ACTION: Record<ListingCategory, string> = { game: 'Play', app: 'Open', product: 'View' };

function hue(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/** Stable gradient colours per listing, used when there is no artwork. */
export function artStyle(seed: string): CSSProperties {
  const h = hue(seed);
  return {
    ['--g' as string]: `linear-gradient(135deg, hsl(${h} 80% 46%), hsl(${(h + 50) % 360} 85% 38%))`,
    ['--g2' as string]: `linear-gradient(135deg, hsl(${h} 78% 52%), hsl(${(h + 40) % 360} 80% 40%))`
  };
}

export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/** Empty mock arrays retained strictly for backwards type compatibility; zero mock data loaded */
export const SAMPLE_LISTINGS: Listing[] = [];
export const SAMPLE_BANNERS: Banner[] = [];
