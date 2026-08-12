#!/usr/bin/env bash
# Post-test hook: analyze Vitest output and print an actionable summary
#
# Usage: pipe vitest output or pass a log file as argument.
#   pnpm test 2>&1 | bash hooks/post-test-analyze.sh
#   bash hooks/post-test-analyze.sh <test-output.log>

set -uo pipefail

LOG_FILE="${1:-}"
TEST_OUTPUT=""

if [[ -n "$LOG_FILE" && -f "$LOG_FILE" ]]; then
    TEST_OUTPUT=$(cat "$LOG_FILE")
else
    if [[ ! -t 0 ]]; then
        TEST_OUTPUT=$(cat)
    else
        echo "Usage: pnpm test 2>&1 | bash hooks/post-test-analyze.sh"
        echo "   or: bash hooks/post-test-analyze.sh <test-output.log>"
        exit 0
    fi
fi

# Vitest's default reporter prints a summary line like:
#   Tests  3 failed | 12 passed (15)
# or, all passing:
#   Tests  15 passed (15)
SUMMARY_LINE=$(printf '%s\n' "$TEST_OUTPUT" | grep -E '^\s*Tests\s' | tail -1)

FAILED=$(printf '%s' "$SUMMARY_LINE" | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
PASSED=$(printf '%s' "$SUMMARY_LINE" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0)
SKIPPED=$(printf '%s' "$SUMMARY_LINE" | grep -oE '[0-9]+ skipped' | grep -oE '[0-9]+' || echo 0)

FAILED="${FAILED:-0}"
PASSED="${PASSED:-0}"
SKIPPED="${SKIPPED:-0}"

# Extract failure details — vitest prints "FAIL  <file> > <test name>" per failure
FAILURES=$(printf '%s\n' "$TEST_OUTPUT" | grep '^\s*FAIL' 2>/dev/null || true)

echo ""
echo "═══════════════════════════════════"
echo "  Test Results Summary"
echo "═══════════════════════════════════"
echo ""

if [[ "$FAILED" -gt 0 ]]; then
    echo "  🔴 FAILED: $FAILED"
    echo "  ✅ Passed: $PASSED"
    echo "  ⏭️  Skipped: $SKIPPED"
    echo ""
    echo "  Failed Tests:"
    echo "  ─────────────"
    echo "$FAILURES" | head -50
    echo ""
    echo "  Next Steps:"
    echo "  1. Fix the failing tests above"
    echo "  2. Run 'pnpm test' to verify fixes"
    echo "  3. If it's a logic bug (not a test bug), check rules/error-handling.md"
    echo "     for how the calculator should represent the failing case"
else
    echo "  ✅ All $PASSED test(s) passed"
    if [[ "$SKIPPED" -gt 0 ]]; then
        echo "  ⏭️  $SKIPPED test(s) skipped"
    fi
fi

echo ""
echo "═══════════════════════════════════"
