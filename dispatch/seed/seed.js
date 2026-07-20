// Seeds the LOCAL Firebase emulators (never real Firebase) with fake test
// data: one admin, two employees, and a few sample jobs in different
// statuses. Run this while `firebase emulators:start` is running, from
// inside dispatch/seed: `npm install && npm run seed`.

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

async function main() {
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

  const now = admin.firestore.Timestamp.now();
  const inTwoDays = admin.firestore.Timestamp.fromMillis(now.toMillis() + 2 * 24 * 60 * 60 * 1000);
  const tomorrow = admin.firestore.Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

  await db.collection("jobs").add({
    status: "unassigned",
    assignedTo: null,
    assignedBy: null,
    assignedAt: null,
    customerName: "Sarah Chen",
    customerPhone: "(617) 555-0142",
    customerEmail: "sarah.chen@example.com",
    address: "24 Dorchester Ave, South Boston, MA",
    scheduledStart: inTwoDays,
    scheduledEnd: null,
    notes: "3 indoor units, 1 outdoor. Ground floor condo.",
    unitCounts: { indoor: 3, outdoor: 1 },
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
    scheduledStart: tomorrow,
    scheduledEnd: null,
    notes: "Mitsubishi units, one is mounted high (10+ ft).",
    unitCounts: { indoor: 1, outdoor: 1 },
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
    scheduledStart: tomorrow,
    scheduledEnd: null,
    notes: "",
    unitCounts: { indoor: 2, outdoor: 1 },
    source: "manual",
    calBookingUid: null,
    calEventTypeSlug: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: adminUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("\nSeed complete. Test logins (all password: password123):\n");
  console.log("  Admin:     owner@heatpumpbutler.test");
  console.log("  Employee:  mike@heatpumpbutler.test   (has one assigned job)");
  console.log("  Employee:  jess@heatpumpbutler.test   (has one assigned job)");
  console.log("\nOpen http://localhost:5000/login.html to sign in.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
