import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminServices, firebaseAdminConfigured } from '@/lib/firebase-admin';
import { isHttpUrl, isListingCategory } from '@/lib/listing-schema';
import { getBacsStatus } from '@/lib/bacs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!firebaseAdminConfigured) return NextResponse.json({ error: 'Firebase server configuration is pending. Add the Admin SDK environment values before accepting submissions.' }, { status: 503 });
  const services = getAdminServices();
  if (!services) return NextResponse.json({ error: 'Firebase Admin could not be initialized.' }, { status: 503 });
  let uploadedStoragePath = '';

  try {
    const form = await request.formData();
    const fullName = String(form.get('full_name') ?? '').trim();
    const categoryValue = String(form.get('category') ?? '').trim();
    const name = String(form.get('name') ?? '').trim();
    const url = String(form.get('url') ?? '').trim();
    const media = form.get('media');
    if (!fullName || !name || !isListingCategory(categoryValue)) return NextResponse.json({ error: 'Full name, category, and the category-specific name are required.' }, { status: 400 });
    if (categoryValue !== 'product' && (!url || !isHttpUrl(url))) return NextResponse.json({ error: 'A valid HTTP(S) URL is required for apps and games.' }, { status: 400 });
    if (categoryValue === 'product' && url && !isHttpUrl(url)) return NextResponse.json({ error: 'Product URL must be a valid HTTP(S) URL when provided.' }, { status: 400 });
    if (!(media instanceof File) || !media.type.startsWith('image/')) return NextResponse.json({ error: 'A logo or flyer image is required.' }, { status: 400 });
    if (media.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Artwork must be 8MB or smaller.' }, { status: 400 });

    const listingRef = services.db.collection('apps').doc();
    const mediaKey = categoryValue === 'product' ? 'flyer' : 'logo';
    uploadedStoragePath = `uploads/${categoryValue}/${listingRef.id}/${mediaKey}`;
    const downloadToken = randomUUID();
    const file = services.bucket.file(uploadedStoragePath);
    await file.save(Buffer.from(await media.arrayBuffer()), { metadata: { contentType: media.type, metadata: { firebaseStorageDownloadTokens: downloadToken } } });
    const mediaUrl = `https://firebasestorage.googleapis.com/v0/b/${services.bucket.name}/o/${encodeURIComponent(uploadedStoragePath)}?alt=media&token=${downloadToken}`;
    const createdAt = Timestamp.now();
    const expiryDate = Timestamp.fromMillis(createdAt.toMillis() + 7 * 24 * 60 * 60 * 1000);
    await listingRef.set({
      full_name: fullName,
      category: categoryValue,
      app_name: categoryValue === 'app' ? name : null,
      game_name: categoryValue === 'game' ? name : null,
      product_name: categoryValue === 'product' ? name : null,
      app_url: categoryValue === 'app' ? url : null,
      game_url: categoryValue === 'game' ? url : null,
      product_url: categoryValue === 'product' && url ? url : null,
      logo: mediaKey === 'logo' ? mediaUrl : null,
      flyer: mediaKey === 'flyer' ? mediaUrl : null,
      created_at: createdAt,
      expiry_date: expiryDate
    });
    return NextResponse.json({ listing_id: listingRef.id, media_url: mediaUrl, bacs: getBacsStatus() }, { status: 201 });
  } catch (error) {
    if (uploadedStoragePath) await services.bucket.file(uploadedStoragePath).delete({ ignoreNotFound: true }).catch(() => undefined);
    console.error('listing submission failed', error);
    return NextResponse.json({ error: 'The listing could not be saved. Check Firebase Storage and Firestore configuration.' }, { status: 500 });
  }
}
