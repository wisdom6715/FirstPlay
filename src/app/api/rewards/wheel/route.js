import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Default 6-segment wheel initialized to zero outcomes as required by PRD Section 3
 */
export const DEFAULT_SIX_SEGMENTS = [
  { id: 'seg_1', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
  { id: 'seg_2', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
  { id: 'seg_3', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' },
  { id: 'seg_4', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
  { id: 'seg_5', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
  { id: 'seg_6', amount: 0, amountLabel: '0 MB', subLabel: 'Data', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' }
];

/**
 * GET /api/rewards/wheel
 * Retrieves the authoritative 6-segment wheel configuration from Firebase.
 */
export async function GET() {
  try {
    if (isFirebaseLive && db) {
      // 1. Check dedicated wheel_configs/current document
      const wheelDocRef = doc(db, 'wheel_configs', 'current');
      const wheelSnap = await getDoc(wheelDocRef);

      if (wheelSnap.exists()) {
        const data = wheelSnap.data();
        if (Array.isArray(data.segments) && data.segments.length === 6) {
          return NextResponse.json({
            success: true,
            isConfigured: true,
            segments: data.segments,
            title: data.title || 'FirstPlay Rewards Wheel',
            updatedAt: data.updated_at
          });
        }
      }

      // 2. Check active gift in 'gifts' collection
      const giftsQuery = query(collection(db, 'gifts'), where('is_active', '==', true));
      const giftsSnap = await getDocs(giftsQuery);
      
      if (!giftsSnap.empty) {
        const activeGifts = giftsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // If a gift has pre-calculated 6 segments (from 6 outcomes), use it directly
        const configuredGift = activeGifts.find(g => Array.isArray(g.segments) && g.segments.length === 6);
        if (configuredGift) {
          return NextResponse.json({
            success: true,
            isConfigured: true,
            segments: configuredGift.segments,
            title: configuredGift.gift_name || configuredGift.name || 'FirstPlay Rewards Wheel'
          });
        }

        // Otherwise map active gifts
        const segments = Array.from({ length: 6 }, (_, idx) => {
          const gift = activeGifts[idx];
          const colors = ['#0f172a', '#0066ff', '#ffffff', '#0f172a', '#0066ff', '#ffffff'];
          const textColors = ['#ffffff', '#ffffff', '#0a0a0f', '#ffffff', '#ffffff', '#0a0a0f'];
          
          if (gift) {
            return {
              id: gift.id || `seg_${idx + 1}`,
              giftId: gift.id,
              amount: Number(gift.quantity) || 0,
              amountLabel: `${gift.quantity} ${gift.unit || 'MB'}`,
              subLabel: gift.gift_name || 'Gift',
              giftType: gift.gift_type || 'data',
              unit: gift.unit || 'MB',
              network: gift.network || null,
              color: colors[idx],
              textColor: textColors[idx]
            };
          }
          return {
            id: `seg_${idx + 1}`,
            amount: 0,
            amountLabel: '0 MB',
            subLabel: 'Try Again',
            giftType: 'data',
            unit: 'MB',
            color: colors[idx],
            textColor: textColors[idx]
          };
        });

        return NextResponse.json({
          success: true,
          isConfigured: true,
          segments
        });
      }
    }

    // Default zero outcomes per PRD section 3
    return NextResponse.json({
      success: true,
      isConfigured: false,
      segments: DEFAULT_SIX_SEGMENTS
    });
  } catch (err) {
    console.error('[API] /api/rewards/wheel error:', err);
    return NextResponse.json({
      success: true,
      isConfigured: false,
      segments: DEFAULT_SIX_SEGMENTS,
      error: err.message
    });
  }
}

/**
 * POST /api/rewards/wheel
 * Updates the authoritative 6-segment configuration in Firebase.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { segments, title } = body || {};

    if (!Array.isArray(segments) || segments.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Wheel must contain exactly 6 segments.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }

    // Sanitize segment items
    const sanitizedSegments = segments.map((seg, idx) => ({
      id: seg.id || `seg_${idx + 1}`,
      giftId: seg.giftId || null,
      amount: Number(seg.amount) || 0,
      amountLabel: seg.amountLabel || `${seg.amount || 0} ${seg.unit || 'MB'}`,
      subLabel: seg.subLabel || 'Reward',
      giftType: seg.giftType || 'data',
      unit: seg.unit || 'MB',
      network: seg.network || null,
      color: seg.color || (idx % 2 === 0 ? '#0f172a' : '#0066ff'),
      textColor: seg.textColor || '#ffffff'
    }));

    const wheelDocRef = doc(db, 'wheel_configs', 'current');
    await setDoc(wheelDocRef, {
      title: title || 'FirstPlay Rewards Wheel',
      segments: sanitizedSegments,
      updated_at: serverTimestamp(),
      is_active: true
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Wheel configuration updated successfully.',
      segments: sanitizedSegments
    });
  } catch (err) {
    console.error('[API] POST /api/rewards/wheel error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update wheel configuration' },
      { status: 500 }
    );
  }
}
