// Central Firebase init, shared by every page in the app.
// Loads the SDK straight from Google's CDN as ES modules — no npm/build step,
// matching the zero-build approach used for the rest of this site.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  connectAuthEmulator,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  connectStorageEmulator,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import { firebaseConfig } from "./firebase-config.js";

const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// A second, independent app instance used ONLY for creating new employee
// accounts from the admin screen — createUserWithEmailAndPassword on the
// default `auth` instance signs the browser in as the newly created user,
// which would otherwise boot the admin out of their own session. Auth
// state on this secondary app is never persisted or relied on beyond the
// single create-user call.
export const secondaryApp = initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondaryApp);

if (isLocal) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  connectAuthEmulator(secondaryAuth, "http://localhost:9099", { disableWarnings: true });
}
