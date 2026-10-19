# Unlock Gate

Earn your scroll. Instagram, TikTok and friends sit behind a gate kept by Biscuit the shiba;
you pay a toll (plank, nose-tap push-ups, a few pages + one question, scripture, cross off a
to-do, 5 breaths, three good things) and the app is open for a set window. Or turn back.

- React + Vite, hash routes, installable PWA, offline, all data in localStorage.
- `src/library.js` holds the public-domain reading and scripture (Long's Marcus Aurelius,
  Gummere's Seneca, Thoreau, KJV, Pickthall's 1930 Quran).
- `node scripts/icons.mjs` regenerates icons; `node scripts/shots.mjs <dir>` walks every
  screen at iPhone size (run `npx vite preview --port 4190` first; set CHROME to a Chromium path if needed).

A web app can't block other apps on iOS. The prototype relies on the home-screen swap
(Gate goes where Instagram was). A native build would use Screen Time (FamilyControls,
ManagedSettings shields, DeviceActivity) to really lock apps and re-lock on a timer.
