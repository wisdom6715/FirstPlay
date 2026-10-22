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
 * Valid reasons for account deletion
 */
const VALID_REASONS = [
  'No longer using FirstPlay',
  'Privacy or data security concerns',
  'Temporary break / digital detox',
  'Creating a new account',
  'Technical issues with games or performance',
  'Too many notifications / emails',
  'Other'
];

/**
 * Basic in-memory rate limiting map (IP -> timestamps array)
 * Allows up to 5 deletion requests per 10 minutes per IP
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(clientIp) {
  if (!clientIp) return false;
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];
  
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

export async function POST(request) {
  try {
    // 1. IP Rate Limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before submitting another deletion request.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const { 
      email, 
      username, 
      phone, 
      reason, 
      details, 
      confirmUnderstand,
      website_hp // Honeypot field for bot trap
    } = body || {};

    // 2. Honeypot check
    if (website_hp) {
      return NextResponse.json({
        success: true,
        message: 'Your account deletion request has been submitted successfully.'
      });
    }

    // 3. Validation
    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
      return NextResponse.json(
        { error: 'Please enter a valid account email address.' },
        { status: 400 }
      );
    }

    if (!confirmUnderstand) {
      return NextResponse.json(
        { error: 'You must confirm that you understand account deletion is permanent and irreversible.' },
        { status: 400 }
      );
    }

    const cleanUsername = (username || '').trim().slice(0, 50);
    const cleanPhone = (phone || '').trim().slice(0, 30);
    const cleanReason = (reason && VALID_REASONS.includes(reason)) ? reason : 'Not specified / Other';
    const cleanDetails = (details || '').trim().slice(0, 2000);

    // 4. Check Resend configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('[AccountRemoval API] RESEND_API_KEY is not configured in environment variables.');
      return NextResponse.json(
        { error: 'Email service configuration error. Please try again later or reach out to privacy@firstplay.fun directly.' },
        { status: 500 }
      );
    }

    const primaryRecipient = (process.env.SUPPORT_RECIPIENT_EMAIL || 'privacy@firstplay.fun').trim();
    const additionalRecipient = (process.env.SUPPORT_ADDITIONAL_RECIPIENT_EMAIL || '').trim();
    
    const recipients = Array.from(new Set([primaryRecipient, additionalRecipient, 'privacy@firstplay.fun'].filter(Boolean)));
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'FirstPlay Privacy <wisdom@firstplay.fun>';

    // 5. Generate Reference ID
    const ticketId = `FP-DEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const submissionDate = new Date();
    const formattedDate = submissionDate.toUTCString();

    const subject = `[Account Deletion Request] ${cleanEmail} — #${ticketId}`;

    // 6. Admin Notification Email Template
    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #3c4257; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e3e8ee; border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); overflow: hidden; text-align: left;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #e3e8ee; background: #ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 16px; font-weight: 900; letter-spacing: 0.5px; color: #0a2540;">
                      FIRST<span style="color: #df1b41;">PLAY</span> <span style="font-weight: 500; color: #8898aa; font-size: 13px;">/ Privacy &amp; Data Deletion Desk</span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; font-family: monospace; background-color: #fff1f2; color: #df1b41; border: 1px solid #fed7aa;">
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
                User Account Deletion Request
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #8898aa;">
                Received on ${escapeHtml(formattedDate)} (Apple Guideline 5.1.1(v) Request)
              </p>

              <!-- Account Details Table -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0; border: 1px solid #e3e8ee; border-radius: 10px; background-color: #fafbfc; overflow: hidden; font-size: 13px;">
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa; width: 34%; border-bottom: 1px solid #e3e8ee;">Account Email</td>
                  <td style="padding: 10px 16px; font-weight: 700; color: #0a2540; border-bottom: 1px solid #e3e8ee;">
                    <a href="mailto:${escapeHtml(cleanEmail)}" style="color: #635bff; text-decoration: none;">${escapeHtml(cleanEmail)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa; border-bottom: 1px solid #e3e8ee;">Username / Player ID</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #0a2540; border-bottom: 1px solid #e3e8ee;">
                    ${cleanUsername ? escapeHtml(cleanUsername) : '<span style="color: #8898aa; font-style: italic;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa; border-bottom: 1px solid #e3e8ee;">Phone (Rewards)</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #0a2540; border-bottom: 1px solid #e3e8ee;">
                    ${cleanPhone ? escapeHtml(cleanPhone) : '<span style="color: #8898aa; font-style: italic;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa; border-bottom: 1px solid #e3e8ee;">Reason for Leaving</td>
                  <td style="padding: 10px 16px; font-weight: 600; color: #df1b41; border-bottom: 1px solid #e3e8ee;">${escapeHtml(cleanReason)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-weight: 600; color: #8898aa;">Irreversible Consent</td>
                  <td style="padding: 10px 16px; font-weight: 700; color: #00875a;">Confirmed by User</td>
                </tr>
              </table>

              ${cleanDetails ? `
              <div style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #8898aa;">
                Additional User Notes:
              </div>
              <div style="background-color: #ffffff; border: 1px solid #e3e8ee; border-left: 4px solid #df1b41; border-radius: 8px; padding: 16px 20px; font-size: 13px; line-height: 1.6; color: #0a2540; margin-bottom: 24px; white-space: pre-wrap; word-break: break-word;">
${escapeHtml(cleanDetails)}
              </div>
              ` : ''}

              <!-- Compliance Note -->
              <div style="padding: 14px 18px; border-radius: 8px; background-color: #f8f9fa; border: 1px solid #e3e8ee; font-size: 12px; color: #697386; line-height: 1.5;">
                <strong>Compliance Action Required:</strong> Purge all Firebase Auth records, Firestore user documents, and tournament leaderboard ranks matching this email within 72 hours.
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #fafbfc; border-top: 1px solid #e3e8ee; text-align: center; font-size: 12px; color: #8898aa;">
              FirstPlay Privacy &amp; Data Protection Desk • Automated Review Alert • Reference: ${escapeHtml(ticketId)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 7. Dispatch via Resend
    const resend = new Resend(resendApiKey);

    const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      replyTo: cleanEmail,
      subject,
      html: adminHtml,
      tags: [
        { name: 'category', value: 'account_deletion' },
        { name: 'ticket_id', value: ticketId }
      ]
    });

    if (adminEmailError) {
      console.error('[AccountRemoval API] Resend Error:', adminEmailError);
      return NextResponse.json(
        { error: 'Failed to dispatch account removal notice. Please try again or email privacy@firstplay.fun directly.' },
        { status: 500 }
      );
    }

    // 8. Dispatch Confirmation Email to User
    const userReceiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Account Deletion Request Received — FirstPlay</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #3c4257;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e3e8ee; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); overflow: hidden; text-align: left;">
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #e3e8ee; background: #ffffff;">
              <div style="font-size: 16px; font-weight: 900; color: #0a2540;">
                FIRST<span style="color: #0071e3;">PLAY</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0a2540;">
                Account Deletion Request Received
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4f566b;">
                We have received your request to permanently delete your FirstPlay account and associated data for <strong>${escapeHtml(cleanEmail)}</strong>.
              </p>
              
              <div style="padding: 12px 16px; border-radius: 8px; background-color: #fafbfc; border: 1px solid #e3e8ee; margin-bottom: 20px; font-size: 13px;">
                <strong>Request Reference:</strong> <code style="font-family: monospace; color: #0071e3; font-weight: bold;">${escapeHtml(ticketId)}</code><br>
                <strong>Target Timeline:</strong> Processed within 48 to 72 hours.
              </div>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #697386;">
                <strong>What happens next:</strong><br>
                • Your profile, saved favorites, tournament entries, and reward balances will be permanently removed from all active servers.<br>
                • If you did not make this request or wish to cancel it, please reply to this email immediately with your Reference ID.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background-color: #fafbfc; border-top: 1px solid #e3e8ee; font-size: 12px; color: #8898aa; text-align: center;">
              FirstPlay Privacy Team • <a href="https://firstplay.fun" style="color: #0071e3; text-decoration: none;">firstplay.fun</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Attempt user confirmation email (non-blocking)
    resend.emails.send({
      from: fromAddress,
      to: [cleanEmail],
      subject: `Account Deletion Request Received [Ref: #${ticketId}]`,
      html: userReceiptHtml
    }).catch(err => {
      console.warn('[AccountRemoval API] Non-critical user receipt email error:', err);
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Your account deletion request has been logged successfully. Your account and associated personal data will be permanently purged within 48 to 72 hours.'
    });

  } catch (err) {
    console.error('[AccountRemoval API] Unexpected Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting your request. Please try again later.' },
      { status: 500 }
    );
  }
}
