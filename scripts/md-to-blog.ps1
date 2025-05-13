# PowerShell script to convert markdown files with YAML front matter to blog JSON format
# Usage:
#   .\js\md-to-blog.ps1                  # Process all markdown files in blog-drafts/Posted
#   .\js\md-to-blog.ps1 -File filename.md # Process a specific file from blog-drafts/Posted

param (
    [string]$File = ""
)

# Directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$DraftsDir = Join-Path -Path $RootDir -ChildPath "blog-drafts\Posted" # Point to Posted drafts
$BlogDataDir = Join-Path -Path $RootDir -ChildPath "blog-data"       # Output dir for individual posts
$BlogIndexFile = Join-Path -Path $RootDir -ChildPath "blog-index.json" # Output file for the index

# Function to generate slug from filename
function Get-SlugFromFilename {
    param (
        [string]$Filename
    )
    return [System.IO.Path]::GetFileNameWithoutExtension($Filename).ToLower()
}

# Very basic markdown to HTML conversion (Keep existing logic)
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
    
    # Lists (Improved slightly)
    # Convert lines starting with '-' or '*' to <li>
    $html = $html -replace '(?m)^\s*[-*]\s+(.*)$', '<li>$1</li>'
    # Wrap consecutive <li> items in <ul> tags
    $html = $html -replace '(?ms)(<li>.*?</li>\s*)+', "<ul>`n`$1</ul>`n" 

    # Links
    $html = $html -replace '\[(.*?)\]\((.*?)\)', '<a href="$2">$1</a>'
    
    # Paragraphs (Attempt to wrap lines not already in tags)
    # Split into lines, wrap non-empty lines not starting with <tag> or </tag>
    $lines = $html -split '\r?\n'
    $processedLines = @()
    $inList = $false
    foreach ($line in $lines) {
        $trimmedLine = $line.Trim()
        if ($trimmedLine -match '^<(/?)ul') { # Handle list tags separately
             $processedLines += $line
             $inList = $trimmedLine.StartsWith('<ul>')
        } elseif ($inList -and $trimmedLine.StartsWith('<li>')) {
             $processedLines += $line
        } elseif ($trimmedLine -match '^<(/?)') { # Keep existing tags
            $processedLines += $line
        } elseif ($trimmedLine.Length -gt 0) { # Wrap other non-empty lines
            $processedLines += "<p>$line</p>"
        } else {
             $processedLines += $line # Keep empty lines
        }
    }
    $html = $processedLines -join "`n"

    return $html
}


# Function to parse markdown file with YAML front matter
function Parse-MarkdownFile {
    param (
        [string]$FilePath
    )

    Write-Host "Reading file: $FilePath"
    # Read explicitly as UTF8 to handle potential encoding issues better
    $content = Get-Content -Path $FilePath -Encoding UTF8 -Raw 

    # Regex to find YAML front matter (between --- delimiters)
    $yamlRegex = '(?ms)^---\s*$(.*?)^---\s*$(.*)'
    $metadata = @{}
    $contentMarkdown = $content # Default content is the whole file if no front matter

    if ($content -match $yamlRegex) {
        $yamlContent = $matches[1].Trim()
        $contentMarkdown = $matches[2].Trim() # Content after the second ---

        # Basic YAML parsing (assumes simple key: value pairs)
        $yamlLines = $yamlContent -split '\r?\n'
        foreach ($line in $yamlLines) {
            if ($line -match '^([^:]+):\s*(.*)$') {
                $key = $matches[1].Trim().ToLower()
                # Extract raw value part (including potential comment)
                $rawValue = $matches[2]
                # Split by '#' at most once and take the part *before* the comment
                $valuePart = ($rawValue -split '#', 2)[0]
                # Trim quotes AND whitespace from the actual value part
                $value = $valuePart.Trim().Trim('"').Trim("'").Trim()

                if ($key -eq 'tags') {
                    # Robustly handle tags: Detect list vs. comma-separated, split, trim quotes/whitespace
                    $tagsArray = @() # Initialize empty array
                    if (-not [string]::IsNullOrWhiteSpace($value)) {
                        $trimmedValue = $value.Trim() # Trim overall whitespace first
                        if ($trimmedValue.StartsWith('[') -and $trimmedValue.EndsWith(']')) {
                            # Looks like a YAML list
                            $listContent = $trimmedValue.Substring(1, $trimmedValue.Length - 2) # Remove brackets
                            $tagsArray = $listContent -split ',' | ForEach-Object { $_.Trim().Trim('"').Trim("'").Trim() }
                        } else {
                            # Assume comma-separated string or single tag
                            $tagsArray = $trimmedValue -split ',' | ForEach-Object { $_.Trim().Trim('"').Trim("'").Trim() }
                        }
                    }
                    # Remove any empty tags that might result from splitting/trimming (moved to after processing)
                    $metadata['tags'] = $tagsArray | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
                }
                elseif ($key -eq 'featured') {
                    $metadata['featured'] = $value.ToLower() -eq 'true'
                }
                 elseif ($key -eq 'additionalimages') {
                     # Handle additionalImages YAML list or empty string/null
                     if ($value -and $value -match '\[.*\]') {
                        $metadata['additionalImages'] = $value.TrimStart('[').TrimEnd(']') -split ',' | ForEach-Object { $_.Trim().Trim('"').Trim("'") }
                        $metadata['additionalImages'] = $metadata['additionalImages'] | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
                     } else {
                        $metadata['additionalImages'] = @() # Treat empty/non-list as empty list
                     }
                 }
                else {
                    $metadata[$key] = $value
                }
            }
        }
        Write-Host "  -> Found YAML front matter."
    } else {
        Write-Error "File $FilePath does not contain YAML front matter (--- delimiters)."
        return $null # Fail parsing if no front matter
    }

    # Ensure essential fields exist
    if (-not $metadata.ContainsKey('title') -or [string]::IsNullOrWhiteSpace($metadata['title'])) {
         Write-Error "Title not found or empty in YAML front matter for $FilePath"
         return $null
    }
    $title = $metadata['title']
    Write-Host "  -> Title: $title"

    # Convert markdown content to HTML
    $contentHtml = ConvertFrom-Markdown -Markdown $contentMarkdown

    # Generate slug from filename
    $slug = Get-SlugFromFilename -Filename (Split-Path $FilePath -Leaf)
    
    # Validate essential fields before returning the object
     if ([string]::IsNullOrWhiteSpace($slug)) {
        Write-Error "Generated slug is empty for $FilePath"
        return $null
    }
     if (-not $metadata.ContainsKey('date') -or [string]::IsNullOrWhiteSpace($metadata['date'])) {
        Write-Error "Date is missing or empty in YAML for $FilePath"
        return $null
    }

    # Ensure image paths are absolute (start with /)
    $featuredImage = ''
    if ($metadata.ContainsKey('featuredimage')) { $featuredImage = $metadata['featuredimage'] } 
    if ($featuredImage -and !$featuredImage.StartsWith('/')) { $featuredImage = '/' + $featuredImage }

    $bannerImage = ''
    if ($metadata.ContainsKey('bannerimage')) { $bannerImage = $metadata['bannerimage'] } 
    if ($bannerImage -and !$bannerImage.StartsWith('/')) { $bannerImage = '/' + $bannerImage }

    # Ensure additionalImages paths are absolute
    $additionalImages = @()
    if ($metadata.ContainsKey('additionalimages')) { 
        $additionalImages = $metadata['additionalimages'] | ForEach-Object {
            $img = $_
            if ($img -and !$img.StartsWith('/')) { $img = '/' + $img }
            $img
        }
    }

    # Structure the content as an array of blocks
    $contentBlocks = @(
        @{ type = 'html'; content = $contentHtml }
    )

    # Ensure tags is always an array for consistent JSON output
    $processedTags = @() # Default to empty array
    if ($metadata.ContainsKey('tags')) {
        if ($metadata['tags'] -is [array]) {
            $processedTags = $metadata['tags']
        } elseif (-not [string]::IsNullOrWhiteSpace($metadata['tags'])) {
            # If it's a single non-empty string/item, wrap it in an array
            $processedTags = @($metadata['tags'])
        }
        # If it was null, whitespace, or an empty array initially, it remains @()
    }

    # Return the full post data object
    return @{
        id = $slug # Use the validated slug variable
        slug = $slug # Use the validated slug variable
        title = $title
        # Use ContainsKey check for optional fields
        shortDescription = if ($metadata.ContainsKey('shortdescription')) { $metadata['shortdescription'] } else { '' }
        content = $contentBlocks # Use the block structure
        author = if ($metadata.ContainsKey('author')) { $metadata['author'] } else { 'Emily Anderson' }
        date = $metadata['date'] # Already validated
        tags = $processedTags # Use the processed array
        featuredImage = $featuredImage # Use processed path
        bannerImage = $bannerImage   # Use processed path
        featured = if ($metadata.ContainsKey('featured')) { $metadata['featured'] } else { $false }
        additionalImages = $additionalImages # Use processed list
    } # Removed | Select-Object *
}


# Function to process a markdown file, write individual JSON, and return index data
function Process-MarkdownFileAndGenerateOutputs {
    param (
        [string]$FilePath
    )

    try {
        # Write-Host "Processing $FilePath..." # Already logged in Parse-MarkdownFile
        $fullPostData = Parse-MarkdownFile -FilePath $FilePath
        
        # --- DEBUGGING ---
        Write-Host "Debug: Received object type: $($fullPostData.GetType().FullName)" -ForegroundColor Yellow
        Write-Host "Debug: Received Slug: '$($fullPostData.slug)'" -ForegroundColor Yellow
        Write-Host "Debug: Received Title: '$($fullPostData.title)'" -ForegroundColor Yellow
        # --- END DEBUGGING ---

        if ($fullPostData -eq $null) {
            return $null # Skip this file if parsing failed
        }

        # --- Write Individual Post JSON ---
        # Validate slug again before using it in path
        if ([string]::IsNullOrWhiteSpace($fullPostData.slug)) {
             Write-Error "Cannot write file, slug is empty for post titled '$($fullPostData.title)' from $FilePath"
             return $null
        }
        $individualJsonPath = Join-Path -Path $BlogDataDir -ChildPath "$($fullPostData.slug).json"
        # Ensure output directory exists
        if (-not (Test-Path $BlogDataDir)) {
            New-Item -ItemType Directory -Path $BlogDataDir | Out-Null
            Write-Host "Created directory: $BlogDataDir"
        }
        # Convert without EscapeHandling
        $postJson = $fullPostData | ConvertTo-Json -Depth 10 
        # Use Out-File for reliable encoding (UTF8 without BOM by default in PS Core, specify for WinPS)
        Out-File -FilePath $individualJsonPath -InputObject $postJson -Encoding utf8 -Force
        Write-Host "  -> Wrote individual file: $individualJsonPath"

        # --- Extract Index Data ---
        $indexData = @{
            slug = $fullPostData.slug
            title = $fullPostData.title
            date = $fullPostData.date
            tags = $fullPostData.tags
            featured = $fullPostData.featured
            featuredImage = $fullPostData.featuredImage # Include featured image
            shortDescription = $fullPostData.shortDescription # Add short description to index
        }

        return $indexData
    }
    catch {
        $errorMessage = $_.Exception.Message
        Write-Error "Error processing $FilePath`: $errorMessage"
        return $null # Return null on error to skip adding to index
    }
}


# Main function
function Main {
    param (
        [string]$SpecificFile
    )

    $indexPosts = [System.Collections.Generic.List[object]]::new()

    if ($SpecificFile) {
        # Process specific file
        $filePath = Join-Path -Path $DraftsDir -ChildPath $SpecificFile
        if (Test-Path $filePath) {
            $indexData = Process-MarkdownFileAndGenerateOutputs -FilePath $filePath
            if ($indexData -ne $null) {
                $indexPosts.Add($indexData)
            }
        }
        else {
            Write-Error "File not found: $filePath"
            return
        }
    }
    else {
        # Process all markdown files in the drafts directory
        $files = Get-ChildItem -Path $DraftsDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" -and $_.Name -ne "template.md" } # Exclude template

        foreach ($file in $files) {
            $indexData = Process-MarkdownFileAndGenerateOutputs -FilePath $file.FullName
            if ($indexData -ne $null) {
                $indexPosts.Add($indexData)
            }
        }
    }

    # Filter out any null entries before sorting and sort index posts by date (newest first)
    $sortedIndexPosts = $indexPosts | Where-Object { $_ -ne $null -and $_.date } | Sort-Object -Property @{Expression = {[DateTime]$_.date}; Descending = $true}

    # Create final index object
    $blogIndex = @{
        posts = $sortedIndexPosts
    }

    # Save the blog index file
    $blogIndexJson = $blogIndex | ConvertTo-Json -Depth 10
    # Use Out-File for reliable encoding (UTF8 without BOM by default in PS Core, specify for WinPS)
    Out-File -FilePath $BlogIndexFile -InputObject $blogIndexJson -Encoding utf8 -Force
    Write-Host "Blog index saved to $BlogIndexFile"
    Write-Host "Total posts processed for index: $($sortedIndexPosts.Count)"
}


# Run the main function
if ($File) {
    Main -SpecificFile $File
}
else {
    Main
}