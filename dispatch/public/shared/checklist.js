// The 8 technician-checkable items from the marketing site's service
// checklist (the other 2 — "Before & after photos" and "Digital service
// report" — are the outcomes of this report screen itself, not checkboxes).
export const CHECKLIST_ITEMS = [
  { key: "indoorUnitDisassembly", label: "Indoor unit disassembly" },
  { key: "blowerWheelCleaning", label: "Blower wheel cleaning" },
  { key: "evaporatorCoilCleaning", label: "Evaporator coil cleaning" },
  { key: "drainPanSanitation", label: "Drain pan sanitation" },
  { key: "condensateDrainTreatment", label: "Condensate drain treatment" },
  { key: "filterCleaning", label: "Filter cleaning" },
  { key: "outdoorUnitRinse", label: "Outdoor unit rinse" },
  { key: "systemInspection", label: "System inspection" },
];

// Each item tracks its own completion and a technician note. Photos
// attached to a specific item live in the reports/{jobId}/photos
// subcollection (tagged with itemKey) rather than duplicated here — that
// avoids Firestore's array-replace-on-merge behavior for nested arrays.
export function emptyChecklist() {
  const c = {};
  for (const item of CHECKLIST_ITEMS) {
    c[item.key] = { done: false, note: "" };
  }
  return c;
}

export function checklistProgress(checklist) {
  const total = CHECKLIST_ITEMS.length;
  const done = CHECKLIST_ITEMS.filter((item) => checklist[item.key] && checklist[item.key].done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Returns the key of the first not-yet-done item, or null if all are done. */
export function firstIncompleteItem(checklist) {
  const item = CHECKLIST_ITEMS.find((item) => !(checklist[item.key] && checklist[item.key].done));
  return item ? item.key : null;
}
