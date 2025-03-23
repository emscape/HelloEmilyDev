# PowerShell script to convert markdown files to blog JSON format
# Usage:
#   .\js\md-to-blog.ps1                  # Process all markdown files in blog-drafts
#   .\js\md-to-blog.ps1 -File filename.md # Process a specific file
#   .\js\md-to-blog.ps1 -UseBlocks       # Use block-based format for all files
#   .\js\md-to-blog.ps1 -File filename.md -UseBlocks # Process a specific file with block format

param (
    [string]$File = "",
    [switch]$UseBlocks = $false,
    [switch]$MoveToPosted = $false
)

# Directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$DraftsDir = Join-Path -Path $RootDir -ChildPath "blog-drafts"
$PostedDir = Join-Path -Path $DraftsDir -ChildPath "Posted"
$BlogDataPath = Join-Path -Path $RootDir -ChildPath "blog\blog-data.json"

# Function to generate ID from title
function Get-IdFromTitle {
    param (
        [string]$Title
    )
    
    $id = $Title.ToLower() -replace '[^\w\s-]', '' -replace '\s+', '-' -replace '-+', '-'
    if ($id.Length -gt 50) {
        $id = $id.Substring(0, 50)
    }
    return $id
}

# Very basic markdown to HTML conversion
function ConvertFrom-Markdown {
    param (
        [string]$Markdown
    )
    
    $html = $Markdown
    
    # Headers
    $html = $html -replace '(?m)^### (.*$)', '<h3>$1</h3>'
    $html = $html -replace '(?m)^## (.*$)', '<h2>$1</h2>'
    $html = $html -replace '(?m)^# (.*$)', '<h1>$1</h1>'
    
    # Bold and italic
    $html = $html -replace '\*\*(.*?)\*\*', '<strong>$1</strong>'
    $html = $html -replace '\*(.*?)\*', '<em>$1</em>'
    
    # Lists
    $html = $html -replace '(?m)^\s*-\s+(.*$)', '<li>$1</li>'
    $html = $html -replace '(<li>.*<\/li>\n)+', '<ul>$&</ul>'
    
    # Links
    $html = $html -replace '\[(.*?)\]\((.*?)\)', '<a href="$2">$1</a>'
    
    # Paragraphs
    $html = $html -replace '(?m)^(?!<[a-z])', '<p>'
    $html = $html -replace '(?m)^(?!<\/[a-z]|$)', '</p>'
    
    return $html
}

# Function to convert markdown to blocks using Node.js
function Convert-MarkdownToBlocks {
    param (
        [string]$Markdown
    )
    
    # Create a temporary file to hold the markdown
    $tempFile = [System.IO.Path]::GetTempFileName()
    $Markdown | Out-File -FilePath $tempFile -Encoding utf8
    
    # Create a temporary file for the output
    $outputFile = [System.IO.Path]::GetTempFileName()
    
    # Path to the md-to-blocks.js file
    $mdToBlocksPath = Join-Path -Path $ScriptDir -ChildPath "md-to-blocks.js"
    
    # Create a simple Node.js script to use the MarkdownToBlocks class
    $nodeScript = @"
const fs = require('fs');
const MarkdownToBlocks = require('$($mdToBlocksPath.Replace('\', '\\'))');

const markdown = fs.readFileSync('$($tempFile.Replace('\', '\\'))', 'utf8');
const converter = new MarkdownToBlocks();
const blocks = converter.convert(markdown);

fs.writeFileSync('$($outputFile.Replace('\', '\\'))', JSON.stringify(blocks, null, 2), 'utf8');
"@
    
    # Write the Node.js script to a temporary file
    $scriptFile = [System.IO.Path]::GetTempFileName() + ".js"
    $nodeScript | Out-File -FilePath $scriptFile -Encoding utf8
    
    try {
        # Execute the Node.js script
        node $scriptFile
        
        # Read the output
        $blocksJson = Get-Content -Path $outputFile -Raw
        $blocks = $blocksJson | ConvertFrom-Json
        
        return $blocks
    }
    catch {
        Write-Error "Error converting markdown to blocks: $_"
        return $null
    }
    finally {
        # Clean up temporary files
        Remove-Item -Path $tempFile -ErrorAction SilentlyContinue
        Remove-Item -Path $outputFile -ErrorAction SilentlyContinue
        Remove-Item -Path $scriptFile -ErrorAction SilentlyContinue
    }
}

# Function to extract metadata from markdown content
function Extract-MetadataFromContent {
    param (
        [string[]]$Lines
    )
    
    $metadata = @{}
    
    # Look for date patterns
    $dateMatch = $Lines | Where-Object { $_ -match '\d{4}-\d{2}-\d{2}' } | Select-Object -First 1
    if ($dateMatch) {
        $match = [regex]::Match($dateMatch, '\d{4}-\d{2}-\d{2}')
        if ($match.Success) {
            $metadata['date'] = $match.Value
        }
    }
    
    # Extract tags from content
    $potentialTags = @('AI', 'Technology', 'Personal', 'Development', 'Tutorial', 'Web Development', 'Case Study')
    $metadata['tags'] = $potentialTags | Where-Object {
        $tag = $_
        $Lines | Where-Object { $_ -match [regex]::Escape($tag) }
    }
    
    # Look for images that might be featured
    $featuredImageMatch = $Lines | Where-Object {
        $_ -match '!\[(.*?)\]\((.*?)\)' -and
        ($_ -match 'featured' -or $_ -match 'header')
    } | Select-Object -First 1
    
    if ($featuredImageMatch) {
        $match = [regex]::Match($featuredImageMatch, '!\[.*?\]\((.*?)\)')
        if ($match.Success) {
            $metadata['featuredImage'] = $match.Groups[1].Value
        }
    }
    
    return $metadata
}

# Function to extract short description from markdown content
function Extract-ShortDescription {
    param (
        [string[]]$Lines
    )
    
    # Use the first non-empty paragraph after the title as the short description
    for ($i = 1; $i -lt $Lines.Count; $i++) {
        if ($Lines[$i].Trim() -ne '' -and
            -not $Lines[$i].StartsWith('#') -and
            -not $Lines[$i] -match '!\[.*?\]\(.*?\)') {
            return $Lines[$i].Trim()
        }
    }
    
    return ''
}

# Function to parse markdown file
function Parse-MarkdownFile {
    param (
        [string]$FilePath,
        [bool]$UseBlockFormat = $false
    )
    
    Write-Host "Reading file: $FilePath"
    $content = Get-Content -Path $FilePath -Raw
    $lines = $content -split "`n"
    
    # Extract title (first line, remove # prefix)
    $title = ($lines | Where-Object { $_ -match '^#\s+' } | Select-Object -First 1) -replace '^#\s+', ''
    if (-not $title) {
        $title = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    }
    Write-Host "Title: $title"
    
    # Check if file has traditional format with explicit sections
    $metadataIndex = -1
    $shortDescIndex = -1
    $contentIndex = -1
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i].Trim()
        if ($line -match '^##\s+Metadata$') {
            $metadataIndex = $i
        }
        elseif ($line -match '^##\s+Short\s+Description$') {
            $shortDescIndex = $i
        }
        elseif ($line -match '^##\s+Content$') {
            $contentIndex = $i
        }
    }
    
    # Generate an ID based on the title
    $id = Get-IdFromTitle -Title $title
    
    # If using block format or if the file doesn't have traditional sections
    if ($UseBlockFormat -or $metadataIndex -eq -1 -or $shortDescIndex -eq -1 -or $contentIndex -eq -1) {
        Write-Host "Using block-based format for $FilePath"
        
        # Extract metadata from content
        $metadata = Extract-MetadataFromContent -Lines $lines
        
        # Extract short description
        $shortDescription = Extract-ShortDescription -Lines $lines
        
        if ($UseBlockFormat) {
            # Convert content to blocks
            $blocks = Convert-MarkdownToBlocks -Markdown $content
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                blocks = $blocks
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { (Get-Date).ToString('yyyy-MM-dd') }
                tags = if ($metadata.ContainsKey('tags')) { $metadata['tags'] } else { @() }
                featuredImage = if ($metadata.ContainsKey('featuredimage')) { $metadata['featuredimage'] } elseif ($metadata.ContainsKey('featuredImage')) { $metadata['featuredImage'] } else { '' }
                featured = if ($metadata.ContainsKey('featured')) { $metadata['featured'] } else { $false }
            }
        } else {
            # Convert markdown content to HTML
            $contentHtml = ConvertFrom-Markdown -Markdown $content
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                content = $contentHtml
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { (Get-Date).ToString('yyyy-MM-dd') }
                tags = if ($metadata.ContainsKey('tags')) { $metadata['tags'] } else { @() }
                featuredImage = if ($metadata.ContainsKey('featuredimage')) { $metadata['featuredimage'] } elseif ($metadata.ContainsKey('featuredImage')) { $metadata['featuredImage'] } else { '' }
                featured = if ($metadata.ContainsKey('featured')) { $metadata['featured'] } else { $false }
            }
        }
    } else {
        Write-Host "Using traditional format for $FilePath"
        
        # Extract metadata
        $metadataLines = $lines[($metadataIndex + 1)..($shortDescIndex - 1)]
        $metadata = @{}
        
        foreach ($line in $metadataLines) {
            if ($line -match '^-\s+([^:]+):\s+(.+)$') {
                $key = $matches[1].Trim().ToLower()
                $value = $matches[2].Trim()
                
                if ($key -eq 'tags') {
                    $metadata['tags'] = $value -split ',' | ForEach-Object { $_.Trim() }
                }
                elseif ($key -eq 'featured') {
                    $metadata['featured'] = $value.ToLower() -eq 'true'
                }
                else {
                    $metadata[$key] = $value
                }
            }
        }
        
        # Extract short description
        $shortDescription = ($lines[($shortDescIndex + 1)..($contentIndex - 1)] | Where-Object { $_ -ne '' }) -join ' '
        
        # Extract content
        $contentLines = $lines[($contentIndex + 1)..($lines.Length - 1)]
        $contentMarkdown = $contentLines -join "`n"
        
        if ($UseBlockFormat) {
            # Convert content to blocks
            $blocks = Convert-MarkdownToBlocks -Markdown $contentMarkdown
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                blocks = $blocks
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { (Get-Date).ToString('yyyy-MM-dd') }
                tags = if ($metadata.ContainsKey('tags')) { $metadata['tags'] } else { @() }
                featuredImage = if ($metadata.ContainsKey('featuredimage')) { $metadata['featuredimage'] } elseif ($metadata.ContainsKey('featuredImage')) { $metadata['featuredImage'] } else { '' }
                featured = if ($metadata.ContainsKey('featured')) { $metadata['featured'] } else { $false }
            }
        } else {
            # Convert markdown content to HTML
            $contentHtml = ConvertFrom-Markdown -Markdown $contentMarkdown
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                content = $contentHtml
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { (Get-Date).ToString('yyyy-MM-dd') }
                tags = if ($metadata.ContainsKey('tags')) { $metadata['tags'] } else { @() }
                featuredImage = if ($metadata.ContainsKey('featuredimage')) { $metadata['featuredimage'] } elseif ($metadata.ContainsKey('featuredImage')) { $metadata['featuredImage'] } else { '' }
                featured = if ($metadata.ContainsKey('featured')) { $metadata['featured'] } else { $false }
            }
        }
    }
}

# Function to process a markdown file and add it to the blog data
function Process-MarkdownFile {
    param (
        [string]$FilePath,
        [PSCustomObject]$BlogData,
        [bool]$UseBlockFormat = $false,
        [bool]$MoveToPosted = $false
    )
    
    try {
        Write-Host "Processing $FilePath..."
        $post = Parse-MarkdownFile -FilePath $FilePath -UseBlockFormat $UseBlockFormat
        
        if ($post -eq $null) {
            return $BlogData
        }
        
        # Check if post with same ID already exists
        $existingPostIndex = -1
        for ($i = 0; $i -lt $BlogData.posts.Count; $i++) {
            if ($BlogData.posts[$i].id -eq $post.id) {
                $existingPostIndex = $i
                break
            }
        }
        
        if ($existingPostIndex -ne -1) {
            # Update existing post
            $BlogData.posts[$existingPostIndex] = $post
            Write-Host "Updated existing post: $($post.title)"
        }
        else {
            # Add new post
            $BlogData.posts += $post
            Write-Host "Added new post: $($post.title)"
        }
        
        # Move file to Posted folder if requested
        if ($MoveToPosted) {
            $fileName = Split-Path -Leaf $FilePath
            $postedFilePath = Join-Path -Path $PostedDir -ChildPath $fileName
            
            # Create Posted directory if it doesn't exist
            if (-not (Test-Path $PostedDir)) {
                New-Item -Path $PostedDir -ItemType Directory | Out-Null
                Write-Host "Created Posted directory: $PostedDir"
            }
            
            # Move the file
            Move-Item -Path $FilePath -Destination $postedFilePath -Force
            Write-Host "Moved $fileName to Posted folder"
        }
        
        return $BlogData
    }
    catch {
        # Use a different approach for error handling
        $errorMessage = $_.Exception.Message
        Write-Error "Error processing $FilePath`: $errorMessage"
        return $BlogData
    }
}

# Main function
function Main {
    param (
        [string]$SpecificFile,
        [bool]$UseBlockFormat,
        [bool]$MoveToPosted
    )
    
    # Load existing blog data
    $blogData = $null
    try {
        $blogDataJson = Get-Content -Path $BlogDataPath -Raw
        $blogData = $blogDataJson | ConvertFrom-Json
    }
    catch {
        Write-Host "Creating new blog data file..."
        $blogData = @{
            posts = @()
        }
    }
    
    if ($SpecificFile) {
        # Process specific file
        $filePath = Join-Path -Path $DraftsDir -ChildPath $SpecificFile
        if (Test-Path $filePath) {
            $blogData = Process-MarkdownFile -FilePath $filePath -BlogData $blogData -UseBlockFormat $UseBlockFormat -MoveToPosted $MoveToPosted
        }
        else {
            Write-Error "File not found: $filePath"
            return
        }
    }
    else {
        # Process all markdown files in the drafts directory
        $files = Get-ChildItem -Path $DraftsDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" -and $_.DirectoryName -notlike "*\Posted*" }
        
        foreach ($file in $files) {
            $blogData = Process-MarkdownFile -FilePath $file.FullName -BlogData $blogData -UseBlockFormat $UseBlockFormat -MoveToPosted $MoveToPosted
        }
    }
    
    # Sort posts by date (newest first)
    $blogData.posts = $blogData.posts | Sort-Object -Property @{Expression = {[DateTime]$_.date}; Descending = $true}
    
    # Save updated blog data
    $blogDataJson = $blogData | ConvertTo-Json -Depth 10
    $blogDataJson | Out-File -FilePath $BlogDataPath -Encoding utf8
    Write-Host "Blog data saved to $BlogDataPath"
    Write-Host "Total posts: $($blogData.posts.Count)"
}

# Run the main function
if ($File) {
    Main -SpecificFile $File -UseBlockFormat $UseBlocks -MoveToPosted $MoveToPosted
}
else {
    Main -UseBlockFormat $UseBlocks -MoveToPosted $MoveToPosted
}