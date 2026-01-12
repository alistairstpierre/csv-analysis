# Cloudflare Pages Deployment Guide

## Quick Setup

1. **Create a GitHub Repository**
   - Go to https://github.com/new
   - Name it (e.g., "csv-analysis")
   - Don't initialize with README
   - Click "Create repository"

2. **Push Your Code**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Cloudflare Pages**
   - Go to https://dash.cloudflare.com/
   - Navigate to Pages → Create a project
   - Connect your GitHub account
   - Select your repository
   - Configure build settings:
     - **Framework preset**: None
     - **Build command**: None
     - **Deploy command**: `bash deploy.sh`
     - **Version command**: `bash deploy-preview.sh`
     - **Root directory**: `/`
   - Click "Save and Deploy"

4. **Your site will be live!**
   - Cloudflare will provide a URL like: `your-project.pages.dev`
   - Every push to main will trigger automatic deployments

## Project Structure for Cloudflare Pages

This is a static site, so no build process is needed:
- `index.html` - Entry point
- `app.js` - Application logic
- `styles.css` - Styling
- `input/data.csv` - Data file (loaded automatically)
- `_headers` - Security headers for Cloudflare Pages

## Notes

- The CSV file in `input/data.csv` will be served statically
- Chart.js is loaded from CDN (already configured in CSP)
- All processing happens client-side
- No server-side code required
