#!/usr/bin/env zsh
# Simple helper to build & push the frontend image to DigitalOcean Container Registry
set -euo pipefail

# Registry name (ex: nolagodlevel). You can export DOCR_NAME env var or use default below.
DOCR_NAME=${DOCR_NAME:-nolagodlevel}
REGISTRY_HOST=${REGISTRY_HOST:-registry.digitalocean.com}

IMAGE_REF="$REGISTRY_HOST/$DOCR_NAME/frontend:latest"

echo "Building frontend image: $IMAGE_REF"
docker build -t "$IMAGE_REF" -f frontend/Dockerfile ./frontend

echo "Pushing $IMAGE_REF"
docker push "$IMAGE_REF"

echo "Done. Verify with: doctl registry repository list-tags frontend"
