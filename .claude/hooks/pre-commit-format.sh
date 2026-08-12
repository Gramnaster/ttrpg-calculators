#!/usr/bin/env bash
# Pre-commit hook: verify code formatting
# Runs Prettier in check mode — fails if any files need formatting.

set -uo pipefail

echo "Checking code formatting..."

if npx --no-install prettier --check . 2>/dev/null; then
    echo "Format check passed."
else
    echo "Format check failed. Run 'npx prettier --write .' to fix formatting issues."
    exit 1
fi
