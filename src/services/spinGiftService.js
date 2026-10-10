import { db, isFirebaseLive } from './firebaseConfig.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';

/**
 * 8-Segment Wheel Definition matching media_1791543505455.png
 * Clockwise sequence starting from 4 GB at top-right
 */
export const WHEEL_SEGMENTS = [
  {
    id: '4gb',
    amount: 4000,
    amountLabel: '4 GB',
    subLabel: 'Data',
    color: '#0f172a', // Dark navy
    textColor: '#ffffff',
    tier: 'high'
  },
  {
    id: '5gb',
    amount: 5000,
    amountLabel: '5 GB',
    subLabel: 'Jackpot',
    color: '#0066ff', // Vibrant blue
    textColor: '#ffffff',
    tier: 'high'
  },
  {
    id: '0gb',
    amount: 0,
    amountLabel: '0 GB',
    subLabel: 'No Data',
    color: '#0f172a', // Dark navy
    textColor: '#ffffff',
    tier: 'zero'
  },
  {
    id: '500mb',
    amount: 500,
    amountLabel: '500 MB',
    subLabel: 'Data',
    color: '#0066ff', // Vibrant blue
    textColor: '#ffffff',
    tier: 'mid'
  },
  {
    id: '1gb',
    amount: 1000,
    amountLabel: '1 GB',
    subLabel: 'Data',
    color: '#ffffff', // Clean white
    textColor: '#0a0a0f',
    tier: 'mid'
  },
  {
    id: '1.5gb',
    amount: 1500,
    amountLabel: '1.5 GB',
    subLabel: 'Data',
    color: '#0f172a', // Dark navy
    textColor: '#ffffff',
    tier: 'mid'
  },
  {
    id: '2gb',
    amount: 2000,
    amountLabel: '2 GB',
    subLabel: 'Data',
    color: '#0066ff', // Vibrant blue
    textColor: '#ffffff',
    tier: 'mid'
  },
  {
    id: '3gb',
    amount: 3000,
    amountLabel: '3 GB',
    subLabel: 'Data',
    color: '#ffffff', // Clean white
    textColor: '#0a0a0f',
    tier: 'high'
  }
];

const STORAGE_KEY_WON_GIFTS = 'firstplay_won_spin_gifts';
const STORAGE_KEY_PLAYTIME = 'firstplay_gameplay_seconds';
const STORAGE_KEY_LAST_SPIN = 'firstplay_last_spin_time';

/**
 * Probability distribution per user specification:
 * - 0 GB: 30% of the time (0.30)
 * - Between 500 MB and 2 GB: 50% of the time (0.50)
 * - 3 GB upward: 20% of the time (0.20)
 */
export function calculateSpinOutcome() {
  const rand = Math.random();

  if (rand < 0.30) {
    // 30% chance: 0 GB
    const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.id === '0gb');
    return { segment: WHEEL_SEGMENTS[segmentIndex], segmentIndex };
  } else if (rand < 0.80) {
    // 50% chance: between 500mb and 2gb
    const midIds = ['500mb', '1gb', '1.5gb', '2gb'];
    const chosenId = midIds[Math.floor(Math.random() * midIds.length)];
    const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.id === chosenId);
    return { segment: WHEEL_SEGMENTS[segmentIndex], segmentIndex };
  } else {
    // 20% chance: 3GB upward (3gb: 9%, 4gb: 7%, 5gb jackpot: 4%)
    const subRand = Math.random();
    let chosenId = '3gb';
    if (subRand < 0.45) {
      chosenId = '3gb';
    } else if (subRand < 0.80) {
      chosenId = '4gb';
    } else {
      chosenId = '5gb';
    }
    const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.id === chosenId);
    return { segment: WHEEL_SEGMENTS[segmentIndex], segmentIndex };
  }
}

/**
 * Generates an authentic user redemption code, e.g. FP-DATA-8K3N-7W9B
 */
export function generateRedeemCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `FP-DATA-${part1}-${part2}`;
}

export const spinGiftService = {
  /**
   * Save a won gift to Firebase collection 'spin_gift' and local cache
   */
  async recordWonGift(segment) {
    if (!segment || segment.amount === 0) return null;

    const code = generateRedeemCode();
    const giftLabel = `${segment.amountLabel} ${segment.subLabel}`;
    const redeemUrl = `https://firstplay.fun/redeem?code=${code}`;

    const giftDoc = {
      code,
      gift: giftLabel,
      amount_mb: segment.amount,
      status: 'active', // 'active' (not used) | 'used' (already redeemed)
      redeem_url: redeemUrl,
      created_at: new Date().toISOString()
    };

    let savedDocId = null;

    // 1. Persist to Cloud Firestore 'spin_gift' collection
    if (isFirebaseLive && db) {
      try {
        const docRef = await addDoc(collection(db, 'spin_gift'), {
          code: giftDoc.code,
          gift: giftDoc.gift,
          amount_mb: giftDoc.amount_mb,
          status: 'active',
          redeem_url: giftDoc.redeem_url,
          created_at: serverTimestamp(),
          redeemed_at: null
        });
        savedDocId = docRef.id;
        console.info('[FirstPlay] Won gift saved to Firestore spin_gift:', savedDocId);
      } catch (err) {
        console.warn('[FirstPlay] Firestore spin_gift write error:', err.message);
      }
    }

    // 2. Persist to local storage cache
    const finalItem = {
      id: savedDocId || `local-${Date.now()}`,
      ...giftDoc
    };

    const localGifts = this.getLocalWonGifts();
    const updated = [finalItem, ...localGifts];
    this.saveLocalWonGifts(updated);

    return finalItem;
  },

  /**
   * Redeem a gift code.
   * If already used, returns { alreadyRedeemed: true }.
   */
  async redeemGiftCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid gift code.' };
    }

    // 1. Check in Cloud Firestore
    if (isFirebaseLive && db) {
      try {
        const q = query(
          collection(db, 'spin_gift'),
          where('code', '==', cleanCode),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();

          if (data.status === 'used' || data.redeemed === true) {
            this.markLocalGiftAsUsed(cleanCode);
            return {
              success: false,
              alreadyRedeemed: true,
              gift: data.gift,
              message: 'Already redeemed: This reward code has already been claimed.'
            };
          }

          // Mark as used in Firestore
          await updateDoc(doc(db, 'spin_gift', docSnap.id), {
            status: 'used',
            redeemed_at: serverTimestamp()
          });

          this.markLocalGiftAsUsed(cleanCode);

          return {
            success: true,
            alreadyRedeemed: false,
            gift: data.gift,
            message: `Congratulations! ${data.gift} has been successfully redeemed.`
          };
        }
      } catch (err) {
        console.warn('[FirstPlay] Firestore redemption query warning:', err.message);
      }
    }

    // 2. Fallback check local storage
    const localGifts = this.getLocalWonGifts();
    const localMatch = localGifts.find(g => g.code?.toUpperCase() === cleanCode);

    if (localMatch) {
      if (localMatch.status === 'used') {
        return {
          success: false,
          alreadyRedeemed: true,
          gift: localMatch.gift,
          message: 'Already redeemed: This reward code has already been claimed.'
        };
      }

      this.markLocalGiftAsUsed(cleanCode);
      return {
        success: true,
        alreadyRedeemed: false,
        gift: localMatch.gift,
        message: `Congratulations! ${localMatch.gift} has been successfully redeemed.`
      };
    }

    return {
      success: false,
      alreadyRedeemed: false,
      message: 'Gift code not found. Please verify the code and try again.'
    };
  },

  /**
   * Check status of a gift code
   */
  async checkCodeStatus(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return null;

    if (isFirebaseLive && db) {
      try {
        const q = query(
          collection(db, 'spin_gift'),
          where('code', '==', cleanCode),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
      } catch (err) {
        console.warn('[FirstPlay] Status check warning:', err.message);
      }
    }

    const localGifts = this.getLocalWonGifts();
    return localGifts.find(g => g.code?.toUpperCase() === cleanCode) || null;
  },

  // Local storage helpers
  getLocalWonGifts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WON_GIFTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveLocalWonGifts(gifts) {
    try {
      localStorage.setItem(STORAGE_KEY_WON_GIFTS, JSON.stringify(gifts));
    } catch (e) {
      console.warn('Failed to save won gifts locally:', e);
    }
  },

  markLocalGiftAsUsed(code) {
    const gifts = this.getLocalWonGifts();
    const updated = gifts.map(g => {
      if (g.code?.toUpperCase() === code?.toUpperCase()) {
        return { ...g, status: 'used', redeemed_at: new Date().toISOString() };
      }
      return g;
    });
    this.saveLocalWonGifts(updated);
  },

  // Playtime Tracking ("Play any game for 2h to unlock spin")
  getPlaytimeSeconds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PLAYTIME);
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  },

  addPlaytimeSeconds(seconds) {
    const current = this.getPlaytimeSeconds();
    const updated = current + seconds;
    localStorage.setItem(STORAGE_KEY_PLAYTIME, updated.toString());
    return updated;
  },

  resetPlaytimeSeconds() {
    localStorage.setItem(STORAGE_KEY_PLAYTIME, '0');
  },

  recordSpinTime() {
    localStorage.setItem(STORAGE_KEY_LAST_SPIN, Date.now().toString());
  }
};
