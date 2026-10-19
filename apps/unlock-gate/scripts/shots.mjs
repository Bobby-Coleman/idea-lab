// Screenshots at iPhone 15 size. Run `npx vite preview --port 4190` first.
// Usage: node scripts/shots.mjs <outdir>
import { chromium } from 'playwright'
const OUT = process.argv[2] || '.'
const URL = 'http://localhost:4190/'
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined })
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
await page.clock.install()
const wait = async (ms) => { await page.clock.runFor(ms); await page.waitForTimeout(Math.min(ms, 450)) }
const shot = async (n) => { await page.waitForTimeout(250); await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
const click = (sel) => page.locator(sel).first().click()
await page.goto(URL)
await wait(800); await shot('01-welcome')
await click('text=Meet the gate'); await wait(500); await shot('02-apps')
await click('text=Guard 3 apps'); await wait(500)
await page.locator('[aria-label=Scripture]').click(); await page.locator('[aria-label="Three good things"]').click(); await wait(300); await shot('03-tolls')
await click('text=These are good'); await wait(500); await shot('04-setup')
await click('text=Close the gate'); await wait(600); await shot('05-home-empty')
// Instagram → plank
await click('.gate-app >> nth=0'); await wait(700); await shot('06-gate')
await click('text=30s plank'); await wait(500); await shot('07-plank-ready')
await click("text=I’m in position"); await wait(1000); await shot('08-plank-count')
await wait(3000); await wait(12000); await shot('09-plank-hold')
await wait(20000); await wait(800); await shot('10-opened')
await click('text=Not now'); await wait(600)
// TikTok → push-ups
await click('.gate-app >> nth=1'); await wait(600); await click('text=10 push-ups'); await wait(500)
for (let i = 0; i < 6; i++) { await page.locator('.nose').dispatchEvent('pointerdown'); await wait(700) }
await shot('11-pushups')
for (let i = 0; i < 4; i++) { await page.locator('.nose').dispatchEvent('pointerdown'); await wait(700) }
await wait(800); await click('text=Not now'); await wait(600)
// X → read
await click('.gate-app >> nth=2'); await wait(600); await click('text=Read 3 pages'); await wait(800); await shot('12-read')
for (let i = 0; i < 3; i++) { await wait(16000); await page.locator('.toll-foot .btn').click(); await wait(600) }
await wait(1600); await shot('13-quiz')
await page.locator('.opt >> nth=1').click(); await wait(500); await shot('14-quiz-wrong')
await page.locator('.opt >> nth=0').click(); await wait(400); await shot('15-quiz-right')
await wait(1500); await wait(1500); await shot('16-paywall')
await page.locator('.pw-x').click(); await wait(600); await click('text=Not now'); await wait(600)
await shot('17-home-after')
// Instagram is open now; use TikTok? also open. Use settings to add YouTube… go to gate via X? open. Use scripture via direct hash.
await page.evaluate(() => { location.hash = '#/toll/youtube/scripture' }); await wait(800); await shot('18-scripture')
await wait(25000); await page.fill('.reflect input', 'Slowing down tonight'); await shot('19-scripture-ready')
await page.evaluate(() => { location.hash = '#/toll/reddit/todo' }); await wait(800); await shot('20-todo-empty')
await page.evaluate(() => { location.hash = '#/toll/reddit/gratitude' }); await wait(800)
const g = page.locator('.draft input'); await g.nth(0).fill('Coffee on the porch'); await g.nth(1).fill('Mom calling just to say hi'); await g.nth(2).fill('Finished the deck early')
await click('text=Done'); await wait(2000); await shot('21-gratitude')
await page.evaluate(() => { location.hash = '#/toll/reddit/breathe' }); await wait(600); await click('text=Start'); await wait(2500); await shot('22-breathe')
await page.evaluate(() => { location.hash = '#/gate/reddit' }); await wait(800)
await click('text=Never mind'); await wait(800); await shot('23-resisted')
await click('.opened-actions .btn.primary'); await wait(600)
await page.evaluate(() => { location.hash = '#/settings' }); await wait(600); await page.locator('text=Fill with a sample week').dispatchEvent('click'); await wait(300)
await page.evaluate(() => { location.hash = '#/stats' }); await wait(800); await shot('24-stats')
await page.locator('.screen').evaluate((e) => e.scrollTo(0, 600)); await wait(300); await shot('25-stats-history')
await page.evaluate(() => { location.hash = '#/settings' }); await wait(600); await shot('26-settings')
await page.locator('.screen').evaluate((e) => e.scrollTo(0, 1200)); await wait(300); await shot('27-settings-more')
await page.evaluate(() => { location.hash = '#/' }); await wait(800); await shot('28-home-week')
console.log('ERRORS', errs)
await browser.close()
