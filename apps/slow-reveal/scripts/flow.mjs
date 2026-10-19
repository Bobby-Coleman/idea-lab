// Wrap-and-send flow, then open the link as a brand new recipient, then offline.
// Run `npx vite preview --port 4180` first.
import { chromium } from 'playwright'
const OUT = process.argv[2] || '.'
const browser = await chromium.launch()
const opts = { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const ctx = await browser.newContext(opts)
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:4180' })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
const wait = (ms) => page.waitForTimeout(ms)
const shot = async (n, p = page) => { await p.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
await page.goto('http://localhost:4180/')
await page.evaluate(() => localStorage.setItem('sr.v1', JSON.stringify({ onboarded: true, seeded: true, name: 'Bobby', received: [], sent: [] })))
await page.goto('http://localhost:4180/#/'); await page.reload(); await wait(700); await shot('31-empty')
await page.click('[aria-label="Wrap a gift"]'); await wait(500)
await page.fill('input.big-input', 'Sam'); await page.click('text=Something digital'); await shot('32-step-for')
await page.click('text=Continue'); await wait(400)
await page.fill('.step input.input', 'A playlist of every song from our road trip')
await page.setInputFiles('input[type=file]', `${OUT}/../s2/14-revealed.png`); await wait(800)
await page.fill('.note-input', 'Every song from Big Sur to Portland, in order. Even the bad ones.'); await shot('33-step-gift')
await page.click('text=Continue'); await wait(400)
await page.click('text=Write them for me'); await wait(4500); await shot('34-step-clues')
await page.click('text=Continue'); await wait(400); await page.click('text=Starry night'); await page.click('[aria-label=pink]'); await wait(300); await shot('35-step-wrap')
await page.click('text=Holo foil'); await wait(600); await shot('36-paywall'); await page.click('[aria-label=Close]'); await wait(500)
await page.click('text=Continue'); await wait(400); await page.click('text=1 week'); await shot('37-step-when')
await page.click('text=Continue'); await wait(400); await shot('38-review')
await page.click('text=Wrap it and send'); await wait(2000); await shot('39-sent')
const url = await page.evaluate(() => navigator.clipboard.readText().then((t) => t.split('\n').pop()))
console.log('link length', url.length)
await page.click('text=Done'); await wait(600); await shot('40-sent-list')
// second gift triggers the free limit
await page.click('[aria-label="Wrap a gift"]'); await wait(400)
// recipient: fresh phone
const ctx2 = await browser.newContext(opts)
const p2 = await ctx2.newPage()
p2.on('pageerror', (e) => errs.push('R: ' + e.message))
await p2.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
await p2.goto(url); await p2.waitForTimeout(1200); await shot('41-recipient', p2)
await p2.locator('.gb').click(); await p2.waitForTimeout(900); await shot('42-recipient-torn', p2)
await p2.click('[aria-label=Back]'); await p2.waitForTimeout(600); await shot('43-recipient-inbox', p2)
// offline
await p2.evaluate(() => navigator.serviceWorker.ready); await p2.waitForTimeout(1500)
await ctx2.setOffline(true); await p2.reload(); await p2.waitForTimeout(1000); await shot('44-offline', p2)
console.log('ERRORS', errs)
await browser.close()
