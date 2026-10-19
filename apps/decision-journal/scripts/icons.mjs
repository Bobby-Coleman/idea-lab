// Renders the home screen icons and the link preview image. Run: node scripts/icons.mjs
import { chromium } from 'playwright'
import { owlSvg } from '../src/owl-svg.js'
const owl = (s) => owlSvg({ mood: 'happy', size: s })
const icon = (size) => `<div style="width:${size}px;height:${size}px;background:linear-gradient(150deg,#ff8a5c,#f2625a 55%,#d9455f);display:flex;align-items:center;justify-content:center">
  <div style="margin-top:${size * 0.06}px">${owl(Math.round(size * 0.78))}</div></div>`
const browser = await chromium.launch()
const page = await browser.newPage()
for (const [name, size] of [['icon-512.png', 512], ['icon-192.png', 192], ['apple-touch-icon.png', 180]]) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<html><body style="margin:0">${icon(size)}</body></html>`)
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname })
}
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(`<html><body style="margin:0;width:1200px;height:630px;background:#f5f0e6;display:flex;align-items:center;justify-content:center;gap:70px;font-family:Georgia,serif">
  <div style="width:340px;height:340px;border-radius:76px;overflow:hidden;box-shadow:0 30px 60px rgba(217,69,95,.3)">${icon(340)}</div>
  <div style="color:#1e1a16;max-width:600px"><div style="font-size:72px;line-height:1.02">Is your gut<br>actually right?</div>
  <div style="font-size:30px;color:#6b6258;margin-top:24px;font-family:-apple-system,Helvetica,sans-serif">Hindsight checks back at 30, 60 and 90 days and keeps score.</div></div></body></html>`)
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname })
await browser.close()
