/* ============================================================
   export.js — Save to PDF (print)
   ============================================================ */

function exportToPdf() {
  document.body.classList.add('printing');
  window.print();
  setTimeout(() => document.body.classList.remove('printing'), 300);
}

/* ---------- JSON backup / restore ---------- */

function exportDataAsJson() {
  const json = JSON.stringify(App.state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = (App.state.meta.date || 'undated').replace(/[^0-9a-z-]/gi, '');
  const a = document.createElement('a');
  a.href = url;
  a.download = `watchbill-backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isValidWatchbillData(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.crew) &&
    Array.isArray(obj.stations) &&
    Array.isArray(obj.periods) &&
    obj.meta &&
    obj.assignments &&
    typeof obj.assignments === 'object'
  );
}

function importDataFromJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (e) {
      alert("That file isn't valid JSON, so it can't be imported.");
      return;
    }
    if (!isValidWatchbillData(parsed)) {
      alert("That file doesn't look like a Watchbill Maker backup, so it can't be imported.");
      return;
    }
    if (!confirm('Import this file? It will replace everything currently in the app — roster, stations, and the watchbill.')) {
      return;
    }
    App.state = parsed;
    ensureAssignmentSlots();
    App.save();
    renderAll();
    alert('Backup imported.');
  };
  reader.onerror = () => alert('Could not read that file.');
  reader.readAsText(file);
}
