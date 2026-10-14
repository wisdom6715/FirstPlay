import { NextResponse } from 'next/server';
import { db, isFirebaseLive } from '../../../../services/firebaseConfig';
import { 
  doc, 
  runTransaction, 
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { flutterwaveUtils } from '../../../../utils/flutterwaveUtils';

/**
 * POST /api/rewards/fulfill
 * Processes reward fulfillment atomically using Firestore transactions.
 * Prevents duplicate redemptions, verifies expiration, and connects with Flutterwave.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      redemptionId, 
      code, 
      userId,
      whatsappNumber, 
      // Gift payload
      phone, 
      network, 
      // Tournament payload
      bankCode, 
      bankName,
      accountNumber, 
      accountName 
    } = body || {};

    const cleanCode = (code || '').trim().toUpperCase();

    if (!redemptionId && !cleanCode) {
      return NextResponse.json(
        { success: false, error: 'Redemption identifier is required' },
        { status: 400 }
      );
    }

    if (!isFirebaseLive || !db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }

    // 1. Target the redemption document
    const redemptionRef = doc(db, 'redemptions', redemptionId);

    // 2. Execute Atomic Firestore Transaction: Guarantee single-use and claim for processing
    let authoritativeRecord = null;

    try {
      authoritativeRecord = await runTransaction(db, async (transaction) => {
        const redemptionSnap = await transaction.get(redemptionRef);

        if (!redemptionSnap.exists()) {
          throw new Error('Redemption record not found.');
        }

        const data = redemptionSnap.data();

        // Verify Expiration
        const now = new Date();
        let expiresAt = null;
        if (data.expires_at?.toDate) {
          expiresAt = data.expires_at.toDate();
        } else if (data.expires_at) {
          expiresAt = new Date(data.expires_at);
        }

        if (expiresAt && now.getTime() >= expiresAt.getTime()) {
          throw new Error('This redemption code has expired (24-hour limit exceeded).');
        }

        // Verify Not Already Used
        if (data.is_used === true || data.status === 'completed' || data.status === 'processing') {
          throw new Error('This redemption code has already been redeemed or is currently processing.');
        }

        // Atomically claim the code
        transaction.update(redemptionRef, {
          is_used: true,
          status: 'processing',
          claimed_at: serverTimestamp(),
          used_at: serverTimestamp()
        });

        return { id: redemptionSnap.id, ...data };
      });
    } catch (txErr) {
      console.warn('[Fulfill API] Atomic transaction blocked:', txErr.message);
      return NextResponse.json(
        { success: false, error: txErr.message },
        { status: 409 } // Conflict / Precondition Failed
      );
    }

    // 3. Save Optional WhatsApp Contact if voluntarily provided (PRD Section 6)
    if (whatsappNumber && whatsappNumber.trim()) {
      try {
        await addDoc(collection(db, 'redemption_contacts'), {
          redemption_id: authoritativeRecord.id,
          user_id: userId || authoritativeRecord.user_id,
          whatsapp_phone_number: whatsappNumber.trim(),
          created_at: serverTimestamp()
        });
      } catch (contactErr) {
        console.warn('[Fulfill API] Could not save optional contact:', contactErr.message);
      }
    }

    // 4. Execute Fulfillment Based on Authoritative Category
    const category = (authoritativeRecord.category || 'gift').toLowerCase();
    const reference = `FP-FUL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let fulfillmentResult = null;

    if (category === 'gift') {
      const giftType = (authoritativeRecord.gift_type || 'data').toLowerCase();

      if (giftType === 'data' || giftType === 'airtime') {
        if (!phone || !phone.trim()) {
          await updateDoc(redemptionRef, { status: 'failed', failure_reason: 'Recipient phone number missing' });
          return NextResponse.json({ success: false, error: 'Recipient phone number is required.' }, { status: 400 });
        }

        const cleanPhone = phone.trim();
        const cleanNetwork = (network || authoritativeRecord.network || 'MTN').trim().toUpperCase();

        fulfillmentResult = await flutterwaveUtils.purchaseBillVTU({
          phone: cleanPhone,
          network: cleanNetwork,
          amount: authoritativeRecord.quantity,
          giftType,
          reference
        });

        const cleanWhatsapp = (whatsappNumber || '').trim() || null;

        // Update final redemption record
        await updateDoc(redemptionRef, {
          status: fulfillmentResult.status || (fulfillmentResult.success ? 'completed' : 'failed'),
          fulfillment_provider: 'flutterwave_vtu',
          provider_reference: fulfillmentResult.reference || reference,
          phone: cleanPhone,
          recipient_phone: cleanPhone,
          whatsapp_number: cleanWhatsapp,
          fulfillment_details: {
            recipient_phone: cleanPhone,
            whatsapp_number: cleanWhatsapp,
            network: cleanNetwork,
            reward_type: giftType,
            quantity: authoritativeRecord.quantity,
            unit: authoritativeRecord.unit
          },
          completed_at: fulfillmentResult.success ? serverTimestamp() : null
        });

      } else {
        const cleanWhatsapp = (whatsappNumber || '').trim() || null;
        const cleanPhone = (phone || '').trim() || null;

        // Gift card or other manual/configured reward
        fulfillmentResult = {
          success: true,
          status: 'completed',
          message: `Your ${authoritativeRecord.gift_name} has been approved and queued for delivery.`
        };

        await updateDoc(redemptionRef, {
          status: 'completed',
          fulfillment_provider: 'internal_gift_system',
          provider_reference: reference,
          phone: cleanPhone,
          recipient_phone: cleanPhone,
          whatsapp_number: cleanWhatsapp,
          fulfillment_details: {
            phone: cleanPhone,
            whatsapp_number: cleanWhatsapp
          },
          completed_at: serverTimestamp()
        });
      }

    } else if (category === 'tournament') {
      // Tournament Cash Prize Bank Transfer
      if (!accountNumber || !bankCode) {
        await updateDoc(redemptionRef, { status: 'failed', failure_reason: 'Bank account details missing' });
        return NextResponse.json({ success: false, error: 'Bank account number and bank selection required.' }, { status: 400 });
      }

      const cleanWhatsapp = (whatsappNumber || '').trim() || null;

      fulfillmentResult = await flutterwaveUtils.transferTournamentPrize({
        accountNumber: accountNumber.trim(),
        bankCode: bankCode.trim(),
        amount: authoritativeRecord.amount,
        currency: authoritativeRecord.currency || 'NGN',
        tournamentName: authoritativeRecord.tournament_name || 'Tournament Prize',
        reference
      });

      // Update final redemption record
      await updateDoc(redemptionRef, {
        status: fulfillmentResult.status || (fulfillmentResult.success ? 'completed' : 'failed'),
        fulfillment_provider: 'flutterwave_transfers',
        provider_reference: fulfillmentResult.reference || reference,
        phone: cleanWhatsapp,
        whatsapp_number: cleanWhatsapp,
        fulfillment_details: {
          whatsapp_number: cleanWhatsapp,
          bank_code: bankCode.trim(),
          bank_name: bankName || bankCode,
          account_number: accountNumber.trim(),
          account_name: accountName || 'Verified Account',
          amount: authoritativeRecord.amount,
          currency: authoritativeRecord.currency || 'NGN'
        },
        completed_at: fulfillmentResult.success ? serverTimestamp() : null
      });
    }

    return NextResponse.json({
      success: fulfillmentResult?.success ?? true,
      status: fulfillmentResult?.status || 'completed',
      category,
      reference,
      message: fulfillmentResult?.message || 'Reward redemption completed successfully!'
    });

  } catch (err) {
    console.error('[API] /api/rewards/fulfill error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing reward fulfillment' },
      { status: 500 }
    );
  }
}
