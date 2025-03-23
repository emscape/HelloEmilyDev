# Automated Blog Post Publishing Script
# Usage: 
#   .\js\publish-new-blog-posts-fixed.ps1
#
# This script automatically:
# 1. Finds all markdown files in the blog-drafts directory (excluding README.md and files in Posted folder)
# 2. Converts them to JSON format and adds them to blog-data.json
# 3. Moves the published files to the Posted folder
# 4. Optionally uses block-based format for all files

param (
    [switch]$UseBlocks = $true,
    [switch]$Verbose = $false
)

# Function to log messages
function Write-Log {
    param (
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Type] $Message"
    
    # Always write to console
    if ($Type -eq "ERROR") {
        Write-Host $logMessage -ForegroundColor Red
    }
    elseif ($Type -eq "WARNING") {
        Write-Host $logMessage -ForegroundColor Yellow
    }
    elseif ($Type -eq "SUCCESS") {
        Write-Host $logMessage -ForegroundColor Green
    }
    else {
        Write-Host $logMessage
    }
}

# Set up paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$DraftsDir = Join-Path -Path $RootDir -ChildPath "blog-drafts"
$PostedDir = Join-Path -Path $DraftsDir -ChildPath "Posted"
$BlogDataPath = Join-Path -Path $RootDir -ChildPath "blog\blog-data.json"

# Create Posted directory if it doesn't exist
if (-not (Test-Path $PostedDir)) {
    New-Item -Path $PostedDir -ItemType Directory | Out-Null
    Write-Log "Created Posted directory: $PostedDir" "INFO"
}

# Find all markdown files in the blog-drafts directory (excluding README.md and files in Posted folder)
$files = Get-ChildItem -Path $DraftsDir -Filter "*.md" | Where-Object { 
    $_.Name -ne "README.md" -and 
    $_.DirectoryName -notlike "*\Posted*" -and
    $_.Name -ne "template.md"
}

if ($files.Count -eq 0) {
    Write-Log "No new blog posts found in drafts folder." "WARNING"
    exit
}

Write-Log "Found $($files.Count) new blog post(s) to publish." "INFO"

# Process each file
foreach ($file in $files) {
    Write-Log "Processing $($file.Name)..." "INFO"
    
    # Run the md-to-blog-fixed.ps1 script with the appropriate parameters
    $mdToBlogPath = Join-Path -Path $ScriptDir -ChildPath "md-to-blog-fixed.ps1"
    
    try {
        if ($UseBlocks) {
            & $mdToBlogPath -File $file.Name -UseBlocks -MoveToPosted
            Write-Log "Converted $($file.Name) to block format and added to blog-data.json" "SUCCESS"
        }
        else {
            & $mdToBlogPath -File $file.Name -MoveToPosted
            Write-Log "Converted $($file.Name) to HTML format and added to blog-data.json" "SUCCESS"
        }
        
        Write-Log "Moved $($file.Name) to Posted folder" "SUCCESS"
    }
    catch {
        Write-Log "Error processing $($file.Name): $_" "ERROR"
    }
}

Write-Log "Blog post publishing complete!" "SUCCESS"
Write-Log "You can now view your blog posts at https://helloemily.dev/blog-archive.html" "INFO"