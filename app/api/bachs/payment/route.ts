import { NextResponse } from 'next/server';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import {
  BACHS_PAYMENT_LINK_IDS,
  BACHS_PAYMENT_LINKS,
  verifyBachsWebhookSignature
} from '@/lib/bachs';

export const runtime = 'nodejs';

/**
 * GET /api/bachs/payment
 * Diagnostics & reference verification helper
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkRef = searchParams.get('check_ref');

  if (checkRef && firebaseDb) {
    try {
      const q = query(
        collection(firebaseDb, 'pending_campaigns'),
        where('reference', '==', checkRef.trim())
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const item = snapshot.docs[0].data();
        return NextResponse.json({
          reference: checkRef,
          status: item.paymentStatus || item.status,
          category: item.category,
          title: item.title,
          listing_id: item.listingId || null
        });
      }
    } catch (err) {
      console.warn('Error checking reference:', err);
    }
  }

  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/bachs/payment',
    provider: 'Bachs.io',
    links: BACHS_PAYMENT_LINKS,
    instructions: 'Send Bachs webhook POST events here to confirm payments before writing listings to Firestore.'
  });
}

/**
 * POST /api/bachs/payment
 * Bachs Webhook Endpoint to confirm payment and publish the listing to Firestore
 */
export async function POST(request: Request) {
  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Unable to read request payload' }, { status: 400 });
  }

  // Signature verification
  const sigHeader =
    request.headers.get('x-bachs-signature') ||
    request.headers.get('signature') ||
    request.headers.get('x-signature');
  const timestampHeader =
    request.headers.get('x-bachs-timestamp') ||
    request.headers.get('timestamp');

  const verification = verifyBachsWebhookSignature(rawBody, sigHeader, timestampHeader);
  if (!verification.valid) {
    console.warn('[Bachs Webhook] Signature verification failed:', verification.reason);
    return NextResponse.json({ error: 'Signature verification failed', reason: verification.reason }, { status: 401 });
  }

  // Parse webhook payload
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const event = String(payload.event || payload.type || payload.status || '').toLowerCase();
  const data = (payload.data || payload) as Record<string, unknown>;

  console.info('[Bachs Webhook] Received event:', event, 'ID:', data.id || data.reference);

  // Check if event denotes successful collection/payment
  const isSuccess =
    event.includes('collection.succeeded') ||
    event.includes('payment.successful') ||
    event.includes('charge.success') ||
    event.includes('checkout.completed') ||
    event.includes('success') ||
    data.status === 'succeeded' ||
    data.status === 'paid' ||
    data.status === 'successful';

  if (!isSuccess) {
    return NextResponse.json({
      received: true,
      message: `Event '${event}' does not require fulfillment.`
    }, { status: 200 });
  }

  // Extract payment details
  const paymentLinkId = String(
    data.payment_link_id ||
    data.payment_link ||
    data.link_id ||
    ''
  ).toLowerCase();

  const reference = String(
    data.reference ||
    (data.metadata as Record<string, unknown> | undefined)?.reference ||
    data.client_reference_id ||
    ''
  ).trim();

  // Determine category from payment link or metadata
  let inferredCategory: 'app' | 'product' | 'game' = 'app';
  if (paymentLinkId.includes(BACHS_PAYMENT_LINK_IDS.product) || paymentLinkId.includes('pl_051e5550c4f6')) {
    inferredCategory = 'product';
  } else if (paymentLinkId.includes(BACHS_PAYMENT_LINK_IDS.app) || paymentLinkId.includes('pl_fb788898fc46')) {
    inferredCategory = 'app';
  } else if ((data.metadata as Record<string, unknown> | undefined)?.category) {
    inferredCategory = (data.metadata as Record<string, unknown>).category as 'app' | 'product';
  }

  if (!firebaseDb) {
    console.error('[Bachs Webhook] Firestore is not configured');
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
  }

  try {
    // 1. Look for matching pending campaign by reference
    let pendingDoc: { id: string; data: Record<string, unknown> } | null = null;

    if (reference) {
      const q = query(
        collection(firebaseDb, 'pending_campaigns'),
        where('reference', '==', reference)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        pendingDoc = {
          id: snapshot.docs[0].id,
          data: snapshot.docs[0].data()
        };
      }
    }

    // If not found by reference, try finding the most recent pending campaign for this category
    if (!pendingDoc) {
      const q = query(
        collection(firebaseDb, 'pending_campaigns'),
        where('category', '==', inferredCategory),
        where('paymentStatus', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        pendingDoc = {
          id: snapshot.docs[0].id,
          data: snapshot.docs[0].data()
        };
      }
    }

    // 2. Prepare listing data to write into Firestore DB
    const campaignCategory = (pendingDoc?.data.category as 'app' | 'product') || inferredCategory;
    const title = String(pendingDoc?.data.title || data.title || (data.metadata as Record<string, unknown> | undefined)?.title || 'Promoted Showcase');
    const studio = String(pendingDoc?.data.studioName || (data.metadata as Record<string, unknown> | undefined)?.studio || 'Independent Studio');
    const url = String(pendingDoc?.data.url || (data.metadata as Record<string, unknown> | undefined)?.url || '');
    const tagline = String(pendingDoc?.data.tagline || (data.metadata as Record<string, unknown> | undefined)?.tagline || '');
    const description = String(pendingDoc?.data.description || (data.metadata as Record<string, unknown> | undefined)?.description || tagline);
    const icon = String(pendingDoc?.data.icon || (data.metadata as Record<string, unknown> | undefined)?.icon || '');
    const banner = String(pendingDoc?.data.banner || (data.metadata as Record<string, unknown> | undefined)?.banner || '');

    // Write verified listing into 'apps' collection
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const appDocRef = await addDoc(collection(firebaseDb, 'apps'), {
      category: campaignCategory,
      app_name: campaignCategory === 'app' ? title : null,
      product_name: campaignCategory === 'product' ? title : null,
      game_name: null,
      app_url: campaignCategory === 'app' ? url : null,
      product_url: campaignCategory === 'product' ? url : null,
      game_url: null,
      full_name: studio,
      tagline,
      description,
      logo: icon || null,
      flyer: banner || null,
      banner_url: banner || null,
      payment_status: 'paid',
      payment_reference: reference || String(data.id || 'bachs_confirmed'),
      payment_provider: 'bachs',
      created_at: serverTimestamp(),
      expiry_date: expiryDate
    });

    console.info(`[Bachs Webhook] Listing verified and written to Firestore: ${appDocRef.id} (${campaignCategory}: ${title})`);

    // Also write to promotion_banner if banner image is available
    if (banner) {
      await addDoc(collection(firebaseDb, 'promotion_banner'), {
        title,
        subtitle: tagline || description.slice(0, 80),
        badge_text: campaignCategory === 'app' ? 'WEB APP SHOWCASE' : 'PRODUCT SHOWCASE',
        image_url: banner,
        target_url: url,
        placement: 'all',
        active: true,
        payment_reference: reference || String(data.id || 'bachs_confirmed'),
        created_at: serverTimestamp()
      });
    }

    // Update pending campaign record to completed
    if (pendingDoc) {
      await updateDoc(doc(firebaseDb, 'pending_campaigns', pendingDoc.id), {
        paymentStatus: 'paid',
        status: 'completed',
        listingId: appDocRef.id,
        paidAt: serverTimestamp(),
        paymentReference: reference || String(data.id || 'bachs_confirmed')
      });
    }

    return NextResponse.json({
      received: true,
      status: 'confirmed',
      listing_id: appDocRef.id,
      category: campaignCategory,
      title
    }, { status: 200 });
  } catch (err) {
    console.error('[Bachs Webhook] Error writing confirmed listing to Firestore:', err);
    return NextResponse.json({ error: 'Failed to record listing', details: (err as Error).message }, { status: 500 });
  }
}
