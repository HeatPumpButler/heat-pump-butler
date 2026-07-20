# Heat Pump Butler

A one-page marketing site for Heat Pump Butler — professional residential heat pump / mini-split deep cleaning.

## Live site

https://heatpumpbutler.github.io/heat-pump-butler/

## Structure

- `index.html` — the entire site (HTML + embedded CSS + a touch of JS), no build step required.
- `assets/` — logo, hero photo, and before/after photos (cropped from the brand concept sheet).
- `brand-source/` — original concept PNGs and the brand PDF (git-ignored, kept local only).

## Quoting calculator

The Pricing section includes a live estimator (`index.html`, `<script>` near the bottom) that computes price from the number of indoor units: $199 for 1 unit, $274 for 2, then +$75 per additional unit. Outdoor unit cleaning is always included. Update `BASE_PRICE`, `TWO_UNIT_PRICE`, and `ADDITIONAL_UNIT_PRICE` there if pricing changes.

## Booking widget (Cal.com)

The "Book Now" buttons scroll to a booking section that embeds [Cal.com](https://cal.com)'s free scheduler — no backend required. To activate real booking:

1. Create a free account at https://cal.com
2. Create an event type (e.g. "Deep Clean Consultation") and set your availability
3. In `index.html`, find `const CAL_LINK = "heat-pump-butler/deep-clean";` near the bottom and replace it with your real `your-username/your-event-slug`

Until you do that, the embed will show Cal.com's placeholder/error state since that account doesn't exist yet.

## Quote request form

The contact form at the bottom is currently a demo placeholder — submitting it just shows an alert, nothing is sent anywhere. When you're ready to receive real leads, the simplest options are:

- **Formspree** (free tier): point the `<form>`'s `action` at a Formspree endpoint and remove the `onsubmit` demo handler — submissions get emailed to you with no backend to run.
- **mailto:** link — zero setup, but depends on the visitor having a configured email client.

## Editing

Open `index.html` in any editor and update the placeholder phone/email (currently `(000) 000-0000` / `add-your-email@example.com`), then push to `main` — GitHub Pages redeploys automatically within a minute or two.
