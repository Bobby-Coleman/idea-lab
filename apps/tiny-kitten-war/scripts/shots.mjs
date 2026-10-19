// iPhone-size screenshots of the main flow. Needs `npx vite` on 5173.
import { chromium } from 'playwright'
const OUT = process.argv[2] || '/tmp/claude-0/shots'
const which = process.argv[3] || 'all'
const fs = await import('node:fs'); fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
const wait = (ms) => page.waitForTimeout(ms)
const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
const seed = (s) => page.evaluate((s) => localStorage.setItem('tiny-kitten-war.v1', JSON.stringify(s)), s)
// auto-pick level ups and wander in circles
const autoplay = () => page.evaluate(() => {
  if (window.__auto) return
  window.__auto = setInterval(() => {
    const g = window.__game; if (!g) return
    const card = document.querySelector('.card'); if (card) card.click()
    const t = performance.now() / 1000
    g.keys = { a: Math.cos(t * 0.7) < -0.3, d: Math.cos(t * 0.7) > 0.3, w: Math.sin(t * 0.7) < -0.3, s: Math.sin(t * 0.7) > 0.3 }
  }, 100)
})
await page.goto('http://localhost:5173/')
await wait(1500)
if (which === 'all' || which === 'menu') {
  await shot('01-title')
  await page.click('text=To battle!'); await wait(600); await shot('02-battles')
  await page.click('text=Wardrobe').catch(() => {})
}
if (which === 'all' || which === 'battle') {
  await page.goto('http://localhost:5173/'); await wait(800)
  await page.click('text=To battle!'); await wait(400)
  await page.click('text=The Grassy Front'); await wait(1200); await shot('03-intro')
  await autoplay()
  await wait(14000); await shot('04-early')
  // skip ahead so the field is busy
  await page.evaluate(() => { const g = window.__game; g.t = 80; g.weapons = { claw: 3, hairball: 2, yarn: 2 } })
  await wait(9000); await shot('05-mid')
  await page.evaluate(() => { window.__game.mewCharge = 1 }); await wait(300); await shot('06-mewready')
  await page.evaluate(() => window.__game.mew()); await wait(450); await shot('07-mew')
  await page.evaluate(() => { const g = window.__game; g.t = 147 }); await wait(5000); await shot('08-boss')
  await page.evaluate(() => { const g = window.__game; g.p.hp = 9999; g.boss.hp = 30 }); await wait(4000); await shot('09-victory')
  await wait(3000); await shot('10-results')
}
console.log('ERRORS', errs)
await browser.close()
