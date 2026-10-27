# Decomposition AI

Demo landing page for **Decomposition AI** — sponsor-lead enrichment for SuperOptimal. Pipedrive leads that replied go in; enriched phase-two emails and Luma-style sponsor pages (single-event and multi-city packages) come out. The CTA is the Pipedrive booking link.

**Set the booking link:** edit `BOOKING_URL` at the bottom of `app.js`.

Static site, no build step: `index.html`, `styles.css`, `app.js`.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Sections
- Hero: Pipedrive leads in, emails and sponsor pages out
- Pipeline: Pipedrive "Replied" stage → enrichment code
- Animated comparison vs. doing it by hand (enrich, email two, sponsor page, series pitch)
- Outputs: sample phase-two email + Luma-style sponsor page
- Source function catalog, 6-step flow, team section, FAQ

All companies and people shown are fictional demo data.
