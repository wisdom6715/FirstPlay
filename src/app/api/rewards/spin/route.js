import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import crypto from 'crypto';

/**
 * Generate a cryptographically secure, unique 8-character redemption code
 * Format matching PRD Section 5: e.g. "A7K9P2XM"
 */
function generateSecureCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude 0, O, 1, I to prevent user ambiguity
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * POST /api/rewards/spin
 * Authoritatively executes spin resolution and records the 24-hour redemption record in Firebase.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, userName } = body || {};

    const cleanUserId = (userId || 'anonymous_player').trim();
    const cleanUserName = (userName || cleanUserId).trim();

    // 1. Retrieve the authoritative 6-segment wheel outcomes from Firebase
    let activeSegments = null;

    if (isFirebaseLive && db) {
      const wheelDocRef = doc(db, 'wheel_configs', 'current');
      const wheelSnap = await getDoc(wheelDocRef);

      if (wheelSnap.exists()) {
        const data = wheelSnap.data();
        if (Array.isArray(data.segments) && data.segments.length === 6) {
          activeSegments = data.segments;
        }
      }

      if (!activeSegments) {
        // Fallback: check active gift in 'gifts' collection
        try {
          const giftsQuery = query(collection(db, 'gifts'), where('is_active', '==', true));
          const giftsSnap = await getDocs(giftsQuery);
          if (!giftsSnap.empty) {
            const configuredGift = giftsSnap.docs.map(d => d.data()).find(g => Array.isArray(g.segments) && g.segments.length === 6);
            if (configuredGift) {
              activeSegments = configuredGift.segments;
            }
          }
        } catch (giftCheckErr) {
          console.warn('[Spin] Could not query gifts collection:', giftCheckErr);
        }
      }
    }

    // Default outcomes if wheel not yet configured by admin
    if (!activeSegments || activeSegments.length !== 6) {
      activeSegments = [
        { id: 'seg_1', amount: 50, amountLabel: '50 MB', subLabel: 'Try Again', isSmallest: true, giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
        { id: 'seg_2', amount: 100, amountLabel: '100 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
        { id: 'seg_3', amount: 250, amountLabel: '250 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' },
        { id: 'seg_4', amount: 500, amountLabel: '500 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
        { id: 'seg_5', amount: 1024, amountLabel: '1024 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
        { id: 'seg_6', amount: 2048, amountLabel: '2048 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' }
      ];
    }

    // 2. Authoritative Server-Side Outcome Resolution
    // Identify smallest number in the slots (treated the same way 0 was treated)
    const amounts = activeSegments.map(s => Number(s.amount) || 0);
    const minAmount = Math.min(...amounts);

    const smallestIndices = activeSegments
      .map((s, i) => ((Number(s.amount) || 0) === minAmount ? i : -1))
      .filter(i => i !== -1);
    const positiveRewardIndices = activeSegments
      .map((s, i) => ((Number(s.amount) || 0) > minAmount ? i : -1))
      .filter(i => i !== -1);

    let chosenSegmentIndex = 0;
    const randomFloat = Math.random();

    if (positiveRewardIndices.length === 0) {
      // All slots have identical amount
      chosenSegmentIndex = Math.floor(Math.random() * 6);
    } else {
      // 30% chance lands on the smallest number (treated like 0), 70% chance of winning one of the higher rewards
      if (randomFloat < 0.30 && smallestIndices.length > 0) {
        chosenSegmentIndex = smallestIndices[Math.floor(Math.random() * smallestIndices.length)];
      } else if (positiveRewardIndices.length > 0) {
        chosenSegmentIndex = positiveRewardIndices[Math.floor(Math.random() * positiveRewardIndices.length)];
      } else {
        chosenSegmentIndex = Math.floor(Math.random() * 6);
      }
    }

    const wonSegment = activeSegments[chosenSegmentIndex];
    const isSmallestNumber = (Number(wonSegment.amount) || 0) === minAmount;

    // The smallest number is treated the exact same way 0 was treated: no redemption code generated
    if (isSmallestNumber) {
      return NextResponse.json({
        success: true,
        segmentIndex: chosenSegmentIndex,
        segment: {
          ...wonSegment,
          isSmallest: true,
          subLabel: wonSegment.subLabel || 'Try Again'
        },
        reward: null
      });
    }

    // 3. For positive reward: Generate unique code and store in `redemptions` collection
    let uniqueCode = generateSecureCode();
    const now = new Date();
    // Exactly 24 hours expiry from creation time
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let redemptionDocId = null;

    if (isFirebaseLive && db) {
      // Ensure code collision avoidance
      let codeExists = true;
      let attempts = 0;
      while (codeExists && attempts < 5) {
        const checkQuery = query(collection(db, 'redemptions'), where('redemption_code', '==', uniqueCode));
        const checkSnap = await getDocs(checkQuery);
        if (checkSnap.empty) {
          codeExists = false;
        } else {
          uniqueCode = generateSecureCode();
          attempts++;
        }
      }

      const redemptionRecord = {
        user_id: cleanUserId,
        user_name: cleanUserName,
        redemption_code: uniqueCode,
        category: 'gift',
        gift_id: wonSegment.giftId || wonSegment.id || 'dynamic_gift',
        gift_type: wonSegment.giftType || 'data',
        gift_name: wonSegment.subLabel || wonSegment.giftName || 'Mobile Reward',
        quantity: Number(wonSegment.amount) || 0,
        unit: wonSegment.unit || 'MB',
        network: wonSegment.network || null,
        tournament_id: null,
        tournament_name: null,
        amount: null,
        currency: null,
        created_at: serverTimestamp(),
        expires_at: Timestamp.fromDate(expiresAt),
        is_used: false,
        used_at: null,
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'redemptions'), redemptionRecord);
      redemptionDocId = docRef.id;
      console.info(`[Rewards API] Redemption code generated: ${uniqueCode} for user ${cleanUserId}`);
    }

    return NextResponse.json({
      success: true,
      segmentIndex: chosenSegmentIndex,
      segment: wonSegment,
      reward: {
        id: redemptionDocId,
        redemptionCode: uniqueCode,
        category: 'gift',
        giftName: wonSegment.subLabel || wonSegment.giftName || 'Mobile Reward',
        quantity: wonSegment.amount,
        unit: wonSegment.unit || 'MB',
        network: wonSegment.network || null,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (err) {
    console.error('[API] /api/rewards/spin error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error resolving spin' },
      { status: 500 }
    );
  }
}
