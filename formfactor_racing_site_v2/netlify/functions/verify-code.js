// Netlify Function: verify-code
// Checks whether a code is valid and (optionally) marks it redeemed.
import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try{
    const { code } = await req.json();

  // --- Shared fallback codes (quick access) ---
  const ADMIN_CODE = process.env.ADMIN_CODE || 'FF-ADMIN-ACCESS';              // unlimited, admin access
  const WEEKLY_CODE = process.env.WEEKLY_CODE || 'FF-01NOV-AEDT';
  const FFR_DAY = process.env.FFR_DAY || 'FFR-DAY';              // this week's shared code
  const MONTHLY_SHARED = process.env.MONTHLY_SHARED || 'FF-MONTHLY-ACCESS';    // optional shared monthly

  const nowAet = new Date(); // server time; Netlify uses UTC but we just compare ISO here
  const endOfThisWeek = new Date('2025-11-02T23:59:59+11:00'); // AEDT hardcoded for launch weekend

  if (code === ADMIN_CODE) {
    return new Response(JSON.stringify({ valid:true, access:'admin', expires: null, message:'Admin code' }), { status: 200 });
  }
  if (code === WEEKLY_CODE) {
    if (nowAet.getTime() <= endOfThisWeek.getTime()) {
      return new Response(JSON.stringify({ valid:true, access:'day', expires: endOfThisWeek.toISOString(), message:'Weekly code' }), { status: 200 });
    } else {
      // fallthrough to invalid
    }
  }
  if (code === MONTHLY_SHARED) {
    const monthLater = new Date(nowAet.getTime() + 31*24*60*60*1000);
    return new Response(JSON.stringify({ valid:true, access:'monthly', expires: monthLater.toISOString(), message:'Monthly shared code' }), { status: 200 });
  }
  if (code === FFR_DAY) {
    const dayLater = new Date(Date.now() + 24*60*60*1000);
    return new Response(JSON.stringify({ valid:true, access:'day', expires: dayLater.toISOString(), message:'Day Pass code' }), { status: 200 });
  }
  // --- End shared fallback codes ---

    if(!code){ return new Response(JSON.stringify({ valid:false, message:'No code provided' }), { status: 400 }); }
    const store = getStore('ff-codes');
    const blob = await store.get(`codes/${code}.json`);
    if(!blob){ return new Response(JSON.stringify({ valid:false, message:'Invalid code' }), { status: 404 }); }
    const rec = await blob.json();
    const now = Date.now();
    if (new Date(rec.expires).getTime() < now){
      return new Response(JSON.stringify({ valid:false, message:'Code expired' }), { status: 410 });
    }
    // Mark redeemed (single-use). Comment this out if you want multi-use for same day.
    if(!rec.redeemed){
      rec.redeemed = true;
      rec.redeemed_at = new Date().toISOString();
      await store.set(`codes/${code}.json`, JSON.stringify(rec), { metadata: { contentType: 'application/json' }});
      await store.set(`sessions/${rec.session_id}.json`, JSON.stringify(rec), { metadata: { contentType: 'application/json' }});
    }
    return new Response(JSON.stringify({ valid:true, access: rec.access, expires: rec.expires }), { status: 200 });
  }catch(e){
    return new Response(JSON.stringify({ valid:false, message:'Server error' }), { status: 500 });
  }
};
