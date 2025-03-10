# Instructions 1: GitHub Repository Setup and Deployment

This document provides step-by-step instructions for uploading the HelloEmily.dev website to GitHub and configuring GitHub Pages for deployment.

## Current Status
- Local Git repository initialized with main branch
- Git global configuration set (user.name and user.email)
- Remote origin added but GitHub repository doesn't exist yet
- Files staged and committed locally

## Step 1: Create GitHub Repository
1. Log in to GitHub (emscape account)
2. Click "New repository" button
3. Name the repository "HelloEmilyDev"
4. Set visibility to Public (for GitHub Pages)
5. Do not initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Push Local Repository to GitHub
1. After creating the repository on GitHub, push the local repository:
   ```
   git push -u origin main
   ```

## Step 3: Configure GitHub Pages
1. Go to repository settings on GitHub
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click "Save"
6. Under "Custom domain", enter "HelloEmily.dev"
7. Check "Enforce HTTPS" option

## Step 4: Verify DNS Configuration
1. Ensure A records point to GitHub Pages IP addresses:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
2. Ensure CNAME record for www.HelloEmily.dev points to emscape.github.io

## Step 5: Test Website
1. Wait for DNS propagation (may take up to 24 hours)
2. Visit HelloEmily.dev to verify the website is working
3. Check that HTTPS is working properly

## Troubleshooting
- If GitHub Pages doesn't build, check the Actions tab for error messages
- If DNS isn't working, verify DNS settings with your domain provider
- If HTTPS isn't working, ensure "Enforce HTTPS" is checked in GitHub Pages settings

## Command Reference
```bash
# Commands already executed:
git config --global user.name "emscape"
git config --global user.email "emily@theDapperFoxes.com"
git remote add origin https://github.com/emscape/HelloEmilyDev.git
git checkout -b main
git add .
git commit -m "Initial commit of HelloEmily.dev website"

# Commands to execute after creating GitHub repository:
git push -u origin main
```

## Error Encountered
```
remote: Repository not found.
fatal: repository 'https://github.com/emscape/HelloEmilyDev.git/' not found
```

This error indicates that the repository doesn't exist on GitHub yet. You need to create it first by following Step 1 above.