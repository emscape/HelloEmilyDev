# Test script to convert saving-sparky.md to block format
# This script will:
# 1. Convert saving-sparky.md to block format
# 2. Add it to the blog data
# 3. Optionally move it to the Posted folder

# Change to the root directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location -Path $RootDir

# Run the md-to-blog.ps1 script with the UseBlocks parameter
Write-Host "Converting saving-sparky.md to block format..."
& "$ScriptDir\md-to-blog.ps1" -File "saving-sparky.md" -UseBlocks

Write-Host "`nConversion complete. Check the blog data file to see the results."
Write-Host "To view the blog post, open blog-post.html?id=saving-my-ai-sidekick-how-i-built-my-custom-gpt in your browser."