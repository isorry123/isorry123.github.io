/* ============================================================
   rotator.js — auto-rotate assignment engine + swap/replace logic
   ============================================================ */

/**
 * Returns true if `personId` is already assigned to ANY station
 * during `periodId` (a person can't stand two watches at once).
 */
function isBusyInPeriod(periodId, personId, excludeStationId) {
  const slots = App.state.assignments[periodId] || {};
  return Object.entries(slots).some(([stationId, slot]) => {
    if (stationId === excludeStationId) return false;
    return slot.primary === personId || slot.ui === personId;
  });
}

/**
 * Rank candidate people for a station/period by:
 *  1. Fewer total watches so far this bill (fairness)
 *  2. Did NOT stand the immediately preceding period (rest)
 *  3. Random tie-break so results aren't always alphabetical
 */
function rankCandidates(candidates, counts, prevPeriodId, personIdsBusyPrev) {
  return candidates
    .map((p) => ({
      person: p,
      count: counts[p.id] || 0,
      restViolation: prevPeriodId ? personIdsBusyPrev.has(p.id) : false,
      jitter: Math.random(),
    }))
    .sort((a, b) => {
      if (a.restViolation !== b.restViolation) return a.restViolation ? 1 : -1;
      if (a.count !== b.count) return a.count - b.count;
      return a.jitter - b.jitter;
    })
    .map((x) => x.person);
}

function availableCrew() {
  return App.state.crew.filter((c) => c.status === 'available');
}

function candidatesFor(stationId, level, periodId, excludeStationId) {
  return availableCrew().filter(
    (p) => qualLevel(p, stationId) === level && !isBusyInPeriod(periodId, p.id, excludeStationId)
  );
}

function personIdsBusyIn(periodId) {
  const slots = App.state.assignments[periodId] || {};
  const ids = new Set();
  Object.values(slots).forEach((slot) => {
    if (slot.primary) ids.add(slot.primary);
    if (slot.ui) ids.add(slot.ui);
  });
  return ids;
}

/**
 * Auto-rotate the whole bill.
 * mode: 'all' clears and reassigns everything, 'empty' only fills empty slots.
 */
function autoRotate(mode) {
  ensureAssignmentSlots();
  const { periods, stations, assignments } = App.state;
  const counts = {}; // personId -> watches assigned so far

  // Seed counts from existing assignments when only filling gaps
  if (mode === 'empty') {
    periods.forEach((p) => {
      stations.forEach((s) => {
        const slot = assignments[p.id][s.id];
        if (slot.primary) counts[slot.primary] = (counts[slot.primary] || 0) + 1;
        if (slot.ui) counts[slot.ui] = (counts[slot.ui] || 0) + 1;
      });
    });
  } else {
    periods.forEach((p) => {
      stations.forEach((s) => {
        assignments[p.id][s.id] = { primary: null, ui: null };
      });
    });
  }

  periods.forEach((period, idx) => {
    const prevPeriod = idx > 0 ? periods[idx - 1] : null;
    const busyPrev = prevPeriod ? personIdsBusyIn(prevPeriod.id) : new Set();

    stations.forEach((station) => {
      const slot = assignments[period.id][station.id];

      if (!slot.primary) {
        const pool = candidatesFor(station.id, 'Q', period.id, station.id);
        const ranked = rankCandidates(pool, counts, prevPeriod && prevPeriod.id, busyPrev);
        if (ranked.length) {
          slot.primary = ranked[0].id;
          counts[ranked[0].id] = (counts[ranked[0].id] || 0) + 1;
        }
      }

      if (station.allowUI && !slot.ui) {
        const pool = candidatesFor(station.id, 'UI', period.id, station.id).filter(
          (p) => p.id !== slot.primary
        );
        const ranked = rankCandidates(pool, counts, prevPeriod && prevPeriod.id, busyPrev);
        if (ranked.length) {
          slot.ui = ranked[0].id;
          counts[ranked[0].id] = (counts[ranked[0].id] || 0) + 1;
        }
      }
    });
  });

  App.save();
}

/**
 * Clear every assignment in the current watchbill (keeps roster, stations,
 * and periods untouched — just empties the grid back to gaps).
 */
function clearWatchbill() {
  ensureAssignmentSlots();
  const { periods, stations, assignments } = App.state;
  periods.forEach((p) => {
    stations.forEach((s) => {
      assignments[p.id][s.id] = { primary: null, ui: null };
    });
  });
  App.save();
}
function findReplacement(periodId, stationId, level, excludePersonId) {
  const station = getStationById(stationId);
  if (!station) return null;
  const counts = {};
  Object.values(App.state.assignments).forEach((slots) => {
    Object.values(slots).forEach((slot) => {
      if (slot.primary) counts[slot.primary] = (counts[slot.primary] || 0) + 1;
      if (slot.ui) counts[slot.ui] = (counts[slot.ui] || 0) + 1;
    });
  });

  const pool = candidatesFor(stationId, level, periodId, stationId).filter(
    (p) => p.id !== excludePersonId
  );
  const ranked = rankCandidates(pool, counts, null, new Set());
  return ranked.length ? ranked[0].id : null;
}

/**
 * Mark a person unavailable (sick/limited) and try to backfill every watch
 * they were holding. Returns a report of what happened for the UI to show.
 */
function swapOutPerson(personId, newStatus) {
  const person = getCrewById(personId);
  if (!person) return { changed: [], gaps: [] };
  person.status = newStatus;

  const changed = [];
  const gaps = [];

  Object.entries(App.state.assignments).forEach(([periodId, slots]) => {
    Object.entries(slots).forEach(([stationId, slot]) => {
      ['primary', 'ui'].forEach((role) => {
        if (slot[role] === personId) {
          const level = role === 'primary' ? 'Q' : 'UI';
          const replacementId = newStatus === 'available' ? null : findReplacement(periodId, stationId, level, personId);
          slot[role] = replacementId;
          const period = App.state.periods.find((p) => p.id === periodId);
          const station = getStationById(stationId);
          const entry = {
            periodLabel: period ? period.label : '?',
            stationName: station ? station.name : '?',
            role,
            replacement: replacementId ? getCrewById(replacementId) : null,
          };
          if (replacementId) changed.push(entry);
          else gaps.push(entry);
        }
      });
    });
  });

  App.save();
  return { changed, gaps };
}
