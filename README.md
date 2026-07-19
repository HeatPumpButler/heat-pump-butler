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

The "Book Now" buttons scroll to a booking section that embeds [Cal.com](https://cal.com)'s free scheduler — no backend required. It's connected to the Cal.com account `kevin-cutler-gfyocj`, showing all of that account's public event types.

To point the embed at one specific event type instead of the full list, open `index.html`, find `const CAL_LINK = "kevin-cutler-gfyocj";` near the bottom, and change it to `"kevin-cutler-gfyocj/your-event-slug"`.

Also connect Google Calendar inside Cal.com (Settings → Apps → Google Calendar) so bookings check your real availability and land on your calendar automatically.

## Quote request form

The contact form at the bottom is currently a demo placeholder — submitting it just shows an alert, nothing is sent anywhere. When you're ready to receive real leads, the simplest options are:

- **Formspree** (free tier): point the `<form>`'s `action` at a Formspree endpoint and remove the `onsubmit` demo handler — submissions get emailed to you with no backend to run.
- **mailto:** link — zero setup, but depends on the visitor having a configured email client.

## Editing

Open `index.html` in any editor and update the placeholder phone/email (currently `(000) 000-0000` / `add-your-email@example.com`), then push to `main` — GitHub Pages redeploys automatically within a minute or two.
