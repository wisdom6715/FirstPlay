import { db, isFirebaseLive } from './firebaseConfig.js';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { INITIAL_LISTINGS } from '../data/seedCatalog.js';

const STORAGE_KEY_LISTINGS = 'firstplay_local_listings';
const STORAGE_KEY_RECENTS = 'firstplay_recently_played';
const STORAGE_KEY_BANNERS = 'firstplay_local_banners';

// Local storage cache used strictly for offline persistence of Firebase listings
function getLocalStoredListings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading local listings cache:', e);
    return [];
  }
}

function saveLocalStoredListings(listings) {
  try {
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
  } catch (e) {
    console.error('Error writing local listings cache:', e);
  }
}

function getLocalStoredBanners() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BANNERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading local banners cache:', e);
    return [];
  }
}

function saveLocalStoredBanners(banners) {
  try {
    localStorage.setItem(STORAGE_KEY_BANNERS, JSON.stringify(banners));
  } catch (e) {
    console.error('Error writing local banners cache:', e);
  }
}

// Convert Firestore 'apps' or 'listings' documents into standard FirstPlay item structure
export function normalizeAppDoc(docId, data) {
  const category = (data.category || 'game').toLowerCase();
  let name = '';
  let url = '';
  let logoUrl = '';
  let bannerUrl = '';

  if (category === 'game') {
    name = data.game_name || data.name || 'Untitled Game';
    url = data.game_url || data.url || '';
    logoUrl = data.logo || data.logo_url || '';
    bannerUrl = data.banner_url || data.logo || logoUrl;
  } else if (category === 'app') {
    name = data.app_name || data.name || 'Untitled App';
    url = data.app_url || data.url || '';
    logoUrl = data.logo || data.logo_url || '';
    bannerUrl = data.banner_url || data.logo || logoUrl;
  } else if (category === 'product') {
    name = data.product_name || data.name || 'Untitled Product';
    url = data.product_url || data.url || '';
    logoUrl = data.flyer || data.logo || data.logo_url || '';
    bannerUrl = data.flyer || data.banner_url || logoUrl;
  }

  let createdAtStr = new Date().toISOString();
  if (data.created_at) {
    if (typeof data.created_at.toDate === 'function') {
      createdAtStr = data.created_at.toDate().toISOString();
    } else if (data.created_at.seconds) {
      createdAtStr = new Date(data.created_at.seconds * 1000).toISOString();
    } else if (typeof data.created_at === 'string') {
      createdAtStr = data.created_at;
    }
  }

  let expiryDateStr = null;
  if (data.expiry_date) {
    if (typeof data.expiry_date.toDate === 'function') {
      expiryDateStr = data.expiry_date.toDate().toISOString();
    } else if (data.expiry_date.seconds) {
      expiryDateStr = new Date(data.expiry_date.seconds * 1000).toISOString();
    } else if (typeof data.expiry_date === 'string') {
      expiryDateStr = data.expiry_date;
    }
  } else if (data.expiration_date) {
    expiryDateStr = data.expiration_date;
  }

  return {
    id: docId,
    game_id: data.game_id || data.id || docId,
    name,
    full_name: data.full_name ? `${name} — ${data.full_name}` : name,
    category,
    tagline: data.tagline || data.description || (category === 'game' ? 'Instant Web Game' : category === 'app' ? 'Web Application' : 'Digital Product'),
    description: data.description || data.tagline || (category === 'game' ? `Play ${name} directly in FirstPlay with seamless web performance.` : `Experience ${name} by ${data.full_name || 'Independent Creator'}.`),
    url,
    logo_url: logoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    banner_url: bannerUrl || logoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    creator: data.full_name || 'Independent Creator',
    origin: data.origin || 'Nigeria',
    tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : [category],
    rating: data.rating || 5.0,
    plays_count: data.plays_count || 0,
    requires_fullscreen: Boolean(data.requires_fullscreen),
    status: data.status || 'active',
    payment_reference: data.payment_reference || null,
    open_in_app: data.open_in_app !== undefined ? Boolean(data.open_in_app) : true,
    created_at: createdAtStr,
    expiration_date: expiryDateStr
  };
}

// Convert Firestore 'promotion_banner' document into standard FirstPlay banner structure
export function normalizeBannerDoc(docId, data) {
  return {
    id: docId,
    name: data.title || 'Featured Promotion',
    full_name: data.title || 'Featured Promotion',
    category: data.placement === 'app' ? 'app' : data.placement === 'product' ? 'product' : 'game',
    tagline: data.subtitle || 'Featured on FirstPlay',
    description: data.subtitle || 'Experience this highlighted feature directly on FirstPlay.',
    url: data.target_url || '',
    logo_url: data.image_url,
    banner_url: data.image_url,
    creator: 'FirstPlay Spotlight',
    origin: 'Global',
    tags: ['Featured', 'Banner'],
    badge_text: data.badge_text || 'FEATURED',
    is_featured: true,
    requires_fullscreen: Boolean(data.requires_fullscreen),
    status: 'active',
    rating: 5.0,
    plays_count: 0
  };
}

// Helper to filter out any legacy hardcoded deadshot entries
function filterOutDeadshot(items = []) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => 
    item && 
    item.id !== 'fp-deadshot-io' && 
    !item.url?.toLowerCase().includes('deadshot.io') &&
    !item.name?.toLowerCase().includes('deadshot')
  );
}

// Automatically purge legacy deadshot entries from localStorage caches
try {
  const cachedListings = getLocalStoredListings();
  if (cachedListings.some(i => i.id === 'fp-deadshot-io' || i.url?.includes('deadshot.io'))) {
    saveLocalStoredListings(filterOutDeadshot(cachedListings));
  }
  const cachedBanners = getLocalStoredBanners();
  if (cachedBanners.some(b => b.id === 'fp-deadshot-io' || b.url?.includes('deadshot.io'))) {
    saveLocalStoredBanners(filterOutDeadshot(cachedBanners));
  }
} catch (e) {
  // Ignore in SSR/testing environments
}

export const catalogService = {
  // Fetch active listings from Firebase 'apps' collection (and valid 'listings')
  // If user is offline or Firebase network is unavailable, immediately serve cached listings
  async getListings() {
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (isOffline) {
      console.log('[FirstPlay] Offline network detected. Serving cached catalog data immediately.');
      const cached = filterOutDeadshot(getLocalStoredListings());
      return cached.length > 0 ? cached : filterOutDeadshot(INITIAL_LISTINGS);
    }

    let appItems = [];
    let listingItems = [];
    let fetchSucceeded = false;

    if (isFirebaseLive && db) {
      try {
        // Enforce 4.5-second safety timeout so stalled network does not block the UI
        const queryWithTimeout = async () => {
          // 1. Fetch from official 'apps' collection
          const appsSnap = await getDocs(collection(db, 'apps'));
          appsSnap.forEach(d => {
            const data = d.data();
            // Invariant: turned-off games or under_review submissions NEVER appear in public app
            if (data.active === false || data.status === 'disabled' || data.status === 'under_review') {
              return;
            }
            const item = normalizeAppDoc(d.id, data);
            if (item.active === false || item.status === 'disabled' || item.status === 'under_review') {
              return;
            }
            if (item.expiration_date) {
              const exp = new Date(item.expiration_date);
              if (exp > new Date()) {
                appItems.push(item);
              }
            } else {
              appItems.push(item);
            }
          });

          // 2. Fetch from 'listings' collection (support existing backend entries)
          try {
            const listingsSnap = await getDocs(collection(db, 'listings'));
            listingsSnap.forEach(d => {
              const data = d.data();
              if (data.active !== false && data.status === 'active') {
                listingItems.push(normalizeAppDoc(d.id, data));
              }
            });
          } catch (e) {
            // Optional legacy collection
          }
        };

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase query timeout')), 4500)
        );

        await Promise.race([queryWithTimeout(), timeoutPromise]);
        fetchSucceeded = true;
      } catch (err) {
        console.warn('[FirstPlay] Firebase network fetch failed/timed out, falling back to cached catalog:', err.message);
      }
    }

    if (fetchSucceeded) {
      // Merge remote items, de-duplicating by URL or ID
      const remoteListings = [...appItems];
      listingItems.forEach(li => {
        const exists = remoteListings.some(ri => ri.id === li.id || (ri.url && ri.url === li.url));
        if (!exists) remoteListings.push(li);
      });

      // Filter out any default deadshot leftovers per user specification
      const finalListings = filterOutDeadshot(remoteListings);
      saveLocalStoredListings(finalListings);
      return finalListings;
    }

    // Fallback: Read local cache immediately
    const cached = filterOutDeadshot(getLocalStoredListings());
    return cached.length > 0 ? cached : filterOutDeadshot(INITIAL_LISTINGS);
  },

  // Fetch promotional hero banners from 'promotion_banner' collection with offline cache support
  async getPromotedBanners() {
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (isOffline) {
      return getLocalStoredBanners();
    }

    if (!isFirebaseLive || !db) return getLocalStoredBanners();

    try {
      const bannerFetch = async () => {
        const bannerSnap = await getDocs(collection(db, 'promotion_banner'));
        const banners = [];
        bannerSnap.forEach(d => {
          const data = d.data();
          if (data.active !== false) {
            banners.push(normalizeBannerDoc(d.id, data));
          }
        });
        return banners;
      };

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Banner query timeout')), 3500)
      );

      const banners = await Promise.race([bannerFetch(), timeoutPromise]);
      if (banners.length > 0) {
        saveLocalStoredBanners(banners);
      }
      return banners.length > 0 ? banners : getLocalStoredBanners();
    } catch (err) {
      console.warn('[FirstPlay] Error fetching promotion_banner, using cached banners:', err.message);
      return getLocalStoredBanners();
    }
  },

  // Get active featured hero promotion (cached offline resilient)
  async getPromotedHero() {
    // 1. Check promotion_banner collection from Firebase (or cache)
    const banners = await this.getPromotedBanners();
    if (banners.length > 0) {
      return banners[0];
    }

    // 2. Fallback to catalog listings
    const all = await this.getListings();
    if (!all || all.length === 0) return null;

    const featuredHero = all.find(item => item.is_featured);
    return featuredHero || all[0] || null;
  },

  // Get all rotating ad banners for 15-second auto-scrolling slideshow
  async getAllAdBanners() {
    const remoteBanners = await this.getPromotedBanners();
    const listings = await this.getListings();

    const bannerList = [];

    // 1. Add all active promotion_banner items from Firebase
    if (Array.isArray(remoteBanners)) {
      remoteBanners.forEach(b => {
        if (b && (b.banner_url || b.logo_url)) {
          bannerList.push({
            ...b,
            badge_text: b.badge_text || 'SPONSORED SHOWCASE'
          });
        }
      });
    }

    // 2. Add other featured/popular listings with high-resolution landscape banners from Firebase
    if (Array.isArray(listings)) {
      listings.forEach(item => {
        if (!item) return;
        const alreadyIn = bannerList.some(b => b.id === item.id || (b.url && b.url === item.url));
        if (!alreadyIn && (item.is_featured || item.banner_url || item.logo_url)) {
          bannerList.push({
            ...item,
            badge_text: item.badge_text || (item.category === 'game' ? 'TOP GAME' : 'FEATURED')
          });
        }
      });
    }

    return bannerList;
  },

  // Filter listings by category
  async getListingsByCategory(category) {
    const all = await this.getListings();
    if (!category || category === 'all') return all;
    return all.filter(item => item.category === category);
  },

  // Search listings
  async searchListings(keyword, categoryFilter = 'all') {
    const all = await this.getListings();
    const term = (keyword || '').toLowerCase().trim();

    return all.filter(item => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!term) return true;

      const inName = item.name?.toLowerCase().includes(term);
      const inFullName = item.full_name?.toLowerCase().includes(term);
      const inDesc = item.description?.toLowerCase().includes(term);
      const inCreator = item.creator?.toLowerCase().includes(term);
      const inOrigin = item.origin?.toLowerCase().includes(term);
      const inTags = item.tags?.some(t => t.toLowerCase().includes(term));

      return inName || inFullName || inDesc || inCreator || inOrigin || inTags;
    });
  },

  // Recently played history management
  getRecentlyPlayed() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECENTS);
      if (raw !== null) {
        return filterOutDeadshot(JSON.parse(raw));
      }
      return [];
    } catch {
      return [];
    }
  },

  recordPlay(item) {
    if (!item) return [];
    try {
      const current = this.getRecentlyPlayed();
      const filtered = current.filter(existing => existing.id !== item.id);
      const updated = [
        {
          ...item,
          lastPlayedAt: new Date().toISOString()
        },
        ...filtered
      ].slice(0, 20); // Keep last 20
      localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error recording played item:', e);
      return [];
    }
  },

  clearRecentlyPlayed() {
    try {
      localStorage.removeItem(STORAGE_KEY_RECENTS);
      return true;
    } catch {
      return false;
    }
  },

  // Favorites management
  getFavorites() {
    try {
      const raw = localStorage.getItem('firstplay_favorites');
      return raw ? filterOutDeadshot(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(item) {
    try {
      const current = this.getFavorites();
      const exists = current.some(fav => fav.id === item.id);
      let updated;
      if (exists) {
        updated = current.filter(fav => fav.id !== item.id);
      } else {
        updated = [{ ...item, favoritedAt: new Date().toISOString() }, ...current];
      }
      localStorage.setItem('firstplay_favorites', JSON.stringify(updated));
      return { favorites: updated, isFavorited: !exists };
    } catch (e) {
      console.error('Error toggling favorite:', e);
      return { favorites: [], isFavorited: false };
    }
  },

  isFavorite(itemId) {
    const current = this.getFavorites();
    return current.some(fav => fav.id === itemId);
  },

  // ================= ADMIN DASHBOARD SERVICES =================

  // Fetch all games in Firestore 'apps' collection (both active and disabled)
  async getAdminAllGames() {
    if (!isFirebaseLive || !db) return [];
    try {
      const snap = await getDocs(collection(db, 'apps'));
      const items = [];
      snap.forEach(d => {
        const data = d.data();
        const normalized = normalizeAppDoc(d.id, data);
        items.push({
          ...normalized,
          email: data.email || data.publisher_email || '',
          active: data.active !== undefined ? Boolean(data.active) : data.status !== 'disabled'
        });
      });
      return items;
    } catch (e) {
      console.error('[Admin] Error fetching all apps:', e);
      return [];
    }
  },

  // Fetch all pending submissions in 'under_review' collection
  async getAdminUnderReviewGames() {
    if (!isFirebaseLive || !db) return [];
    try {
      const snap = await getDocs(collection(db, 'under_review'));
      const items = [];
      snap.forEach(d => {
        const data = d.data();
        items.push({
          id: d.id,
          game_id: data.game_id || data.id || d.id,
          name: data.name || data.game_name || data.title || 'Untitled Submission',
          title: data.title || data.name || data.game_name || 'Untitled Submission',
          category: data.category || 'game',
          url: data.url || data.game_url || data.app_url || '',
          email: data.email || data.publisher_email || '',
          publisher_email: data.email || data.publisher_email || '',
          logo_url: data.logo || data.logo_url || '',
          banner_url: data.banner_url || data.flyer || data.banner || '',
          creator: data.full_name || data.studioName || 'Independent Studio',
          tagline: data.tagline || '',
          description: data.description || '',
          open_in_app: data.open_in_app !== undefined ? Boolean(data.open_in_app) : true,
          status: 'under_review',
          created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at) : new Date().toISOString(),
          raw: data
        });
      });
      return items;
    } catch (e) {
      console.error('[Admin] Error fetching under_review collection:', e);
      return [];
    }
  },

  // Toggle game active status on/off in 'apps'
  async toggleGameActive(docId, newActiveState) {
    if (!isFirebaseLive || !db) throw new Error('Firebase is not connected');
    const appRef = doc(db, 'apps', docId);
    await updateDoc(appRef, {
      active: Boolean(newActiveState),
      status: newActiveState ? 'active' : 'disabled'
    });
    // Invalidate local storage cache so site re-syncs immediately
    localStorage.removeItem(STORAGE_KEY_LISTINGS);
  },

  // Update game/app/product details in Firestore 'apps' collection
  async updateGameDetails(gameId, updatePayload, collectionName = 'apps') {
    if (!isFirebaseLive || !db) throw new Error('Firebase is not connected');
    const category = (updatePayload.category || 'game').toLowerCase();
    const name = (updatePayload.name || '').trim();

    const fieldsToUpdate = {
      name,
      game_name: category === 'game' ? name : (updatePayload.game_name || name),
      app_name: category === 'app' ? name : (updatePayload.app_name || name),
      product_name: category === 'product' ? name : (updatePayload.product_name || name),
      category,
      url: (updatePayload.url || '').trim(),
      game_url: category === 'game' ? (updatePayload.url || '').trim() : (updatePayload.game_url || updatePayload.url || '').trim(),
      app_url: category === 'app' ? (updatePayload.url || '').trim() : (updatePayload.app_url || updatePayload.url || '').trim(),
      product_url: category === 'product' ? (updatePayload.url || '').trim() : (updatePayload.product_url || updatePayload.url || '').trim(),
      creator: (updatePayload.creator || updatePayload.full_name || 'Independent Studio').trim(),
      full_name: (updatePayload.creator || updatePayload.full_name || 'Independent Studio').trim(),
      email: (updatePayload.email || updatePayload.publisher_email || '').trim().toLowerCase() || null,
      publisher_email: (updatePayload.email || updatePayload.publisher_email || '').trim().toLowerCase() || null,
      tagline: (updatePayload.tagline || '').trim(),
      description: (updatePayload.description || '').trim(),
      logo: updatePayload.logo_url || updatePayload.logo || null,
      logo_url: updatePayload.logo_url || updatePayload.logo || null,
      flyer: updatePayload.banner_url || updatePayload.flyer || null,
      banner_url: updatePayload.banner_url || updatePayload.flyer || null,
      banner: updatePayload.banner_url || updatePayload.flyer || null,
      open_in_app: updatePayload.open_in_app !== undefined ? Boolean(updatePayload.open_in_app) : true,
      updated_at: serverTimestamp()
    };

    if (updatePayload.active !== undefined) {
      fieldsToUpdate.active = Boolean(updatePayload.active);
      fieldsToUpdate.status = updatePayload.active ? 'active' : 'disabled';
    }

    const docRef = doc(db, collectionName, gameId);
    await updateDoc(docRef, fieldsToUpdate);

    // Invalidate local storage cache so site re-syncs immediately
    localStorage.removeItem(STORAGE_KEY_LISTINGS);
    localStorage.removeItem(STORAGE_KEY_BANNERS);

    return fieldsToUpdate;
  },

  // Update an under_review submission details
  async updateUnderReviewDetails(submissionId, updatePayload) {
    if (!isFirebaseLive || !db) throw new Error('Firebase is not connected');
    const docRef = doc(db, 'under_review', submissionId);
    const title = (updatePayload.title || updatePayload.name || '').trim();
    const fieldsToUpdate = {
      title,
      name: title,
      category: updatePayload.category || 'game',
      url: (updatePayload.url || '').trim(),
      creator: (updatePayload.creator || 'Independent Studio').trim(),
      full_name: (updatePayload.creator || 'Independent Studio').trim(),
      email: (updatePayload.email || updatePayload.publisher_email || '').trim().toLowerCase() || null,
      publisher_email: (updatePayload.email || updatePayload.publisher_email || '').trim().toLowerCase() || null,
      tagline: (updatePayload.tagline || '').trim(),
      description: (updatePayload.description || '').trim(),
      logo_url: updatePayload.logo_url || null,
      logo: updatePayload.logo_url || null,
      banner_url: updatePayload.banner_url || null,
      banner: updatePayload.banner_url || null,
      open_in_app: Boolean(updatePayload.open_in_app),
      updated_at: serverTimestamp()
    };
    await updateDoc(docRef, fieldsToUpdate);
    return fieldsToUpdate;
  },

  // Approve a submission from 'under_review' -> write to 'apps' preserving the pre-generated game_id and delete from 'under_review'
  async approveUnderReviewGame(submission) {
    if (!isFirebaseLive || !db) throw new Error('Firebase is not connected');
    const category = submission.category || 'game';
    const name = submission.name || submission.title;

    // Use the existing game_id generated during game submission
    const gameId = submission.game_id || submission.id;
    const appDocRef = gameId ? doc(db, 'apps', gameId) : doc(collection(db, 'apps'));
    const resolvedGameId = appDocRef.id;

    // 1. Write approved record to 'apps' collection with the exact pre-assigned game_id
    await setDoc(appDocRef, {
      game_id: resolvedGameId,
      id: resolvedGameId,
      category,
      name,
      game_name: category === 'game' ? name : null,
      app_name: category === 'app' ? name : null,
      product_name: category === 'product' ? name : null,
      game_url: category === 'game' ? submission.url : null,
      app_url: category === 'app' ? submission.url : null,
      product_url: category === 'product' ? submission.url : null,
      url: submission.url,
      email: submission.email || submission.publisher_email || null,
      publisher_email: submission.email || submission.publisher_email || null,
      creator: submission.creator || 'Independent Studio',
      full_name: submission.creator || 'Independent Studio',
      tagline: submission.tagline || '',
      description: submission.description || '',
      logo: submission.logo_url || null,
      logo_url: submission.logo_url || null,
      flyer: submission.banner_url || null,
      banner_url: submission.banner_url || null,
      open_in_app: Boolean(submission.open_in_app),
      payment_status: 'free',
      status: 'active',
      active: true,
      created_at: serverTimestamp()
    });

    // 2. If it has a banner, also create a promotion_banner linking to the game_id
    if (submission.banner_url) {
      try {
        await addDoc(collection(db, 'promotion_banner'), {
          title: name,
          subtitle: submission.tagline || submission.description.slice(0, 80),
          badge_text: 'GAME SHOWCASE',
          image_url: submission.banner_url,
          target_url: submission.url,
          game_id: resolvedGameId,
          placement: 'all',
          active: true,
          open_in_app: Boolean(submission.open_in_app),
          created_at: serverTimestamp()
        });
      } catch (e) {
        console.warn('[Admin] Could not add promotion banner on approval:', e);
      }
    }

    // 3. Delete from 'under_review'
    if (submission.id) {
      await deleteDoc(doc(db, 'under_review', submission.id));
    }

    // Clear local cache so changes reflect instantly
    localStorage.removeItem(STORAGE_KEY_LISTINGS);
    localStorage.removeItem(STORAGE_KEY_BANNERS);

    return resolvedGameId;
  },

  // Reject and delete from 'under_review'
  async rejectUnderReviewGame(submissionId) {
    if (!isFirebaseLive || !db) throw new Error('Firebase is not connected');
    await deleteDoc(doc(db, 'under_review', submissionId));
  },

  // Permanently delete a game from 'apps'
  async deleteGame(gameId) {
    if (!isFirebaseLive || !db) throw new Error('Firebase is not connected');
    await deleteDoc(doc(db, 'apps', gameId));
    localStorage.removeItem(STORAGE_KEY_LISTINGS);
  },

  /**
   * Verify whether an authenticated Firebase user is listed in the Firestore 'admins' collection.
   * Neither emails nor passwords are hardcoded in the codebase; everything is governed in Firebase.
   * 
   * @param {{ email?: string, uid?: string }} user
   * @returns {Promise<{ isAuthorized: boolean, adminData?: object, error?: string }>}
   */
  async verifyAdminUser(user) {
    if (!user || !user.email) {
      return { isAuthorized: false, error: 'No user email detected.' };
    }

    if (!isFirebaseLive || !db) {
      return { isAuthorized: false, error: 'Firebase is not initialized or connected.' };
    }

    try {
      const emailLower = user.email.toLowerCase().trim();

      // 1. Check by UID: doc(db, 'admins', user.uid)
      if (user.uid) {
        try {
          const uidSnap = await getDoc(doc(db, 'admins', user.uid));
          if (uidSnap.exists()) {
            const data = uidSnap.data();
            if (data.active !== false) {
              return { isAuthorized: true, adminData: { ...data, docId: uidSnap.id } };
            }
          }
        } catch (e) {
          // Fall through to email check
        }
      }

      // 2. Check by doc ID named after the email: doc(db, 'admins', emailLower)
      try {
        const emailSnap = await getDoc(doc(db, 'admins', emailLower));
        if (emailSnap.exists()) {
          const data = emailSnap.data();
          if (data.active !== false) {
            return { isAuthorized: true, adminData: { ...data, docId: emailSnap.id } };
          }
        }
      } catch (e) {
        // Fall through to query
      }

      // 3. Query collection 'admins' where email == emailLower
      try {
        const q = query(collection(db, 'admins'), where('email', '==', emailLower));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const match = snap.docs.find(d => d.data().active !== false);
          if (match) {
            return { isAuthorized: true, adminData: { ...match.data(), docId: match.id } };
          }
        }
      } catch (qErr) {
        console.warn('[Admin Whitelist] Query check:', qErr);
      }

      return {
        isAuthorized: false,
        error: `Access Denied: "${user.email}" is not listed in the Firestore 'admins' table. Please ensure this email is added to the 'admins' collection in Firebase.`
      };
    } catch (err) {
      console.error('[Admin Whitelist] Error verifying admin:', err);
      return {
        isAuthorized: false,
        error: `Admin validation failed: ${err.message}`
      };
    }
  },

  /**
   * Save the enrolled TOTP Base32 secret for this admin in their Firestore document.
   * 
   * @param {{ email?: string, uid?: string }} user 
   * @param {string} secret - Base32 secret
   * @param {string} [docId] - Optional document ID in 'admins'
   */
  async saveAdminTotpSecret(user, secret, docId) {
    if (!isFirebaseLive || !db) throw new Error('Firebase is not connected');
    const emailLower = user.email.toLowerCase().trim();

    let targetDocRef = null;
    if (docId) {
      targetDocRef = doc(db, 'admins', docId);
    } else if (user.uid) {
      const snap = await getDoc(doc(db, 'admins', user.uid));
      if (snap.exists()) targetDocRef = doc(db, 'admins', user.uid);
    }

    if (!targetDocRef) {
      const snap = await getDoc(doc(db, 'admins', emailLower));
      if (snap.exists()) targetDocRef = doc(db, 'admins', emailLower);
    }

    if (!targetDocRef) {
      const q = query(collection(db, 'admins'), where('email', '==', emailLower));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetDocRef = doc(db, 'admins', qSnap.docs[0].id);
      }
    }

    if (!targetDocRef) {
      targetDocRef = doc(db, 'admins', emailLower);
    }

    await updateDoc(targetDocRef, {
      totp_secret: secret,
      mfa_enabled: true,
      mfa_enrolled_at: serverTimestamp()
    });
  }
};
