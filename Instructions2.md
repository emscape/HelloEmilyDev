# Instructions 2: Completing GitHub Repository Setup and Deployment

This document provides step-by-step instructions for completing the GitHub repository setup and deploying the HelloEmily.dev website.

## Prerequisites
- Local Git repository is initialized with main branch
- Files are staged and committed locally
- Remote origin is set to https://github.com/emscape/HelloEmilyDev.git

## Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com/) and sign in with the emscape account
2. Navigate to [Create a new repository](https://github.com/new)
3. Enter the following information:
   - Repository name: `HelloEmilyDev`
   - Description: `Website for HelloEmily.dev`
   - Visibility: Public (required for GitHub Pages with free account)
   - Do NOT initialize with README, .gitignore, or license (as we already have a local repository)
4. Click "Create repository"

## Step 2: Push Local Repository to GitHub
1. After creating the repository, run the following command to push your local repository to GitHub:
   ```bash
   git push -u origin main
   ```
2. If prompted, enter your GitHub credentials

## Step 3: Configure GitHub Pages
1. Go to the repository on GitHub (https://github.com/emscape/HelloEmilyDev)
2. Click on "Settings" tab
3. In the left sidebar, click on "Pages"
4. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
5. Click "Save"
6. Under "Custom domain":
   - Enter: HelloEmily.dev
   - Click "Save"
7. Check "Enforce HTTPS" once the domain is verified (may take a few minutes)

## Step 4: Verify Deployment
1. Go to the "Actions" tab on GitHub to monitor the deployment workflow
2. Wait for the "Deploy to GitHub Pages" workflow to complete successfully
3. Visit HelloEmily.dev to verify the website is accessible
4. Check that HTTPS is working properly

## Step 5: Verify DNS Configuration
1. Ensure A records point to GitHub Pages IP addresses:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
2. Ensure CNAME record for www.HelloEmily.dev points to emscape.github.io

## Troubleshooting
- If GitHub Pages doesn't build, check the Actions tab for error messages
- If DNS isn't working, verify DNS settings with your domain provider
- If HTTPS isn't working, ensure "Enforce HTTPS" is checked in GitHub Pages settings

## Command Reference
```bash
# Push local repository to GitHub
git push -u origin main

# Verify remote repository
git remote -v