# Decomp AI

Demo landing page for **Decomp AI** — sponsor-lead enrichment for SuperOptimal. Pipedrive leads that replied go in; enriched phase-two emails and Luma-style sponsor pages (single-event and multi-city packages) come out. The CTA is the Pipedrive booking link.

**Set the booking link:** edit `BOOKING_URL` at the bottom of `app.js`.

Static site, no build step: `index.html`, `styles.css`, `app.js`.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Sections
- Hero with fanned site cards (YouTube, Amazon, Expedia, Calendly, Google Maps); click one to see it in code
- `agent.ts` panel that types a real-looking call for each site and shows the result
- Race: the same task done by Decomp AI vs. a browser agent, with live time, tokens and cost (5 tasks)
- **Lead enrichment**: company name in → parallel calls to the five sites → CRM-ready record with fit score (DTC brand, hotel, local clinic examples)
- "Every capability. One import.": auto-scrolling function catalog
- "How a website becomes functions": animated isometric desk scene through 6 steps (Capture → Run natively)

All data, timings and prices are illustrative demo data. Not affiliated with the sites shown.
