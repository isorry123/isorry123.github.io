/* ============================================================
   stations.js — watch station configuration tab
   ============================================================ */

function renderStations() {
  const wrap = document.getElementById('stationsTableWrap');
  const { stations } = App.state;

  if (stations.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      <p>No watch stations defined yet.</p>
      <p class="empty-sub">Add the stations that need to be manned, e.g. Officer of the Deck, Helm, Lookout.</p>
    </div>`;
  } else {
    const rows = stations
      .map(
        (s) => `<tr>
          <td><input class="cell-input" data-field="name" data-id="${s.id}" value="${escapeHtml(s.name)}" /></td>
          <td class="center"><input type="checkbox" data-field="allowUI" data-id="${s.id}" ${s.allowUI ? 'checked' : ''} /></td>
          <td><button class="icon-btn danger" data-remove-station="${s.id}" title="Remove">✕</button></td>
        </tr>`
      )
      .join('');

    wrap.innerHTML = `<table class="data-table">
      <thead><tr><th>Station</th><th>Allow UI seat</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  wireStationEvents();
}

function wireStationEvents() {
  const wrap = document.getElementById('stationsTableWrap');

  wrap.querySelectorAll('.cell-input').forEach((el) => {
    el.addEventListener('change', (e) => {
      const s = getStationById(e.target.dataset.id);
      if (!s) return;
      s[e.target.dataset.field] = e.target.value.trim();
      App.save();
      if (typeof renderWatchbill === 'function') renderWatchbill();
    });
  });

  wrap.querySelectorAll('[data-field="allowUI"]').forEach((el) => {
    el.addEventListener('change', (e) => {
      const s = getStationById(e.target.dataset.id);
      if (!s) return;
      s.allowUI = e.target.checked;
      App.save();
      renderRoster();
      if (typeof renderWatchbill === 'function') renderWatchbill();
    });
  });

  wrap.querySelectorAll('[data-remove-station]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.removeStation;
      const s = getStationById(id);
      if (!s) return;
      if (!confirm(`Remove watch station "${s.name}"? This also clears it from the watchbill.`)) return;
      App.state.stations = App.state.stations.filter((x) => x.id !== id);
      App.state.crew.forEach((c) => { if (c.quals) delete c.quals[id]; });
      Object.values(App.state.assignments).forEach((slots) => { delete slots[id]; });
      App.save();
      renderStations();
      renderRoster();
      if (typeof renderWatchbill === 'function') renderWatchbill();
    });
  });
}

function addStation(name) {
  if (!name || !name.trim()) return;
  App.state.stations.push({
    id: uid('st'),
    name: name.trim(),
    allowUI: true,
  });
  App.save();
  renderStations();
  renderRoster();
}
