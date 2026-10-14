import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * POST /api/rewards/validate
 * Validates a redemption code and determines category automatically.
 * Checks existence, 24-hour expiration, and single-use state.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, userId } = body || {};

    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a redemption code.' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { valid: false, error: 'Database service is currently unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    // 1. Query the 'redemptions' collection
    const q = query(
      collection(db, 'redemptions'),
      where('redemption_code', '==', cleanCode),
      limit(1)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return NextResponse.json({
        valid: false,
        code: cleanCode,
        error: 'Invalid redemption code. Please check the code and try again.'
      });
    }

    const docSnap = snap.docs[0];
    const data = docSnap.data();
    const docId = docSnap.id;

    // 2. Check Expiration: Must not exceed 24 hours from creation
    const now = new Date();
    let expiresAt = null;

    if (data.expires_at?.toDate) {
      expiresAt = data.expires_at.toDate();
    } else if (data.expires_at) {
      expiresAt = new Date(data.expires_at);
    }

    if (expiresAt && now.getTime() >= expiresAt.getTime()) {
      return NextResponse.json({
        valid: false,
        code: cleanCode,
        isExpired: true,
        error: 'This redemption code expired after 24 hours and is no longer redeemable.'
      });
    }

    // 3. Check Consumption: Must not be already used or completed
    if (data.is_used === true || data.status === 'completed' || data.status === 'processing') {
      return NextResponse.json({
        valid: false,
        code: cleanCode,
        isUsed: true,
        usedAt: data.used_at || null,
        error: 'This redemption code has already been redeemed and cannot be used again.'
      });
    }

    // 4. Determine category automatically from stored record (gift vs tournament)
    const category = (data.category || 'gift').toLowerCase();

    return NextResponse.json({
      valid: true,
      redemptionId: docId,
      code: cleanCode,
      category, // 'gift' | 'tournament'
      userId: data.user_id,
      userName: data.user_name,
      // Gift details
      giftName: data.gift_name || null,
      giftType: data.gift_type || null,
      quantity: data.quantity || null,
      unit: data.unit || null,
      network: data.network || null,
      // Tournament details
      tournamentId: data.tournament_id || null,
      tournamentName: data.tournament_name || null,
      amount: data.amount || null,
      currency: data.currency || 'NGN',
      // Metadata
      status: data.status,
      expiresAt: expiresAt ? expiresAt.toISOString() : null
    });
  } catch (err) {
    console.error('[API] /api/rewards/validate error:', err);
    return NextResponse.json(
      { valid: false, error: err.message || 'Error validating redemption code' },
      { status: 500 }
    );
  }
}
