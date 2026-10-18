// Assembles the GitHub Pages site on the gh-pages branch.
//
// Every app lives in apps/<slug>/ on some branch. For each slug we take the
// most recent commit (across all remote branches) that touched that folder,
// build it with `npm run build`, and copy its dist/ to <slug>/ on gh-pages.
// Apps whose folder hasn't changed since the last deploy are not rebuilt, and
// a failed build leaves the previously published version in place.
// Then the launcher (index.html) is regenerated from what's published.

import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const HERE = path.dirname(new URL(import.meta.url).pathname)
const REPO = process.cwd()
const TMP = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'deploy-'))
const SITE = path.join(TMP, 'site')
const REBUILD_ALL = process.env.REBUILD_ALL === 'true'
const BUILD_TIMEOUT_MS = 10 * 60 * 1000
const PARALLEL = 3

const git = (...args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const tryGit = (...args) => { try { return git(...args) } catch { return null } }
const log = (...a) => console.log('[deploy]', ...a)

// ---- 1. Find every app and the commit that last touched it -----------------

const refs = git('for-each-ref', '--format=%(refname)', 'refs/remotes/origin')
  .split('\n')
  .filter((r) => r && !r.endsWith('/HEAD') && !r.endsWith('/gh-pages'))

const slugs = new Set()
for (const ref of refs) {
  const out = tryGit('ls-tree', '-d', '--name-only', `${ref}:apps`)
  if (!out) continue
  for (const slug of out.split('\n')) {
    if (/^[a-z0-9][a-z0-9-]*$/.test(slug) && tryGit('cat-file', '-e', `${ref}:apps/${slug}/package.json`) !== null) {
      slugs.add(slug)
    }
  }
}

const apps = []
for (const slug of [...slugs].sort()) {
  const [commit, time] = git('log', '-1', '--format=%H %ct', ...refs, '--', `apps/${slug}`).split(' ')
  const tree = tryGit('rev-parse', `${commit}:apps/${slug}`)
  if (!tree) { log(`${slug}: removed in its latest commit, leaving the published copy alone`); continue }
  const branch = git('for-each-ref', '--contains', commit, '--format=%(refname:lstrip=3)', ...refs).split('\n')[0]
  apps.push({ slug, commit, tree, branch, time: Number(time) })
}
log('apps found:', apps.map((a) => `${a.slug}@${a.branch}:${a.commit.slice(0, 7)}`).join(', ') || 'none')

// ---- 2. Check out gh-pages -------------------------------------------------

if (tryGit('rev-parse', '--verify', 'refs/remotes/origin/gh-pages')) {
  git('worktree', 'add', '--detach', SITE, 'origin/gh-pages')
} else {
  git('worktree', 'add', '--detach', SITE, refs[0])
  execFileSync('git', ['checkout', '--orphan', 'gh-pages-new'], { cwd: SITE })
  execFileSync('git', ['rm', '-rfq', '.'], { cwd: SITE })
}
const META_FILE = path.join(SITE, 'apps.json')
const meta = fs.existsSync(META_FILE) ? JSON.parse(fs.readFileSync(META_FILE, 'utf8')) : {}

// ---- 3. Build what changed -------------------------------------------------

function run(cmd, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env: { ...process.env, CI: 'true' } })
    let out = ''
    const add = (d) => { out += d; if (out.length > 200000) out = out.slice(-100000) }
    child.stdout.on('data', add)
    child.stderr.on('data', add)
    const timer = setTimeout(() => { add('\n[timed out]\n'); child.kill('SIGKILL') }, BUILD_TIMEOUT_MS)
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, out }) })
  })
}

async function build(app) {
  const work = path.join(TMP, 'src', app.slug)
  fs.mkdirSync(work, { recursive: true })
  execFileSync('sh', ['-c', `git archive ${app.commit} apps/${app.slug} | tar -x -C "${work}"`], { cwd: REPO })
  const dir = path.join(work, 'apps', app.slug)
  const hasLock = fs.existsSync(path.join(dir, 'package-lock.json'))
  let r = await run('npm', [hasLock ? 'ci' : 'install', '--no-audit', '--no-fund'], dir)
  if (r.code === 0) r = await run('npm', ['run', 'build'], dir)
  const dist = path.join(dir, 'dist')
  if (r.code === 0 && !fs.existsSync(path.join(dist, 'index.html'))) r = { code: 1, out: r.out + '\nBuild finished but dist/index.html is missing.' }
  return { ...r, dist }
}

function readInfo(slug) {
  const dir = path.join(SITE, slug)
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
  const attr = (re) => (html.match(re) || [])[1]
  const linkHref = (rel) => attr(new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)`, 'i')) ||
    attr(new RegExp(`<link[^>]*href=["']([^"']+)["'][^>]*rel=["']${rel}["']`, 'i'))
  const metaContent = (name) => attr(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)`, 'i'))
  let manifest = {}
  let manifestBase = '.'
  const mHref = linkHref('manifest')
  if (mHref && !/^https?:/.test(mHref)) {
    try {
      manifest = JSON.parse(fs.readFileSync(path.join(dir, mHref), 'utf8'))
      manifestBase = path.posix.dirname(mHref)
    } catch {}
  }
  let icon = linkHref('apple-touch-icon')
  if (!icon && manifest.icons?.length) {
    const best = [...manifest.icons].filter((i) => i.purpose !== 'maskable').sort((a, b) => parseInt(b.sizes) - parseInt(a.sizes))[0] || manifest.icons[0]
    icon = path.posix.join(manifestBase, best.src)
  }
  if (!icon) icon = linkHref('icon')
  const clean = (p) => p && !/^https?:|^data:/.test(p) ? path.posix.normalize(`${slug}/${p}`) : p
  return {
    name: metaContent('apple-mobile-web-app-title') || manifest.short_name || manifest.name || attr(/<title>([^<]*)<\/title>/i) || slug,
    title: manifest.name || attr(/<title>([^<]*)<\/title>/i) || slug,
    description: manifest.description || metaContent('description') || '',
    color: manifest.theme_color || metaContent('theme-color') || '#888888',
    icon: clean(icon),
  }
}

const queue = apps.filter((a) => {
  const m = meta[a.slug]
  if (REBUILD_ALL) return true
  if (m?.tree === a.tree && fs.existsSync(path.join(SITE, a.slug, 'index.html'))) return false
  if (m?.failedTree === a.tree) { log(`${a.slug}: same source as the last failed build, skipping`); return false }
  return true
})
log('to build:', queue.map((a) => a.slug).join(', ') || 'nothing')

const built = []
const failed = []
async function worker() {
  for (let app; (app = queue.shift());) {
    log(`${app.slug}: building ${app.branch}@${app.commit.slice(0, 7)}`)
    const r = await build(app)
    if (r.code !== 0) {
      failed.push(app.slug)
      console.log(`::group::${app.slug} build log (failed)\n${r.out}\n::endgroup::`)
      console.log(`::error title=${app.slug} build failed::${app.slug} on ${app.branch} (${app.commit.slice(0, 7)}) failed to build; the previous version stays live.`)
      meta[app.slug] = { ...meta[app.slug], slug: app.slug, failedTree: app.tree, failedCommit: app.commit, failedBranch: app.branch, failedAt: new Date().toISOString(), error: r.out.slice(-3000) }
      continue
    }
    const out = path.join(SITE, app.slug)
    fs.rmSync(out, { recursive: true, force: true })
    fs.cpSync(r.dist, out, { recursive: true })
    built.push(app.slug)
    meta[app.slug] = { slug: app.slug, tree: app.tree, commit: app.commit, branch: app.branch, committedAt: new Date(app.time * 1000).toISOString(), deployedAt: new Date().toISOString(), ...readInfo(app.slug) }
    log(`${app.slug}: published`)
  }
}
await Promise.all(Array.from({ length: PARALLEL }, worker))

// ---- 4. Launcher and commit ------------------------------------------------

const live = Object.values(meta).filter((m) => m.tree && fs.existsSync(path.join(SITE, m.slug, 'index.html')))
  .sort((a, b) => a.name.localeCompare(b.name))
const pending = apps.filter((a) => !live.some((m) => m.slug === a.slug)).map((a) => ({ slug: a.slug, name: a.slug, failed: meta[a.slug]?.failedTree === a.tree }))
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const tiles = [
  ...live.map((m) => `<a class="app" href="./${esc(m.slug)}/" style="--c:${esc(m.color)}">
      <span class="icon">${m.icon ? `<img src="./${esc(m.icon)}" alt="" loading="lazy">` : esc(m.name.slice(0, 1))}${m.failedTree && m.failedTree !== m.tree ? '<i class="dot" title="Latest change failed to build"></i>' : ''}</span>
      <span class="name">${esc(m.name)}</span>
    </a>`),
  ...pending.map((p) => `<div class="app soon">
      <span class="icon">${p.failed ? '!' : '…'}</span>
      <span class="name">${esc(p.name)}</span>
    </div>`),
].join('\n    ')

const rows = live.map((m) => `<li><a href="./${esc(m.slug)}/"><b>${esc(m.title)}</b><span>${esc(m.description)}</span></a><time datetime="${esc(m.deployedAt)}">${esc(m.deployedAt)}</time></li>`).join('\n      ')

const template = fs.readFileSync(path.join(HERE, 'launcher.html'), 'utf8')
fs.writeFileSync(path.join(SITE, 'index.html'), template.replace('<!--TILES-->', tiles).replace('<!--ROWS-->', rows).replace('<!--COUNT-->', String(live.length)))
fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2) + '\n')
fs.writeFileSync(path.join(SITE, '.nojekyll'), '')
fs.cpSync(path.join(HERE, 'public'), SITE, { recursive: true })

const sh = (cmd) => execFileSync('sh', ['-c', cmd], { cwd: SITE, encoding: 'utf8' }).trim()
sh('git add -A')
if (!sh('git status --porcelain')) {
  log('nothing changed')
} else {
  const msg = `Deploy ${built.length ? built.join(', ') : 'launcher'}${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`
  execFileSync('git', ['commit', '-qm', msg], { cwd: SITE })
  if (process.env.DRY_RUN) log(`dry run, not pushing (${msg}); site is at ${SITE}`)
  else {
    execFileSync('git', ['push', '-q', 'origin', 'HEAD:refs/heads/gh-pages'], { cwd: SITE, stdio: 'inherit' })
    log('pushed:', msg)
  }
}

const summary = [
  '## Deploy',
  '',
  '| App | Branch | Commit | State |',
  '|---|---|---|---|',
  ...apps.map((a) => `| [${a.slug}](https://${(process.env.GITHUB_REPOSITORY_OWNER || '').toLowerCase()}.github.io/${(process.env.GITHUB_REPOSITORY || '/').split('/')[1]}/${a.slug}/) | ${a.branch} | ${a.commit.slice(0, 7)} | ${built.includes(a.slug) ? 'published' : failed.includes(a.slug) ? '**build failed** (old version still live)' : 'unchanged'} |`),
].join('\n')
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n')
console.log(summary)
if (!process.env.DRY_RUN) git('worktree', 'remove', '--force', SITE)
if (failed.length) process.exitCode = 1
