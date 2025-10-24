FormFactor Racing — Complete Pack (Cox Plate Day)
FILES
- index.html    → Landing page with pricing and Stripe links
- members.html  → Members page (mobile-first), requires FFR-DAY / FFR-WEEKEND / FFR-MONTHLY
- thanks.html   → After-payment page that saves the code and deep-links to members
- picks.json    → Full selections for 25 Oct 2025 (Randwick, Moonee Valley, Doomben)

GO LIVE
1) In Netlify/GitHub, upload all files to the site root (overwrite existing).
2) In Stripe Payment Links → After payment → Redirect URL:
   - Day:     https://formfactor-racing.netlify.app/thanks.html?code=FFR-DAY
   - Weekend: https://formfactor-racing.netlify.app/thanks.html?code=FFR-WEEKEND
   - Monthly: https://formfactor-racing.netlify.app/thanks.html?code=FFR-MONTHLY

WEEKLY ROUTINE (60s)
- Only update picks.json (date, horses, confidence, reasons). Upload that one file.
