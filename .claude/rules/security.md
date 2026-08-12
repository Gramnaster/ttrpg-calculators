---
alwaysApply: true
description: >
  Enforces the security practices that still apply to a public, no-backend,
  no-auth static site — XSS avoidance, dependency hygiene, no secrets.
---

# Security Rules

This app has no backend, no auth, no user accounts, and no persisted user data — most of the OWASP Top 10 (SQL injection, broken auth, session management) doesn't apply. What's left is real, though: this is a public GitHub Pages site, and the client-side surface still has failure modes.

## No Secrets in a Public Repo

- **This repo is (or will be) public on GitHub Pages — nothing goes in it that isn't meant to be public.** No API keys, no tokens, even for services that seem harmless. A static calculator app has no legitimate reason to need a secret; if a future feature seems to need one, that's a signal it needs a backend, not a `.env` file bundled into a client build (Vite's `import.meta.env.VITE_*` variables are **inlined into the public bundle** — never put a secret behind that prefix).

## XSS

- **No `dangerouslySetInnerHTML`** unless rendering content that's both static (authored in this repo, not user input) and has no reason to ever contain markup. React's default JSX escaping is the safety net — don't opt out of it.
- **Calculator inputs are numbers/simple strings rendered as text**, never interpreted as markup or executed. There's no rich-text or user-generated-content surface in this app; keep it that way rather than adding one that then needs sanitization.

## Dependency Hygiene

- **Run `pnpm audit` periodically** (see `skills/outdated`) and address high/critical findings. A dependency vulnerability in a client-only bundle is still shipped to every visitor.
- **Don't add a dependency for something a few lines of code can do** (see `rules/performance.md`'s bundle-budget guidance) — fewer dependencies means a smaller vulnerability surface, not just a smaller bundle.
- **Dependabot (`.github/dependabot.yml`) automates the periodic check.** It opens weekly PRs for both the `npm` ecosystem (covers `pnpm-lock.yaml` — Dependabot has no separate "pnpm" ecosystem value) and `github-actions` (keeps workflow action versions current, since a pinned Action SHA can itself carry a CVE). Routine minor/patch bumps are grouped into one PR; major-version bumps stay separate so they get the changelog read `rules/packages.md` requires before merging. This supplements, not replaces, an occasional manual `pnpm audit` for immediate high/critical findings between Dependabot's weekly runs.

## Automated Security Scanning

- **CodeQL (`.github/workflows/codeql.yml`) runs static analysis for JS/TypeScript** on every push to `main`, every pull request, and weekly on a schedule (so a newly-disclosed query/CVE gets checked against unchanged code, not just new commits). It's GitHub's own semantic code scanner — catches real bug classes (unsafe regex, prototype pollution, obvious XSS sinks) that ESLint's syntactic rules don't. Findings surface under the repo's Security → Code scanning tab.
- **This requires the repo to be public** (or on a plan with GitHub Advanced Security) — CodeQL Actions-based scanning is free for public repos, billed otherwise. Confirm repo visibility before relying on this if that ever changes.

## External Links

- **`rel="noopener noreferrer"` on every `target="_blank"` link** (e.g. a link to the SRD/rules-reference source for a calculator's system). Without it, the opened page can access `window.opener` and redirect the original tab.

## Content Security

- If a future addition serves any user-supplied content (unlikely for this app, but worth stating), it goes through explicit sanitization before render — never trust-by-default.
