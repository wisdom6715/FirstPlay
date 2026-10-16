import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';

const DEFAULT_SIX_ZEROS = [
  { id: 'seg_1', amount: 0, amountLabel: '0 MB', subLabel: 'Try Again', giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
  { id: 'seg_2', amount: 0, amountLabel: '0 MB', subLabel: 'Try Again', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
  { id: 'seg_3', amount: 0, amountLabel: '0 MB', subLabel: 'Try Again', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' },
  { id: 'seg_4', amount: 0, amountLabel: '0 MB', subLabel: 'Try Again', giftType: 'data', unit: 'MB', color: '#0f172a', textColor: '#ffffff' },
  { id: 'seg_5', amount: 0, amountLabel: '0 MB', subLabel: 'Try Again', giftType: 'data', unit: 'MB', color: '#0066ff', textColor: '#ffffff' },
  { id: 'seg_6', amount: 0, amountLabel: '0 MB', subLabel: 'Try Again', giftType: 'data', unit: 'MB', color: '#ffffff', textColor: '#0a0a0f' }
];

/**
 * Builds 6 segment objects from raw outcomes array.
 * Tags the lowest number so its probability can be calculated, but awards the actual prize.
 */
function buildSegmentsFromOutcomes(outcomes = [], giftName = 'Reward', giftType = 'data', unit = 'MB', network = null) {
  const colors = ['#0f172a', '#0066ff', '#ffffff', '#0f172a', '#0066ff', '#ffffff'];
  const textColors = ['#ffffff', '#ffffff', '#0a0a0f', '#ffffff', '#ffffff', '#0a0a0f'];

  // Pad or trim to exactly 6 values
  const cleanOutcomes = Array.from({ length: 6 }, (_, i) => Number(outcomes[i]) || 0);
  const minAmount = Math.min(...cleanOutcomes);

  return cleanOutcomes.map((amt, idx) => {
    const isSmallest = amt === minAmount;
    return {
      id: `seg_${idx + 1}`,
      amount: amt,
      amountLabel: `${amt} ${unit || 'MB'}`,
      subLabel: giftName,
      isSmallest,
      giftType,
      unit: unit || 'MB',
      network: network || null,
      color: colors[idx],
      textColor: textColors[idx]
    };
  });
}

/**
 * GET /api/rewards/gifts
 * Returns all gifts from the `gifts` collection for admin dashboard.
 */
export async function GET(request) {
  try {
    if (!isFirebaseLive || !db) {
      return NextResponse.json({ success: true, gifts: [], currentGift: null });
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');

    const giftsColl = collection(db, 'gifts');
    let snap;
    try {
      const q = query(giftsColl, orderBy('created_at', 'desc'));
      snap = await getDocs(q);
    } catch (orderErr) {
      snap = await getDocs(giftsColl);
    }

    let list = snap.docs.map((d) => ({
      id: d.id,
      gift_id: d.id,
      ...d.data(),
      created_at: d.data().created_at?.toDate ? d.data().created_at.toDate().toISOString() : d.data().created_at,
      updated_at: d.data().updated_at?.toDate ? d.data().updated_at.toDate().toISOString() : d.data().updated_at
    }));

    if (typeFilter && typeFilter !== 'all') {
      list = list.filter((g) => g.gift_type === typeFilter || g.category_slug === typeFilter);
    }
    if (statusFilter === 'active') {
      list = list.filter((g) => g.is_active === true);
    } else if (statusFilter === 'inactive') {
      list = list.filter((g) => g.is_active === false);
    }

    // The most recently created active gift is the current spinner gift
    const currentGift = list.find((g) => g.is_active !== false) || list[0] || null;

    return NextResponse.json({ 
      success: true, 
      gifts: list,
      currentGift
    });
  } catch (err) {
    console.error('[API] GET /api/rewards/gifts error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch gifts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rewards/gifts
 * Creates a new gift or updates an existing gift in the `gifts` collection.
 * Also synchronizes the authoritative 6-segment wheel in Firebase.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      gift_id, 
      gift_name, 
      category_id,
      category_name,
      gift_type, 
      description, 
      unit, 
      network, 
      outcomes, // Array of 6 numbers: [0, val1, val2, val3, val4, val5]
      is_active 
    } = body || {};

    if (!gift_name || !gift_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Gift name is required.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }

    const cleanUnit = (unit || 'MB').trim();
    const cleanType = (gift_type || category_name || 'data').toLowerCase().trim();
    const cleanName = gift_name.trim();

    // Ensure array of 6 numbers entered by admin
    let cleanOutcomes = [50, 100, 250, 500, 1024, 2048];
    if (Array.isArray(outcomes) && outcomes.length === 6) {
      cleanOutcomes = outcomes.map((o) => Number(o) || 0);
    }

    const segments = buildSegmentsFromOutcomes(cleanOutcomes, cleanName, cleanType, cleanUnit, network);

    const docData = {
      gift_name: cleanName,
      name: cleanName,
      category_id: category_id || null,
      category_name: category_name || cleanType,
      gift_type: cleanType,
      unit: cleanUnit,
      description: (description || '').trim(),
      network: network ? network.trim() : null,
      outcomes: cleanOutcomes,
      segments,
      is_active: is_active !== false,
      updated_at: serverTimestamp()
    };

    let targetDocId = gift_id;

    if (gift_id) {
      // Update existing gift
      const giftDocRef = doc(db, 'gifts', gift_id);
      await updateDoc(giftDocRef, docData);
    } else {
      // Create new gift document
      docData.created_at = serverTimestamp();
      const newRef = await addDoc(collection(db, 'gifts'), docData);
      targetDocId = newRef.id;
    }

    // Synchronize wheel_configs/current document for seamless backend resolution
    try {
      const wheelDocRef = doc(db, 'wheel_configs', 'current');
      await setDoc(wheelDocRef, {
        gift_id: targetDocId,
        title: cleanName,
        category: category_name || cleanType,
        unit: cleanUnit,
        segments,
        outcomes: cleanOutcomes,
        updated_at: serverTimestamp(),
        is_active: is_active !== false
      }, { merge: true });
    } catch (wheelSyncErr) {
      console.warn('[API] Could not sync wheel_configs/current:', wheelSyncErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gift saved successfully and synchronized with the rewards wheel.',
      gift: { id: targetDocId, ...docData }
    });
  } catch (err) {
    console.error('[API] POST /api/rewards/gifts error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save gift' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rewards/gifts
 * Deletes a gift from the `gifts` collection and resets the wheel outcomes to zero.
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Gift ID is required.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }

    // 1. Delete from 'gifts'
    const docRef = doc(db, 'gifts', id);
    await deleteDoc(docRef);

    // 2. Reset wheel_configs/current to 6 zero outcomes
    try {
      const wheelDocRef = doc(db, 'wheel_configs', 'current');
      await setDoc(wheelDocRef, {
        gift_id: null,
        title: 'FirstPlay Rewards Wheel',
        segments: DEFAULT_SIX_ZEROS,
        outcomes: [0, 0, 0, 0, 0, 0],
        updated_at: serverTimestamp(),
        is_active: false
      });
    } catch (wheelErr) {
      console.warn('[API] Warning resetting wheel_configs on delete:', wheelErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gift deleted successfully. Wheel has been reset.'
    });
  } catch (err) {
    console.error('[API] DELETE /api/rewards/gifts error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete gift' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rewards/gifts
 * Soft toggles activation/deactivation of a gift.
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { gift_id, is_active } = body || {};

    if (!gift_id) {
      return NextResponse.json(
        { success: false, error: 'Gift ID is required.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }

    const giftDocRef = doc(db, 'gifts', gift_id);
    await updateDoc(giftDocRef, {
      is_active: Boolean(is_active),
      updated_at: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: `Gift ${is_active ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (err) {
    console.error('[API] PATCH /api/rewards/gifts error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to toggle gift status' },
      { status: 500 }
    );
  }
}
