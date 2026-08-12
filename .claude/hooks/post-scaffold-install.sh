#!/usr/bin/env bash
# Post-scaffold hook: run npm install after package.json changes
# Triggered when package.json is created or modified.
#
# Usage:
#   Called automatically by Claude Code PostToolUse hook after Edit/Write.
#   Accepts file path via:
#     1. First argument ($1)
#     2. CLAUDE_EDITED_FILE env var
#     3. PostToolUse stdin JSON ({"tool_input":{"file_path":"..."}})
#   When called with no input (manual use), install runs unconditionally.

set -uo pipefail

FILE="${1:-${CLAUDE_EDITED_FILE:-}}"

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

# If we have a file path, only install for package.json
if [[ -n "$FILE" ]]; then
    FILE="${FILE//\\//}"
    case "$FILE" in
        */package.json|package.json) ;;
        *) exit 0 ;;
    esac
fi

echo "package.json changed. Running npm install..."

if npm install --silent 2>/dev/null; then
    echo "Install completed."
else
    echo "Warning: npm install failed. You may need to install manually."
fi
