// Checks the app loads with no network after one visit, served from a subpath.
// Run `npx vite preview --port 4174 --base /idea-lab/read-the-texts/` first.
import { chromium } from 'playwright'
const OUT = process.argv[2] || '.'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await page.goto('http://localhost:4174/idea-lab/read-the-texts/')
await page.evaluate(() => navigator.serviceWorker.ready)
await page.waitForTimeout(1500)
await ctx.setOffline(true)
await page.reload()
await page.waitForTimeout(1000)
console.log('offline title:', await page.title(), '| onboarding visible:', await page.locator('.onb').count())
await page.click('text=Continue')
await page.click('text=Continue')
await page.click('text=Start reading')
await page.waitForTimeout(300)
await page.locator('.demo-card').first().click()
await page.waitForTimeout(6500)
await page.locator('.screen').evaluate((e) => e.scrollTo(0, 99999))
await page.click('text=Delete')
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/27-confirm.png` })
console.log('ERRORS', errs)
await b.close()
