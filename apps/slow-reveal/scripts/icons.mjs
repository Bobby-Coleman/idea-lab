import { chromium } from 'playwright'
import fs from 'node:fs'
const svg = fs.readFileSync(new URL('./icon.svg', import.meta.url), 'utf8')
const browser = await chromium.launch()
const page = await browser.newPage()
for (const [name, size] of [['icon-512.png', 512], ['icon-192.png', 192], ['apple-touch-icon.png', 180]]) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`)
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname })
}
// Link preview image for iMessage (og:image).
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(`<html><body style="margin:0;width:1200px;height:630px;background:#fbf3e8;display:flex;align-items:center;justify-content:center;gap:70px;font-family:Georgia,serif">
  <div style="width:360px;height:360px;border-radius:70px;overflow:hidden;box-shadow:0 30px 60px rgba(90,15,28,.25)">${svg.replace('<svg ', '<svg width="360" height="360" ')}</div>
  <div style="color:#2b1d16;max-width:560px"><div style="font-size:66px;font-weight:700;line-height:1.05">Someone sent<br>you a gift</div>
  <div style="font-size:30px;color:#8b786c;margin-top:22px;font-family:-apple-system,Helvetica,sans-serif">It unwraps a little more every day.</div></div></body></html>`)
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname })
await browser.close()
