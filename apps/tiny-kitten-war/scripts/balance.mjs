// Plays battle 1 in real time with a dumb circling bot and prints progress.
import { chromium } from 'playwright'
const b = await chromium.launch()
const page = await b.newPage({ viewport: { width: 393, height: 852 } })
await page.goto('http://localhost:5173/'); await page.waitForTimeout(1000)
await page.click('text=To battle!'); await page.waitForTimeout(300)
await page.click('text=The Grassy Front'); await page.waitForTimeout(500)
await page.evaluate(() => setInterval(() => {
  const g = window.__game; if (!g) return
  const c = document.querySelector('.card'); if (c) c.click()
  if (g.mewCharge >= 1) g.mew()
  const t = performance.now() / 1000
  g.keys = { a: Math.cos(t * 0.5) < -0.3, d: Math.cos(t * 0.5) > 0.3, w: Math.sin(t * 0.5) < -0.3, s: Math.sin(t * 0.5) > 0.3 }
}, 100))
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(10000)
  const r = await page.evaluate(() => { const g = window.__game; return g ? { t: Math.round(g.t), hp: Math.round(g.p.hp), lv: g.level, kills: g.kills, alive: g.enemies.length, boss: g.boss && Math.round(g.boss.hp), w: JSON.stringify(g.weapons) } : null })
  console.log(JSON.stringify(r))
  if (!r) break
}
console.log(await page.evaluate(() => document.querySelector('.res-title')?.textContent))
await b.close()
