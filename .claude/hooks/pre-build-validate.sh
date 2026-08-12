#!/usr/bin/env bash
# Pre-build hook: validate project structure matches expected shape
# Checks that expected config files and folders exist.
#
# Usage: bash hooks/pre-build-validate.sh [project-dir]

set -uo pipefail

PROJECT_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

echo "Validating project structure..."

if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
    echo "🔴 No package.json found in $PROJECT_DIR"
    ERRORS=$((ERRORS + 1))
fi

if [[ ! -f "$PROJECT_DIR/tsconfig.json" ]]; then
    echo "⚠️  No tsconfig.json found — this project should be TypeScript-strict (rules/coding-style.md)"
    WARNINGS=$((WARNINGS + 1))
fi

if [[ ! -f "$PROJECT_DIR/vite.config.ts" ]]; then
    echo "⚠️  No vite.config.ts found"
    WARNINGS=$((WARNINGS + 1))
fi

if [[ ! -f "$PROJECT_DIR/eslint.config.js" ]]; then
    echo "⚠️  No eslint.config.js (flat config) found"
    WARNINGS=$((WARNINGS + 1))
fi

if [[ ! -d "$PROJECT_DIR/src/calculators" ]]; then
    echo "⚠️  No src/calculators/ folder — see rules/architecture.md for the expected shape"
    WARNINGS=$((WARNINGS + 1))
fi

# Soft check: every calculator folder should have at least one *.test.ts(x) file
if [[ -d "$PROJECT_DIR/src/calculators" ]]; then
    for CALC_DIR in "$PROJECT_DIR"/src/calculators/*/; do
        [[ -d "$CALC_DIR" ]] || continue
        if ! find "$CALC_DIR" -maxdepth 1 -name '*.test.ts*' -print -quit 2>/dev/null | grep -q .; then
            echo "⚠️  ${CALC_DIR} has no test file — see rules/testing.md"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
fi

if [[ ! -f "$PROJECT_DIR/.github/workflows/deploy.yml" ]] && [[ ! -d "$PROJECT_DIR/.github/workflows" ]]; then
    echo "⚠️  No GitHub Actions workflow found — see skills/ci-cd for the GH Pages deploy pipeline"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
if [[ $ERRORS -gt 0 ]]; then
    echo "🔴 $ERRORS error(s) found — fix before building"
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo "⚠️  $WARNINGS warning(s) — consider addressing these"
    exit 0
else
    echo "✓ Project structure looks good"
    exit 0
fi
