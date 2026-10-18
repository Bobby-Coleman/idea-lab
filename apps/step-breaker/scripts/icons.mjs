// Renders the home screen icons from Pip's SVG using the pre-installed Chromium.
import { chromium } from 'playwright-core'
const base = process.argv[2] || 'http://localhost:4173/'
const out = new URL('../public/icons/', import.meta.url).pathname
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const page = await browser.newPage({ viewport: { width: 400, height: 800 } })
await page.goto(base)
await page.waitForSelector('.ob-pip svg')
const svg = await page.evaluate(() => {
  const n = document.querySelector('.ob-pip svg').cloneNode(true)
  n.querySelectorAll('.pip-line').forEach((x) => x.setAttribute('style', 'fill:none;stroke:#2B2340;stroke-width:3.5;stroke-linecap:round'))
  n.removeAttribute('class'); n.querySelectorAll('[class]').forEach((x) => x.removeAttribute('class'))
  return n.outerHTML
})
for (const [name, size, pad] of [['icon-512.png', 512, 0.2], ['icon-192.png', 192, 0.2], ['apple-touch-icon.png', 180, 0.18]]) {
  await page.setViewportSize({ width: size, height: size })
  const inner = Math.round(size * (1 - pad * 2))
  await page.setContent(`<html><body style="margin:0"><div style="width:${size}px;height:${size}px;background:radial-gradient(circle at 50% 35%,#FFF6EC,#FFD9B8);display:grid;place-items:center">
    <div style="width:${inner}px;margin-top:${size * 0.04}px">${svg.replace(/width="\d+"/, 'width="100%"').replace(/height="[\d.]+"/, 'height="100%"')}</div></div></body></html>`)
  await page.screenshot({ path: out + name, clip: { x: 0, y: 0, width: size, height: size } })
}
await browser.close()
console.log('icons written')
