---
name: readme
description: >
  Writes and updates README.md under ASD-STE100 controlled-language rules.
  Use when: "update the readme", "write a readme", "readme skill",
  "document the project".
---

# /readme — Write and Update README.md

## What

This skill sets the writing standard for `README.md` and applies it on every update. It does not cover `.claude/rules/*.md`, ADRs, or code comments — those keep their own conventions.

## When

- "Update the readme"
- "Write a readme"
- A new calculator ships and the calculator list in `README.md` goes stale
- A dev command, a stack version, or the deployment target changes

## Primary Standard: ASD-STE100

ASD-STE100 (Simplified Technical English) governs every sentence in `README.md`. Reference: [ASD-STE100 official site](https://www.asd-ste100.org/).

Core rules from the standard, applied here:

- One instruction or one fact per sentence.
- Active voice. Name the actor: "Run `pnpm install`", not "Dependencies are installed."
- Present tense for facts about the project; imperative mood for steps the reader performs.
- A maximum of 20 words per instruction sentence, 25 for a description sentence.
- One approved term per concept, used every time it recurs (see "Avoid: synonym rotation" below).

## Avoid

- **Synonym rotation.** Pick one word per concept and repeat it. Do not vary "calculator" with "tool" or "utility", or "run" with "execute" or "invoke", across the document.
- **Hedging.** Cut "should", "may", "could", "typically", "generally", "in most cases". State the fact or the step directly. "The build fails if `tsc` reports an error", not "The build may fail if there are type errors."
- **Frozen verbs.** Replace a nominalized-verb-plus-weak-verb pair with the direct verb. "Install the dependencies", not "Perform an installation of the dependencies". "Build the project", not "Run a build of the project."
- **Marketing adjectives.** Cut "powerful", "seamless", "robust", "intuitive", "modern", "blazing fast", "beautiful". State the observable behavior instead: not "a seamless dev experience" but "`pnpm dev` starts a local server with hot reload."
- **Run-ons.** One fact per sentence. Split any sentence joined by "and", "which", or a semicolon if it reports more than one fact. "The build runs `tsc -b` and `vite build`" stays as one sentence only because it is one step with two named commands, not two separate facts.
- **Phrasal verbs.** Use the single-word verb where one exists. "Start the dev server", not "Spin up the dev server". "Remove the file", not "Get rid of the file". "Continue", not "Carry on".

## How

1. Read the current `README.md`, `package.json` (scripts, dependencies), and `src/calculators/*/` (`Glob`) before writing — state only what the project actually does, never a planned or aspirational feature.
2. Draft or update the affected section only. A calculator addition touches the calculator list and, if a new dev command was added, the commands table — it does not require rewriting the whole file.
3. Read every changed sentence against the "Avoid" list above before finishing. Rewrite any sentence that fails one of the six checks.
4. Confirm every command shown (`pnpm install`, `pnpm dev`, `pnpm test`, etc.) matches an actual `package.json` script — don't invent a command name.

## Related

- `rules/git-workflow.md` — commit `README.md` changes with `docs:`
- `project-structure` — the folder shape a README's structure section should describe
