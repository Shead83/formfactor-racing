# FormFactor Racing

Official website for **FormFactor Racing** — data-driven horse racing tips with paid member access (Stripe) and an admin editor (Netlify CMS).

## Contents
- `index.html`, `styles.css`, `app.js` — site
- `members.html`, `thanks.html` — gated members flow
- `picks.json` — daily tips (loaded by members page)
- `/admin` — Netlify CMS (Decap) editor for `picks.json`

## Setup (GitHub + Netlify)
1. Push this folder to a GitHub repo (e.g. `formfactor-racing`).
2. Netlify → **Add new site → Import from Git** → connect the repo.
3. Netlify → **Identity → Enable Identity** → Registration: Invite only.
4. Netlify → **Identity → Services → Enable Git Gateway**.
5. Netlify → **Identity → Invite users** → invite your email.
6. Visit `/admin` on your site → log in → edit "Race Day Tips" → Publish.

## Stripe links
Edit `app.js` and replace the placeholders with your **LIVE** Payment Links:
```js
const checkoutLinks = {
  day:    'https://buy.stripe.com/REPLACE_WITH_LIVE_DAY_LINK',
  weekend:'https://buy.stripe.com/REPLACE_WITH_LIVE_WEEKEND_LINK',
  monthly:'https://buy.stripe.com/REPLACE_WITH_LIVE_MONTHLY_LINK'
};
```

## Apple Pay
Stripe Dashboard → Settings → Payments → Apple Pay → **verify your domain**.

## Members access codes
- Day: `FFR-DAY` (24h)
- Weekend: `FFR-WKD` (72h)
- Monthly: `FFR-MONTH` (31 days)

Rotate codes by updating:
- Stripe **After payment redirect** (e.g. `/thanks.html?plan=day&code=FFR-DAY`)
- The `VALID` map in `members.html`

## License
All rights reserved.
