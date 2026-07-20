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

export function emptyChecklist() {
  const c = {};
  for (const item of CHECKLIST_ITEMS) c[item.key] = false;
  return c;
}
