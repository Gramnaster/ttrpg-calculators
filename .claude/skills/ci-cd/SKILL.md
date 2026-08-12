---
name: ci-cd
description: >
  GitHub Actions workflow for lint + typecheck + test + build + deploy to
  GitHub Pages via actions/deploy-pages, PR-gated CI, CodeQL security
  scanning, Dependabot, and the Vite base-path configuration project sites
  need. Use when: "CI", "GitHub Actions", "deploy", "GitHub Pages",
  "pipeline", "CodeQL", "Dependabot", "security scanning".
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

`deploy.yml` does double duty: it's the PR-gated CI check (lint + typecheck + test + build, required before merge) *and* the deploy pipeline. The `build` job runs on every push to `main` and every pull request targeting `main`; the `deploy` job only runs on the `push` event, so PRs get full verification without ever publishing.

```yaml
# .github/workflows/deploy.yml
name: CI / Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
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
      - uses: pnpm/setup@c9883cc79df532ad1a7b81bf9ab944ceb090d65c # v2.0.0
        with:
          runtime: node@22
          cache: true
      - run: pnpm exec tsc --noEmit
      - run: pnpm exec eslint .
      - run: pnpm exec vitest run
      - run: pnpm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    if: github.event_name == 'push'
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
- **`deploy`'s `if: github.event_name == 'push'`** is what keeps a PR from ever reaching the Pages environment — `pull_request` events skip straight past it once `build` succeeds. For real merge-blocking, also mark the `build` job as a required status check (Settings → Branches → branch protection rule for `main`) — the workflow running isn't the same as it being enforced.

## Security Scanning — CodeQL

```yaml
# .github/workflows/codeql.yml
name: "CodeQL"

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "30 3 * * 1" # weekly — catches newly-disclosed CVEs in unchanged code

jobs:
  analyze:
    name: Analyze (javascript-typescript)
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v4
        with:
          languages: javascript-typescript
          queries: security-extended
      - uses: github/codeql-action/analyze@v4
        with:
          category: "/language:javascript-typescript"
```

- `javascript-typescript` covers both `.ts`/`.tsx` in one pass — no separate language entries needed.
- Build mode is implicitly `none` for this language — CodeQL extracts JS/TS without compiling it, so no `pnpm install`/build step is needed before `analyze`.
- Findings land under the repo's **Security → Code scanning** tab, not as a build failure by default — `security-events: write` is what lets the action upload SARIF results there.
- Free for public repos (Actions-based CodeQL); a private repo needs GitHub Advanced Security. This app is intended to stay public (`CLAUDE.md`), so this is a non-issue unless that changes.

## Dependency Updates — Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm" # covers pnpm-lock.yaml — no separate "pnpm" ecosystem value exists
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
    open-pull-requests-limit: 10

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

- Two ecosystems: `npm` for the JS dependency tree (Dependabot auto-detects `pnpm-lock.yaml` under this value — pnpm has no dedicated ecosystem name) and `github-actions` for the pinned Action versions/SHAs in `deploy.yml` and `codeql.yml` themselves.
- Routine minor/patch bumps are grouped into a single weekly PR to cut review noise for a solo maintainer; major-version bumps are left ungrouped so each gets its own PR and changelog read, per `rules/packages.md`.
- This is separate from **Dependabot alerts** (vulnerability notifications) and **Dependabot security updates** (auto-PRs for CVEs) — those are repo Settings → Code security toggles, not config in this file, and are typically on by default for public repos. Verify in Settings if unsure; this skill can't flip them (no `gh` CLI available in this environment as of this writing).

## Verification, Not Just a Green Checkmark

Per [ADR-003](../../knowledge/decisions/003-vitest-testing-stack.md), this app has no automated E2E test of the deployed artifact. After a deploy, actually open the live Pages URL and confirm:

- The page renders (not a blank screen — the `base` path symptom above)
- Calculator navigation works (routes resolve correctly under the Pages subpath)
- No 404s in the browser console for any asset

## Local Equivalent

Before pushing, the same checks the CI job runs:

```bash
pnpm run build && pnpm run preview
# open the printed localhost URL and click through
```

## Related

- `rules/git-workflow.md` — PRs should pass this pipeline before merge
- `rules/security.md` — why CodeQL and Dependabot are the right amount of security automation for a backend-less app
- `devops-engineer` agent — owns this workflow's design and troubleshooting
- `outdated` — periodic dependency/Node-version audit, complementary to this pipeline and to Dependabot's automated version-update PRs
