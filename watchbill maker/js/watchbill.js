/* ============================================================
   watchbill.js — period management + the watchbill grid itself
   ============================================================ */

function renderWatchbill() {
  ensureAssignmentSlots();
  renderPeriodsEditor();
  renderWatchbillGrid();
}

function renderPeriodsEditor() {
  const wrap = document.getElementById('periodsWrap');
  const rows = App.state.periods
    .map(
      (p, idx) => `<tr>
        <td><input class="cell-input" data-pfield="label" data-id="${p.id}" value="${escapeHtml(p.label)}" /></td>
        <td><input class="cell-input cell-input--time" type="time" data-pfield="start" data-id="${p.id}" value="${p.start}" /></td>
        <td><input class="cell-input cell-input--time" type="time" data-pfield="end" data-id="${p.id}" value="${p.end}" /></td>
        <td>
          <button class="icon-btn" data-move-period="up" data-id="${p.id}" ${idx === 0 ? 'disabled' : ''} title="Move earlier">↑</button>
          <button class="icon-btn" data-move-period="down" data-id="${p.id}" ${idx === App.state.periods.length - 1 ? 'disabled' : ''} title="Move later">↓</button>
          <button class="icon-btn danger" data-remove-period="${p.id}" title="Remove">✕</button>
        </td>
      </tr>`
    )
    .join('');

  wrap.innerHTML = `<table class="data-table data-table--compact">
    <thead><tr><th>Watch</th><th>Start</th><th>End</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  wrap.querySelectorAll('.cell-input').forEach((el) => {
    el.addEventListener('change', (e) => {
      const p = App.state.periods.find((x) => x.id === e.target.dataset.id);
      if (!p) return;
      p[e.target.dataset.pfield] = e.target.value;
      App.save();
    });
  });

  wrap.querySelectorAll('[data-move-period]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const dir = e.target.dataset.movePeriod;
      const list = App.state.periods;
      const i = list.findIndex((p) => p.id === id);
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      App.save();
      renderWatchbill();
    });
  });

  wrap.querySelectorAll('[data-remove-period]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.removePeriod;
      if (!confirm('Remove this watch period from the bill?')) return;
      App.state.periods = App.state.periods.filter((p) => p.id !== id);
      delete App.state.assignments[id];
      App.save();
      renderWatchbill();
    });
  });
}

function addPeriod(label, start, end) {
  if (!label || !label.trim()) return;
  App.state.periods.push({ id: uid('pd'), label: label.trim(), start: start || '00:00', end: end || '00:00' });
  App.save();
  renderWatchbill();
}

function personOptionsFor(stationId, level, periodId, currentValue) {
  const options = ['<option value="">— gap —</option>'];
  App.state.crew.forEach((p) => {
    if (qualLevel(p, stationId) !== level) return;
    const busyElsewhere = isBusyInPeriod(periodId, p.id, stationId) && p.id !== currentValue;
    const unavailable = p.status !== 'available' && p.id !== currentValue;
    const disabled = busyElsewhere || unavailable ? 'disabled' : '';
    const tag = p.status !== 'available' ? ` (${p.status})` : busyElsewhere ? ' (on watch)' : '';
    options.push(
      `<option value="${p.id}" ${p.id === currentValue ? 'selected' : ''} ${disabled}>${escapeHtml(p.name)}${escapeHtml(tag)}</option>`
    );
  });
  return options.join('');
}

function renderWatchbillGrid() {
  const wrap = document.getElementById('watchbillGridWrap');
  const { periods, stations, assignments } = App.state;

  if (stations.length === 0 || periods.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      <p>Add at least one watch station and one watch period to build the bill.</p>
    </div>`;
    return;
  }

  const headerCells = periods
    .map((p) => `<th><span class="watch-label">${escapeHtml(p.label)}</span><span class="watch-time">${p.start}–${p.end}</span></th>`)
    .join('');

  const bodyRows = stations
    .map((station) => {
      const cells = periods
        .map((period) => {
          const slot = assignments[period.id][station.id];
          const gap = !slot.primary;
          const uiRow = station.allowUI
            ? `<select class="cell-select cell-select--ui" data-role="ui" data-period="${period.id}" data-station="${station.id}">
                 ${personOptionsFor(station.id, 'UI', period.id, slot.ui)}
               </select>`
            : '';
          return `<td class="${gap ? 'cell-gap' : ''}">
            <select class="cell-select" data-role="primary" data-period="${period.id}" data-station="${station.id}">
              ${personOptionsFor(station.id, 'Q', period.id, slot.primary)}
            </select>
            ${uiRow}
          </td>`;
        })
        .join('');
      return `<tr><th class="row-label">${escapeHtml(station.name)}</th>${cells}</tr>`;
    })
    .join('');

  wrap.innerHTML = `<div class="bill-sheet">
    <div class="bill-sheet__head">
      <div>
        <div class="bill-sheet__unit" id="printUnit">${escapeHtml(App.state.meta.unit)}</div>
        <div class="bill-sheet__title">Watch, Quarter &amp; Station Bill</div>
      </div>
      <div class="bill-sheet__date" id="printDate">${escapeHtml(App.state.meta.date)}</div>
    </div>
    <table class="watch-grid">
      <thead><tr><th class="corner">Station</th>${headerCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <p class="legend"><span class="legend-dot legend-dot--gap"></span> Unfilled watch — needs a qualified, available person.</p>
  </div>`;

  wrap.querySelectorAll('.cell-select').forEach((el) => {
    el.addEventListener('change', (e) => {
      const { period, station, role } = e.target.dataset;
      const slot = App.state.assignments[period][station];
      slot[role] = e.target.value || null;
      App.save();
      renderWatchbillGrid();
    });
  });
}
