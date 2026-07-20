import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db, secondaryAuth } from "./firebase.js";
import { createUserProfile } from "./firestore.js";

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/** Fetches the Firestore users/{uid} profile doc for the given Auth user. */
export async function getProfile(user) {
  if (!user) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;
  return { uid: user.uid, ...snap.data() };
}

/**
 * Resolves once with { user, profile } — profile is null if the Auth user
 * has no matching Firestore users/{uid} doc (e.g. account was created in
 * Auth but never provisioned properly) or if signed out entirely.
 */
export function waitForAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      const profile = await getProfile(user);
      resolve({ user, profile });
    });
  });
}

/**
 * Call at the top of any protected page. Redirects to login if not signed
 * in, to the deactivated-account message if `active: false`, or to the
 * other role's home if the signed-in user's role doesn't match what the
 * page requires. Returns { user, profile } on success so the page can use it.
 */
export async function requireRole(requiredRole) {
  const { user, profile } = await waitForAuth();

  if (!user || !profile) {
    location.href = "/login.html";
    return null;
  }

  if (profile.active === false) {
    await logout();
    location.href = "/login.html?deactivated=1";
    return null;
  }

  if (profile.role !== requiredRole) {
    location.href = profile.role === "admin" ? "/admin/index.html" : "/employee/home.html";
    return null;
  }

  return { user, profile };
}

/**
 * Creates a new employee's Auth account + Firestore profile, using the
 * secondary Firebase app instance so the admin's own session/sign-in state
 * is never disturbed. `adminUid` is whoever is creating this account.
 */
export async function createEmployeeAccount({ displayName, email, password, adminUid }) {
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = cred.user.uid;
  await createUserProfile(uid, { displayName, email, role: "employee", createdBy: adminUid });
  await signOut(secondaryAuth);
  return uid;
}
