// Seeds the LOCAL Firebase emulators (never real Firebase) with fake test
// data: one admin, two employees, and a few sample jobs in different
// statuses. Run this while `firebase emulators:start` is running, from
// inside dispatch/seed: `npm install && npm run seed`.
//
// Safe to re-run — it clears out any previously seeded jobs/reports/photos
// first, so you always get the exact same deterministic state.

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

import admin from "firebase-admin";

admin.initializeApp({ projectId: "demo-heat-pump-butler" });

const auth = admin.auth();
const db = admin.firestore();

async function upsertUser({ email, password, displayName, role }) {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch {
    userRecord = await auth.createUser({ email, password, displayName });
  }
  await db.collection("users").doc(userRecord.uid).set(
    {
      displayName,
      email,
      role,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: "seed-script",
    },
    { merge: true }
  );
  return userRecord.uid;
}

async function clearCollection(ref) {
  const snap = await ref.get();
  for (const doc of snap.docs) {
    const subcollections = await doc.ref.listCollections();
    for (const sub of subcollections) {
      await clearCollection(sub);
    }
    await doc.ref.delete();
  }
}

function atTime(baseDate, hours, minutes) {
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return admin.firestore.Timestamp.fromDate(d);
}

async function main() {
  await clearCollection(db.collection("jobs"));
  await clearCollection(db.collection("reports"));

  const adminUid = await upsertUser({
    email: "owner@heatpumpbutler.test",
    password: "password123",
    displayName: "Kevin Cutler",
    role: "admin",
  });

  const employee1Uid = await upsertUser({
    email: "mike@heatpumpbutler.test",
    password: "password123",
    displayName: "Mike Reilly",
    role: "employee",
  });

  const employee2Uid = await upsertUser({
    email: "jess@heatpumpbutler.test",
    password: "password123",
    displayName: "Jess Doyle",
    role: "employee",
  });

  const today = new Date();
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const inTwoDaysDate = new Date(today);
  inTwoDaysDate.setDate(inTwoDaysDate.getDate() + 2);

  await db.collection("jobs").add({
    status: "unassigned",
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    customerName: "Sarah Chen",
    customerPhone: "(617) 555-0142",
    customerEmail: "sarah.chen@example.com",
    address: "24 Dorchester Ave, South Boston, MA",
    scheduledStart: atTime(inTwoDaysDate, 14, 0),
    scheduledEnd: null,
    notes: "3 indoor units, 1 outdoor. Ground floor condo.",
    unitCounts: { indoor: 3, outdoor: 1 },
    equipment: { manufacturer: "Daikin", model: null, outdoorUnitSerial: null },
    source: "manual",
    calBookingUid: null,
    calEventTypeSlug: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: adminUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection("jobs").add({
    status: "assigned",
    assignedTo: employee1Uid,
    assignedBy: adminUid,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    customerName: "David Park",
    customerPhone: "(617) 555-0198",
    customerEmail: "dpark@example.com",
    address: "112 Bunker Hill St, Charlestown, MA",
    scheduledStart: atTime(tomorrowDate, 10, 30),
    scheduledEnd: null,
    notes: "Mitsubishi units, one is mounted high (10+ ft).",
    unitCounts: { indoor: 1, outdoor: 1 },
    equipment: { manufacturer: "Mitsubishi Electric", model: "MSZ-FS18NA", outdoorUnitSerial: "D14VSA3610AA" },
    source: "manual",
    calBookingUid: null,
    calEventTypeSlug: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: adminUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection("jobs").add({
    status: "assigned",
    assignedTo: employee2Uid,
    assignedBy: adminUid,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    customerName: "Michael S.",
    customerPhone: "(617) 555-0110",
    customerEmail: null,
    address: "8 W Broadway, South Boston, MA",
    scheduledStart: atTime(tomorrowDate, 13, 0),
    scheduledEnd: null,
    notes: "",
    unitCounts: { indoor: 2, outdoor: 1 },
    equipment: { manufacturer: "LG", model: null, outdoorUnitSerial: null },
    source: "manual",
    calBookingUid: null,
    calEventTypeSlug: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: adminUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // A job scheduled for TODAY, assigned to Mike, so the home dashboard's
  // date strip / stats / "next job" card have something to show right away.
  await db.collection("jobs").add({
    status: "assigned",
    assignedTo: employee1Uid,
    assignedBy: adminUid,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
    customerName: "John Smith",
    customerPhone: "(206) 555-0198",
    customerEmail: "john.smith@example.com",
    address: "123 Maple St, Seattle, WA 98101",
    scheduledStart: atTime(today, 10, 30),
    scheduledEnd: atTime(today, 12, 30),
    notes: "Please check attic air handler. Homeowner has allergies.",
    unitCounts: { indoor: 1, outdoor: 1 },
    equipment: { manufacturer: "Daikin", model: "4TTR4024L1000A", outdoorUnitSerial: "D14VSA3610AA" },
    source: "manual",
    calBookingUid: null,
    calEventTypeSlug: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: adminUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("\nSeed complete. Test logins (all password: password123):\n");
  console.log("  Admin:     owner@heatpumpbutler.test");
  console.log("  Employee:  mike@heatpumpbutler.test   (has a job today + a job tomorrow)");
  console.log("  Employee:  jess@heatpumpbutler.test   (has one assigned job)");
  console.log("\nOpen http://localhost:5000/login.html to sign in.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
