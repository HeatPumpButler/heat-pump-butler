# Heat Pump Butler

A one-page marketing site for Heat Pump Butler — professional residential heat pump / mini-split deep cleaning.

## Live site

https://heatpumpbutler.github.io/heat-pump-butler/

## Structure

- `index.html` — the entire site (HTML + embedded CSS + a touch of JS), no build step required.
- `assets/` — logo, hero photo, and before/after photos (cropped from the brand concept sheet).
- `brand-source/` — original concept PNGs and the brand PDF (git-ignored, kept local only).

## Quoting calculator

The Pricing section includes a live estimator (`index.html`, `<script>` near the bottom) with separate steppers for indoor units (IDUs) and outdoor units (ODUs):

- Base visit (1 IDU + 1 ODU): **$199**, ~1 hour
- Every additional unit, either kind: **+$75** and **+30 minutes**

So price and appointment length both scale off the same "extra units" count. Update `BASE_PRICE`, `PRICE_PER_EXTRA`, `BASE_DURATION`, and `DURATION_PER_EXTRA` in that script to change the formula, or `MAX_IDU` / `MAX_ODU` to change the stepper caps (currently 6 IDUs, 3 ODUs — a max of 7 "extra" units, i.e. up to 270 minutes).

## Booking widget (Cal.com)

The "Book Now" buttons scroll to a booking section that embeds [Cal.com](https://cal.com)'s free scheduler — no backend required. Clicking **"Get This Quote & Book"** in the calculator re-loads the embed with the matching appointment duration pre-selected, so the time slots shown actually reflect the job size.

This depends on one piece of setup in your Cal.com account:

1. Create (or rename) an event type with the slug **`deep-clean`** under your account `kevin-cutler-gfyocj`, so the full link is `kevin-cutler-gfyocj/deep-clean`.
2. In that event type's **Duration** settings, turn on **"Allow booker to select duration"** (multiple durations) and add these options, in minutes: `60, 90, 120, 150, 180, 210, 240, 270`. Set the default to `60`.
3. That's it — the site appends `?duration=N` to the booking link to preselect the right length whenever someone uses the calculator.

If you'd rather use a different event slug, update `CAL_LINK` near the bottom of `index.html` (currently `"kevin-cutler-gfyocj/deep-clean"`).

Also connect Google Calendar inside Cal.com (Settings → Apps → Google Calendar) so bookings check your real availability and land on your calendar automatically.

## Quote request form

The contact form at the bottom is currently a demo placeholder — submitting it just shows an alert, nothing is sent anywhere. When you're ready to receive real leads, the simplest options are:

- **Formspree** (free tier): point the `<form>`'s `action` at a Formspree endpoint and remove the `onsubmit` demo handler — submissions get emailed to you with no backend to run.
- **mailto:** link — zero setup, but depends on the visitor having a configured email client.

## Editing

Open `index.html` in any editor and update the placeholder phone/email (currently `(000) 000-0000` / `add-your-email@example.com`), then push to `main` — GitHub Pages redeploys automatically within a minute or two.
