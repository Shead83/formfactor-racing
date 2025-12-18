/* FormFactor Racing — Derby Day runtime */
const picksStatus = document.getElementById('picksStatus');
const picksRoot = document.getElementById('picksRoot');
document.getElementById('yr').textContent = new Date().getFullYear();

async function loadPicks() {
  try {
    const res = await fetch('picks.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('picks.json not found');
    const data = await res.json();
    renderPicks(data);
    picksStatus.textContent = 'Loaded Derby Day picks.';
    picksStatus.classList.add('ok');
  } catch (err) {
    console.warn(err);
    picksStatus.innerHTML = 'No <code>picks.json</code> found yet. Upload it next to <code>index.html</code> to render selections.';
    picksStatus.classList.add('warn');
  }
}

function chip(txt, cls='') {
  return `<span class="chip ${cls}">${txt}</span>`;
}

function renderRace(r) {
  const confClass = r.confidence ? `conf-${r.confidence.toLowerCase()}` : '';
  return `<div class="race">
    <div class="race-head">
      <div class="race-no">R${r.number ?? ''}</div>
      <div class="race-name">${r.horse ?? ''}</div>
    </div>
    <div class="race-meta">
      ${r.recent_speed_rating!=null ? chip('SR ' + r.recent_speed_rating) : ''}
      ${r.sectional_last600!=null ? chip('L600 ' + r.sectional_last600 + 's') : ''}
      ${r.barrier!=null ? chip('Barrier ' + r.barrier) : ''}
      ${r.weight!=null ? chip(r.weight + 'kg') : ''}
      ${r.horse_number!=null ? chip('#' + r.horse_number) : ''}
      ${r.confidence ? chip(r.confidence, confClass) : ''}
    </div>
    ${r.reason ? `<div class="race-reason">${r.reason}</div>` : ''}
  </div>`;
}

function renderMeeting(m) {
  const races = (m.races||[]).map(renderRace).join('');
  const best = m.best_bet ? `<div class="callout best"><strong>Best Bet:</strong> ${m.best_bet.horse} (R${m.best_bet.number})</div>` : '';
  const value = m.value_bet ? `<div class="callout value"><strong>Value:</strong> ${m.value_bet.horse} (R${m.value_bet.number})</div>` : '';
  const rough = m.roughie ? `<div class="callout rough"><strong>Roughie:</strong> ${m.roughie.horse} (R${m.roughie.number})</div>` : '';

  return `<article class="meeting-card">
    <h3>${m.track || ''}</h3>
    ${best}${value}${rough}
    <div class="races">${races}</div>
  </article>`;
}

function renderBlock(block) {
  const meetings = (block.meetings||[]).map(renderMeeting).join('');
  return `<section class="city-block">
    <div class="city-head">
      <div class="city-meta">
        <div class="city">${block.city}</div>
        <div class="date">${block.date}</div>
      </div>
    </div>
    <div class="meetings">${meetings}</div>
  </section>`;
}

function renderPicks(data) {
  // support array or single object
  const blocks = Array.isArray(data) ? data : [data];
  const html = blocks.map(renderBlock).join('');
  picksRoot.innerHTML = html;
}

loadPicks();
