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

// The 4 checklist items the customer-facing report shows as before/after
// photo pairs (matching the "Home Air Health Report" mockup's 4 sections).
export const REPORT_BEFORE_AFTER_ITEMS = [
  { key: "evaporatorCoilCleaning", label: "Indoor Coil" },
  { key: "blowerWheelCleaning", label: "Blower Wheel" },
  { key: "drainPanSanitation", label: "Drain Pan" },
  { key: "outdoorUnitRinse", label: "Outdoor Coil" },
];

/* ---------------- Equipment Inspection (expands the "System inspection" checklist item) ---------------- */

export const EQUIPMENT_INSPECTION_ITEMS = {
  indoor: [
    { key: "blowerMotor", label: "Blower Motor" },
    { key: "fanBearings", label: "Fan Bearings" },
    { key: "drainPan", label: "Drain Pan" },
    { key: "coil", label: "Coil" },
    { key: "filter", label: "Filter" },
  ],
  outdoor: [
    { key: "coil", label: "Coil" },
    { key: "fanMotor", label: "Fan Motor" },
    { key: "electricalConnections", label: "Electrical Connections" },
    { key: "refrigerantLines", label: "Refrigerant Lines" },
  ],
};

/** Defaults every component to "passed" — technician flips to failed if a problem is found. */
export function emptyEquipmentInspection() {
  const build = (items) => {
    const o = {};
    for (const item of items) o[item.key] = true;
    return o;
  };
  return {
    indoor: build(EQUIPMENT_INSPECTION_ITEMS.indoor),
    outdoor: build(EQUIPMENT_INSPECTION_ITEMS.outdoor),
  };
}

export function countFailedEquipment(inspection) {
  if (!inspection) return 0;
  let count = 0;
  for (const zone of ["indoor", "outdoor"]) {
    const items = (inspection && inspection[zone]) || {};
    for (const key of Object.keys(items)) {
      if (items[key] === false) count++;
    }
  }
  return count;
}

/* ---------------- Air Quality Findings (only when the $49 add-on is booked) ---------------- */

export const AIR_QUALITY_FIELDS = [
  { key: "filterCondition", label: "Filter Condition", options: ["Good", "Fair", "Needs Replacement"] },
  { key: "coilCleanliness", label: "Coil Cleanliness", options: ["Excellent", "Good", "Fair", "Poor"] },
  { key: "moldGrowth", label: "Mold Growth", options: ["None Found", "Minor", "Significant"] },
  { key: "drainPanStatus", label: "Drain Pan", options: ["Sanitized", "Needs Attention"] },
  { key: "drainLineStatus", label: "Drain Line", options: ["Clear", "Slow", "Clogged"] },
  { key: "odor", label: "Odor", options: ["None", "Mild", "Strong"] },
];

const CONCERNING_VALUES = {
  filterCondition: ["Needs Replacement"],
  coilCleanliness: ["Poor"],
  moldGrowth: ["Minor", "Significant"],
  drainPanStatus: ["Needs Attention"],
  drainLineStatus: ["Slow", "Clogged"],
  odor: ["Mild", "Strong"],
};

/** Defaults every field to its best-case (first-listed) option. */
export function defaultAirQualityFindings() {
  const o = {};
  for (const f of AIR_QUALITY_FIELDS) o[f.key] = f.options[0];
  return o;
}

export function countConcerningFindings(findings) {
  if (!findings) return 0;
  let count = 0;
  for (const f of AIR_QUALITY_FIELDS) {
    if (CONCERNING_VALUES[f.key].includes(findings[f.key])) count++;
  }
  return count;
}

/* ---------------- Health score, summary, recommendations, next service ---------------- */

export function computeHealthScore(equipmentInspection, airQualityFindings) {
  const failed = countFailedEquipment(equipmentInspection);
  const concerning = countConcerningFindings(airQualityFindings);
  return Math.max(0, 100 - failed * 5 - concerning * 5);
}

export function starsForScore(score) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

export function defaultSystemSummary(score) {
  if (score >= 90) return "Your heat pump system is clean, operating efficiently, and no repairs are recommended at this time.";
  if (score >= 70) return "Your heat pump system is in good condition overall, with a few items worth monitoring.";
  return "Your heat pump system has some issues that may need attention soon.";
}

export function defaultRecommendations(score) {
  return score >= 90 ? "None at this time." : "We recommend scheduling a follow-up visit to address the items noted above.";
}

/** `scheduledStart` may be a Firestore Timestamp, Date, or millis. */
export function defaultNextServiceDate(scheduledStart) {
  const base = scheduledStart && scheduledStart.toDate ? scheduledStart.toDate() : new Date(scheduledStart || Date.now());
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

/** Fixed marketing boilerplate — no instruments to actually measure this. */
export function defaultSavings() {
  return { airflowPercent: 18, energyPercent: 9, airQualityNote: "Significant" };
}
