// Fills dist/sw.js with every built file so the app works fully offline after first load.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createHash } from 'node:crypto'

const dist = new URL('../dist/', import.meta.url).pathname
const files = []
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p) })
walk(dist)
const list = ['./', ...files.map((f) => './' + relative(dist, f)).filter((f) => f !== './sw.js' && !/(cyrillic|greek|vietnamese|latin-ext).*\.woff2?$|\.woff$/.test(f))]
const hash = createHash('sha1')
files.forEach((f) => hash.update(readFileSync(f)))
const sw = readFileSync(join(dist, 'sw.js'), 'utf8')
  .replace('__VERSION__', hash.digest('hex').slice(0, 10))
  .replace('__PRECACHE__', JSON.stringify(list, null, 0))
writeFileSync(join(dist, 'sw.js'), sw)
console.log(`sw.js precaches ${list.length} files`)
