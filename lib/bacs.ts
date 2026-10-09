export function getBacsStatus() {
  const credentialsConfigured = Boolean(process.env.BACS_API_BASE_URL && process.env.BACS_SECRET_KEY && process.env.BACS_MERCHANT_ID);
  const adapterImplemented = false;
  const configured = credentialsConfigured && adapterImplemented;
  return {
    configured,
    credentials_configured: credentialsConfigured,
    label: configured ? 'Bacs ready' : 'Bacs adapter pending',
    message: configured
      ? 'Payment handoff is ready for the configured merchant account.'
      : credentialsConfigured
        ? 'Bacs credentials are present, but the provider checkout adapter is still pending its merchant API contract.'
        : 'Add Bacs API base URL, secret key, and merchant ID to enable payment handoff.'
  };
}
