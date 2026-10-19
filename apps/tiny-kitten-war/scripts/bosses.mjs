// Screens for every boss fight plus the menus. Needs `npx vite` on 5173.
import { chromium } from 'playwright'
const OUT = process.argv[2] || '/tmp/claude-0/shots'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = ':root{--st:47px!important;--sb:34px!important}'; document.head.appendChild(st) }))
await ctx.addInitScript(() => { if (!sessionStorage.seeded) { sessionStorage.seeded = 1; localStorage.setItem('tiny-kitten-war.v1', JSON.stringify({ fish: 260, cleared: { front: true, siege: true }, hats: ['none', 'helmet', 'viking'], hat: 'viking', name: 'Sir Mittens' })) } })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
const wait = (ms) => page.waitForTimeout(ms)
const shot = async (n) => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log('shot', n) }
const auto = () => page.evaluate(() => { window.__auto = setInterval(() => { const c = document.querySelector('.card'); if (c) c.click() }, 150) })
await page.goto('http://localhost:5173/'); await wait(1200)
await page.click('text=Wardrobe'); await wait(500); await shot('w1-hats')
await page.click('.tabs >> text=Coats'); await wait(300); await shot('w2-coats')
await page.click('.header .iconbtn'); await wait(300)
await page.click('text=Training'); await wait(400); await shot('t1-training')
await page.click('.header .iconbtn'); await wait(300)
for (const [name, id, n] of [['Siege of Castle Grumble', 'siege', 'b2'], ["Dragon's Pass", 'pass', 'b3']]) {
  await page.click('text=To battle!'); await wait(400)
  await page.click(`text=${name}`); await wait(800)
  await auto()
  await page.evaluate(() => { const g = window.__game; g.t = 100; g.weapons = { claw: 3, hairball: 3, laser: 2, catnip: 2, fish: 2 } })
  await wait(8000); await shot(`${n}-mid`)
  const fps = await page.evaluate(() => new Promise((r) => { let n = 0, t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2) }; requestAnimationFrame(f) }))
  console.log('fps', n, fps, await page.evaluate(() => window.__game.enemies.length))
  await page.evaluate(() => { const g = window.__game; g.t = g.battle.bossAt - 0.1; g.p.hp = 5000; g.maxHp = 5000 })
  await wait(400)
  await page.evaluate(() => { const g = window.__game; g.boss.x = g.p.x + 180; g.boss.y = g.p.y - 60 })
  await wait(2500); await shot(`${n}-boss1`)
  await wait(3000); await shot(`${n}-boss2`)
  await page.evaluate(() => { const g = window.__game; g.boss.hp = 5 })
  await wait(1500); await shot(`${n}-win`)
  await wait(3500); await shot(`${n}-results`)
  if (id === 'pass') { await page.click('text=Continue'); await wait(500); await shot('s1-steam') }
  else { await page.click('text=📸 Brag'); await wait(1500); await shot(`${n}-card`); await page.click('.sharecard'); await page.goto('http://localhost:5173/'); await wait(1000) }
}
console.log('ERRORS', errs)
await browser.close()
