#!/usr/bin/env bash
# Post-edit hook: auto-format changed TS/TSX/CSS files
# Runs Prettier (and ESLint --fix) on edited files after Claude edits them.
#
# Usage:
#   Called automatically by Claude Code PostToolUse hook after Edit/Write.
#   Accepts file path via:
#     1. First argument ($1)
#     2. CLAUDE_EDITED_FILE env var
#     3. PostToolUse stdin JSON ({"tool_input":{"file_path":"..."}})

set -uo pipefail

FILE="${1:-${CLAUDE_EDITED_FILE:-}}"

# Fallback: parse file_path from PostToolUse stdin JSON. Prefer jq (handles JSON
# escapes like \\ in Windows paths correctly); fall back to a sed extraction.
if [[ -z "$FILE" ]] && [[ ! -t 0 ]]; then
    STDIN=$(cat)
    if command -v jq >/dev/null 2>&1; then
        FILE=$(printf '%s' "$STDIN" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || true
    fi
    if [[ -z "$FILE" ]]; then
        FILE=$(printf '%s' "$STDIN" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1) || true
        FILE="${FILE//\\\\/\\}"
    fi
fi

[[ -z "$FILE" ]] && exit 0

# Normalize Windows backslash paths so the directory walk below works under Git Bash
FILE="${FILE//\\//}"

# Only format files Prettier/ESLint understand
case "$FILE" in
    *.ts|*.tsx|*.js|*.jsx|*.css|*.json|*.md) ;;
    *) exit 0 ;;
esac

[[ ! -f "$FILE" ]] && exit 0

# Find the nearest package.json to confirm we're inside a Node project before
# invoking npx (avoids npx trying to fetch prettier in a non-JS directory).
DIR=$(dirname "$FILE")
PROJECT_ROOT=""
while [[ "$DIR" != "/" && "$DIR" != "." ]]; do
    if [[ -f "$DIR/package.json" ]]; then
        PROJECT_ROOT="$DIR"
        break
    fi
    PARENT=$(dirname "$DIR")
    [[ "$PARENT" == "$DIR" ]] && break
    DIR="$PARENT"
done

if [[ -z "$PROJECT_ROOT" ]]; then
    echo "No package.json found for $FILE, skipping format"
    exit 0
fi

npx --no-install prettier --write "$FILE" 2>/dev/null || true

case "$FILE" in
    *.ts|*.tsx|*.js|*.jsx) npx --no-install eslint --fix "$FILE" 2>/dev/null || true ;;
esac

exit 0
