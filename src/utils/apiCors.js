import { NextResponse } from 'next/server';

/**
 * Shared CORS headers allowing web games (hosted on external domains,
 * iframes, webviews, or localhost) to securely communicate with FirstPlay APIs.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
  'Access-Control-Max-Age': '86400',
};

/**
 * Reusable preflight OPTIONS handler for Next.js route handlers
 */
export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Standard JSON response helper with CORS headers attached
 */
export function jsonResponse(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}
