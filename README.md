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
- Hero and intro: why browser agents are slow and expensive
- **How it works**:
  - Layers: pixels → 2.4 MB page → 3 KB data request (what decomposing actually targets)
  - Same question, two paths: browser agent (8 LLM calls, ~52k tokens) vs. decomposed (2 LLM calls, ~1.2k tokens)
  - Where the savings come from + monthly cost calculator (illustrative estimates)
  - Build pipeline with real artifacts: Capture → Map → Clean → Name → Assemble → Run
- Lead-enrichment pipeline example, animated comparison, sample outputs, function catalog, FAQ

All companies, people and numbers shown are illustrative demo data.
