import { NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { BACHS_PAYMENT_LINK_IDS, BACHS_PAYMENT_LINKS } from '@/lib/bachs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, studioName, tagline, url, description, icon, banner } = body;

    if (!title || !url || !category) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 });
    }

    // If game, it's free! Write directly to 'apps' collection
    if (category === 'game') {
      if (!firebaseDb) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
      }

      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const gameDoc = await addDoc(collection(firebaseDb, 'apps'), {
        category: 'game',
        game_name: title.trim(),
        app_name: null,
        product_name: null,
        game_url: url.trim(),
        app_url: null,
        product_url: null,
        full_name: studioName?.trim() || 'Independent Studio',
        tagline: tagline?.trim() || '',
        description: description?.trim() || '',
        logo: icon || null,
        flyer: banner || null,
        banner_url: banner || null,
        payment_status: 'free',
        created_at: serverTimestamp(),
        expiry_date: expiryDate
      });

      if (banner) {
        await addDoc(collection(firebaseDb, 'promotion_banner'), {
          title: title.trim(),
          subtitle: tagline?.trim() || description?.trim().slice(0, 80) || '',
          badge_text: 'GAME SHOWCASE',
          image_url: banner,
          target_url: url.trim(),
          placement: 'all',
          active: true,
          created_at: serverTimestamp()
        });
      }

      return NextResponse.json({
        success: true,
        free: true,
        listing_id: gameDoc.id,
        message: 'Game listed successfully (7 Days Free)!'
      });
    }

    // For 'app' or 'product': Save as pending campaign and provide Bachs checkout link
    const prefix = category === 'app' ? 'FP-APP' : 'FP-PROD';
    const reference = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const paymentUrl = category === 'app' ? BACHS_PAYMENT_LINKS.app : BACHS_PAYMENT_LINKS.product;
    const paymentLinkId = category === 'app' ? BACHS_PAYMENT_LINK_IDS.app : BACHS_PAYMENT_LINK_IDS.product;
    const amount = category === 'app' ? 10000 : 5000;

    let pendingId = '';
    if (firebaseDb) {
      const docRef = await addDoc(collection(firebaseDb, 'pending_campaigns'), {
        reference,
        category,
        title: title.trim(),
        studioName: studioName?.trim() || 'Independent Studio',
        tagline: tagline?.trim() || '',
        url: url.trim(),
        description: description?.trim() || '',
        icon: icon || null,
        banner: banner || null,
        paymentLinkId,
        paymentStatus: 'pending',
        amount,
        created_at: serverTimestamp()
      });
      pendingId = docRef.id;
    }

    return NextResponse.json({
      success: true,
      free: false,
      reference,
      pending_id: pendingId,
      category,
      amount,
      payment_url: paymentUrl,
      payment_link_id: paymentLinkId,
      message: 'Pending campaign created. Complete Bachs checkout to publish.'
    });
  } catch (err) {
    console.error('Error creating pending campaign:', err);
    return NextResponse.json({ error: 'Failed to create campaign draft', details: (err as Error).message }, { status: 500 });
  }
}
