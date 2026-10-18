import { chromium } from 'playwright'
import fs from 'node:fs'
const [dir, out, ...names] = process.argv.slice(2)
const imgs = names.map((n) => `<figure><img src="data:image/png;base64,${fs.readFileSync(`${dir}/${n}.png`).toString('base64')}"><figcaption>${n}</figcaption></figure>`).join('')
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 393 * names.length + 20 * names.length, height: 900 } })
await p.setContent(`<body style="margin:0;background:#444;display:flex;gap:20px;font:14px sans-serif;color:#fff">${imgs}<style>figure{margin:0}img{width:393px;display:block}</style></body>`)
await p.screenshot({ path: out, fullPage: true }); await b.close()
