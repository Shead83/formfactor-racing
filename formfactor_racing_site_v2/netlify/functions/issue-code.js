// Netlify Function: issue-code (Stripe webhook)
// Generates a unique access code when a checkout completes and stores it in Netlify Blobs.
// Env vars required: STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY
import Stripe from 'stripe';
import crypto from 'crypto';
import { getStore } from '@netlify/blobs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

function makeCode(){
  const raw = crypto.randomBytes(6).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g,'');
  return `FF-${raw.slice(0,4)}-${raw.slice(4,8)}`;
}

function deriveAccess(lineItems){
  // Map product to access tier + expiry days
  // Customize these product IDs to your live Stripe Product IDs
  const map = {
    'Day Pass': { access: 'day', days: 1 },
    'Weekend Pro': { access: 'weekend', days: 2 },
    'Monthly Access': { access: 'monthly', days: 31 }
  };
  for (const it of lineItems) {
    const name = it.description || it.price?.product?.name;
    for (const key of Object.keys(map)) {
      if ((name||'').includes(key)) return map[key];
    }
  }
  return { access: 'day', days: 1 };
}

export default async (req, context) => {
  const sig = req.headers['stripe-signature'];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try{
    const raw = await req.text();
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  }catch(err){
    return new Response(JSON.stringify({ message: 'Invalid signature' }), { status: 400 });
  }

  if(event.type !== 'checkout.session.completed'){
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const session = event.data.object;
  const store = getStore('ff-codes'); // blob bucket

  // Fetch line items to decide tier & expiry
  const li = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
  const { access, days } = deriveAccess(li.data);

  const code = makeCode();
  const now = new Date();
  const expires = new Date(now.getTime() + days*24*60*60*1000);

  const record = {
    code,
    access,
    email: session.customer_details?.email || null,
    session_id: session.id,
    created: now.toISOString(),
    expires: expires.toISOString(),
    redeemed: false
  };

  // Store by session id and by code for lookup
  await store.set(`sessions/${session.id}.json`, JSON.stringify(record), { metadata: { contentType: 'application/json' }});
  await store.set(`codes/${code}.json`, JSON.stringify(record), { metadata: { contentType: 'application/json' }});

  // Optional: send email with SendGrid
  try{
    if(process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL && record.email){
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: record.email }] }],
          from: { email: process.env.FROM_EMAIL, name: 'FormFactor Racing' },
          subject: 'Your FormFactor access code',
          content: [{ type: 'text/plain', value: `Thanks for your purchase!

Your code: ${code}
Access: ${access}
Expires: ${record.expires}

Use it at https://YOUR_DOMAIN/members.html` }]
        })
      });
      // ignore failures silently
    }
  }catch(e){ /* noop */ }

  return new Response(JSON.stringify({ ok: true, code }), { status: 200 });
};
