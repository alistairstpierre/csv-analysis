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

## Troubleshooting

If you see "hello world" or a blank page:

1. **Check Build Output Directory**: Make sure it's set to `/` (root)
2. **Verify Files**: Ensure `index.html` is in the root directory
3. **Check Build Logs**: In Cloudflare Pages, check the build logs to see if files are being deployed
4. **Wait for Deployment**: After pushing, wait a minute for Cloudflare to rebuild
5. **Clear Cache**: Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Notes

- The CSV file in `input/data.csv` will be served statically
- Chart.js is loaded from CDN (already configured in CSP)
- All processing happens client-side
- No server-side code required
- The `_redirects` file ensures all routes point to `index.html`
