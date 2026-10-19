// Renders the app icons from the game's own art. Needs `npx vite` running on 5173.
import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 512, height: 512 } })
await page.goto('http://localhost:5173/scripts/icon.html')
await page.waitForFunction(() => window.done)
const png = await page.locator('#c').screenshot()
const fs = await import('node:fs')
fs.writeFileSync(new URL('../public/icon-512.png', import.meta.url), png)
for (const [name, size] of [['icon-192.png', 192], ['apple-touch-icon.png', 180]]) {
  await page.setContent(`<body style="margin:0"><img src="data:image/png;base64,${png.toString('base64')}" width="${size}" height="${size}">`)
  await page.setViewportSize({ width: size, height: size })
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname })
}
await browser.close()
