/* ============================================================
   swap.js — sick/incapacitated swap-out tab
   ============================================================ */

function renderSwap() {
  const selectWrap = document.getElementById('swapPersonSelect');
  const { crew } = App.state;

  if (crew.length === 0) {
    selectWrap.innerHTML = `<p class="empty-sub">Add people to the roster first.</p>`;
    document.getElementById('swapResult').innerHTML = '';
    return;
  }

  const options = crew
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)} — ${escapeHtml(c.status)}</option>`)
    .join('');

  selectWrap.innerHTML = `
    <select id="swapPersonPicker" class="cell-input">${options}</select>
    <div class="swap-actions">
      <button class="btn btn--warn" id="markLimitedBtn">Mark Limited</button>
      <button class="btn btn--danger" id="markSickBtn">Mark Sick / Incapacitated</button>
      <button class="btn" id="markAvailableBtn">Mark Available</button>
    </div>
  `;

  document.getElementById('markSickBtn').addEventListener('click', () => runSwap('sick'));
  document.getElementById('markLimitedBtn').addEventListener('click', () => runSwap('limited'));
  document.getElementById('markAvailableBtn').addEventListener('click', () => runSwap('available'));

  renderGapSummary();
}

function runSwap(status) {
  const id = document.getElementById('swapPersonPicker').value;
  const person = getCrewById(id);
  if (!person) return;

  const result = swapOutPerson(id, status);
  const resultWrap = document.getElementById('swapResult');

  const changedList = result.changed
    .map((c) => `<li><strong>${escapeHtml(c.periodLabel)}</strong> — ${escapeHtml(c.stationName)} (${c.role === 'ui' ? 'UI seat' : 'primary'}): now <strong>${escapeHtml(personLabel(c.replacement))}</strong></li>`)
    .join('');
  const gapList = result.gaps
    .map((g) => `<li><strong>${escapeHtml(g.periodLabel)}</strong> — ${escapeHtml(g.stationName)} (${g.role === 'ui' ? 'UI seat' : 'primary'}): <span class="tag tag--gap">no qualified sub found</span></li>`)
    .join('');

  resultWrap.innerHTML = `
    <h3>${escapeHtml(person.name)} marked <em>${escapeHtml(status)}</em></h3>
    ${result.changed.length ? `<p>Watches backfilled:</p><ul class="swap-list">${changedList}</ul>` : ''}
    ${result.gaps.length ? `<p>Needs manual attention — no qualified, available replacement was found:</p><ul class="swap-list swap-list--gap">${gapList}</ul>` : ''}
    ${!result.changed.length && !result.gaps.length ? `<p class="empty-sub">This person had no watches assigned in the current bill.</p>` : ''}
  `;

  renderRoster();
  renderWatchbill();
  renderSwap();
}

function renderGapSummary() {
  const wrap = document.getElementById('gapSummary');
  const gaps = [];
  App.state.periods.forEach((period) => {
    App.state.stations.forEach((station) => {
      const slot = App.state.assignments[period.id] && App.state.assignments[period.id][station.id];
      if (slot && !slot.primary) {
        gaps.push(`${period.label} — ${station.name}`);
      }
    });
  });

  wrap.innerHTML = gaps.length
    ? `<p class="tag tag--gap">${gaps.length} unfilled watch${gaps.length === 1 ? '' : 'es'} in the current bill</p>
       <ul class="swap-list swap-list--gap">${gaps.map((g) => `<li>${escapeHtml(g)}</li>`).join('')}</ul>`
    : `<p class="tag tag--ok">All watches are filled.</p>`;
}
