/**
 * FirstPlay Reward & Dynamic Gift Service
 * Implements client communication with /api/rewards/* and local state management
 * Conforms to PRD: Dynamic Gift Management, Redemption Codes & Reward Fulfillment
 */

const STORAGE_KEY_WON_GIFTS = 'firstplay_won_spin_gifts';
const STORAGE_KEY_PLAYTIME = 'firstplay_gameplay_seconds';
const STORAGE_KEY_LAST_SPIN = 'firstplay_last_spin_time';

export const rewardService = {
  // ==========================================
  // 1. Wheel & Spin APIs
  // ==========================================

  /**
   * Fetches the authoritative 6-segment wheel configuration from the server/Firebase
   */
  async getWheelConfig() {
    try {
      const res = await fetch('/api/rewards/wheel', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('[RewardService] Error loading wheel config:', err);
      return {
        success: false,
        isConfigured: false,
        segments: [],
        error: err.message
      };
    }
  },

  /**
   * Authoritative spin resolution on the backend.
   * Generates unique 24-hour redemption code if a non-zero reward is won.
   */
  async executeSpin(userId, userName) {
    try {
      const res = await fetch('/api/rewards/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName })
      });
      const data = await res.json();

      if (data.success && data.reward) {
        // Cache won gift in local storage for rewards history
        this.saveLocalWonGift({
          id: data.reward.id,
          code: data.reward.redemptionCode,
          gift: `${data.reward.quantity} ${data.reward.unit || 'MB'}`,
          amount: data.reward.quantity,
          amountLabel: `${data.reward.quantity} ${data.reward.unit || 'MB'}`,
          unit: data.reward.unit,
          network: data.reward.network,
          category: data.reward.category || 'gift',
          status: 'pending',
          expiresAt: data.reward.expiresAt,
          createdAt: data.reward.createdAt,
          redeem_url: typeof window !== 'undefined' ? `${window.location.origin}/redeem?code=${data.reward.redemptionCode}` : `/redeem?code=${data.reward.redemptionCode}`
        });
      }

      return data;
    } catch (err) {
      console.error('[RewardService] Error executing spin:', err);
      return { success: false, error: err.message || 'Network error during spin' };
    }
  },

  // ==========================================
  // 2. Redemption & Validation APIs
  // ==========================================

  /**
   * Validates redemption code, checks 24h expiration, and determines category automatically.
   */
  async validateCode(code, userId) {
    try {
      const res = await fetch('/api/rewards/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('[RewardService] Error validating code:', err);
      return { valid: false, error: err.message || 'Failed to validate code' };
    }
  },

  /**
   * Fulfills reward atomically through Flutterwave VTU / Transfer API
   */
  async fulfillReward(payload) {
    try {
      const res = await fetch('/api/rewards/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && payload.code) {
        this.markLocalGiftRedeemed(payload.code);
      }

      return data;
    } catch (err) {
      console.error('[RewardService] Error fulfilling reward:', err);
      return { success: false, error: err.message || 'Fulfillment error' };
    }
  },

  // ==========================================
  // 3. Banking APIs (Flutterwave)
  // ==========================================

  /**
   * Fetches the official list of Nigerian commercial banks
   */
  async getNigerianBanks() {
    try {
      const res = await fetch('/api/rewards/banks', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      return data.banks || [];
    } catch (err) {
      console.error('[RewardService] Error loading banks:', err);
      return [];
    }
  },

  /**
   * Resolves a Nigerian bank account number to verify account holder name
   */
  async resolveAccount(accountNumber, bankCode) {
    try {
      const res = await fetch('/api/rewards/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('[RewardService] Error resolving bank account:', err);
      return { success: false, error: err.message };
    }
  },

  // ==========================================
  // 4. Admin Management APIs
  // ==========================================

  /**
   * Updates the 6-segment configuration on the wheel
   */
  async saveWheelConfig(segments, title = 'FirstPlay Rewards Wheel') {
    try {
      const res = await fetch('/api/rewards/wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments, title })
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error saving wheel config:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: Fetch all gift categories
   */
  async getGiftCategories() {
    try {
      const res = await fetch('/api/rewards/categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error getting gift categories:', err);
      return { success: false, categories: [] };
    }
  },

  /**
   * Admin: Create or update a gift category
   */
  async createOrUpdateGiftCategory(categoryData) {
    try {
      const res = await fetch('/api/rewards/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error saving category:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: Delete a gift category
   */
  async deleteGiftCategory(id) {
    try {
      const res = await fetch(`/api/rewards/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error deleting category:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: Fetch all gifts
   */
  async getAdminGifts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/rewards/gifts?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error getting admin gifts:', err);
      return { success: false, gifts: [] };
    }
  },

  /**
   * Admin: Create or update a gift
   */
  async createOrUpdateAdminGift(giftData) {
    try {
      const res = await fetch('/api/rewards/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftData)
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error saving gift:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: Delete a gift permanently
   */
  async deleteAdminGift(gift_id) {
    try {
      const res = await fetch(`/api/rewards/gifts?id=${encodeURIComponent(gift_id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error deleting gift:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: Soft toggle activation/deactivation of a gift
   */
  async toggleAdminGift(gift_id, is_active) {
    try {
      const res = await fetch('/api/rewards/gifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift_id, is_active })
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error toggling gift:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: List redemptions history
   */
  async getAdminRedemptions(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/rewards/redemptions?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      console.error('[RewardService] Error getting admin redemptions:', err);
      return { success: false, redemptions: [] };
    }
  },

  // ==========================================
  // 5. Local Playtime & Won Gifts Cache
  // ==========================================

  getPlaytimeSeconds() {
    if (typeof window === 'undefined') return 7200;
    const val = localStorage.getItem(STORAGE_KEY_PLAYTIME);
    return val ? parseInt(val, 10) : 7200; // default unlocked for smooth UX or testing
  },

  addPlaytimeSeconds(secondsToAdd) {
    if (typeof window === 'undefined') return 7200;
    const current = this.getPlaytimeSeconds();
    const next = current + secondsToAdd;
    localStorage.setItem(STORAGE_KEY_PLAYTIME, next.toString());
    return next;
  },

  getLocalWonGifts() {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WON_GIFTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveLocalWonGift(giftItem) {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getLocalWonGifts();
      const filtered = list.filter((g) => g.code !== giftItem.code);
      filtered.unshift(giftItem);
      localStorage.setItem(STORAGE_KEY_WON_GIFTS, JSON.stringify(filtered.slice(0, 30)));
    } catch (e) {
      console.warn('[RewardService] Could not cache won gift:', e);
    }
  },

  markLocalGiftRedeemed(code) {
    if (typeof window === 'undefined' || !code) return;
    try {
      const list = this.getLocalWonGifts();
      const updated = list.map((item) =>
        item.code === code ? { ...item, status: 'used', isUsed: true } : item
      );
      localStorage.setItem(STORAGE_KEY_WON_GIFTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('[RewardService] Could not update local gift:', e);
    }
  }
};
