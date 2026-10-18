import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import dns from 'node:dns';

// Set DNS resolution to prefer IPv4 first to eliminate transient EAI_AGAIN lookup errors
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored if unsupported
}

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

    const fromAddress = process.env.RESEND_FROM_EMAIL || from || 'FirstPlay <wisdom@firstplay.fun>';
    const recipients = Array.isArray(to) ? to : [to];

    const resend = new Resend(apiKey);
    let sendResult = null;
    let lastError = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await resend.emails.send({
          from: fromAddress,
          to: recipients,
          subject,
          html,
          text: text || undefined
        });

        if (result.error) {
          lastError = result.error;
          console.error(`[Resend Send-Email Error - Attempt ${attempt}]`, result.error);
        } else {
          sendResult = result.data;
          break;
        }
      } catch (err) {
        lastError = err;
        console.error(`[Resend Send-Email Exception - Attempt ${attempt}]`, err);
      }

      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!sendResult) {
      console.error('[Resend Send-Email Final Failure]', lastError);
      return NextResponse.json(
        { error: lastError?.message || 'Failed to dispatch email' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, ...sendResult });
  } catch (err) {
    console.error('[Next.js send-email Route Exception]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error sending email' },
      { status: 500 }
    );
  }
}

