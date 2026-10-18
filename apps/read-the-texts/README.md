# Read the Texts

Screenshot a chat (or paste it) and find out how into you they are: an animated score, one brutally specific line, free stats, and a paywalled full read (green and red flags, effort balance, a Four Horsemen check inspired by Gottman's research, and what to text next). Per-person trends, a Stories-sized share card, and a mock paywall.

Installable PWA: Add to Home Screen on iPhone opens it full screen, offline, with data stored on the device only.

- Pasted text and the three demo chats are analyzed for real by a heuristic engine (`src/engine.js`). Screenshot reads are a seeded mock (no OCR yet). Swap `analyze()` for an LLM call to go live.
- React + Vite, hash routing and a relative base, so it runs from any path.
- Settings has prototype tools: simulate the subscription, reset the free read, replay onboarding.

```
npm install
npm run dev      # local
npm run build    # outputs dist/ (static, deploy anywhere)
```

`scripts/shots.mjs` drives the app in Playwright at iPhone size for screenshots (`npx vite preview` first).
