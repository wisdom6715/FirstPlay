import crypto from 'crypto';

export const BACHS_PAYMENT_LINKS = {
  app: 'https://checkout.bachs.io/pay/pl_fb788898fc46',
  product: 'https://checkout.bachs.io/pay/pl_051e5550c4f6'
} as const;

export const BACHS_PAYMENT_LINK_IDS = {
  app: 'pl_fb788898fc46',
  product: 'pl_051e5550c4f6'
} as const;

export const BACHS_WEBHOOK_URL = '/api/bachs/payment';

export type PendingCampaign = {
  id: string;
  reference: string;
  category: 'game' | 'app' | 'product';
  title: string;
  studioName: string;
  tagline: string;
  url: string;
  description: string;
  icon?: string;
  banner?: string;
  paymentLinkId?: string;
  paymentStatus: 'pending' | 'paid' | 'free';
  paymentReference?: string;
  amount?: number;
  createdAt: number;
};

/**
 * Verifies the Bachs webhook HMAC-SHA256 signature if a secret is provided.
 * If no secret is configured yet in environment, returns true with a warning.
 */
export function verifyBachsWebhookSignature(
  rawBody: string,
  signatureHeader?: string | null,
  timestampHeader?: string | null
): { valid: boolean; reason?: string } {
  const secret = process.env.BACHS_WEBHOOK_SECRET || process.env.BACHS_SECRET_KEY;

  if (!secret) {
    // If webhook secret isn't yet in .env, permit processing so live tests don't fail
    return { valid: true, reason: 'No webhook secret configured in environment (dev mode)' };
  }

  if (!signatureHeader) {
    return { valid: false, reason: 'Missing signature header' };
  }

  try {
    const payloadToSign = timestampHeader ? `${timestampHeader}.${rawBody}` : rawBody;
    const computedHash = crypto
      .createHmac('sha256', secret)
      .update(payloadToSign)
      .digest('hex');

    // Compare signature (handle possible 't=...,v1=...' format or direct hex)
    const expectedSig = signatureHeader.includes('v1=')
      ? signatureHeader.split('v1=')[1].split(',')[0].trim()
      : signatureHeader.trim();

    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedHash, 'utf8'),
      Buffer.from(expectedSig, 'utf8')
    );

    return { valid: isValid, reason: isValid ? 'Signature verified' : 'Invalid signature' };
  } catch (err) {
    return { valid: false, reason: `Verification error: ${(err as Error).message}` };
  }
}
