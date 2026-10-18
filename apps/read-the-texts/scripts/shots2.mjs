import { chromium } from 'playwright'
const OUT = process.argv[2]
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
const wait = (ms) => page.waitForTimeout(ms)
const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
await page.goto('http://localhost:4173/')
await page.evaluate(() => localStorage.setItem('rtt.v1', JSON.stringify({ onboarded: true })))
await page.reload(); await wait(800); await shot('21-home')
await page.click('[aria-label="New scan"]'); await wait(500)
await page.setInputFiles('input[type=file]', [`${OUT}/02-onb2.png`, `${OUT}/13-result-mixed.png`])
await page.fill('input.input', 'Chris'); await wait(400); await shot('22-shots')
await page.click('text=Read it'); await wait(2500); await shot('23-analyzing-img'); await wait(6000); await shot('24-img-result')
await page.click('[aria-label=Back]'); await wait(500)
await page.click('[aria-label="New scan"]'); await wait(500); await page.click('text=Paste text'); await page.click('text=Use example'); await page.click('text=Read it'); await wait(700); await shot('25-paywall-scans')
// offline
await ctx.setOffline(true); await page.goto('http://localhost:4173/#/people').catch(e => console.log('nav fail', e.message)); await wait(800); await shot('26-offline')
console.log('ERRORS', errs)
await browser.close()
