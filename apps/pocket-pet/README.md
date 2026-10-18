# Pocket Pet

Scan your real pet and it becomes a cute chibi buddy you feed, pet, walk and dress up.

Installable PWA (Add to Home Screen on iPhone). Everything is stored on the device; no accounts.

- `npm install && npm run dev` to work on it, `npm run build` to produce `dist/` (a single inlined `index.html` plus manifest, service worker and icons).
- Relative base and hash routing, so it works at any path.
- The "AI scan" is mocked: colors and markings are sampled from the photo (k-means, center weighted) and drawn onto parametric SVG cat/dog/bunny art in `src/Pet.jsx`.
- Plus (paywall) is a demo toggle: tapping "Start free trial" unlocks it locally with no payment.
- `#/gallery` shows every species, pattern, expression and outfit for design review.
