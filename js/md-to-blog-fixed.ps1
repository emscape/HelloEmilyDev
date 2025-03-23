# PowerShell script to convert markdown files to blog JSON format
# Usage:
#   .\js\md-to-blog-fixed.ps1                  # Process all markdown files in blog-drafts
#   .\js\md-to-blog-fixed.ps1 -File filename.md # Process a specific file
#   .\js\md-to-blog-fixed.ps1 -UseBlocks       # Use block-based format for all files
#   .\js\md-to-blog-fixed.ps1 -File filename.md -UseBlocks # Process a specific file with block format

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
        [string]$Markdown,
        [string]$PostFolder = ""
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
const blocks = converter.convert(markdown, '$PostFolder');

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

# Function to extract date from various formats
function Extract-Date {
    param (
        [string[]]$Lines
    )
    
    # Try to find a date in YYYY-MM-DD format
    $dateMatch = $Lines | Where-Object { $_ -match '\d{4}-\d{2}-\d{2}' } | Select-Object -First 1
    if ($dateMatch) {
        $match = [regex]::Match($dateMatch, '\d{4}-\d{2}-\d{2}')
        if ($match.Success) {
            return $match.Value
        }
    }
    
    # Try to find a date in Month DD, YYYY format
    $monthNames = @('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
    $monthPattern = "($($monthNames -join '|'))\s+\d{1,2},\s+\d{4}"
    $dateMatch = $Lines | Where-Object { $_ -match $monthPattern } | Select-Object -First 1
    
    if ($dateMatch) {
        $match = [regex]::Match($dateMatch, $monthPattern)
        if ($match.Success) {
            try {
                $date = [DateTime]::Parse($match.Value)
                return $date.ToString('yyyy-MM-dd')
            }
            catch {
                Write-Warning "Could not parse date: $($match.Value)"
            }
        }
    }
    
    # If no date found, return today's date
    return (Get-Date).ToString('yyyy-MM-dd')
}

# Function to extract metadata from YAML frontmatter
function Extract-YamlFrontmatter {
    param (
        [string[]]$Lines
    )
    
    $metadata = @{}
    $inFrontmatter = $false
    $frontmatterLines = @()
    
    # Check if the file starts with YAML frontmatter (---)
    if ($Lines.Length -gt 0 -and $Lines[0].Trim() -eq '---') {
        $inFrontmatter = $true
        
        for ($i = 1; $i -lt $Lines.Length; $i++) {
            if ($Lines[$i].Trim() -eq '---') {
                $inFrontmatter = $false
                break
            }
            $frontmatterLines += $Lines[$i]
        }
        
        # Process frontmatter lines
        foreach ($line in $frontmatterLines) {
            if ($line -match '^(\w+):\s*(.+)$') {
                $key = $matches[1].Trim().ToLower()
                $value = $matches[2].Trim()
                
                # Handle special cases
                if ($key -eq 'tags') {
                    # Tags might be on the same line or on subsequent lines
                    if ($value -match '^\[.*\]$') {
                        # Tags in array format [tag1, tag2]
                        $metadata['tags'] = $value.Trim('[]').Split(',') | ForEach-Object { $_.Trim() }
                    }
                    else {
                        # Tags might be on subsequent lines with dash prefix
                        $tagLines = $frontmatterLines | Where-Object { $_ -match '^\s*-\s+(.+)$' }
                        if ($tagLines) {
                            $metadata['tags'] = $tagLines | ForEach-Object { 
                                if ($_ -match '^\s*-\s+(.+)$') { $matches[1].Trim() } 
                            }
                        }
                        else {
                            $metadata['tags'] = @($value)
                        }
                    }
                }
                elseif ($key -eq 'featured') {
                    $metadata['featured'] = $value.ToLower() -eq 'true'
                }
                else {
                    $metadata[$key] = $value
                }
            }
        }
        
        return @{
            metadata = $metadata
            contentStartIndex = $i + 1
        }
    }
    
    return $null
}

# Function to extract metadata from markdown content
function Extract-MetadataFromContent {
    param (
        [string[]]$Lines
    )
    
    $metadata = @{}
    
    # First, try to extract YAML frontmatter
    $frontmatter = Extract-YamlFrontmatter -Lines $Lines
    if ($frontmatter) {
        return $frontmatter
    }
    
    # Look for date patterns
    $metadata['date'] = Extract-Date -Lines $Lines
    
    # Extract tags from content
    $potentialTags = @('AI', 'Technology', 'Personal', 'Development', 'Tutorial', 'Web Development', 'Case Study', 'Ethics', 'Artificial Intelligence')
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
    
    return @{
        metadata = $metadata
        contentStartIndex = 0
    }
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
            -not $Lines[$i] -match '!\[.*?\]\(.*?\)' -and
            -not $Lines[$i].StartsWith('---')) {
            return $Lines[$i].Trim()
        }
    }
    
    return ''
}

# Function to fix image paths
function Fix-ImagePaths {
    param (
        [string]$Content,
        [string]$PostFolder
    )
    
    if (-not $PostFolder) {
        return $Content
    }
    
    # Replace relative image paths with full paths
    $pattern = '!\[(.*?)\]\(([^/].*?)\)'
    $replacement = '![$1](images/blog/' + $PostFolder + '/$2)'
    
    return $Content -replace $pattern, $replacement
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
    
    # Generate an ID based on the title
    $id = Get-IdFromTitle -Title $title
    
    # Get post folder name for image path fixing
    $postName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    
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
    
    # If using block format or if the file doesn't have traditional sections
    if ($UseBlockFormat -or $metadataIndex -eq -1 -or $shortDescIndex -eq -1 -or $contentIndex -eq -1) {
        Write-Host "Using block-based format for $FilePath"
        
        # Extract metadata from content
        $metadataResult = Extract-MetadataFromContent -Lines $lines
        $metadata = $metadataResult.metadata
        $contentStartIndex = $metadataResult.contentStartIndex
        
        # Extract short description
        $shortDescription = Extract-ShortDescription -Lines $lines[$contentStartIndex..($lines.Length - 1)]
        
        # Fix image paths in content
        $fixedContent = Fix-ImagePaths -Content ($lines[$contentStartIndex..($lines.Length - 1)] -join "`n") -PostFolder $postName
        
        if ($UseBlockFormat) {
            # Convert content to blocks
            $blocks = Convert-MarkdownToBlocks -Markdown $fixedContent -PostFolder $postName
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                blocks = $blocks
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { Extract-Date -Lines $lines }
                tags = if ($metadata.ContainsKey('tags')) { $metadata['tags'] } else { @() }
                featuredImage = if ($metadata.ContainsKey('featuredimage')) { $metadata['featuredimage'] } elseif ($metadata.ContainsKey('featuredImage')) { $metadata['featuredImage'] } else { '' }
                featured = if ($metadata.ContainsKey('featured')) { $metadata['featured'] } else { $false }
            }
        } else {
            # Convert markdown content to HTML
            $contentHtml = ConvertFrom-Markdown -Markdown $fixedContent
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                content = $contentHtml
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { Extract-Date -Lines $lines }
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
        
        # Fix image paths in content
        $fixedContent = Fix-ImagePaths -Content $contentMarkdown -PostFolder $postName
        
        if ($UseBlockFormat) {
            # Convert content to blocks
            $blocks = Convert-MarkdownToBlocks -Markdown $fixedContent -PostFolder $postName
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                blocks = $blocks
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { Extract-Date -Lines $lines }
                tags = if ($metadata.ContainsKey('tags')) { $metadata['tags'] } else { @() }
                featuredImage = if ($metadata.ContainsKey('featuredimage')) { $metadata['featuredimage'] } elseif ($metadata.ContainsKey('featuredImage')) { $metadata['featuredImage'] } else { '' }
                featured = if ($metadata.ContainsKey('featured')) { $metadata['featured'] } else { $false }
            }
        } else {
            # Convert markdown content to HTML
            $contentHtml = ConvertFrom-Markdown -Markdown $fixedContent
            
            return @{
                id = $id
                title = $title
                shortDescription = $shortDescription
                content = $contentHtml
                author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
                date = if ($metadata.ContainsKey('date')) { $metadata['date'] } else { Extract-Date -Lines $lines }
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