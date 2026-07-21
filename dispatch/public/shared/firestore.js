import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import {
  emptyChecklist,
  emptyEquipmentInspection,
  defaultAirQualityFindings,
  computeHealthScore,
  defaultSystemSummary,
  defaultRecommendations,
  defaultNextServiceDate,
  defaultSavings,
} from "./checklist.js";

/* ---------------- Users ---------------- */

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function listEmployees({ activeOnly = false } = {}) {
  const base = collection(db, "users");
  const q = activeOnly
    ? query(base, where("role", "==", "employee"), where("active", "==", true))
    : query(base, where("role", "==", "employee"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function createUserProfile(uid, { displayName, email, role, createdBy }) {
  await setDoc(doc(db, "users", uid), {
    displayName,
    email,
    role,
    active: true,
    createdAt: serverTimestamp(),
    createdBy,
  });
}

export async function setUserActive(uid, active) {
  await updateDoc(doc(db, "users", uid), { active });
}

/* ---------------- Jobs ---------------- */

const JOBS = "jobs";

export async function createJob(data, createdBy) {
  const ref = await addDoc(collection(db, JOBS), {
    status: "unassigned",
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    customerName: data.customerName,
    customerPhone: data.customerPhone || null,
    customerEmail: data.customerEmail || null,
    address: data.address,
    scheduledStart: data.scheduledStart,
    scheduledEnd: data.scheduledEnd || null,
    notes: data.notes || "",
    unitCounts: data.unitCounts || null,
    equipment: data.equipment || null, // { manufacturer, model, outdoorUnitSerial }
    addOns: data.addOns || { airQualityTest: false },
    source: "manual",
    calBookingUid: null,
    calEventTypeSlug: null,
    createdAt: serverTimestamp(),
    createdBy,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getJob(jobId) {
  const snap = await getDoc(doc(db, JOBS, jobId));
  return snap.exists() ? { id: jobId, ...snap.data() } : null;
}

export async function listAllJobs() {
  const q = query(collection(db, JOBS), orderBy("scheduledStart", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listJobsForEmployee(uid) {
  const q = query(
    collection(db, JOBS),
    where("assignedTo", "==", uid),
    orderBy("scheduledStart", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Jobs assigned to this employee whose scheduledStart falls on the given
 * JS Date's calendar day (local time), ordered earliest first — used by
 * the home dashboard's date strip / day overview. */
export async function listJobsForEmployeeOnDate(uid, date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const q = query(
    collection(db, JOBS),
    where("assignedTo", "==", uid),
    where("scheduledStart", ">=", Timestamp.fromDate(start)),
    where("scheduledStart", "<", Timestamp.fromDate(end)),
    orderBy("scheduledStart", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function assignJob(jobId, employeeUid, adminUid) {
  await updateDoc(doc(db, JOBS, jobId), {
    assignedTo: employeeUid,
    assignedBy: adminUid,
    assignedAt: serverTimestamp(),
    status: "assigned",
    updatedAt: serverTimestamp(),
  });
}

export async function unassignJob(jobId) {
  await updateDoc(doc(db, JOBS, jobId), {
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    status: "unassigned",
    updatedAt: serverTimestamp(),
  });
}

export async function updateJobDetails(jobId, data) {
  await updateDoc(doc(db, JOBS, jobId), { ...data, updatedAt: serverTimestamp() });
}

export async function setJobStatus(jobId, status) {
  await updateDoc(doc(db, JOBS, jobId), { status, updatedAt: serverTimestamp() });
}

export async function cancelJob(jobId) {
  await setJobStatus(jobId, "cancelled");
}

/* ---------------- Reports (doc id === jobId) ---------------- */

const REPORTS = "reports";

export async function getReport(jobId) {
  const snap = await getDoc(doc(db, REPORTS, jobId));
  return snap.exists() ? { id: jobId, ...snap.data() } : null;
}

export async function ensureDraftReport(jobId, employeeId) {
  const existing = await getReport(jobId);
  if (existing) return existing;
  const fresh = {
    jobId,
    employeeId,
    checklist: emptyChecklist(),
    notes: "",
    status: "draft",
    timerState: "not_started",
    timerStartedAt: null,
    timerElapsedSeconds: 0,
    submittedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, REPORTS, jobId), fresh);
  return { id: jobId, ...fresh };
}

export async function saveReportNotes(jobId, notes) {
  await setDoc(doc(db, REPORTS, jobId), { notes, updatedAt: serverTimestamp() }, { merge: true });
}

/** Merges a partial update ({ done, note }) into one checklist item without
 * touching the others — Firestore's merge:true deep-merges nested map
 * fields, so this only ever touches checklist.{itemKey}. */
export async function updateChecklistItem(jobId, itemKey, updates) {
  await setDoc(
    doc(db, REPORTS, jobId),
    { checklist: { [itemKey]: updates }, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Populates the Inspection & Summary fields (health score, system summary,
 * recommendations, next recommended service, equipment inspection, and —
 * if the job has the Air Quality Test add-on — air quality findings) with
 * computed defaults, but only the first time this is called for a report
 * (checked via presence of `equipmentInspection`) so it never clobbers a
 * technician's edits on subsequent visits to this screen.
 */
export async function ensureInspectionDefaults(jobId, job, report) {
  if (report.equipmentInspection) return report;

  const equipmentInspection = emptyEquipmentInspection();
  const airQualityFindings = job.addOns && job.addOns.airQualityTest ? defaultAirQualityFindings() : null;
  const healthScore = computeHealthScore(equipmentInspection, airQualityFindings);

  const fresh = {
    equipmentInspection,
    airQualityFindings,
    healthScore,
    systemSummary: defaultSystemSummary(healthScore),
    recommendations: defaultRecommendations(healthScore),
    nextRecommendedService: Timestamp.fromDate(defaultNextServiceDate(job.scheduledStart)),
    savings: defaultSavings(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, REPORTS, jobId), fresh, { merge: true });
  return { ...report, ...fresh };
}

/** Saves any subset of the Inspection & Summary fields as the technician edits them. */
export async function saveInspectionData(jobId, data) {
  await setDoc(doc(db, REPORTS, jobId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function submitReport(jobId) {
  await setDoc(
    doc(db, REPORTS, jobId),
    { status: "submitted", submittedAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true }
  );
  await setJobStatus(jobId, "completed");
}

/* ---------------- Job timer (per-report, simple elapsed-time tracker) ---------------- */

export async function startOrResumeTimer(jobId) {
  await setDoc(
    doc(db, REPORTS, jobId),
    { timerState: "running", timerStartedAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

async function accumulateElapsed(jobId) {
  const report = await getReport(jobId);
  let elapsed = report.timerElapsedSeconds || 0;
  if (report.timerState === "running" && report.timerStartedAt) {
    elapsed += Math.max(0, (Date.now() - report.timerStartedAt.toMillis()) / 1000);
  }
  return elapsed;
}

export async function pauseTimer(jobId) {
  const elapsed = await accumulateElapsed(jobId);
  await setDoc(
    doc(db, REPORTS, jobId),
    { timerState: "paused", timerStartedAt: null, timerElapsedSeconds: elapsed, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return elapsed;
}

export async function finalizeTimer(jobId) {
  const elapsed = await accumulateElapsed(jobId);
  await setDoc(
    doc(db, REPORTS, jobId),
    { timerState: "stopped", timerStartedAt: null, timerElapsedSeconds: elapsed, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return elapsed;
}

/* ---------------- Photos (subcollection of reports) ---------------- */

export async function addPhotoDoc(jobId, { storagePath, itemKey, phase, uploadedBy, employeeId }) {
  const ref = await addDoc(collection(db, REPORTS, jobId, "photos"), {
    storagePath,
    itemKey: itemKey || null,
    phase: phase || null, // 'before' | 'after' | null
    uploadedBy,
    employeeId,
    uploadedAt: serverTimestamp(),
    caption: null,
  });
  return ref.id;
}

export async function listPhotos(jobId) {
  const snap = await getDocs(collection(db, REPORTS, jobId, "photos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deletePhotoDoc(jobId, photoId) {
  await deleteDoc(doc(db, REPORTS, jobId, "photos", photoId));
}
