# Instructions 3: Fixing DNS Configuration for GitHub Pages with Namecheap

This document provides step-by-step instructions for properly configuring Namecheap DNS settings to work with GitHub Pages for the HelloEmily.dev domain.

## Issue Identified
The domain HelloEmily.dev and its www subdomain are not properly configured to point to GitHub Pages servers, resulting in a "NotServedByPagesError".

## Step 1: Verify GitHub Pages Settings
Emily, please follow these steps exactly:

1. Go to the repository on GitHub (https://github.com/emscape/HelloEmilyDev)
2. Click on "Settings" tab
3. In the left sidebar, click on "Pages"
4. Verify the following settings:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Custom domain: HelloEmily.dev
5. Note: Do NOT check "Enforce HTTPS" until the domain is properly configured
6. Take a screenshot of these settings for your records

## Step 2: Configure DNS Records in Namecheap
Emily, please follow these steps to update your DNS settings in Namecheap:

1. Go to [Namecheap.com](https://www.namecheap.com/) and log in to your account
2. Click on "Domain List" from the left sidebar
3. Find HelloEmily.dev in your domain list and click "Manage"
4. Navigate to the "Advanced DNS" tab
5. Look for the "Host Records" section

### Add A Records
Delete any existing A records for @ (if present) and add these four A records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A    | @    | 185.199.108.153 | 30 min |
| A    | @    | 185.199.109.153 | 30 min |
| A    | @    | 185.199.110.153 | 30 min |
| A    | @    | 185.199.111.153 | 30 min |

### Add CNAME Record
Delete any existing CNAME record for www (if present) and add this CNAME record:

| Type  | Host | Value              | TTL |
|-------|------|-------------------|-----|
| CNAME | www  | emscape.github.io | 30 min |

6. Click the "Save Changes" button at the bottom of the page
7. Take a screenshot of your DNS settings for your records

## Step 3: Wait for DNS Propagation
DNS changes can take up to 48 hours to fully propagate, though they often take effect within a few hours.

Emily, please wait at least 1 hour before proceeding to the next step.

## Step 4: Verify DNS Configuration
After waiting for DNS propagation (at least 1 hour), Emily, please verify your DNS configuration:

1. Open a command prompt or terminal on your computer
2. Run the following command to check A records:
   ```
   nslookup HelloEmily.dev
   ```
   You should see the GitHub Pages IP addresses (185.199.108.153, etc.) in the results.

3. Run the following command to check CNAME record:
   ```
   nslookup www.HelloEmily.dev
   ```
   You should see a reference to emscape.github.io in the results.

4. Take screenshots of both command outputs

If you don't see the expected results, please wait longer for DNS propagation.

## Step 5: Verify GitHub Pages Connection
Emily, after confirming DNS is properly configured:

1. Go back to GitHub repository settings > Pages
2. Refresh the page
3. If the domain verification is successful, you'll see a message indicating that your site is published
4. Now check "Enforce HTTPS" to enable secure connections
5. Take a screenshot of the updated GitHub Pages settings
6. Note: The HTTPS certificate may take up to 24 hours to be issued

## Step 6: Test the Website
Emily, please test both versions of the website:

1. Visit https://HelloEmily.dev in your browser
2. Take a screenshot of the loaded website
3. Visit https://www.HelloEmily.dev in your browser
4. Take a screenshot of the loaded website

## Troubleshooting
If you continue to see "Domain does not resolve to the GitHub Pages server" error:

- Double-check your Namecheap DNS settings against the instructions above
- Ensure all four A records are correctly entered with the exact IP addresses
- Verify the CNAME record is correctly pointing to emscape.github.io
- Try clearing your browser cache or using a different browser
- Try using a different internet connection (mobile data instead of WiFi)
- Contact Namecheap support if DNS changes don't seem to be saving

## Additional Resources
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Namecheap DNS Setup Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/)
- [Troubleshooting Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)