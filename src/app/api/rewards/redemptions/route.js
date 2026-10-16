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
 * Formats user phone number and whatsapp number for each redemption.
 */
export async function GET(request) {
  try {
    if (!isFirebaseLive || !db) {
      return NextResponse.json({ success: true, redemptions: [] });
    }

    const { searchParams } = new URL(request.url);
    const maxLimit = parseInt(searchParams.get('limit') || '100', 10);
    const categoryFilter = searchParams.get('category');
    const statusFilter = searchParams.get('status');

    const redemptionsColl = collection(db, 'redemptions');
    let snap;
    try {
      const q = query(redemptionsColl, orderBy('created_at', 'desc'), limit(maxLimit));
      snap = await getDocs(q);
    } catch (orderErr) {
      snap = await getDocs(redemptionsColl);
    }

    // Attempt to read redemption_contacts for any voluntarily submitted WhatsApp numbers
    const contactMap = {};
    try {
      const contactsSnap = await getDocs(collection(db, 'redemption_contacts'));
      contactsSnap.forEach((cd) => {
        const cdata = cd.data();
        if (cdata.redemption_id) {
          contactMap[cdata.redemption_id] = cdata.whatsapp_phone_number || cdata.phone;
        }
      });
    } catch (contactErr) {
      // Optional fallback
    }

    let list = snap.docs.map((d) => {
      const data = d.data();
      const phone = data.phone || data.recipient_phone || data.fulfillment_details?.recipient_phone || null;
      const whatsapp = data.whatsapp_number || data.fulfillment_details?.whatsapp_number || contactMap[d.id] || null;

      return {
        id: d.id,
        ...data,
        phone,
        recipient_phone: phone,
        whatsapp_number: whatsapp,
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
