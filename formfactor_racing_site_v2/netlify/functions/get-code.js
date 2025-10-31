// Netlify Function: get-code
// Returns the code for a given Checkout session_id so the success page can display it.
import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  const url = new URL(req.url);
  const sid = url.searchParams.get('session_id');
  if(!sid){ return new Response(JSON.stringify({ message: 'Missing session_id' }), { status: 400 }); }
  const store = getStore('ff-codes');
  const blob = await store.get(`sessions/${sid}.json`);
  if(!blob){ return new Response(JSON.stringify({ message: 'Code not ready. Please refresh in a few seconds.' }), { status: 404 }); }
  const json = await blob.json();
  return new Response(JSON.stringify({ code: json.code, access: json.access, expires: json.expires }), { status: 200 });
};
