# idea-lab

Prototype apps, each an installable web app at `apps/<slug>/`.

- Launcher: https://bobby-coleman.github.io/idea-lab/
- Each app: `https://bobby-coleman.github.io/idea-lab/<slug>/`
- How deploys work, and what each app must follow: [DEPLOY.md](DEPLOY.md)

Hosting lives in `.github/workflows/deploy.yml` and `hosting/`. The workflow builds every app from
whichever branch changed it most recently and publishes the result to the `gh-pages` branch.
