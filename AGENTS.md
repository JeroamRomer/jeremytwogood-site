# Agent notes: jeremytwogood.com

This branch (`facelift`) is **Open Sequence**, the unreleased redesign. The live site, **Classic**, is `main`.

Before changing anything, read `docs/open-sequence-handoff.md`. It covers what both sites are, how to swap which one is live, how to run and test, the rules every change must follow, and the prioritized open work.

Quick commands: `npm run dev` (http://localhost:4321); `npm run build && npm test && npm run test:ui && npm run test:api` before every commit. Discard timestamp-only diffs in `public/agent-data.json`. Never merge to `main` or deploy to production without Jeremy's go-ahead.
