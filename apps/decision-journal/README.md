# Hindsight (decision journal)

Log a decision with your gut pick, your reasoning and how sure you are. Hindsight checks back at
30, 60 and 90 days, asks which option was actually right, and keeps score: "your gut is right 73% of the time".

- React 19 + Vite, installable PWA, hash routing, data in localStorage (`hindsight.v1`), no accounts.
- `src/store.js` state and check-in logic, `src/stats.js` gut/head scoring, `src/ai.js` mocked "Hoot" AI
  (bias flags and questions quoted from your own words, late-night nudge, pattern read), `src/sample.js` sample journal.
- Demo tools live under the You tab: skip ahead 7/30 days, load or remove the sample journal, toggle Plus.
- `node scripts/icons.mjs` renders icons; `scripts/shots.mjs` screenshots the whole flow at iPhone size (needs `vite preview --port 4180`).
