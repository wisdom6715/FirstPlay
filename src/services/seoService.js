/**
 * FirstPlay Dynamic Client-Side SEO Engine
 * Reactively updates Page Titles, OpenGraph, Twitter/X cards, and Schema.org JSON-LD structured data.
 */

import { slugify } from '../sitemap';

export const SITE_URL = 'https://firstplay.fun';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/firstplay_x_cover.jpg`;

export const DEFAULT_SEO = {
  title: 'FirstPlay — African Web Games & Digital Experiences | Play Lagos Life, Danfo Run, Monkey Post',
  description: 'Discover and play top Nigerian and African web games instantly with zero installation. Experience Lagos Life, Danfo Run, Monkey Post, myAbuja Life, and trending Naija browser games on mobile and PC.',
  keywords: 'Lagos Life, Danfo Run, Monkey Post, myAbuja Life, Naija games, Nigerian games, African web games, play games online Nigeria, African gaming platform, browser games Lagos, instant play web games, HTML5 African games, free online games Nigeria',
  canonical: `${SITE_URL}/`,
  image: DEFAULT_OG_IMAGE,
  imageAlt: 'FirstPlay - African and Naija Web Games featuring Lagos Life, Danfo Run, and Monkey Post',
  type: 'website'
};

function setMetaTag(nameOrProperty, key, value) {
  if (typeof document === 'undefined') return;
  if (!value) return;

  let el = document.querySelector(`meta[${nameOrProperty}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(nameOrProperty, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(url) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(id, data) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

/**
 * Universal SEO update helper
 */
export function updateSEO({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  imageAlt = DEFAULT_SEO.imageAlt,
  canonical = DEFAULT_SEO.canonical,
  type = 'website',
  game = null
} = {}) {
  if (typeof document === 'undefined') return;

  // 1. Title
  document.title = title;

  // 2. Standard Meta
  setMetaTag('name', 'title', title);
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setCanonical(canonical);

  // 3. OpenGraph (Facebook, Instagram, TikTok, LinkedIn, WhatsApp)
  setMetaTag('property', 'og:site_name', 'FirstPlay');
  setMetaTag('property', 'og:type', type);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonical);
  setMetaTag('property', 'og:image', image);
  setMetaTag('property', 'og:image:secure_url', image);
  setMetaTag('property', 'og:image:alt', imageAlt);
  setMetaTag('property', 'og:locale', 'en_NG');

  // 4. Twitter / X Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:site', '@FirstPlayApp');
  setMetaTag('name', 'twitter:creator', '@FirstPlayApp');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', image);
  setMetaTag('name', 'twitter:image:alt', imageAlt);

  // 5. TikTok & Instagram mobile crawler compatibility
  setMetaTag('property', 'al:web:url', canonical);
  setMetaTag('property', 'al:web:should_fallback', 'true');

  // 6. If viewing a specific game, inject VideoGame JSON-LD
  if (game) {
    const gameSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: game.name || game.full_name || 'Game',
      url: canonical,
      image: image,
      description: description,
      genre: Array.isArray(game.tags) ? game.tags : ['African Web Game', 'Browser Game'],
      gamePlatform: ['Web Browser', 'Mobile Web', 'Desktop'],
      applicationCategory: 'Game',
      operatingSystem: 'Any modern web browser',
      inLanguage: 'en-NG',
      author: {
        '@type': 'Organization',
        name: game.creator || 'Independent Creator'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN'
      }
    };
    setJsonLd('firstplay-active-game-ld', gameSchema);
  }
}

/**
 * Updates SEO when navigating between main tabs
 */
export function setTabSEO(tab, categoryFilter = 'All') {
  switch (tab) {
    case 'discover':
      updateSEO({
        title: 'FirstPlay — African Web Games & Digital Experiences | Play Lagos Life, Danfo Run, Monkey Post',
        description: 'Discover and play top Nigerian and African web games instantly with zero installation. Experience Lagos Life, Danfo Run, Monkey Post, and curated Naija games.',
        canonical: `${SITE_URL}/`
      });
      break;

    case 'category':
      updateSEO({
        title: `Play ${categoryFilter === 'All' ? 'Naija & African Games Online' : `${categoryFilter} Games`} — FirstPlay`,
        description: `Explore the top curated Nigerian browser games and digital products in the ${categoryFilter} collection on FirstPlay.`,
        canonical: `${SITE_URL}/category`
      });
      break;

    case 'search':
      updateSEO({
        title: 'Search Nigerian & African Games — FirstPlay',
        description: 'Search and find African web games, Naija simulation titles, arcade runners, and digital creations on FirstPlay.',
        canonical: `${SITE_URL}/search`
      });
      break;

    case 'promote':
      updateSEO({
        title: 'Submit & Promote Your Web Game — FirstPlay Creator Network',
        description: 'Get your African web game or product in front of thousands of players instantly. Low setup fees, zero install friction, and instant play.',
        canonical: `${SITE_URL}/promote`
      });
      break;

    case 'favourite':
      updateSEO({
        title: 'Your Favorites & Game Library — FirstPlay',
        description: 'Access your favorite Nigerian and African browser games in your personalized FirstPlay web library.',
        canonical: `${SITE_URL}/favourite`
      });
      break;

    case 'settings':
      updateSEO({
        title: 'Settings & Appearance — FirstPlay',
        description: 'Customize theme, audio, and device settings on FirstPlay.',
        canonical: `${SITE_URL}/settings`
      });
      break;

    case 'privacy':
      updateSEO({
        title: 'Privacy Policy — FirstPlay',
        description: 'Read the official FirstPlay Privacy Policy detailing technical data handling, device local storage, and user protection standards.',
        canonical: `${SITE_URL}/privacy`
      });
      break;

    case 'terms':
      updateSEO({
        title: 'Terms of Service — FirstPlay',
        description: 'Read the official FirstPlay Terms of Service governing access, fair gameplay, rewards redemption, and platform usage.',
        canonical: `${SITE_URL}/terms-of-service`
      });
      break;

    default:
      updateSEO(DEFAULT_SEO);
  }
}

/**
 * Updates SEO when a game is currently playing
 */
export function setGameSEO(game) {
  if (!game) return;
  const slug = slugify(game.name || 'game');
  const gameTitle = `Play ${game.name} — ${game.tagline || 'Naija Web Game'} | FirstPlay`;
  const gameDesc = `${game.description || `Play ${game.name} directly on FirstPlay with zero download.`} Play instant African browser games on any phone, tablet, or PC.`;
  const gameImage = game.banner_url || game.logo_url || DEFAULT_OG_IMAGE;
  const gameUrl = `${SITE_URL}/game/${slug}`;

  updateSEO({
    title: gameTitle,
    description: gameDesc,
    keywords: `${game.name}, ${game.tagline || ''}, ${(game.tags || []).join(', ')}, Lagos Life, Danfo Run, Monkey Post, Nigerian web games, African browser games`,
    image: gameImage,
    imageAlt: `${game.name} on FirstPlay`,
    canonical: gameUrl,
    type: 'game',
    game
  });
}

/**
 * Injects/refreshes dynamic Schema.org ItemList with all current games in catalog
 * prioritizing Lagos Life, Danfo Run, Monkey Post, and myAbuja Life
 */
export function updateCatalogItemListSEO(listings = []) {
  if (!Array.isArray(listings) || listings.length === 0) return;

  const getPriority = (item) => {
    const name = (item.name || item.full_name || '').toLowerCase().trim();
    if (name.includes('lagos life')) return 0;
    if (name.includes('danfo run') || name.includes('danfo')) return 1;
    if (name.includes('monkey post')) return 2;
    if (name.includes('abuja')) return 3;
    return 999;
  };

  const sorted = [...listings]
    .filter(item => item.category === 'game')
    .sort((a, b) => {
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      return (b.plays_count || 0) - (a.plays_count || 0);
    });

  const itemListElement = sorted.slice(0, 15).map((game, index) => {
    const slug = slugify(game.name || 'game');
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: game.name,
      item: {
        '@type': 'VideoGame',
        name: game.name,
        url: `${SITE_URL}/game/${slug}`,
        description: game.description || game.tagline,
        image: game.banner_url || game.logo_url || DEFAULT_OG_IMAGE,
        genre: Array.isArray(game.tags) ? game.tags : ['Browser Game'],
        gamePlatform: ['Web Browser', 'Mobile Web', 'Desktop'],
        operatingSystem: 'Any modern web browser',
        inLanguage: 'en-NG',
        author: {
          '@type': 'Organization',
          name: game.creator || 'Independent Creator'
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'NGN'
        }
      }
    };
  });

  const catalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Nigerian and African Web Games',
    description: 'Curated ranking of African browser games on FirstPlay, featuring Lagos Life, Danfo Run, Monkey Post, and myAbuja Life.',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: itemListElement.length,
    itemListElement
  };

  setJsonLd('firstplay-catalog-ld', catalogSchema);
}
