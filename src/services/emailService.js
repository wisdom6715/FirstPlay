/**
 * FirstPlay Email Notification Service powered by Resend
 * Sends transactional notifications to publishers for:
 * 1. Under Review: When a new game/app is submitted.
 * 2. Approved & Live: When an admin approves the game.
 * 3. Submission Update / Rejected: When a submission cannot be accepted.
 * 4. Details Updated: When listing details or artwork are edited.
 */

import { slugify } from '../sitemap';

export const SITE_URL = 'https://firstplay.fun';

/**
 * Shared, high-contrast, responsive Apple-inspired HTML email layout
 */
function createEmailLayout({
  badgeText = 'NOTIFICATION',
  badgeBg = '#eff6ff',
  badgeColor = '#0071e3',
  badgeBorder = '#bfdbfe',
  title = 'FirstPlay Notification',
  introText = '',
  details = [],
  ctaText = '',
  ctaUrl = '',
  footerNote = ''
}) {
  const detailsHtml = details.length > 0 ? `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb; overflow: hidden; font-size: 13px;">
      ${details.map((item, idx) => `
        <tr style="${idx > 0 ? 'border-top: 1px solid #e5e7eb;' : ''}">
          <td style="padding: 12px 16px; font-weight: 600; color: #6b7280; width: 38%; vertical-align: top;">
            ${escapeHtml(item.label)}
          </td>
          <td style="padding: 12px 16px; font-weight: 600; color: #111827; vertical-align: top; word-break: break-all;">
            ${item.isLink ? `<a href="${escapeHtml(item.value)}" style="color: #0071e3; text-decoration: none;">${escapeHtml(item.value)}</a>` : escapeHtml(item.value)}
          </td>
        </tr>
      `).join('')}
    </table>
  ` : '';

  const ctaHtml = (ctaText && ctaUrl) ? `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 12px 0;">
      <tr>
        <td align="center">
          <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; text-align: center; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);">
            ${escapeHtml(ctaText)} &rarr;
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f7; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #f3f4f6; background-color: #ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.5px; color: #111827; display: inline-block;">
                      FIRST<span style="color: #0071e3;">PLAY</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 500; color: #6b7280; margin-top: 2px;">
                      African Web Games &amp; Digital Experiences
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">
                      ${escapeHtml(badgeText)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 800; color: #111827; line-height: 1.3; letter-spacing: -0.3px;">
                ${escapeHtml(title)}
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                ${introText}
              </p>

              ${detailsHtml}

              ${ctaHtml}

              ${footerNote ? `
                <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #6b7280;">
                  ${footerNote}
                </p>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">
                You received this operational email because a game or product is managed under your email on <a href="${SITE_URL}" style="color: #6b7280; text-decoration: underline;">FirstPlay</a>.
              </p>
              <p style="margin: 0;">
                FirstPlay Technologies &bull; Lagos, Nigeria &bull; <a href="mailto:support@firstplay.fun" style="color: #6b7280; text-decoration: none;">support@firstplay.fun</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
 * Core email sender dispatching via /api/send-email
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    console.warn('[EmailService] Skipped: No recipient email provided.');
    return { success: false, error: 'Recipient email required' };
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('[EmailService] API returned non-200:', data);
      return { success: false, error: data.message || data.error || 'Failed to send' };
    }

    return { success: true, ...data };
  } catch (err) {
    console.error('[EmailService] Network exception while dispatching email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Under Review Email
 * Triggered immediately when publisher uploads a game on the Promote/Upload screen
 */
export async function sendUnderReviewEmail({ to, gameTitle, studioName, gameUrl, gameId }) {
  const title = `We've received your submission: "${gameTitle}" is Under Review`;
  const subject = `🎮 "${gameTitle}" is Under Review — FirstPlay`;

  const html = createEmailLayout({
    badgeText: 'UNDER REVIEW',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    badgeBorder: '#fde68a',
    title: `Submission Received for "${gameTitle}"`,
    introText: `Thank you for submitting your game to FirstPlay. To maintain optimal performance, safety, and an authentic experience for African web gamers, all new entries are queued for review before going live.`,
    details: [
      { label: 'Game Title', value: gameTitle },
      ...(gameId ? [{ label: 'Game ID', value: gameId }] : []),
      { label: 'Studio / Creator', value: studioName || 'Independent Studio' },
      { label: 'Launch URL', value: gameUrl, isLink: true },
      { label: 'Queue Status', value: 'Under Review by Admin' }
    ],
    ctaText: 'Visit FirstPlay Platform',
    ctaUrl: SITE_URL,
    footerNote: '<strong>What happens next:</strong> Our moderation team will test responsiveness and compatibility. Once approved, you will receive a confirmation email and your game will appear live in the FirstPlay catalog immediately.'
  });

  const text = `Hi ${studioName || 'Developer'},\n\nWe have received your game submission "${gameTitle}" on FirstPlay. It is now queued under review.\n\nGame Title: ${gameTitle}${gameId ? `\nGame ID: ${gameId}` : ''}\nStudio: ${studioName}\nURL: ${gameUrl}\n\nOur moderation team reviews submissions for mobile/browser compatibility. You will receive an email as soon as it is approved.\n\nFirstPlay Team\nhttps://firstplay.app`;

  return sendEmail({ to, subject, html, text });
}

/**
 * 2. Approved & Live Email
 * Triggered when admin approves the game from the Admin Dashboard
 */
export async function sendApprovedEmail({ to, gameTitle, studioName, gameUrl, gameId }) {
  const slug = slugify(gameTitle || gameId || 'game');
  const playUrl = `${SITE_URL}/game/${slug}`;
  const subject = `🚀 Congratulations! "${gameTitle}" is Now Live on FirstPlay`;

  const html = createEmailLayout({
    badgeText: 'APPROVED & LIVE',
    badgeBg: '#d1fae5',
    badgeColor: '#047857',
    badgeBorder: '#a7f3d0',
    title: `Your Game is Now Live on FirstPlay!`,
    introText: `Great news! <strong>${escapeHtml(gameTitle)}</strong> by <strong>${escapeHtml(studioName || 'Independent Studio')}</strong> has passed our quality review and has been officially approved. Players across Nigeria and Africa can discover and play your game instantly in their browser with zero installation.`,
    details: [
      { label: 'Game Title', value: gameTitle },
      ...(gameId ? [{ label: 'Game ID', value: gameId }] : []),
      { label: 'Studio / Creator', value: studioName || 'Independent Studio' },
      { label: 'Direct Play Link', value: playUrl, isLink: true },
      { label: 'Platform Status', value: 'Live on FirstPlay Catalog' }
    ],
    ctaText: `Play ${gameTitle} Now`,
    ctaUrl: playUrl,
    footerNote: `<strong>Pro Tip:</strong> Share your direct FirstPlay link (<code>${playUrl}</code>) on Twitter, WhatsApp, and Instagram to start ranking on the FirstPlay Trending charts.`
  });

  const text = `Congratulations!\n\n"${gameTitle}" by ${studioName || 'Independent Studio'} has been approved and is now LIVE on FirstPlay!\n\nDirect Play URL: ${playUrl}\n\nPlayers can now launch your game instantly with zero friction. Share your link to drive plays and climb the leaderboards!\n\nFirstPlay Team\nhttps://firstplay.app`;

  return sendEmail({ to, subject, html, text });
}

/**
 * 3. Submission Update / Declined Email
 * Triggered when admin rejects a submission from the Under Review queue
 */
export async function sendRejectedEmail({ to, gameTitle, studioName, gameUrl, reason }) {
  const subject = `Update regarding your submission: "${gameTitle}" — FirstPlay`;
  const reasonText = reason && reason.trim() ? reason.trim() : 'Requirements not met at this time';

  const html = createEmailLayout({
    badgeText: 'SUBMISSION UPDATE',
    badgeBg: '#fef2f2',
    badgeColor: '#dc2626',
    badgeBorder: '#fecaca',
    title: `Review Status for "${gameTitle}"`,
    introText: `Thank you for your interest in publishing <strong>${escapeHtml(gameTitle)}</strong> on FirstPlay. After reviewing the submission, our moderation team was unable to publish this entry to the live catalog at this time.<br><br>
      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 10px; padding: 14px 16px; margin: 12px 0 16px 0; font-size: 13px; color: #9f1239; line-height: 1.5;">
        <strong style="color: #881337; font-size: 13px; display: block; margin-bottom: 4px;">Reason for Rejection:</strong>
        ${escapeHtml(reasonText)}
      </div>`,
    details: [
      { label: 'Game Title', value: gameTitle },
      { label: 'Studio / Creator', value: studioName || 'Independent Studio' },
      { label: 'Destination URL', value: gameUrl, isLink: true },
      { label: 'Review Decision', value: 'Not Approved' },
      { label: 'Moderator Feedback', value: reasonText }
    ],
    ctaText: 'Submit an Updated Version',
    ctaUrl: `${SITE_URL}/promote`,
    footerNote: '<strong>Common review guidelines:</strong> Ensure your game URL resolves over HTTPS, loads cleanly on mobile viewports, and operates without unhandled script crashes. You are welcome to resolve any issues and submit again anytime.'
  });

  const text = `Hi ${studioName || 'Developer'},\n\nThank you for submitting "${gameTitle}" to FirstPlay. Our moderation team was unable to approve this entry at this time.\n\nReason for Rejection:\n${reasonText}\n\nPlease ensure your launch URL resolves over HTTPS and renders cleanly on mobile web browsers. You are always welcome to resolve any issues and submit again.\n\nSubmit an updated version: https://firstplay.app/promote\n\nFirstPlay Team`;

  return sendEmail({ to, subject, html, text });
}

/**
 * 4. Game Details Updated Email
 * Triggered when listing details (name, URL, artwork, publisher) are edited in the Admin Dashboard
 */
export async function sendUpdatedEmail({ to, gameTitle, studioName, gameUrl, category = 'game', isUnderReview = false }) {
  const slug = slugify(gameTitle || 'game');
  const viewUrl = isUnderReview ? `${SITE_URL}/promote` : `${SITE_URL}/game/${slug}`;
  const subject = `✨ Listing Updated: "${gameTitle}" on FirstPlay`;

  const html = createEmailLayout({
    badgeText: 'DETAILS UPDATED',
    badgeBg: '#eff6ff',
    badgeColor: '#0071e3',
    badgeBorder: '#bfdbfe',
    title: `Listing Details Updated`,
    introText: `The catalog details for <strong>${escapeHtml(gameTitle)}</strong> have been updated by administrators in the FirstPlay database. All changes have been synchronized live.`,
    details: [
      { label: 'Game Title', value: gameTitle },
      { label: 'Studio / Creator', value: studioName || 'Independent Studio' },
      { label: 'Category', value: category.toUpperCase() },
      { label: 'Destination URL', value: gameUrl, isLink: true },
      { label: 'Catalog Status', value: isUnderReview ? 'Under Review' : 'Live on FirstPlay' }
    ],
    ctaText: 'View on FirstPlay',
    ctaUrl: viewUrl,
    footerNote: 'If you did not request or expect these updates, please reach out to our team at <a href="mailto:support@firstplay.fun" style="color: #0071e3;">support@firstplay.fun</a>.'
  });

  const text = `Hi ${studioName || 'Developer'},\n\nThe catalog details for "${gameTitle}" on FirstPlay have been updated.\n\nTitle: ${gameTitle}\nStudio: ${studioName}\nURL: ${gameUrl}\n\nAll changes are now synced live.\n\nFirstPlay Team\nhttps://firstplay.app`;

  return sendEmail({ to, subject, html, text });
}

export const emailService = {
  sendEmail,
  sendUnderReviewEmail,
  sendApprovedEmail,
  sendRejectedEmail,
  sendUpdatedEmail
};
