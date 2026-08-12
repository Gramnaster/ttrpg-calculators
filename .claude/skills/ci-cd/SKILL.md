---
name: ci-cd
description: >
  GitHub Actions workflow for lint + typecheck + test + build + deploy to
  GitHub Pages via actions/deploy-pages, and the Vite base-path
  configuration project sites need. Use when: "CI", "GitHub Actions",
  "deploy", "GitHub Pages", "pipeline".
---

# CI/CD — GitHub Actions + GitHub Pages

`Plans.txt` requires this app be "Deployable on Github Pages." This skill covers the verified, current (as of this kit's writing — re-check `docs.github.com` before relying on this for a new setup) official approach: GitHub Actions building the Vite app and publishing via `actions/upload-pages-artifact` + `actions/deploy-pages`, not the older `gh-pages` branch + npm-package approach.

## The Vite `base` Path Gotcha

This is the single most common reason a correctly-built Vite app shows a blank page (with 404s on every JS/CSS asset) once deployed to GitHub Pages.

- **Project site** (`https://<user>.github.io/<repo-name>/`): `vite.config.ts` needs `base: "/<repo-name>/"`.
- **User/org site** (`https://<user>.github.io/`, i.e. the repo is literally named `<user>.github.io`): `base: "/"` (the default — no change needed).

```ts
// vite.config.ts
export default defineConfig({
  base: "/TTRPGCalculators/", // match the actual repo name once it's created
  plugins: [react()],
});
```

Confirm the actual repo name before hardcoding this — don't assume it matches the local folder name.

## Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
      - run: npx vitest run
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Key points, verified against current GitHub docs rather than assumed:

- `permissions: pages: write` and `id-token: write` are required — without them the deploy job fails on a permissions error, not a build error.
- The `github-pages` deployment `environment` is auto-created by GitHub the first time this runs; GitHub recommends restricting it to the default branch (Settings → Environments → `github-pages` → protection rules).
- `actions/upload-pages-artifact` uploads the build output as an artifact; `actions/deploy-pages` (a separate job, `needs: build`) publishes it. Splitting into two jobs means a failed deploy step doesn't re-run the whole build.
- **Repo setting**: Settings → Pages → Source must be set to "GitHub Actions" (not "Deploy from a branch") for this workflow to have anywhere to publish to.

## Verification, Not Just a Green Checkmark

Per [ADR-003](../../knowledge/decisions/003-vitest-testing-stack.md), this app has no automated E2E test of the deployed artifact. After a deploy, actually open the live Pages URL and confirm:

- The page renders (not a blank screen — the `base` path symptom above)
- Calculator navigation works (routes resolve correctly under the Pages subpath)
- No 404s in the browser console for any asset

## Local Equivalent

Before pushing, the same checks the CI job runs:

```bash
npm run build && npm run preview
# open the printed localhost URL and click through
```

## Related

- `rules/git-workflow.md` — PRs should pass this pipeline before merge
- `devops-engineer` agent — owns this workflow's design and troubleshooting
- `outdated` — periodic dependency/Node-version audit, complementary to this pipeline
