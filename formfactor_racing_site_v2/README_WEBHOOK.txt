SETUP — Codes on Purchase → Members Unlock (Netlify + Stripe)

1) Deploy this folder to Netlify.
2) In Stripe Checkout, set success_url to:
   https://YOUR_DOMAIN/success.html?session_id={CHECKOUT_SESSION_ID}
3) In Netlify → Site Settings → Environment variables, set:
   - STRIPE_SECRET_KEY       = sk_live_...
   - STRIPE_WEBHOOK_SECRET   = whsec_...   (from step 5)
   - (Optional) SENDGRID_API_KEY and FROM_EMAIL for emailing codes
4) Map your product names in `issue-code.js` (Day Pass, Weekend Pro, Monthly Access) if they differ.
5) Create a Stripe webhook endpoint pointing to:
   https://YOUR_DOMAIN/.netlify/functions/issue-code
   Subscribe to: checkout.session.completed
   Copy the signing secret into STRIPE_WEBHOOK_SECRET.
6) Test a checkout with test keys. After payment, Stripe redirects to success.html. The page calls
   /.netlify/functions/get-code?session_id=... and displays the generated code.
7) On the live site, buyers will receive their code on the success page (and email if SendGrid is configured).
   They can enter it at /members.html to unlock picks. Codes expire based on product tier and are single-use by default.
