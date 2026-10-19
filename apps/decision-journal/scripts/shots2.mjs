// Spot checks after polish. Needs `vite preview --port 4180`.
import { chromium } from 'playwright'
const OUT = process.argv[2] || '.'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
const wait = (ms) => page.waitForTimeout(ms)
const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
await page.goto('http://localhost:4180/')
await wait(500); await page.click('text=Skip'); await page.fill('.big-input', 'Bobby')
await page.click('text=Explore with a sample journal'); await wait(6500); await shot('p1-today')
await page.click('[aria-label="New decision"]'); await wait(600)
await page.fill('.big-text', 'Should I get bangs?'); await page.click('.chip >> text=Other'); await page.click('text=Continue'); await wait(400)
await page.click('text=Continue'); await wait(400); await page.click('.gut-card >> nth=1'); await wait(900)
await page.fill('textarea.note', 'Everyone on TikTok has them and I am scared I will regret it.')
await page.locator('.flow-body').evaluate((e) => e.scrollTo(0, 999)); await wait(200); await shot('p2-aibtn')
await page.click('text=Continue'); await wait(400); await page.click('text=Seal it')
await wait(300); await shot('p3-seal-a'); await wait(500); await shot('p3-seal-b'); await wait(500); await shot('p3-seal-c'); await wait(1200); await shot('p3-seal-d')
await page.click('.sealed >> text=Done'); await wait(700)
await page.click('.tab >> text=Journal'); await wait(600); await page.click('text=Lend my cousin'); await wait(700)
await page.locator('.detail').evaluate((e) => e.scrollTo(0, 300)); await wait(400); await shot('p4-detail-scrolled')
await page.locator('.detail').evaluate((e) => e.scrollTo(0, 9999)); await wait(300)
await page.click('text=Delete'); await wait(600); await shot('p5-asker')
await page.click('.asker-btn.danger'); await wait(900); await shot('p6-after-delete')
console.log('ERRORS', errs)
await browser.close()
