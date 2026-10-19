/**
 * promotionService.js
 * 
 * Authoritative administrative service for managing promotional banners and sponsor spotlights
 * stored in Firebase Firestore ('promotional_banners' collection).
 */

import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseLive } from './firebaseConfig';

export const PRIMARY_PROMOTION_COLLECTION = 'promotional_banners';

/**
 * Normalizes raw Firestore document data into standard promotion structure
 */
function normalizePromotionDoc(docId, data, sourceCollection = PRIMARY_PROMOTION_COLLECTION) {
  if (!data) return null;

  const bannerUrl = (
    data.image_url ||
    data.imageUrl ||
    data.banner_url ||
    data.bannerUrl ||
    data.banner ||
    data.image ||
    data.flyer ||
    data.flyer_url ||
    data.photo_url ||
    data.product_image ||
    data.productImage ||
    (Array.isArray(data.images) && data.images[0]) ||
    (Array.isArray(data.image_urls) && data.image_urls[0]) ||
    data.logo ||
    data.logo_url ||
    ''
  ).toString().trim();

  const title = (
    data.title ||
    data.name ||
    data.product_name ||
    data.productName ||
    data.game_name ||
    data.app_name ||
    'Featured Promotion'
  ).toString().trim();

  const targetUrl = (
    data.target_url ||
    data.targetUrl ||
    data.url ||
    data.link ||
    data.product_url ||
    data.productUrl ||
    data.game_url ||
    data.app_url ||
    ''
  ).toString().trim();

  const isProduct = Boolean(
    data.category === 'product' ||
    data.type === 'product' ||
    data.product_name ||
    data.product_url
  );

  const category = isProduct 
    ? 'product' 
    : (data.category || (data.placement === 'app' ? 'app' : data.placement === 'product' ? 'product' : 'game'));

  const badgeText = (
    data.badge_text || 
    data.badgeText || 
    data.badge || 
    (isProduct ? 'FEATURED PRODUCT' : 'SPECIAL PROMOTION')
  ).toString().trim().toUpperCase();

  const subtitle = (
    data.subtitle ||
    data.tagline ||
    data.description ||
    ''
  ).toString().trim();

  const active = data.active !== false && data.status !== 'disabled';

  return {
    id: docId,
    _collection: sourceCollection,
    title,
    subtitle,
    description: data.description || '',
    badge_text: badgeText,
    banner_url: bannerUrl,
    image_url: bannerUrl,
    target_url: targetUrl,
    category,
    placement: data.placement || 'all',
    active,
    open_in_app: data.open_in_app !== false,
    game_id: data.game_id || '',
    created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at) : null,
    updated_at: data.updated_at ? (data.updated_at.toDate ? data.updated_at.toDate().toISOString() : data.updated_at) : null
  };
}

export const promotionService = {
  /**
   * Fetch all promotions strictly from promotional_banners
   */
  async getPromotions() {
    if (!isFirebaseLive || !db) return [];

    const items = [];
    const seenIds = new Set();

    try {
      const snap = await getDocs(collection(db, PRIMARY_PROMOTION_COLLECTION));
      snap.forEach(d => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          const normalized = normalizePromotionDoc(d.id, d.data(), PRIMARY_PROMOTION_COLLECTION);
          if (normalized) {
            items.push(normalized);
          }
        }
      });
    } catch (err) {
      console.warn(`[promotionService] Could not read ${PRIMARY_PROMOTION_COLLECTION}:`, err.message);
    }

    // Sort newest created_at first
    items.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    return items;
  },

  /**
   * Toggle promotion on/off (active = true / false)
   */
  async togglePromotionActive(docId, nextActive, targetCollection = PRIMARY_PROMOTION_COLLECTION) {
    if (!isFirebaseLive || !db) {
      throw new Error('Firebase connection not available');
    }

    const docRef = doc(db, targetCollection, docId);
    await updateDoc(docRef, {
      active: Boolean(nextActive),
      status: nextActive ? 'active' : 'disabled',
      updated_at: serverTimestamp()
    });

    return { success: true, active: nextActive };
  },

  /**
   * Create a new promotion in promotional_banners
   */
  async createPromotion(promoData, targetCollection = PRIMARY_PROMOTION_COLLECTION) {
    if (!isFirebaseLive || !db) {
      throw new Error('Firebase connection not available');
    }

    const payload = {
      title: promoData.title.trim(),
      name: promoData.title.trim(),
      subtitle: (promoData.subtitle || '').trim(),
      tagline: (promoData.subtitle || '').trim(),
      description: (promoData.description || '').trim(),
      badge_text: (promoData.badge_text || 'SPECIAL PROMOTION').trim().toUpperCase(),
      image_url: (promoData.banner_url || '').trim(),
      banner_url: (promoData.banner_url || '').trim(),
      target_url: (promoData.target_url || '').trim(),
      url: (promoData.target_url || '').trim(),
      category: promoData.category || 'game',
      placement: promoData.placement || 'all',
      active: promoData.active !== false,
      status: promoData.active !== false ? 'active' : 'disabled',
      open_in_app: promoData.open_in_app !== false,
      game_id: promoData.game_id || '',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, targetCollection), payload);
    return { success: true, id: docRef.id, ...payload };
  },

  /**
   * Update an existing promotion
   */
  async updatePromotion(docId, promoData, targetCollection = PRIMARY_PROMOTION_COLLECTION) {
    if (!isFirebaseLive || !db) {
      throw new Error('Firebase connection not available');
    }

    const docRef = doc(db, targetCollection, docId);
    const payload = {
      title: promoData.title.trim(),
      name: promoData.title.trim(),
      subtitle: (promoData.subtitle || '').trim(),
      tagline: (promoData.subtitle || '').trim(),
      description: (promoData.description || '').trim(),
      badge_text: (promoData.badge_text || 'SPECIAL PROMOTION').trim().toUpperCase(),
      image_url: (promoData.banner_url || '').trim(),
      banner_url: (promoData.banner_url || '').trim(),
      target_url: (promoData.target_url || '').trim(),
      url: (promoData.target_url || '').trim(),
      category: promoData.category || 'game',
      placement: promoData.placement || 'all',
      active: promoData.active !== false,
      status: promoData.active !== false ? 'active' : 'disabled',
      open_in_app: promoData.open_in_app !== false,
      game_id: promoData.game_id || '',
      updated_at: serverTimestamp()
    };

    await updateDoc(docRef, payload);
    return { success: true, id: docId, ...payload };
  },

  /**
   * Delete a promotion permanently
   */
  async deletePromotion(docId, targetCollection = PRIMARY_PROMOTION_COLLECTION) {
    if (!isFirebaseLive || !db) {
      throw new Error('Firebase connection not available');
    }

    const docRef = doc(db, targetCollection, docId);
    await deleteDoc(docRef);
    return { success: true, id: docId };
  }
};
