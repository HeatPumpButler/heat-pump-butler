// This config currently points at a fake "demo-" project, which works
// entirely inside the local Firebase emulators (no real Firebase project
// needed) — this is Firebase's documented convention for emulator-only
// development. It's what's used for local testing right now.
//
// BEFORE DEPLOYING FOR REAL: replace every value below with the real config
// from Firebase Console -> Project settings -> Your apps -> Web app -> SDK
// setup and configuration. This is NOT a secret — it's safe to commit and
// safe to paste here directly.
export const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-heat-pump-butler.firebaseapp.com",
  projectId: "demo-heat-pump-butler",
  storageBucket: "demo-heat-pump-butler.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
};
