import { NextResponse } from 'next/server';
import { getBacsStatus } from '@/lib/bacs';
import { getAdminServices, firebaseAdminConfigured } from '@/lib/firebase-admin';
import { CATEGORY_CONFIG, isListingCategory } from '@/lib/listing-schema';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const listingId = typeof body.listing_id === 'string' ? body.listing_id.trim() : '';
  if (!listingId) return NextResponse.json({ error: 'A listing reference is required.' }, { status: 400 });
  if (!firebaseAdminConfigured) return NextResponse.json({ error: 'Firebase server configuration is pending.' }, { status: 503 });
  const services = getAdminServices();
  if (!services) return NextResponse.json({ error: 'Firebase Admin could not be initialized.' }, { status: 503 });

  const listingSnapshot = await services.db.collection('apps').doc(listingId).get();
  if (!listingSnapshot.exists) return NextResponse.json({ error: 'The listing reference was not found.' }, { status: 404 });
  const category = listingSnapshot.data()?.category;
  if (typeof category !== 'string' || !isListingCategory(category)) return NextResponse.json({ error: 'The listing has an invalid category.' }, { status: 422 });

  const status = getBacsStatus();
  const amount = CATEGORY_CONFIG[category].price;
  if (!status.configured) return NextResponse.json({ configured: false, listing_id: listingId, category, amount, status: status.label, message: status.message }, { status: 200 });
  // Provider-specific request signing and checkout creation belongs here once the Bacs merchant contract is supplied.
  return NextResponse.json({ configured: false, listing_id: listingId, category, amount, status: 'Bacs adapter pending', message: 'Bacs credentials are present, but no checkout is started until the provider adapter is implemented.' }, { status: 200 });
}
