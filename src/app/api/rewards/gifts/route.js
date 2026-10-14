import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';

/**
 * GET /api/rewards/gifts
 * Returns all gifts from the `gifts` collection for admin dashboard.
 */
export async function GET(request) {
  try {
    if (!isFirebaseLive || !db) {
      return NextResponse.json({ success: true, gifts: [] });
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');

    const giftsColl = collection(db, 'gifts');
    const q = query(giftsColl, orderBy('created_at', 'desc'));
    const snap = await getDocs(q);

    let list = snap.docs.map((d) => ({
      id: d.id,
      gift_id: d.id,
      ...d.data(),
      created_at: d.data().created_at?.toDate ? d.data().created_at.toDate().toISOString() : d.data().created_at,
      updated_at: d.data().updated_at?.toDate ? d.data().updated_at.toDate().toISOString() : d.data().updated_at
    }));

    if (typeFilter && typeFilter !== 'all') {
      list = list.filter((g) => g.gift_type === typeFilter);
    }
    if (statusFilter === 'active') {
      list = list.filter((g) => g.is_active === true);
    } else if (statusFilter === 'inactive') {
      list = list.filter((g) => g.is_active === false);
    }

    return NextResponse.json({ success: true, gifts: list });
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
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      gift_id, 
      gift_name, 
      gift_type, 
      description, 
      quantity, 
      unit, 
      network, 
      is_active 
    } = body || {};

    if (!gift_name || !gift_type) {
      return NextResponse.json(
        { success: false, error: 'Gift name and gift type are required.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }

    const docData = {
      gift_name: gift_name.trim(),
      gift_type: (gift_type || 'data').toLowerCase().trim(),
      description: (description || '').trim(),
      quantity: Number(quantity) || 0,
      unit: (unit || 'MB').trim(),
      network: network ? network.trim() : null,
      is_active: is_active !== false,
      updated_at: serverTimestamp()
    };

    if (gift_id) {
      // Update existing gift (soft edit)
      const giftDocRef = doc(db, 'gifts', gift_id);
      await updateDoc(giftDocRef, docData);
      return NextResponse.json({
        success: true,
        message: 'Gift updated successfully.',
        gift: { id: gift_id, ...docData }
      });
    } else {
      // Create new gift
      docData.created_at = serverTimestamp();
      const newRef = await addDoc(collection(db, 'gifts'), docData);
      return NextResponse.json({
        success: true,
        message: 'Gift created successfully.',
        gift: { id: newRef.id, ...docData }
      });
    }
  } catch (err) {
    console.error('[API] POST /api/rewards/gifts error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save gift' },
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
