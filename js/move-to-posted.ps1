# Script to move a blog post to the Posted folder
# Usage:
#   .\js\move-to-posted.ps1 -File filename.md

param (
    [Parameter(Mandatory=$true)]
    [string]$File
)

# Change to the root directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location -Path $RootDir

# Run the md-to-blog.ps1 script with the MoveToPosted parameter
Write-Host "Moving $File to Posted folder..."
& "$ScriptDir\md-to-blog.ps1" -File $File -MoveToPosted

Write-Host "`nMove complete. The file has been moved to the Posted folder."