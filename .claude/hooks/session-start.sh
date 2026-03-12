#!/bin/bash
set -euo pipefail

# SessionStart hook for Claude Code on the web
# Installs Supabase CLI as a project dependency (async mode)

echo '{"async": true, "asyncTimeout": 300000}'

# Only run in remote Claude Code environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Setting up Supabase CLI for this session..."

# Check if supabase is already available globally
if command -v supabase &> /dev/null; then
  echo "✓ Supabase CLI is already available"
  supabase --version
  exit 0
fi

# Install as project dev dependency
# CLAUDE_PROJECT_DIR is set by Claude Code, default to current directory if not set
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
cd "$PROJECT_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found"
  exit 1
fi

# Check if supabase is already in devDependencies
if grep -q '"supabase"' package.json; then
  echo "Installing project dependencies..."
  npm install --legacy-peer-deps
else
  echo "Installing Supabase CLI as dev dependency..."
  npm install --save-dev --legacy-peer-deps supabase
fi

echo "✓ Supabase CLI setup complete!"
npx supabase --version
