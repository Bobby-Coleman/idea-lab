// Contact sheet: node scripts/sheet.mjs <dir> <out.png> name1 name2 ...
import { chromium } from 'playwright'
import fs from 'node:fs'
const [dir, out, ...names] = process.argv.slice(2)
const imgs = names.map((n) => `<img src="data:image/png;base64,${fs.readFileSync(`${dir}/${n}.png`).toString('base64')}"><span>${n}</span>`)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393 * names.length / 2 + 20 * names.length, height: 900 } })
await p.setContent(`<body style="margin:0;background:#888;display:flex;gap:16px;padding:10px;font:14px sans-serif">${imgs.map((i) => `<div style="display:flex;flex-direction:column;width:393px">${i.replace('<img', '<img style="width:393px"')}</div>`).join('')}</body>`)
await p.screenshot({ path: out, fullPage: true })
await b.close()
