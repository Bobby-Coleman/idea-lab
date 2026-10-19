# Slow Reveal

Send someone a gift that unwraps a little more every day. Wrap a photo, a promise (tickets, a trip, an IOU) or a real package, pick the paper and the reveal day, and text them the link. Each day they tear off a new piece, the photo underneath gets a little less pixelated, clues unlock, and they can guess (with hot/cold hints). On the big day they tear the rest off.

- Installable PWA (React + Vite), works offline, data stays on the phone.
- No backend: the whole gift, photo included, is compressed into the link's hash (`src/link.js`). A thank-you comes back the same way (`#/r/...`).
- Clue writing, hot/cold guesses and shake reactions are mocked (`src/ai.js`). Package tracking is mocked and moves with the countdown.
- Paywall (Plus) unlocks in demo mode. Settings has time travel for testing the countdown.

```sh
npm ci && npm run dev
npm run build && npx vite preview --port 4180
node scripts/shots.mjs <dir>   # demo walkthrough screenshots
node scripts/flow.mjs <dir>    # wrap, send, open as a new recipient, offline
node scripts/icons.mjs         # regenerate icons + og.png from scripts/icon.svg
```
