---
name: de-sloppify
description: >
  Systematic cleanup checklist — dead code, unnecessary abstractions,
  unused dependencies. Use when: "clean up", "de-sloppify", "remove dead
  code", "simplify this file".
---

# De-Sloppify

## Checklist

Work through these in order — earlier items are cheaper to check and often reveal the later ones.

### 1. Unused Exports

`Grep` every export in the target file/folder for usages elsewhere. Zero usages outside its own file (and it's not an intentional `shared/` public surface) → remove it.

### 2. Unused Dependencies

Check `package.json` against actual imports (`Grep` for the package name across `src/`). A dependency installed for an experiment that didn't pan out is dead weight in the bundle and the vulnerability surface (`rules/security.md`).

```bash
pnpm exec depcheck   # if installed; otherwise grep package.json deps against src/ imports manually
```

### 3. Speculative Abstractions

Per `rules/priorities.md`, simplicity outranks "looks more architectural." Look for:
- A Context provider with exactly one consumer → inline it as local state (`skills/state-management`).
- A `useMemo`/`useCallback`/`React.memo` with no comment explaining what measurement justified it → remove unless one is added, per `knowledge/common-antipatterns.md`.
- A generic `<T>` helper used in exactly one place → un-genericize it back to the concrete case.
- An interface with exactly one implementation and no plan for a second → collapse it.

### 4. Dead CSS

Classes defined but never referenced in any `.tsx`. `Grep` the class name across `src/` before deleting — CSS Modules/plain class strings don't always show up in an IDE's "find usages."

### 5. Commented-Out Code

Delete it. Git history is the record of what used to be there — a comment block isn't a safer place to keep it, just a noisier one.

### 6. Stale TODOs

A `// TODO` with no ticket/context and no sign of being acted on in months is either worth doing now or worth deleting. A growing pile of ignored TODOs isn't a task list, it's noise.

## Process

1. Confirm scope with the user if it's not obvious ("clean up this file" vs. "clean up the whole app").
2. Work the checklist above.
3. **Don't fix unrelated things you notice along the way** — per this project's Surgical Changes standard, note them instead of drive-by-fixing (mention them at the end, don't silently expand scope).
4. Run `pnpm exec tsc --noEmit` after removals — an export can be part of another module's public surface even with no obvious usage in a quick grep.
5. Run the test suite — deleted code with no test coverage doesn't announce itself as broken; a removal that changes behavior should fail a test if one exists.

## Anti-pattern: Refactoring Instead of Removing

```
# BAD — "cleaning up" by redesigning the whole module
"While removing this unused function, I also restructured the file into
three smaller modules and renamed everything for consistency."

# GOOD — remove what's actually dead, nothing else
"Removed calculateLegacyOdds (zero usages, superseded by resolveOpposedRoll
in the same file three months ago per git log). No other changes."
```

## Related

- `code-review` — often the trigger for a de-sloppify pass
- `build-fix` — if cleanup surfaces a type error, that's a separate concern to hand off
