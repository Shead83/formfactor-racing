/* Members page logic: verify access code then load picks */
document.getElementById('yr').textContent = new Date().getFullYear();

const gateStatus = document.getElementById('gateStatus');
const picksStatus = document.getElementById('picksStatus');
const picksRoot = document.getElementById('picksRoot');
const codeInput = document.getElementById('code');
const unlockBtn = document.getElementById('unlock');

function chip(txt, cls=''){ return `<span class="chip ${cls}">${txt}</span>`; }
function renderRace(r){
  const confClass = r.confidence ? `conf-${String(r.confidence).toLowerCase()}` : '';
  return `<div class="race">
    <div class="race-head"><div class="race-no">R${r.number ?? ''}</div><div class="race-name">${r.horse ?? ''}</div></div>
    <div class="race-meta">
      ${r.recent_speed_rating!=null ? chip('SR ' + r.recent_speed_rating) : ''}
      ${r.sectional_last600!=null ? chip('L600 ' + r.sectional_last600 + 's') : ''}
      ${r.barrier!=null ? chip('Barrier ' + r.barrier) : ''}
      ${r.weight!=null ? chip(r.weight + 'kg') : ''}
      ${r.horse_number!=null ? chip('#' + r.horse_number) : ''}
      ${r.confidence!=null ? chip(String(r.confidence)) : ''}
    </div>
    ${r.reason ? `<div class="race-reason">${r.reason}</div>` : ''}
  </div>`;
}
function renderMeeting(m){
  const races = (m.races||[]).map(renderRace).join('');
  const best = m.best_bet ? `<div class="callout best"><strong>Best Bet:</strong> ${m.best_bet.horse} (R${m.best_bet.number})</div>` : '';
  const value = m.value_bet ? `<div class="callout value"><strong>Value:</strong> ${m.value_bet.horse} (R${m.value_bet.number})</div>` : '';
  const rough = m.roughie ? `<div class="callout rough"><strong>Roughie:</strong> ${m.roughie.horse} (R${m.roughie.number})</div>` : '';
  return `<article class="meeting-card"><h3>${m.track||''}</h3>${best}${value}${rough}<div class="races">${races}</div></article>`;
}
function renderBlock(block){
  const meetings = (block.meetings||[]).map(renderMeeting).join('');
  return `<section class="city-block"><div class="city-head"><div class="city">${block.city}</div><div class="date">${block.date}</div></div><div class="meetings">${meetings}</div></section>`;
}
function renderPicks(data){
  const blocks = Array.isArray(data) ? data : [data];
  picksRoot.innerHTML = blocks.map(renderBlock).join('');
}

async function verifyAndLoad(){
  const code = (codeInput.value||'').trim();
  if(!code){ gateStatus.textContent = 'Enter your access code.'; return; }
  gateStatus.textContent = 'Checking code…';

  // Front-end bypass (failsafe): accept shared codes in browser to avoid server dependency
  const LOCAL_CODES = {
    'FF-ADMIN-ACCESS': { access: 'admin', expires: null },
    'FF-01NOV-AEDT':   { access: 'day',   expires: '2025-11-02T23:59:59+11:00' },
    'FF-MONTHLY-ACCESS': { access: 'monthly', expires: null }
  };
  if (LOCAL_CODES[code]) {
    const info = LOCAL_CODES[code];
    gateStatus.textContent = `Unlocked (local): ${info.access}${info.expires ? ' — expires ' + info.expires : ''}`;
    const picks = await fetch('picks.json', { cache:'no-store' });
    const data = await picks.json();
    renderPicks(data);
    picksStatus.textContent = 'Loaded picks.';
    picksStatus.classList.add('ok');
    return;
  }

  try{
    const res = await fetch('/.netlify/functions/verify-code', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code })
    });
    const out = await res.json();
    if(!res.ok || !out.valid){
      gateStatus.textContent = out.message || 'Invalid or expired code.';
      return;
    }
    gateStatus.textContent = `Unlocked: ${out.access} — expires ${out.expires||'end of day'}`;
    // now load picks
    const picks = await fetch('picks.json', { cache:'no-store' });
    const data = await picks.json();
    renderPicks(data);
    picksStatus.textContent = 'Loaded picks.';
    picksStatus.classList.add('ok');
  }catch(e){
    console.error(e);
    gateStatus.textContent = 'Server error validating code.';
  }
}

unlockBtn.addEventListener('click', verifyAndLoad);
codeInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') verifyAndLoad(); });


// Autofill from URL: ?code=XXXX or ?unlock=1 to force-load (admin)
(function(){
  const p = new URLSearchParams(location.search);
  const pre = p.get('code');
  if (pre) { codeInput.value = pre; }
  if (p.get('unlock') === '1' && !pre) { codeInput.value = 'FF-ADMIN-ACCESS'; }
  if (pre || p.get('unlock') === '1') { setTimeout(()=>unlockBtn.click(), 100); }
})();

