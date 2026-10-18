# Deploying an app in idea-lab

Every app at `apps/<slug>/` goes live at **https://bobby-coleman.github.io/idea-lab/<slug>/**,
and the launcher at **https://bobby-coleman.github.io/idea-lab/** lists them all.
Bobby never has to merge anything: pushing your own branch is enough.

## One-time setup for your branch

Merge the hosting branch into your branch once, then push:

```sh
git fetch origin claude/idea-lab-hosting-uq6946
git merge --no-edit --allow-unrelated-histories origin/claude/idea-lab-hosting-uq6946
git push -u origin <your-branch>
```

This adds `.github/workflows/deploy.yml` and `hosting/` to your branch. Don't edit either one
(the workflow always runs the hosting branch's latest copy of the script anyway). If they
change later you don't need to merge again.

## After that, every push deploys

- A push to your branch starts the **Deploy apps** workflow. Your app is live about 2 to 4
  minutes later (install + build + GitHub Pages publish).
- Without the one-time merge your app still goes live, but only when a scheduled run
  picks it up (every 10 to 20 minutes, sometimes slower).
- The version that goes live is the **most recent commit, on any branch, that changed
  `apps/<slug>/`**. So only ever commit inside your own `apps/<slug>/` folder. If your branch
  happens to contain another app's folder (for example because it started from another
  branch), leave it untouched, or your stale copy would replace theirs.
- Only apps whose folder changed get rebuilt.

## What your app folder must have

- `apps/<slug>/package.json` with a `build` script, and `package-lock.json` committed
  (the build runs `npm ci`, then `npm run build` on Node 22).
- The build writes to `apps/<slug>/dist/` with an `index.html` in it.
- Relative paths everywhere: Vite `base: './'`, hash routing, manifest `start_url: "./"` and
  `scope: "./"`, service worker registered as `./sw.js`. Nothing may start with `/`, because
  the app is served from `/idea-lab/<slug>/`.
- For the launcher tile and listing, the built `index.html` should have
  `<meta name="apple-mobile-web-app-title" content="Short name">`,
  `<link rel="apple-touch-icon" href="./...png">`, and a `<link rel="manifest">` whose manifest
  has `name`, `description` and `theme_color`. The launcher falls back to the manifest icons,
  then the `<title>`, if those are missing.
- Don't add a `.github/` folder or anything outside `apps/<slug>/`.

## Checking a deploy

- Open your URL above. The launcher's "Recently updated" list shows when each app last went live.
- https://bobby-coleman.github.io/idea-lab/apps.json lists each app's deployed commit and branch.
- Each workflow run has a summary table (app, branch, commit, state). Use the GitHub MCP
  `actions_list` / `get_job_logs` tools on `Bobby-Coleman/idea-lab` to read it.
- **If your build fails**, the run goes red, the full build log is in the run's output under
  your slug, and the previous version of your app stays live (the launcher shows a red dot
  on its icon). The same broken commit is not retried; push a fix and it builds again.
- To force a rebuild of everything, run the workflow manually with "Rebuild every app".

## On Bobby's phone

Home-screen apps update through their service worker. After a deploy, Bobby may need to open
the app, close it fully, and open it again to see the new version. Make your service worker
take over promptly (`skipWaiting` + `clients.claim`, or vite-plugin-pwa `registerType: 'autoUpdate'`).
