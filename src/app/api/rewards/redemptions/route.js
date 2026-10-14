import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

/**
 * GET /api/rewards/redemptions
 * Lists recent redemption records for admin audit and management.
 */
export async function GET(request) {
  try {
    if (!isFirebaseLive || !db) {
      return NextResponse.json({ success: true, redemptions: [] });
    }

    const { searchParams } = new URL(request.url);
    const maxLimit = parseInt(searchParams.get('limit') || '50', 10);
    const categoryFilter = searchParams.get('category');
    const statusFilter = searchParams.get('status');

    const redemptionsColl = collection(db, 'redemptions');
    const q = query(redemptionsColl, orderBy('created_at', 'desc'), limit(maxLimit));
    const snap = await getDocs(q);

    let list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at,
        expires_at: data.expires_at?.toDate ? data.expires_at.toDate().toISOString() : data.expires_at,
        used_at: data.used_at?.toDate ? data.used_at.toDate().toISOString() : data.used_at
      };
    });

    if (categoryFilter && categoryFilter !== 'all') {
      list = list.filter((r) => r.category === categoryFilter);
    }
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }

    return NextResponse.json({ success: true, redemptions: list });
  } catch (err) {
    console.error('[API] GET /api/rewards/redemptions error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch redemptions' },
      { status: 500 }
    );
  }
}
