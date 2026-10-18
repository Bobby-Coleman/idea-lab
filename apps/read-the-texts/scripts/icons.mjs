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
await browser.close()
