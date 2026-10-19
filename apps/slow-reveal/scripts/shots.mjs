// Screenshots at iPhone 15 size. Run `npx vite preview --port 4180` first.
import { chromium } from 'playwright'
const OUT = process.argv[2] || '.'
const URL = 'http://localhost:4180/'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
const wait = (ms) => page.waitForTimeout(ms)
const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
const scr = (y) => page.locator('.screen').evaluate((e, y) => e.scrollTo(0, y), y)
await page.goto(URL)
await wait(1200); await shot('01-welcome')
await page.click('text=Continue'); await wait(500)
await page.fill('input.big-input', 'Bobby'); await shot('02-name')
await page.click("text=See what's waiting for you"); await wait(900); await shot('03-inbox')
await scr(600); await wait(300); await shot('04-inbox-shelf'); await scr(0)
// Maya: tear a piece
await page.click('text=From Maya'); await wait(900); await shot('05-maya')
await page.click('text=Tear today\'s piece'); await wait(250); await shot('06-tearing'); await wait(900); await shot('07-torn')
await page.locator('.gb').click(); await wait(300); await shot('08-shake')
await scr(500); await wait(300); await shot('09-maya-clues')
await page.fill('.guess-form input', 'concert tickets'); await page.click('.guess-form button'); await wait(1300); await shot('10-guess')
await page.click('[aria-label=Back]'); await wait(600)
// Jules: ready to open
await page.click('text=From Jules'); await wait(900); await shot('11-jules-ready')
for (let i = 0; i < 4; i++) { await page.locator('.gb').click(); await wait(250) }
await shot('12-unwrapping')
for (let i = 0; i < 4; i++) { await page.locator('.gb').click(); await wait(200) }
await wait(500); await shot('13-paper-off'); await wait(1400); await shot('14-revealed')
await scr(500); await wait(300); await shot('15-voucher-note')
await scr(9999); await page.click('text=Send Jules a thank-you'); await wait(600); await shot('16-thanks')
await page.mouse.click(200, 100); await wait(500)
await page.click('[aria-label=Back]'); await wait(600)
await page.click('text=From Mom'); await wait(900); await shot('17-mom')
await scr(520); await wait(300); await shot('18-mom-tracking')
console.log('ERRORS', errs)
await browser.close()
