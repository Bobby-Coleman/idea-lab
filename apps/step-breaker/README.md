# Pip: tiny steps (ADHD Step Breaker)

Type a scary task, Pip the frog breaks it into tiny steps, and sits with you while you do them one at a time.
Installable PWA (Add to Home Screen), works offline, data stays on the device. AI breakdowns are mocked:
20 hand-written tasks plus a template fallback live in `src/breakdowns.js`.

```
npm install
npm run dev        # local dev
npm run build      # dist/ with offline service worker
node scripts/icons.mjs   # re-render home screen icons (needs `npm run preview` running)
```

Screens: onboarding, Today (input + spice level), task list with "make it tinier", Just One Step focus mode
with body-double timer, celebration + shareable win card, Jar (no-streak history), You (skins, cheer styles), paywall (mock).
