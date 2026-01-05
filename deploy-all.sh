#!/bin/bash

# Deploy All Apps to Fly.io
# This script deploys both backend and frontend applications to Fly.io

set -e

echo "=========================================="
echo "Deploying All Apps to Fly.io"
echo "=========================================="

SCRIPT_DIR="$(dirname "$0")"

# Deploy backend first
echo ""
echo "Step 1/2: Deploying Backend..."
echo ""
bash "$SCRIPT_DIR/deploy-backend.sh"

# Wait a bit for backend to be ready
echo ""
echo "Waiting for backend to stabilize..."
sleep 5

# Deploy frontend
echo ""
echo "Step 2/2: Deploying Frontend..."
echo ""
bash "$SCRIPT_DIR/deploy-frontend.sh"

echo ""
echo "=========================================="
echo "All deployments completed!"
echo "=========================================="
echo ""
echo "Your applications are now available at:"
echo "  Frontend: https://4oak-frontend.fly.dev"
echo "  Backend:  https://4oak-backend.fly.dev"
echo ""
echo "To check logs:"
echo "  flyctl logs --app 4oak-backend"
echo "  flyctl logs --app 4oak-frontend"
echo ""

