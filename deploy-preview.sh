#!/bin/bash
# Preview deployment script for Cloudflare Pages
# Used for preview deployments (pull requests, branches)

echo "Building preview for CSV Analysis Interface..."
echo "Static site - no build required"

# Ensure index.html exists
if [ ! -f "index.html" ]; then
    echo "ERROR: index.html not found!"
    exit 1
fi

echo "✓ Preview deployment ready"

# Exit successfully
exit 0
