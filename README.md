# Heat Pump Butler

A one-page marketing site for Heat Pump Butler — professional residential heat pump / mini-split deep cleaning.

## Live site

https://heatpumpbutler.com (custom domain, via GitHub Pages — also reachable at https://heatpumpbutler.github.io/heat-pump-butler/)

## Structure

- `index.html` — the entire site (HTML + embedded CSS + a touch of JS), no build step required.
- `assets/` — logo, hero photo, and before/after photos (cropped from the brand concept sheet).
- `brand-source/` — original concept PNGs and the brand PDF (git-ignored, kept local only).

## Quoting calculator

The Pricing section includes a live estimator (`index.html`, `<script>` near the bottom) with separate steppers for indoor units (IDUs) and outdoor units (ODUs):

- Base visit (1 IDU + 1 ODU): **$199**, ~1 hour
- Every additional unit, either kind: **+$75** and **+30 minutes**

So price and appointment length both scale off the same "extra units" count. The raw duration is then rounded **up** to the nearest length Cal.com actually offers (see below) — better to over-allocate the technician's time than under-allocate it. Update `BASE_PRICE`, `PRICE_PER_EXTRA`, `BASE_DURATION`, and `DURATION_PER_EXTRA` in that script to change the formula, or `MAX_IDU` / `MAX_ODU` to change the stepper caps (currently 6 IDUs, 3 ODUs).

The calculator also collects two extra details that don't come from the site's own form:

- **Manufacturer** — a dropdown (Mitsubishi Electric, Daikin, Fujitsu, LG, Samsung, Gree, Carrier, Other).
- **Units 10+ feet off the ground** — a checkbox.

Both are informational only — neither affects price or duration. They're passed along as free text in the booking's prefilled "notes" field when someone clicks "Get This Quote & Book" (see below) — the technician sees them on the Cal.com booking itself, no separate form submission needed.

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

`heatpumpbutler.com` is configured as the GitHub Pages custom domain via the `CNAME` file at the repo root. DNS at the registrar needs:

- 4 `A` records for the apex domain, pointing to: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- 1 `CNAME` record: `www` → `heatpumpbutler.github.io`

"Enforce HTTPS" in the repo's Pages settings should be turned on once DNS has propagated and GitHub issues the certificate (can take a few hours after the DNS records go live).

## Editing

Open `index.html` in any editor and update the placeholder phone/email (currently `(000) 000-0000` / `add-your-email@example.com`), then push to `main` — GitHub Pages redeploys automatically within a minute or two.
