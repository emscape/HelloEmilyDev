# Instructions 1: GitHub Repository Setup and Deployment

This document provides step-by-step instructions for uploading the HelloEmily.dev website to GitHub and configuring GitHub Pages for deployment.

## Prerequisites
1. Git installed and configured on your local machine
2. GitHub account (emscape) with access to create repositories
3. Proper permissions to modify DNS settings for HelloEmily.dev domain

## Step 1: Create GitHub Repository
1. Log in to GitHub (emscape account)
2. Click "New repository" button
3. Name the repository "HelloEmilyDev"
4. Set visibility to Public (for GitHub Pages)
5. Do not initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Configure Git (if not already configured)
1. Set your Git username:
   ```
   git config --global user.name "emscape"
   ```
2. Set your Git email:
   ```
   git config --global user.email "emily@theDapperFoxes.com"
   ```

## Step 3: Connect Local Repository to GitHub
1. Open terminal/command prompt in the local repository directory
2. Run: `git remote add origin https://github.com/emscape/HelloEmilyDev.git`
3. Verify connection with: `git remote -v`

## Step 4: Push Local Repository to GitHub
1. Ensure all changes are committed locally
   - `git add .`
   - `git commit -m "Initial commit of HelloEmily.dev website"`
2. Push to GitHub:
   - `git push -u origin main`

## Step 5: Configure GitHub Pages
1. Go to repository settings on GitHub
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click "Save"
6. Under "Custom domain", enter "HelloEmily.dev"
7. Check "Enforce HTTPS" option

## Step 6: Verify DNS Configuration
1. Ensure A records point to GitHub Pages IP addresses:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
2. Ensure CNAME record for www.HelloEmily.dev points to emscape.github.io

## Step 7: Test Website
1. Wait for DNS propagation (may take up to 24 hours)
2. Visit HelloEmily.dev to verify the website is working
3. Check that HTTPS is working properly

## Troubleshooting
- If GitHub Pages doesn't build, check the Actions tab for error messages
- If DNS isn't working, verify DNS settings with your domain provider
- If HTTPS isn't working, ensure "Enforce HTTPS" is checked in GitHub Pages settings

## Command Reference
```bash
# Configure Git
git config --global user.name "emscape"
git config --global user.email "emily@theDapperFoxes.com"

# Connect to GitHub remote
git remote add origin https://github.com/emscape/HelloEmilyDev.git

# Verify remote connection
git remote -v

# Stage all files
git add .

# Commit changes
git commit -m "Initial commit of HelloEmily.dev website"

# Push to GitHub
git push -u origin main
```

## Completed Actions
- ✅ Git global configuration set
- ✅ Remote repository added
- ✅ Files staged and committed
- ✅ Repository pushed to GitHub