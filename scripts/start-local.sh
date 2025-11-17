#!/usr/bin/env bash
set -euo pipefail

# Usage:
#  ./scripts/start-local.sh [dev|prod]
# Default: dev (uses nodemon if available)

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
MODE=${1:-dev}

echo "Building frontend and copying to backend/public..."
cd "$REPO_ROOT"

if [ ! -d frontend ]; then
  echo "Pasta frontend não encontrada"
  exit 1
fi

echo "Installing frontend dependencies (npm ci)..."
(cd frontend && npm ci)

echo "Running frontend build..."
(cd frontend && npm run build)

echo "Copying build to backend/public..."
rm -rf backend/public
mkdir -p backend/public
cp -R frontend/dist/* backend/public/ || true

echo "Installing backend dependencies (production)..."
cd backend
npm ci --production

if [ "$MODE" = "dev" ]; then
  echo "Starting backend in dev mode (nodemon if available)..."
  if npm run dev --silent >/dev/null 2>&1; then
    # run dev in foreground
    npm run dev
  else
    echo "nodemon/dev script not available, starting node src/index.js"
    node src/index.js
  fi
else
  echo "Starting backend in production mode"
  npm start
fi
