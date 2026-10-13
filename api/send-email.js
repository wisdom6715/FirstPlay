/**
 * Vercel Serverless Function: FirstPlay Resend Email Dispatcher
 * POST /api/send-email
 */

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, text, from } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required email fields (to, subject, html)'
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Resend API Error] Missing RESEND_API_KEY environment variable on server');
      return res.status(500).json({ error: 'Server configuration error: RESEND_API_KEY is not set' });
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
      return res.status(resendResponse.status).json(data);
    }

    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('[Send-Email Handler Exception]', err);
    return res.status(500).json({ error: err.message || 'Internal server error sending email' });
  }
}
