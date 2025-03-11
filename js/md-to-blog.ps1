# PowerShell script to convert markdown files to blog JSON format
# Usage: 
#   .\js\md-to-blog.ps1                  # Process all markdown files in blog-drafts
#   .\js\md-to-blog.ps1 -File filename.md # Process a specific file

param (
    [string]$File = ""
)

# Directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$DraftsDir = Join-Path -Path $RootDir -ChildPath "blog-drafts"
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

# Function to parse markdown file
function Parse-MarkdownFile {
    param (
        [string]$FilePath
    )
    
    Write-Host "Reading file: $FilePath"
    $content = Get-Content -Path $FilePath -Raw
    $lines = $content -split "`n"
    
    # Extract title (first line, remove # prefix)
    $title = $lines[0] -replace '^#\s+', ''
    Write-Host "Title: $title"
    
    # Find section indices using regex pattern matching
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
    
    Write-Host "Metadata index: $metadataIndex"
    Write-Host "Short Description index: $shortDescIndex"
    Write-Host "Content index: $contentIndex"
    
    if ($metadataIndex -eq -1 -or $shortDescIndex -eq -1 -or $contentIndex -eq -1) {
        Write-Error "File $FilePath does not have the required sections: ## Metadata, ## Short Description, and ## Content"
        return $null
    }
    
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
    
    # Convert markdown content to HTML
    $contentHtml = ConvertFrom-Markdown -Markdown $contentMarkdown
    
    # Generate an ID based on the title
    $id = Get-IdFromTitle -Title $title
    
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

# Function to process a markdown file and add it to the blog data
function Process-MarkdownFile {
    param (
        [string]$FilePath,
        [PSCustomObject]$BlogData
    )
    
    try {
        Write-Host "Processing $FilePath..."
        $post = Parse-MarkdownFile -FilePath $FilePath
        
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
        [string]$SpecificFile
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
            $blogData = Process-MarkdownFile -FilePath $filePath -BlogData $blogData
        }
        else {
            Write-Error "File not found: $filePath"
            return
        }
    }
    else {
        # Process all markdown files in the drafts directory
        $files = Get-ChildItem -Path $DraftsDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }
        
        foreach ($file in $files) {
            $blogData = Process-MarkdownFile -FilePath $file.FullName -BlogData $blogData
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
    Main -SpecificFile $File
}
else {
    Main
}