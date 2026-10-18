import { NextResponse } from 'next/server';

/**
 * Valid support issue categories as specified in requirements
 */
const VALID_CATEGORIES = [
  'Withdrawal Issue',
  'Payment or Transaction Issue',
  'Account Access',
  'Account Verification',
  'Spam or Suspicious Activity',
  'Complaint',
  'Report a Bug',
  'Other'
];

/**
 * Basic in-memory rate limiting map (IP -> timestamps array)
 * Allows up to 5 support submissions per 10 minutes per IP
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(clientIp) {
  if (!clientIp) return false;
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];
  
  // Prune expired timestamps
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(clientIp, validTimestamps);
    return true;
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(clientIp, validTimestamps);
  return false;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Next.js Server-Side Route Handler: FirstPlay Support & Complaint Submissions
 * POST /api/support
 */
export async function POST(request) {
  try {
    // 1. IP extraction for basic spam / rate limiting protection
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many submissions from this connection. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { 
      fullName, 
      country, 
      category, 
      email, 
      message, 
      website_hp // Honeypot field for bot detection
    } = body || {};

    // 2. Honeypot check (bots fill hidden fields)
    if (website_hp) {
      // Silently return success to bot without sending email
      return NextResponse.json({
        success: true,
        message: 'Your request has been submitted successfully. Our team will review your message and get back to you within 24 hours.'
      });
    }

    // 3. Server-side validation
    const cleanName = (fullName || '').trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: 'Please enter a valid full name (between 2 and 100 characters).' },
        { status: 400 }
      );
    }

    const cleanCountry = (country || '').trim();
    if (!cleanCountry || cleanCountry.length > 100) {
      return NextResponse.json(
        { error: 'Please select a valid country.' },
        { status: 400 }
      );
    }

    const cleanCategory = (category || '').trim();
    if (!VALID_CATEGORIES.includes(cleanCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Please select one of the following: ${VALID_CATEGORIES.join(', ')}.` },
        { status: 400 }
      );
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
      return NextResponse.json(
        { error: 'Please enter a valid contact email address.' },
        { status: 400 }
      );
    }

    const cleanMessage = (message || '').trim();
    if (!cleanMessage || cleanMessage.length < 10) {
      return NextResponse.json(
        { error: 'Please provide more details in your message (minimum 10 characters).' },
        { status: 400 }
      );
    }
    if (cleanMessage.length > 3000) {
      return NextResponse.json(
        { error: 'Your message exceeds the 3,000 character limit. Please shorten your description.' },
        { status: 400 }
      );
    }

    // 4. Check Resend API Key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Support Route Error] Missing RESEND_API_KEY environment variable on server.');
      return NextResponse.json(
        { error: 'Email service configuration error. Please try again later or reach out to support@firstplay.fun directly.' },
        { status: 500 }
      );
    }

    // 5. Configured recipient email addresses
    const primaryRecipient = (process.env.SUPPORT_RECIPIENT_EMAIL || 'adezatl4336@gmail.com').trim();
    const additionalRecipient = (process.env.SUPPORT_ADDITIONAL_RECIPIENT_EMAIL || 'olayiwolaibrahim46@gmail.com').trim();
    
    // Deduplicate recipients
    const recipients = Array.from(new Set([primaryRecipient, additionalRecipient].filter(Boolean)));
    if (recipients.length === 0) {
      recipients.push('support@firstplay.fun');
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'FirstPlay <wisdom@firstplay.fun>';

    // 6. Generate Ticket Reference ID & Timestamps
    const ticketId = `FP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const submissionDate = new Date();
    const formattedDate = submissionDate.toUTCString();

    const subject = `[Support Request] ${cleanCategory} — #${ticketId}`;

    // 7. HTML Email Template (Stripe / Apple clean high-contrast styling)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #3c4257; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e3e8ee; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); overflow: hidden; text-align: left;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #e3e8ee; background: #ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 16px; font-weight: 900; letter-spacing: 0.5px; color: #0a2540;">
                      FIRST<span style="color: #635bff;">PLAY</span> <span style="font-weight: 500; color: #8898aa; font-size: 13px;">/ Support Desk</span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; font-family: monospace; background-color: #f0f4ff; color: #635bff; border: 1px solid #d9e2ff;">
                      ${escapeHtml(ticketId)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0a2540; line-height: 1.3;">
                New Support Request: ${escapeHtml(cleanCategory)}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #8898aa;">
                Received on ${escapeHtml(formattedDate)}
              </p>

              <!-- Sender Information Table -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; border: 1px solid #e3e8ee; border-radius: 10px; background-color: #fafbfc; overflow: hidden; font-size: 13px;">
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa; width: 32%; border-bottom: 1px solid #e3e8ee;">Full Name</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #0a2540; border-bottom: 1px solid #e3e8ee;">${escapeHtml(cleanName)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa; border-bottom: 1px solid #e3e8ee;">Contact Email</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #635bff; border-bottom: 1px solid #e3e8ee;">
                    <a href="mailto:${escapeHtml(cleanEmail)}" style="color: #635bff; text-decoration: none;">${escapeHtml(cleanEmail)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa; border-bottom: 1px solid #e3e8ee;">Country</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #0a2540; border-bottom: 1px solid #e3e8ee;">${escapeHtml(cleanCountry)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa;">Issue Category</td>
                  <td style="padding: 10px 16px; font-weight: 700; color: #df1b41;">${escapeHtml(cleanCategory)}</td>
                </tr>
              </table>

              <!-- User's Message Block -->
              <div style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #8898aa;">
                Message Details:
              </div>
              <div style="background-color: #ffffff; border: 1px solid #e3e8ee; border-left: 4px solid #635bff; border-radius: 8px; padding: 16px 20px; font-size: 14px; line-height: 1.6; color: #0a2540; white-space: pre-wrap; word-break: break-word;">
${escapeHtml(cleanMessage)}
              </div>

              <!-- Quick Reply CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 12px 0;">
                <tr>
                  <td align="left">
                    <a href="mailto:${escapeHtml(cleanEmail)}?subject=Re:%20[Support%20Request]%20${encodeURIComponent(cleanCategory)}%20—%20${encodeURIComponent(ticketId)}" style="display: inline-block; background-color: #635bff; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center;">
                      Reply directly to ${escapeHtml(cleanName)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #fafbfc; border-top: 1px solid #e3e8ee; font-size: 11px; color: #8898aa; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">
                This notification was sent by FirstPlay Support System to designated resolution administrators.
              </p>
              <p style="margin: 0;">
                Ticket ID: <strong>${escapeHtml(ticketId)}</strong> &bull; Client IP: ${escapeHtml(clientIp)}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 8. Plain Text Fallback
    const text = `
FIRSTPLAY SUPPORT REQUEST #${ticketId}
=====================================================
Category:     ${cleanCategory}
Full Name:    ${cleanName}
Contact Email: ${cleanEmail}
Country:      ${cleanCountry}
Submitted:    ${formattedDate}
IP Address:   ${clientIp}

MESSAGE:
-----------------------------------------------------
${cleanMessage}
-----------------------------------------------------

To reply directly to the user, send an email to: ${cleanEmail}
`;

    // 9. Dispatch via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        reply_to: cleanEmail,
        subject,
        html,
        text
      })
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error('[Resend Support Dispatch Error]', resendData);
      return NextResponse.json(
        { error: 'Unable to deliver message right now. Please try again or email support@firstplay.fun directly.' },
        { status: resendResponse.status || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Your request has been submitted successfully. Our team will review your message and get back to you within 24 hours.'
    });

  } catch (err) {
    console.error('[Support API Exception]', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
