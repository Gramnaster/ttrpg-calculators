#!/usr/bin/env bash
# Pre-commit hook: detect anti-patterns in staged TS/TSX/CSS files
# Runs a quick grep pass on staged files for this project's specific
# antipatterns — most importantly, layout-triggering CSS animation, which
# directly violates the "performant transformations only" requirement in
# Plans.txt (see rules/animations.md).
#
# Exit codes:
#   0 — No issues found (or no matching files staged)
#   1 — Issues found, commit blocked

set -uo pipefail

STAGED_FILES=()
while IFS= read -r FILE; do
    [[ -n "$FILE" ]] && STAGED_FILES+=("$FILE")
done < <(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|css)$' || true)

if [[ ${#STAGED_FILES[@]} -eq 0 ]]; then
    exit 0
fi

echo "Checking staged files for common issues..."

ERRORS=0

for FILE in "${STAGED_FILES[@]}"; do
    [[ ! -f "$FILE" ]] && continue

    case "$FILE" in
        *.css)
            # The flagship check for this project: transitions/animations on
            # anything other than transform/opacity force Layout or Paint on
            # every frame. See rules/animations.md.
            if grep -nE '(transition|animation)[^;{]*:\s*[^;]*\b(width|height|top|left|right|bottom|margin|padding|border-width|font-size|background-color)\b' "$FILE" 2>/dev/null; then
                echo "🔴 $FILE: animating a layout/paint property — use transform/opacity or clip-path instead (rules/animations.md)"
                ERRORS=$((ERRORS + 1))
            fi
            ;;
        *.ts|*.tsx)
            if grep -n ': any\b' "$FILE" 2>/dev/null; then
                echo "⚠️  $FILE: 'any' type used — narrow with 'unknown' or a proper type"
                ERRORS=$((ERRORS + 1))
            fi

            if grep -n 'console\.log(' "$FILE" 2>/dev/null; then
                echo "⚠️  $FILE: console.log left in — remove before committing"
                ERRORS=$((ERRORS + 1))
            fi

            if grep -n 'dangerouslySetInnerHTML' "$FILE" 2>/dev/null; then
                echo "🔴 $FILE: dangerouslySetInnerHTML used — confirm this isn't rendering untrusted content (rules/security.md)"
                ERRORS=$((ERRORS + 1))
            fi
            ;;
    esac
done

if [[ $ERRORS -gt 0 ]]; then
    echo ""
    echo "Found $ERRORS anti-pattern issue(s) in staged files."
    echo "Fix the issues above or use 'git commit --no-verify' to skip this check."
    exit 1
fi

echo "✓ No anti-patterns detected in staged files."
exit 0
