import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return new NextResponse('Missing game URL parameter', { status: 400 });
  }

  // Pure redirect to the actual game URL: no scripts, no proxying
  return NextResponse.redirect(rawUrl, 307);
}
