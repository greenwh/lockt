# GitHub Actions Workflows

This directory contains automated workflows for the Lockt project.

## Workflows

### 1. Deploy to GitHub Pages (`deploy.yml`)

**Trigger**: Automatically runs on push to `main` branch, or manually via workflow_dispatch

**Purpose**: Builds and deploys the application to GitHub Pages

**Steps**:
1. Checkout code
2. Setup Node.js 20 with npm caching
3. Install dependencies with `npm ci`
4. Build the application with `npm run build`
5. Upload build artifacts to GitHub Pages
6. Deploy to GitHub Pages environment

**Deployment URL**: https://greenwh.github.io/lockt/

**Required GitHub Settings**:
- Go to repository Settings → Pages
- Set "Build and deployment" source to "GitHub Actions"
- Ensure workflow has `pages: write` and `id-token: write` permissions (already configured)

### 2. CI - Build and Test (`ci.yml`)

**Trigger**: Runs on all pull requests and pushes to non-main branches

**Purpose**: Validates that code changes build successfully before merging

**Steps**:
1. Checkout code
2. Setup Node.js 20 with npm caching
3. Install dependencies with `npm ci`
4. Run linter (`npm run lint`)
5. Build the application (`npm run build`)
6. Verify build output (checks for dist directory and index.html)

**Status**: Check status badges appear on PRs to indicate build health

## Setup Instructions

### First Time Setup

1. **Enable GitHub Pages**:
   ```
   Repository Settings → Pages → Source: GitHub Actions
   ```

2. **Verify Permissions**: The workflows are already configured with the necessary permissions. No additional setup needed.

3. **Manual Deployment**: To manually trigger a deployment:
   - Go to Actions tab
   - Select "Deploy to GitHub Pages" workflow
   - Click "Run workflow"
   - Select branch (usually `main`)
   - Click "Run workflow"

### Local Development

The workflows use the same commands you can run locally:

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Build for production
npm run build

# Preview build locally
npm run preview
```

## Workflow Configuration

Both workflows use:
- **Node.js 20**: Current LTS version
- **npm ci**: Clean install from package-lock.json (faster and more reliable than npm install)
- **Caching**: npm dependencies are cached to speed up workflow runs

## Troubleshooting

### Build Fails with "Cannot find type definition file"

**Solution**: Ensure `node_modules` is populated. The workflow runs `npm ci` which installs all dependencies from package-lock.json.

### Deployment 403 Error

**Solution**: Check that:
1. GitHub Pages is enabled and source is set to "GitHub Actions"
2. Workflow has correct permissions (already configured)
3. Branch protection rules don't prevent deployment

### Base Path Issues

The app is configured to deploy to `/lockt/` subdirectory (defined in `vite.config.ts`). If deploying to root domain, change `base: '/lockt/'` to `base: '/'`.

## Monitoring

- **Actions Tab**: View all workflow runs, logs, and artifacts
- **Deployments**: View deployment history in repository's "Environments" section
- **Status Badges**: Add badges to README to show build/deployment status

## Security

- Workflows use official GitHub Actions (verified publishers)
- `npm ci` uses locked dependencies from package-lock.json
- No secrets required for GitHub Pages deployment (uses GITHUB_TOKEN)
- Build artifacts are automatically cleaned up after deployment
