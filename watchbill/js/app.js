/* ============================================================
   app.js — tab navigation, form wiring, boot
   ============================================================ */

function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + tabId));
}

function wireMasthead() {
  const unitInput = document.getElementById('unitName');
  const dateInput = document.getElementById('billDate');

  unitInput.addEventListener('change', (e) => {
    App.state.meta.unit = e.target.value.trim() || 'UNNAMED UNIT';
    App.save();
    renderWatchbill();
  });
  dateInput.addEventListener('change', (e) => {
    App.state.meta.date = e.target.value;
    App.save();
    renderWatchbill();
  });
}

function wireForms() {
  document.getElementById('addCrewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newCrewName');
    const rank = document.getElementById('newCrewRank');
    addCrewMember(name.value, rank.value);
    name.value = '';
    rank.value = '';
    name.focus();
  });

  document.getElementById('addStationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newStationName');
    addStation(name.value);
    name.value = '';
    name.focus();
  });

  document.getElementById('addPeriodForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const label = document.getElementById('newPeriodLabel');
    const start = document.getElementById('newPeriodStart');
    const end = document.getElementById('newPeriodEnd');
    addPeriod(label.value, start.value, end.value);
    label.value = '';
  });

  document.getElementById('autoRotateAllBtn').addEventListener('click', () => {
    if (confirm('Regenerate the entire watchbill? This replaces all current assignments.')) {
      autoRotate('all');
      renderWatchbillGrid();
      renderSwap();
    }
  });

  document.getElementById('autoRotateEmptyBtn').addEventListener('click', () => {
    autoRotate('empty');
    renderWatchbillGrid();
    renderSwap();
  });

  document.getElementById('clearWatchbillBtn').addEventListener('click', () => {
    if (confirm('Clear every assignment in the watchbill? Roster and stations are kept — only the grid empties out.')) {
      clearWatchbill();
      renderWatchbillGrid();
      renderSwap();
    }
  });

  document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);

  document.getElementById('exportJsonBtn').addEventListener('click', exportDataAsJson);

  document.getElementById('importJsonBtn').addEventListener('click', () => {
    document.getElementById('importJsonInput').click();
  });
  document.getElementById('importJsonInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importDataFromJsonFile(file);
    e.target.value = ''; // allow re-selecting the same file later
  });

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('Reset ALL data — roster, stations, and the watchbill? This cannot be undone.')) {
      App.reset();
      renderAll();
    }
  });
}

function wireNav() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

/* Re-render every tab from current App.state without re-attaching
   event listeners. Safe to call repeatedly (Reset, Import, etc). */
function renderAll() {
  document.getElementById('unitName').value = App.state.meta.unit;
  document.getElementById('billDate').value = App.state.meta.date;
  renderRoster();
  renderStations();
  renderWatchbill();
  renderSwap();
}

document.addEventListener('DOMContentLoaded', () => {
  wireNav();
  wireForms();
  wireMasthead();
  renderAll();
});
