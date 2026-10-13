import { NextResponse } from 'next/server';

/**
 * Next.js Server-Side Route Handler: FirstPlay Resend Email Dispatcher
 * POST /api/send-email
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, html, text, from } = body || {};

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required email fields (to, subject, html)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Resend API Error] Missing RESEND_API_KEY environment variable on Next.js server');
      return NextResponse.json(
        { error: 'Server configuration error: RESEND_API_KEY is not set' },
        { status: 500 }
      );
    }

    const fromAddress = from || 'FirstPlay <onboarding@resend.dev>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || undefined
      })
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[Resend API Error]', data);
      return NextResponse.json(data, { status: resendResponse.status });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    console.error('[Next.js send-email Route Exception]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error sending email' },
      { status: 500 }
    );
  }
}
