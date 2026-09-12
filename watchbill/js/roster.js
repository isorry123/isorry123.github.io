/* ============================================================
   roster.js — crew roster tab
   ============================================================ */

function renderRoster() {
  const wrap = document.getElementById('rosterTableWrap');
  const { crew, stations } = App.state;

  if (crew.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      <p>No crew on the roster yet.</p>
      <p class="empty-sub">Add people below — you'll set their qualifications per watch station here too.</p>
    </div>`;
  } else {
    const rows = crew
      .map((person) => {
        const qualCells = stations
          .map((s) => {
            const level = qualLevel(person, s.id);
            return `<td>
              <select class="qual-select ${level}" data-person="${person.id}" data-station="${s.id}">
                <option value="none" ${level === 'none' ? 'selected' : ''}>—</option>
                <option value="UI" ${level === 'UI' ? 'selected' : ''}>Under Instruction</option>
                <option value="Q" ${level === 'Q' ? 'selected' : ''}>Qualified</option>
                <option value="EX" ${level === 'EX' ? 'selected' : ''}>Qualified / Exempt</option>
              </select>
            </td>`;
          })
          .join('');
        return `<tr>
          <td><input class="cell-input" data-field="name" data-id="${person.id}" value="${escapeHtml(person.name)}" /></td>
          <td><input class="cell-input cell-input--narrow" data-field="rank" data-id="${person.id}" value="${escapeHtml(person.rank || '')}" /></td>
          <td>
            <select class="status-select status-${person.status}" data-field="status" data-id="${person.id}">
              <option value="available" ${person.status === 'available' ? 'selected' : ''}>Available</option>
              <option value="limited" ${person.status === 'limited' ? 'selected' : ''}>Limited</option>
              <option value="sick" ${person.status === 'sick' ? 'selected' : ''}>Sick / Incapacitated</option>
            </select>
          </td>
          ${qualCells}
          <td><button class="icon-btn danger" data-remove-person="${person.id}" title="Remove">✕</button></td>
        </tr>`;
      })
      .join('');

    const stationHeaders = stations.map((s) => `<th>${escapeHtml(s.name)}</th>`).join('');

    wrap.innerHTML = `<table class="data-table">
      <thead><tr>
        <th>Name</th><th>Rank / Rate</th><th>Status</th>${stationHeaders}<th></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  wireRosterEvents();
}

function wireRosterEvents() {
  const wrap = document.getElementById('rosterTableWrap');

  wrap.querySelectorAll('.cell-input').forEach((el) => {
    el.addEventListener('change', (e) => {
      const person = getCrewById(e.target.dataset.id);
      if (!person) return;
      person[e.target.dataset.field] = e.target.value.trim();
      App.save();
    });
  });

  wrap.querySelectorAll('.status-select').forEach((el) => {
    el.addEventListener('change', (e) => {
      const person = getCrewById(e.target.dataset.id);
      if (!person) return;
      person.status = e.target.value;
      App.save();
      renderRoster();
      if (typeof renderWatchbill === 'function') renderWatchbill();
    });
  });

  wrap.querySelectorAll('.qual-select').forEach((el) => {
    el.addEventListener('change', (e) => {
      const person = getCrewById(e.target.dataset.person);
      if (!person) return;
      if (!person.quals) person.quals = {};
      const val = e.target.value;
      if (val === 'none') delete person.quals[e.target.dataset.station];
      else person.quals[e.target.dataset.station] = val;
      App.save();
      renderRoster();
    });
  });

  wrap.querySelectorAll('[data-remove-person]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.removePerson;
      const person = getCrewById(id);
      if (!person) return;
      if (!confirm(`Remove ${person.name} from the roster? This also clears them from the watchbill.`)) return;
      App.state.crew = App.state.crew.filter((c) => c.id !== id);
      Object.values(App.state.assignments).forEach((slots) => {
        Object.values(slots).forEach((slot) => {
          if (slot.primary === id) slot.primary = null;
          if (slot.ui === id) slot.ui = null;
        });
      });
      App.save();
      renderRoster();
      if (typeof renderWatchbill === 'function') renderWatchbill();
      if (typeof renderSwap === 'function') renderSwap();
    });
  });
}

function addCrewMember(name, rank) {
  if (!name || !name.trim()) return;
  App.state.crew.push({
    id: uid('cr'),
    name: name.trim(),
    rank: (rank || '').trim(),
    status: 'available',
    quals: {},
  });
  App.save();
  renderRoster();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
