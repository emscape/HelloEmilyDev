# Instructions 6: Deploying Updates to GitHub Pages

This document provides step-by-step instructions for deploying updates to your HelloEmily.dev website using GitHub Pages.

## Overview
In this process, we:
1. Made a small change to the website (added a typo to "Skills" in the navigation menu)
2. Updated the GitHub Actions workflow to use the latest versions
3. Created a backup of the main branch
4. Merged the changes into the main branch
5. Pushed the changes to GitHub, triggering the deployment

## Step 1: Make and Verify Changes
1. Create a new branch or use an existing feature branch
2. Make your desired changes to the website files
3. Test the changes locally if possible
4. Commit the changes to your branch

## Step 2: Update GitHub Actions (if needed)
1. Check the `.github/workflows/deploy.yml` file
2. Update any outdated GitHub Actions to their latest versions:
   - actions/checkout@v4
   - actions/configure-pages@v4
   - actions/upload-pages-artifact@v3
   - actions/deploy-pages@v3

## Step 3: Backup Main Branch (Optional)
1. Switch to the main branch: `git checkout main`
2. Create a backup branch: `git branch main-backup`
3. Push the backup branch to GitHub: `git push origin main-backup`

## Step 4: Merge Changes to Main
1. From the main branch, merge your feature branch:
   ```
   git checkout main
   git merge your-feature-branch -m "Merge feature branch with description of changes"
   ```
2. Resolve any merge conflicts if they occur

## Step 5: Push Changes to GitHub
1. Push the merged changes to GitHub:
   ```
   git push origin main
   ```
2. This will automatically trigger the GitHub Actions workflow

## Step 6: Verify Deployment
1. Go to the GitHub repository and click on the "Actions" tab
2. Check that the workflow completed successfully
3. Visit your website (HelloEmily.dev) to verify the changes are live
4. Check both desktop and mobile views

## Troubleshooting
- If the workflow fails, check the error messages in the GitHub Actions logs
- If the website doesn't update, ensure your DNS settings are correct
- If you need to roll back changes, you can restore from your backup branch

## Best Practices
1. Always create a backup before making significant changes
2. Test changes locally before deploying
3. Use descriptive commit messages
4. Keep your GitHub Actions up to date
5. Regularly check for GitHub Pages feature updates