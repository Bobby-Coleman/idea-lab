# Two of Us (Wrapped for Two)

A Spotify-Wrapped-style story about you and your person, sent as a link. Installable PWA, no backend, no accounts.

- `npm install && npm run dev` to work on it, `npm run build` to build into `dist/` (relative base, hash routing, so it works at any path).
- Stories, Pro state and drafts live in IndexedDB on the device.
- Share links carry the whole story (text plus shrunken photos, deflate-compressed) in the URL hash: `#/s/<payload>`.
- "AI" copy (duo type, stats, captions) is mocked and seeded from the story, in `src/lib/generate.js`.
- Music is synthesized live with Web Audio (`src/lib/music.js`); slide timing is counted in beats.
- Paywall is a mock: tapping buy sets Pro on the device.
