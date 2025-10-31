// Netlify Function: verify-code
// Checks whether a code is valid and (optionally) marks it redeemed.
import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try{
    const { code } = await req.json();
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
