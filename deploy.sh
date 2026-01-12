#!/bin/bash
# Deploy script for Cloudflare Pages
# This is a static site, so no build process is needed
# Files are already in the root directory and ready to serve

echo "Deploying CSV Analysis Interface..."
echo "Static site - no build required"
echo "All files are ready for deployment"

# List files to verify they're present
echo "Files in deployment directory:"
ls -la

# Ensure index.html exists
if [ ! -f "index.html" ]; then
    echo "ERROR: index.html not found!"
    exit 1
fi

echo "✓ index.html found"
echo "✓ Static site ready for deployment"

# Exit successfully
exit 0
