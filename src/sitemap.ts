/**
 * FirstPlay Dynamic Sitemap & SEO URL Registry
 * Powers Google Search indexing, Image discovery, and Social Crawlers.
 */

export interface SitemapImage {
  loc: string;
  title?: string;
  caption?: string;
}

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: SitemapImage[];
}

export const SITE_URL = 'https://firstplay.app';

/**
 * Transforms string into a clean, search-engine friendly slug.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Standard Static Routes for FirstPlay
 */
export const STATIC_ROUTES: SitemapEntry[] = [
  {
    url: `${SITE_URL}/`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0,
    images: [
      {
        loc: `${SITE_URL}/firstplay_x_cover.jpg`,
        title: 'FirstPlay African Web Games & Digital Experiences',
        caption: 'Instant browser games platform featuring Lagos Life, Danfo Run, Monkey Post'
      },
      {
        loc: `${SITE_URL}/icon-512.png`,
        title: 'FirstPlay App Icon'
      }
    ]
  },
  {
    url: `${SITE_URL}/category`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.9
  },
  {
    url: `${SITE_URL}/search`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/promote`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
    images: [
      {
        loc: `${SITE_URL}/firstplay_x_cover.jpg`,
        title: 'Submit and Promote Your Nigerian and African Web Game'
      }
    ]
  },
  {
    url: `${SITE_URL}/favourite`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: `${SITE_URL}/settings`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.5
  }
];

/**
 * Mandatory Top Games that rank first on FirstPlay
 */
export const TOP_FEATURED_GAMES: Array<{
  name: string;
  slug: string;
  description: string;
  priority: number;
  logoUrl?: string;
  bannerUrl?: string;
}> = [
  {
    name: 'Lagos Life',
    slug: 'lagos-life',
    description: 'A Sims-style life game set in Lagos. Ride danfo, chop amala at Shitta, party at Quilox, survive NEPA and make real friends.',
    priority: 0.98,
    logoUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2F1791557081393_logo_Minimalist_Crown_Icon.png?alt=media&token=4bf19efe-c889-4a85-8ac9-6a9261cfdce4',
    bannerUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2F1791557086675_banner_ecf94e5fc0f6dd3569d4addfb4eac6bc2aed320d__1_.png?alt=media&token=f2b81c7c-35e4-49ab-9a5b-b742cfdb95a0'
  },
  {
    name: 'Danfo Run',
    slug: 'danfo-run',
    description: 'Drive the danfo from Ojuelegba to Yaba. Pick up passengers, dodge the go-slow and top the live leaderboard with Afrobeats soundtrack.',
    priority: 0.95,
    logoUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2FLagos%20Gaming%20Speed%20Logo.png?alt=media&token=b457f1a1-e33a-4510-929e-9d4f79d2bd3b',
    bannerUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2F1791550950504_banner_WhatsApp_Image_2026-10-08_at_3.47.45_PM.jpeg?alt=media&token=d7f943ba-ac56-4f67-bb49-eefb1079f060'
  },
  {
    name: 'Monkey Post',
    slug: 'monkey-post',
    description: 'Authentic Nigerian street football showdown. 2-on-2 mini post action, sharp turns, slick nutmegs, and raw street energy on the pitches of Lagos.',
    priority: 0.92,
    logoUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2FLagos%20Gaming%20Speed%20Logo.png?alt=media&token=b457f1a1-e33a-4510-929e-9d4f79d2bd3b',
    bannerUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2F1791557086675_banner_ecf94e5fc0f6dd3569d4addfb4eac6bc2aed320d__1_.png?alt=media&token=f2b81c7c-35e4-49ab-9a5b-b742cfdb95a0'
  },
  {
    name: 'myAbuja Life',
    slug: 'myabuja-life',
    description: 'Experience life in Nigeria’s capital city. Navigate Maitama, Wuse, business, politics, and high life in this premier Nigerian urban simulator.',
    priority: 0.90,
    logoUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2F1791557081393_logo_Minimalist_Crown_Icon.png?alt=media&token=4bf19efe-c889-4a85-8ac9-6a9261cfdce4',
    bannerUrl: 'https://firebasestorage.googleapis.com/v0/b/firstplay-7bd63.firebasestorage.app/o/promotions%2F1791550950504_banner_WhatsApp_Image_2026-10-08_at_3.47.45_PM.jpeg?alt=media&token=d7f943ba-ac56-4f67-bb49-eefb1079f060'
  }
];

/**
 * Builds the complete list of sitemap URLs mixing top 4 games + dynamic games from Firebase
 */
export function generateSitemapEntries(dynamicGames: any[] = []): SitemapEntry[] {
  const entries: SitemapEntry[] = [...STATIC_ROUTES];
  const seenUrls = new Set<string>(entries.map(e => e.url));

  // 1. Add Top 4 Games
  TOP_FEATURED_GAMES.forEach(game => {
    const url = `${SITE_URL}/game/${game.slug}`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const images: SitemapImage[] = [];
      if (game.bannerUrl) images.push({ loc: game.bannerUrl, title: `${game.name} Banner` });
      if (game.logoUrl) images.push({ loc: game.logoUrl, title: `${game.name} Logo` });

      entries.push({
        url,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: game.priority,
        images
      });
    }
  });

  // 2. Mix in dynamic games fetched from Firebase / catalog
  if (Array.isArray(dynamicGames)) {
    dynamicGames.forEach(game => {
      const rawName = game.name || game.game_name || '';
      if (!rawName) return;

      const slug = slugify(rawName);
      if (!slug) return;

      const url = `${SITE_URL}/game/${slug}`;
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        const images: SitemapImage[] = [];
        if (game.banner_url || game.bannerUrl) {
          images.push({ loc: game.banner_url || game.bannerUrl, title: `${rawName} Banner` });
        }
        if (game.logo_url || game.logoUrl || game.logo) {
          images.push({ loc: game.logo_url || game.logoUrl || game.logo, title: `${rawName} Logo` });
        }

        entries.push({
          url,
          lastModified: game.created_at || new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.85,
          images
        });
      }
    });
  }

  return entries;
}

/**
 * Generates production-ready XML string for sitemap.xml with Google Image namespace
 */
export function generateSitemapXml(dynamicGames: any[] = []): string {
  const entries = generateSitemapEntries(dynamicGames);

  const xmlEntries = entries.map(entry => {
    let imagesXml = '';
    if (entry.images && entry.images.length > 0) {
      imagesXml = entry.images
        .map(img => `
    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>${img.title ? `\n      <image:title>${escapeXml(img.title)}</image:title>` : ''}${img.caption ? `\n      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
    </image:image>`)
        .join('');
    }

    return `  <url>
    <loc>${escapeXml(entry.url)}</loc>${entry.lastModified ? `\n    <lastmod>${entry.lastModified.split('T')[0]}</lastmod>` : ''}${entry.changeFrequency ? `\n    <changefreq>${entry.changeFrequency}</changefreq>` : ''}${entry.priority !== undefined ? `\n    <priority>${entry.priority.toFixed(2)}</priority>` : ''}${imagesXml}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates standard robots.txt specification
 */
export function generateRobotsTxt(): string {
  return `# FirstPlay Robots Specification
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/auth
Disallow: /admin/dashboard

# Social Media Link Preview Crawlers
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Instagram
Allow: /

User-agent: Bytespider
Allow: /

User-agent: TikTokBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
