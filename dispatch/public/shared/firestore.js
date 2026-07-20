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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { emptyChecklist } from "./checklist.js";

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
    submittedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, REPORTS, jobId), fresh);
  return { id: jobId, ...fresh };
}

export async function saveReportDraft(jobId, { checklist, notes }) {
  await setDoc(
    doc(db, REPORTS, jobId),
    { checklist, notes, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function submitReport(jobId, { checklist, notes }) {
  await setDoc(
    doc(db, REPORTS, jobId),
    {
      checklist,
      notes,
      status: "submitted",
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await setJobStatus(jobId, "completed");
}

/* ---------------- Photos (subcollection of reports) ---------------- */

export async function addPhotoDoc(jobId, { storagePath, type, uploadedBy, employeeId }) {
  const ref = await addDoc(collection(db, REPORTS, jobId, "photos"), {
    storagePath,
    type,
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
