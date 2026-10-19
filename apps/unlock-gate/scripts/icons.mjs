// Renders the app icons and link preview from Biscuit. Run: node scripts/icons.mjs
import { chromium } from 'playwright'
import { biscuitSVG } from '../src/biscuit.js'
const exe = process.env.CHROME || undefined
const face = biscuitSVG('idle', { key: false })
const icon = (size) => `<div style="width:${size}px;height:${size}px;background:radial-gradient(120% 90% at 50% 0%,#3b7a5d,#1d3a2f 70%);position:relative;overflow:hidden">
  <div style="position:absolute;left:${size * 0.18}px;right:${size * 0.18}px;top:${size * 0.2}px;bottom:-${size * 0.05}px;border-radius:${size}px ${size}px 0 0;background:rgba(255,244,228,.12)"></div>
  <div style="position:absolute;left:${size * 0.08}px;top:${size * 0.12}px;width:${size * 0.84}px;height:${size * 0.84}px">${face.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div>`
const browser = await chromium.launch({ executablePath: exe })
const page = await browser.newPage()
for (const [name, size] of [['icon-512.png', 512], ['icon-192.png', 192], ['apple-touch-icon.png', 180]]) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<html><body style="margin:0">${icon(size)}</body></html>`)
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname })
}
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(`<html><body style="margin:0;width:1200px;height:630px;background:#f5efe3;display:flex;align-items:center;justify-content:center;gap:70px;font-family:-apple-system,Helvetica,sans-serif">
  <div style="width:340px;height:340px;border-radius:76px;overflow:hidden;box-shadow:0 30px 60px rgba(29,58,47,.3)">${icon(340)}</div>
  <div style="color:#1f1a16;max-width:600px"><div style="font-size:76px;font-weight:900;line-height:1.02;letter-spacing:-2px">Earn your<br>scroll.</div>
  <div style="font-size:30px;color:#7b6f63;margin-top:22px;font-weight:600">A plank, a page or a prayer before Instagram opens.</div></div></body></html>`)
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname })
await browser.close()
