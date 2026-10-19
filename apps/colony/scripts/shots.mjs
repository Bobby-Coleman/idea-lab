import { chromium } from 'playwright'
const OUT = process.argv[2]
const only = process.argv[3]
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
let page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
await ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
const wait = (ms) => page.waitForTimeout(ms)
const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
// drag between nodes by index using the game's transform
const drag = async (from, to) => {
  const pts = await page.evaluate(([a, b]) => { const g = window.__game; const r = g.canvas.getBoundingClientRect(); const P = (n) => [r.left + g.sx(g.nodes[n].x), r.top + g.sy(g.nodes[n].y)]; return [P(a), P(b)] }, [from, to])
  await page.mouse.move(...pts[0]); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(pts[0][0] + (pts[1][0] - pts[0][0]) * i / 8, pts[0][1] + (pts[1][1] - pts[0][1]) * i / 8)
  await page.mouse.up()
}
await page.goto('http://localhost:4173/')
if (!only) {

  await wait(2500); await shot('01-title')
  await page.click('text=Play'); await wait(700); await shot('02-map')
  await page.click('text=First Crumbs'); await wait(1000); await shot('03a-intro'); await wait(2000); await shot('03-l1-start')
  await drag(0, 1); await wait(900); await shot('04-l1-sending')
  await wait(2500); await drag(0, 2); await wait(4000); await shot('05-l1-mid')
  await wait(6000); await drag(0, 3); await wait(200)
  const pts = await page.evaluate(() => { const g = window.__game; return g.nodes.map(n=>[n.owner, Math.round(n.count)]) }); console.log(JSON.stringify(pts))
  await wait(9000); await shot('06-l1-late')
  const pts2 = await page.evaluate(() => { const g = window.__game; return g.nodes.map(n=>[n.owner, Math.round(n.count)]) }); console.log(JSON.stringify(pts2))
}
// jump to later levels
await page.close()
const page2 = await ctx.newPage()
await page2.addInitScript(() => { if (!sessionStorage.seeded) { sessionStorage.seeded = 1; localStorage.setItem('colony.v1', JSON.stringify({ unlockAll: true, cleared: 0, food: 500, seenChapters: { house: true, street: true, city: true, world: true, yard: true }, lastSeen: Date.now() })) } })
page = page2
page.on('pageerror', (e) => errs.push(e.message))
for (const [name, n] of [['Red Ants', 'l2'], ['Cul-de-sac', 'l9'], ['Downtown', 'l11'], ['World Domination', 'l14']]) {
  await page.goto('http://localhost:4173/'); await wait(500)
  await page.click('text=Play'); await wait(500)
  await page.click(`.lvl-name:text-is("${name}")`); await wait(1000)
  await shot(`${n}-pre`); await drag(0, 2); await wait(1500); await shot(`${n}-a`)
  await wait(14000); await shot(`${n}-b`)
}
console.log('ERRORS', errs)
await browser.close()
