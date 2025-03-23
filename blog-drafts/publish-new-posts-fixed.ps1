# PowerShell script to publish new blog posts
# This is a wrapper script that calls the main publish-new-blog-posts-fixed.ps1 script

# Get the directory of this script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$PublishScriptPath = Join-Path -Path $RootDir -ChildPath "js\publish-new-blog-posts-fixed.ps1"

Write-Host "Publishing new blog posts..." -ForegroundColor Cyan

# Call the main publish script
try {
    & $PublishScriptPath
    Write-Host "`nPublishing complete!" -ForegroundColor Green
}
catch {
    Write-Host "`nError publishing blog posts: $_" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")