# Heat Pump Butler

A one-page marketing site for Heat Pump Butler — professional residential heat pump / mini-split deep cleaning.

## Live site

https://www.heatpumpbutler.com (custom domain, via GitHub Pages — also reachable at https://heatpumpbutler.github.io/heat-pump-butler/)

The bare `heatpumpbutler.com` (no "www") currently does **not** work — Squarespace has a backend bug where the apex `A` records show correctly in their DNS Settings panel but aren't actually served, even from their own nameservers, even after deleting and re-adding them. `www` is the primary/working domain until Squarespace support resolves that (or a domain-forwarding rule is set up to redirect the apex to `www`).

## Structure

- `index.html` — the entire site (HTML + embedded CSS + a touch of JS), no build step required.
- `assets/` — logo, hero photo, and before/after photos (cropped from the brand concept sheet).
- `brand-source/` — original concept PNGs and the brand PDF (git-ignored, kept local only).

## Quoting calculator

The Pricing section includes a live estimator (`index.html`, `<script>` near the bottom) with separate steppers for indoor units (IDUs) and outdoor units (ODUs):

- Base visit (1 IDU + 1 ODU): **$199**, ~1 hour
- Every additional unit, either kind: **+$75** and **+30 minutes**
- Air Quality Test add-on (optional checkbox): **+$49**, **+0 minutes** (performed alongside the regular cleaning)

So price and appointment length both scale off the same "extra units" count (plus the flat add-on price). The raw duration is then rounded **up** to the nearest length Cal.com actually offers (see below) — better to over-allocate the technician's time than under-allocate it. Update `BASE_PRICE`, `PRICE_PER_EXTRA`, `BASE_DURATION`, `DURATION_PER_EXTRA`, and `AIR_QUALITY_TEST_PRICE` in that script to change the formula, or `MAX_IDU` / `MAX_ODU` to change the stepper caps (currently 6 IDUs, 3 ODUs).

The calculator also collects a few extra details that don't come from the site's own form:

- **Manufacturer** — a dropdown (Mitsubishi Electric, Daikin, Fujitsu, LG, Samsung, Gree, Carrier, Other).
- **Units 10+ feet off the ground** — a checkbox (informational only, no price/duration effect).
- **Air Quality Test** — a checkbox (affects price, see above); when requested, the dispatch app's report includes an Air Quality Findings section for the technician to fill in.

These are passed along as free text in the booking's prefilled "notes" field when someone clicks "Get This Quote & Book" (see below) — the technician sees them on the Cal.com booking itself, no separate form submission needed.

## Booking widget (Cal.com)

The "Book Now" buttons scroll to a booking section that embeds [Cal.com](https://cal.com)'s free scheduler — no backend required. Clicking **"Get This Quote & Book"** in the calculator re-loads the embed with the matching appointment duration pre-selected, so the time slots shown actually reflect the job size.

This depends on the **Deep Cleaning** event type under account `kevin-cutler-gfyocj` (slug `deep-cleaning`, full link `kevin-cutler-gfyocj/deep-cleaning`), which has **"Allow booker to select duration"** turned on with these options, in minutes: `30, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480`.

The site's `AVAILABLE_DURATIONS` array (in the same `<script>` as the calculator) must always match that list exactly — if you add/remove duration options in Cal.com, update the array here too, since the calculator snaps its computed duration up to the nearest value in this list.

If you rename the event type or use a different slug, update `CAL_LINK` near the bottom of `index.html` (currently `"kevin-cutler-gfyocj/deep-cleaning"`).

The embed also appends `&notes=...` with the manufacturer and elevated-unit details from the calculator, using Cal.com's standard "additional notes" prefill param — no extra Cal.com setup needed for that part. If you notice the notes field isn't actually prefilling on the live booking page, let me know and I'll look at an alternative (e.g. custom booking questions configured on the event type).

Also connect Google Calendar inside Cal.com (Settings → Apps → Google Calendar) so bookings check your real availability and land on your calendar automatically.

## Quote request form

The contact form at the bottom is currently a demo placeholder — submitting it just shows an alert, nothing is sent anywhere. When you're ready to receive real leads, the simplest options are:

- **Formspree** (free tier): point the `<form>`'s `action` at a Formspree endpoint and remove the `onsubmit` demo handler — submissions get emailed to you with no backend to run.
- **mailto:** link — zero setup, but depends on the visitor having a configured email client.

## Custom domain

`www.heatpumpbutler.com` is configured as the GitHub Pages custom domain via the `CNAME` file at the repo root (Squarespace DNS, using their own nameservers). "Enforce HTTPS" is on and the certificate is issued/valid.

DNS at the registrar (Squarespace) has:

- 1 `CNAME` record: `www` → `heatpumpbutler.github.io` — **working**
- 4 `A` records for the apex domain, pointing to: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` — configured correctly in the Squarespace panel, but **not actually served**, including when queried directly against Squarespace's own authoritative nameserver (`nsd1.squarespacedns.com`). This persisted after deleting and re-adding the records, so it's a Squarespace-side bug, not a propagation delay. Filed as a support case with them; once fixed, `CNAME` can be switched back to the apex `heatpumpbutler.com` if preferred, or a domain-forwarding rule (apex → www) can be set up instead.

## Editing

Open `index.html` in any editor and update the placeholder phone/email (currently `(000) 000-0000` / `add-your-email@example.com`), then push to `main` — GitHub Pages redeploys automatically within a minute or two.

## Employee dispatch app

`dispatch/` is a separate internal web app (individual employee logins, job assignment, service reports with photo uploads) — see [dispatch/README.md](dispatch/README.md) for setup and local development. It's built on Firebase and deploys independently via `firebase deploy`, without touching this site's GitHub Pages flow at all.
