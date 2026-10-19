// Fast-forwards every level with a simple bot playing your side, to check difficulty.
import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 393, height: 852 } })
const page = await ctx.newPage()
await ctx.addInitScript((UP) => { if (!sessionStorage.s) { sessionStorage.s = 1; localStorage.setItem('colony.v1', JSON.stringify({ unlockAll: true, upgrades: JSON.parse(UP), seenChapters: { yard: 1, house: 1, street: 1, city: 1, world: 1 }, lastSeen: Date.now() })) } }, process.env.UP || '{}')
const botEvery = Number(process.argv[2] || 1.5)
const names = ['First Crumbs','Red Ants','The Picnic','Under the Door','The Pantry','Living Room','The Whole House','Next Door','Cul-de-sac','The Block Party','Downtown','Metropolis','Across the Ocean','World Domination']
for (const name of names) {
  const res = []
  for (let trial = 0; trial < 3; trial++) {
    await page.goto('http://localhost:4173/'); await page.waitForTimeout(300)
    await page.click('text=Play'); await page.waitForTimeout(200)
    await page.click(`.lvl-name:text-is("${name}")`); await page.waitForTimeout(400)
    const r = await page.evaluate((every) => {
      const g = window.__game
      g.setPaused(true)
      let clock = 1, out = 'timeout'
      const ev = g.onEvent
      g.onEvent = (t, d) => { if (t === 'win' || t === 'lose') out = t; }
      for (let i = 0; i < 30 * 400 && out === 'timeout'; i++) {
        g.update(1 / 30)
        clock -= 1 / 30
        if (clock <= 0) { clock = every; g.think(1) }
      }
      return out + ' ' + Math.round(g.t)
    }, botEvery)
    res.push(r)
  }
  console.log(name.padEnd(18), res.join(' | '))
}
await b.close()
