import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminServices, getConfiguredAdminEmail, firebaseAdminConfigured } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (!firebaseAdminConfigured) return NextResponse.json({ error: 'Firebase server configuration is pending.' }, { status: 503 });
  const services = getAdminServices();
  if (!services) return NextResponse.json({ error: 'Firebase Admin could not be initialized.' }, { status: 503 });
  const authorization = request.headers.get('authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const token = await services.auth.verifyIdToken(authorization.slice(7));
    const allowlistedEmail = getConfiguredAdminEmail();
    if (!allowlistedEmail || token.email?.toLowerCase() !== allowlistedEmail) return NextResponse.json({ error: 'This account is not authorized for the dashboard.' }, { status: 403 });

    const now = Timestamp.now();
    const nowDate = now.toDate();
    const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(nowDate);
    const [totalSnapshot, activeSnapshot, recentSnapshot, todaySnapshot] = await Promise.all([
      services.db.collection('apps').count().get(),
      services.db.collection('apps').where('expiry_date', '>', now).count().get(),
      services.db.collection('apps').orderBy('created_at', 'desc').limit(8).get(),
      services.db.collection('metrics_daily').doc(todayKey).get()
    ]);
    const todayMetrics = todaySnapshot.data() ?? {};
    const recentListings = recentSnapshot.docs.map((doc) => {
      const listing = doc.data();
      const name = listing.category === 'app' ? listing.app_name : listing.category === 'game' ? listing.game_name : listing.product_name;
      const created = listing.created_at?.toDate?.();
      const expiry = listing.expiry_date?.toDate?.();
      return {
        id: doc.id,
        full_name: String(listing.full_name ?? ''),
        category: String(listing.category ?? ''),
        name: String(name ?? ''),
        created_at: created ? created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        expiry_date: expiry?.toISOString() ?? '',
        is_active: expiry ? expiry > nowDate : false
      };
    });
    return NextResponse.json({
      metrics: {
        total_listings: totalSnapshot.data().count,
        active_listings: activeSnapshot.data().count,
        daily_active_users: Number(todayMetrics.daily_active_users ?? 0),
        total_app_openings: Number(todayMetrics.total_app_openings ?? 0),
        daily_app_openings: Number(todayMetrics.daily_app_openings ?? 0)
      },
      recent_listings: recentListings
    });
  } catch (error) {
    console.error('dashboard metrics failed', error);
    return NextResponse.json({ error: 'Unable to verify the Firebase session or read dashboard metrics.' }, { status: 401 });
  }
}
