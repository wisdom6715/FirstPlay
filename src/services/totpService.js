import QRCode from 'qrcode';

/**
 * Base32 character set (RFC 4648 standard)
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generates a cryptographically random Base32 secret for TOTP enrollment.
 * Standard length is 20 characters (100 bits of entropy).
 * 
 * @param {number} length 
 * @returns {string} Base32 encoded secret
 */
export function generateTotpSecret(length = 20) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return secret;
}

/**
 * Decodes a Base32 string into a Uint8Array byte buffer.
 * 
 * @param {string} base32 
 * @returns {Uint8Array}
 */
export function base32ToBytes(base32) {
  const clean = (base32 || '').toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Computes the HMAC-SHA1 HOTP value for a specific 8-byte counter step (RFC 4226).
 * 
 * @param {Uint8Array} secretBytes 
 * @param {number} counter 
 * @returns {Promise<string>} 6-digit numeric string
 */
async function generateHOTP(secretBytes, counter) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, Math.floor(counter / 0x100000000));
  view.setUint32(4, counter & 0xffffffff);

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, buffer);
  const hmac = new Uint8Array(signature);

  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = code % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verifies a 6-digit TOTP token against a Base32 secret with a ±1 time step window (±30s) (RFC 6238).
 * 
 * @param {string} token - 6-digit OTP from Google Authenticator, Microsoft Authenticator, or Authy
 * @param {string} secret - Base32 secret key stored for the admin
 * @param {number} window - Drift tolerance in 30-second steps (default: 1)
 * @returns {Promise<boolean>}
 */
export async function verifyTOTP(token, secret, window = 1) {
  if (!token || !secret) return false;
  const cleanToken = token.toString().trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const secretBytes = base32ToBytes(secret);
  if (secretBytes.length === 0) return false;

  const epoch = Math.floor(Date.now() / 1000);
  const currentStep = Math.floor(epoch / 30);

  for (let i = -window; i <= window; i++) {
    const expected = await generateHOTP(secretBytes, currentStep + i);
    if (expected === cleanToken) {
      return true;
    }
  }

  return false;
}

/**
 * Builds the standard otpauth:// URL accepted by Google Authenticator, Microsoft Authenticator, and Authy.
 * 
 * @param {string} email - Admin email
 * @param {string} secret - Base32 secret
 * @param {string} issuer - Platform name (default: FirstPlay)
 * @returns {string}
 */
export function buildOtpAuthUri(email, secret, issuer = 'FirstPlay') {
  const cleanEmail = email.trim();
  const label = encodeURIComponent(`${issuer}:${cleanEmail}`);
  const encIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Renders a QR code Data URL from an otpauth URI for visual scanning.
 * 
 * @param {string} otpAuthUri 
 * @returns {Promise<string>}
 */
export async function generateQrCodeDataUrl(otpAuthUri) {
  return await QRCode.toDataURL(otpAuthUri, {
    width: 240,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
}
