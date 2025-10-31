
# FormFactor Racing — Derby Day Static Site

Deploy steps (Netlify):
1) Download and unzip `FormFactor_DerbyDay_Site.zip`.
2) In Netlify → **Deploys** → **Upload folder**, upload the folder `FormFactor_DerbyDay_Site`.
3) After deploy, add your real `picks.json` by dragging it into the same folder and redeploy — or include it before zipping.

How to use `picks.json`:
- Place a file named **picks.json** next to `index.html`.
- Must follow the structure used in `picks.sample.json` (array of blocks or a single block).
- Fields supported per race:
  - `number`, `horse`, `recent_speed_rating`, `sectional_last600`, `barrier`, `weight`, `confidence` ("High"|"Medium"|"Low"), `reason`.

Branding & compliance:
- Footer includes **ABN 37 375 806 506** and **Gamble Responsibly**.
- Hero callout: “Final selections drop Saturday 8:30am AEDT”.

Stripe links (already wired):
- Day Pass
- Weekend Pro
- Monthly Access

Need help? Upload your real `picks.json` here in chat and I’ll rebuild the ZIP with it embedded.
