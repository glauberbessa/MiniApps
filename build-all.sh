#!/bin/bash
set -e  # Para na primeira falha

# Garantir que estamos no diretório correto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Building MiniApps Monorepo ==="
echo "Working directory: $(pwd)"

# Build app principal
echo "Building main launcher app..."
npm run build

# Build YTPlaylistManagerProWeb
echo "Building YTPlaylistManagerProWeb..."
cd "$SCRIPT_DIR/YTPlaylistManagerProWeb"
npm install
npm run build

# Build ScanQRCodeBar
echo "Building ScanQRCodeBar..."
cd "$SCRIPT_DIR/ScanQRCodeBar"
npm install
npm run build

echo "=== All builds completed successfully ==="
