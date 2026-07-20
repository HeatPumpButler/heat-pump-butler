# Heat Pump Butler — Dispatch (Phase 1)

Internal web app for employees: individual logins, an admin/dispatcher view to manually create and assign jobs, and a mobile-first employee experience (home dashboard, schedule, and a per-job checklist with a live timer) for completing service reports with per-item notes and photos.

Employee side is modeled on a reference mobile mockup: a Home dashboard (greeting, date strip, daily stats, next job, day overview), a Job details screen (customer info, equipment info, checklist preview, Start Job), and a Job-in-progress screen (progress bar, pause/resume timer, one checklist item expanded at a time with its own note + photo).

Built as plain HTML/JS (ES modules), pulling the Firebase SDK straight from Google's CDN — no `npm`/build step for the app itself, matching the zero-build approach of the main marketing site. Backend is Firebase: Auth (email/password), Firestore, and Storage — all on the free Spark plan, no Cloud Functions and no billing required for Phase 1.

Visually reuses the brand tokens (colors, radius, shadow) and logo from the marketing site's `index.html`, so it looks like the same business.

## Structure

```
dispatch/
├── public/                  ← everything Firebase Hosting serves
│   ├── index.html           ← routes to /login.html or the right home page based on auth state
│   ├── login.html           ← shared login for both roles
│   ├── employee/
│   │   ├── home.html        ← dashboard: greeting, date strip, stats, next job, day overview
│   │   ├── index.html       ← "Schedule" — full job list (Upcoming/Completed/All)
│   │   └── job.html         ← job details mode + job-in-progress mode (timer, per-item checklist/notes/photos)
│   ├── admin/
│   │   ├── index.html       ← job dashboard (filter/assign)
│   │   ├── create-job.html  ← manual job entry (stand-in for Cal.com auto-import, Phase 2)
│   │   ├── job.html         ← job detail + assign/reassign + view submitted report/photos
│   │   └── employees.html   ← add/deactivate employee accounts
│   └── shared/               ← firebase.js, auth.js, firestore.js, storage.js, checklist.js, styles.css
├── seed/                     ← one-off Node script to seed the LOCAL emulators with fake test data (not part of the deployed app)
├── firebase.json
├── .firebaserc
├── firestore.rules
├── firestore.indexes.json
└── storage.rules
```

## Local development (no real Firebase project needed)

Everything below runs entirely against the local Firebase emulators — zero cost, zero dependency on a real Firebase project existing yet. `shared/firebase-config.js` ships pointed at a fake `demo-heat-pump-butler` project ID, which is Firebase's documented convention for emulator-only work.

**Prerequisites:** Node.js, the Firebase CLI (`npm install -g firebase-tools`), and a Java runtime (the Firestore/Storage emulators are JVM-based).

1. **Start the emulators** (from `dispatch/`):
   ```
   firebase emulators:start
   ```
   This serves the app itself too, via the Hosting emulator, at **http://localhost:5000**. The Emulator UI (inspect Firestore data, Auth users, Storage files) is at **http://localhost:4000**.

2. **Seed fake test data** (in a separate terminal, one-time setup per fresh emulator run — emulator data resets when you stop it unless you use `--export-on-exit`/`--import`):
   ```
   cd dispatch/seed
   npm install
   npm run seed
   ```
   This creates one admin and two employee accounts, plus a few sample jobs. Credentials are printed at the end (all use password `password123`).

3. Open **http://localhost:5000/login.html** and sign in as the seeded admin or an employee to try the full flow.

To persist emulator data between restarts instead of reseeding every time: `firebase emulators:start --export-on-exit=./emulator-data --import=./emulator-data` (that folder is git-ignored).

## Deploying for real

1. Complete the manual Firebase Console setup (project, Auth provider, Firestore, Storage, Hosting — see the project plan / chat history for the exact steps) on the **free Spark plan**.
2. Replace the placeholder values in `public/shared/firebase-config.js` with the real config from Project settings → Your apps → Web app.
3. Update `.firebaserc`'s `"default"` project ID to the real project ID (or run `firebase use --add` and pick it interactively).
4. Deploy rules and hosting:
   ```
   firebase deploy --only firestore:rules,storage:rules,hosting
   ```
5. Create the very first admin account directly in the Firebase Console (Authentication → add user, then Firestore → manually add a matching `users/{uid}` doc with `role: "admin"`) — every other account after that is created through the Admin → Employees screen in the app itself.

## Not built yet (by design)

- **Cal.com auto-import** (Phase 2) — a Cloud Function receiving Cal.com's booking webhooks, requires upgrading to the Blaze plan (needs a card on file). Until then, jobs are entered manually in Admin → New Job.
- **Time-clock integration** (Phase 3) — the per-job timer (pause/resume, stored on the report as `timerState`/`timerElapsedSeconds`) tracks time spent *on that job*, which is different from a full employee time-clock/payroll ledger. Schema is intentionally left open for a future `timeClockEntries` collection, but nothing about a real time-clock integration is built now.
