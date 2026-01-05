#!/bin/bash

# Deploy Backend to Fly.io
# This script deploys the backend application to Fly.io

set -e

echo "=========================================="
echo "Deploying Backend to Fly.io"
echo "=========================================="

cd "$(dirname "$0")/backend"

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "Error: flyctl is not installed. Please install it first:"
    echo "  brew install flyctl"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "Error: Not logged in to Fly.io. Please run:"
    echo "  flyctl auth login"
    exit 1
fi

# Deploy
echo ""
echo "Starting deployment..."
flyctl deploy

echo ""
echo "=========================================="
echo "Backend deployment completed!"
echo "=========================================="
echo ""
echo "Your backend is now available at:"
echo "  https://4oak-backend.fly.dev"
echo ""
echo "Check logs with:"
echo "  flyctl logs --app 4oak-backend"
echo ""

