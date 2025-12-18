// Netlify Function: create-token
// Verifies a Stripe Checkout Session via Stripe's REST API (no npm deps),
// then returns a signed token valid for a short time.

const crypto = require('crypto');

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'FFR' }), 'utf8').toString('base64url');
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const unsigned = `${header}.${body}`;

  const signature = crypto
    .createHmac('sha256', process.env.TOKEN_SECRET)
    .update(unsigned)
    .digest('base64url');

  return `${unsigned}.${signature}`;
}

async function fetchStripeSession(sessionId) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    const err = new Error('Missing STRIPE_SECRET_KEY');
    err.statusCode = 500;
    throw err;
  }

  const url = `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`;

  // Netlify Functions runtime supports fetch on Node 18+.
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Stripe API error');
    err.statusCode = res.status || 500;
    err.details = json;
    throw err;
  }

  return json;
}

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const sessionId = params.session_id;

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing session_id' }),
      };
    }

    const session = await fetchStripeSession(sessionId);

    if (session.payment_status !== 'paid') {
      return {
        statusCode: 402,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Session is not paid' }),
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const daysValid = 3; // token valid for 3 days

    const payload = {
      sub: session.customer || session.customer_email || session.id,
      plan: 'WEEKLY_METRO_TIPS',
      iat: now,
      exp: now + daysValid * 24 * 60 * 60,
    };

    const token = signToken(payload);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, expiresAt: payload.exp }),
    };
  } catch (err) {
    console.error(err);
    const statusCode = err.statusCode || 500;
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: statusCode === 500 ? 'Internal error' : err.message,
      }),
    };
  }
};
