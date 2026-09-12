/* ============================================================
   data.js — state model + localStorage persistence
   ============================================================ */

const STORAGE_KEY = 'watchbillMaker.v1';

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

function defaultState() {
  const stations = [
    { id: uid('st'), name: 'Officer of the Deck', allowUI: true },
    { id: uid('st'), name: 'Helm', allowUI: true },
    { id: uid('st'), name: 'Lookout', allowUI: false },
    { id: uid('st'), name: 'Engineering Watch', allowUI: true },
    { id: uid('st'), name: 'Sounding & Security', allowUI: false },
  ];

  // Classic Navy watch bill (the "dog watches" split the 1600-2000 block
  // so the same people don't stand the same watch every day).
  const periods = [
    { id: uid('pd'), label: 'Mid Watch', start: '00:00', end: '04:00' },
    { id: uid('pd'), label: 'Morning Watch', start: '04:00', end: '08:00' },
    { id: uid('pd'), label: 'Forenoon Watch', start: '08:00', end: '12:00' },
    { id: uid('pd'), label: 'Afternoon Watch', start: '12:00', end: '16:00' },
    { id: uid('pd'), label: 'First Dog Watch', start: '16:00', end: '18:00' },
    { id: uid('pd'), label: 'Second Dog Watch', start: '18:00', end: '20:00' },
    { id: uid('pd'), label: 'Evening Watch', start: '20:00', end: '24:00' },
  ];

  const crew = [];

  return {
    meta: {
      unit: 'USS EXAMPLE',
      date: new Date().toISOString().slice(0, 10),
    },
    stations,
    periods,
    crew,
    // assignments[periodId][stationId] = { primary: personId|null, ui: personId|null }
    assignments: {},
  };
}

const DB = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.stations || !parsed.periods) return defaultState();
      return parsed;
    } catch (e) {
      console.error('Failed to load watchbill data, starting fresh.', e);
      return defaultState();
    }
  },
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save watchbill data.', e);
    }
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

/* Global mutable app state, shared across modules via window.App */
window.App = {
  state: DB.load(),
  save() { DB.save(this.state); },
  reset() {
    DB.reset();
    this.state = defaultState();
    this.save();
  },
};

/* Ensure every assignment slot exists for current periods/stations */
function ensureAssignmentSlots() {
  const { periods, stations, assignments } = App.state;
  periods.forEach((p) => {
    if (!assignments[p.id]) assignments[p.id] = {};
    stations.forEach((s) => {
      if (!assignments[p.id][s.id]) {
        assignments[p.id][s.id] = { primary: null, ui: null };
      }
    });
  });
}

function getCrewById(id) {
  return App.state.crew.find((c) => c.id === id) || null;
}

function getStationById(id) {
  return App.state.stations.find((s) => s.id === id) || null;
}

function personLabel(person) {
  if (!person) return '';
  return `${person.name}${person.rank ? ' (' + person.rank + ')' : ''}`;
}

function qualLevel(person, stationId) {
  return (person.quals && person.quals[stationId]) || 'none'; // 'Q' | 'UI' | 'EX' | 'none'
}
