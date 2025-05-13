#Requires -Modules powershell-yaml

param(
    [string]$DraftsPath = ".\blog-drafts",
    [string]$PostedDraftsPath = ".\blog-drafts\Posted",
    [string]$BlogImagesPath = ".\images\blog",
    [string]$BlogDataPath = ".\blog\blog-data.json",
    [string]$ImageOptimizeScript = ".\optimize-images.ps1"
)

# Ensure destination directories exist
if (-not (Test-Path $PostedDraftsPath)) {
    New-Item -ItemType Directory -Path $PostedDraftsPath -Force | Out-Null
}
if (-not (Test-Path $BlogImagesPath)) {
    New-Item -ItemType Directory -Path $BlogImagesPath -Force | Out-Null
}

# Get Markdown files from the drafts path, excluding the template
$markdownFiles = Get-ChildItem -Path $DraftsPath -Filter *.md | Where-Object { $_.Name -ne 'template.md' }

if ($markdownFiles.Count -eq 0) {
    Write-Host "No new blog post markdown files found in '$DraftsPath'."
    exit
}

# Load existing blog data
if (-not (Test-Path $BlogDataPath)) {
    Write-Error "Blog data file not found at '$BlogDataPath'. Please create it first."
    exit 1
}
$blogDataJson = Get-Content -Path $BlogDataPath -Raw
$blogData = ConvertFrom-Json -InputObject $blogDataJson

# Ensure $blogData.posts is an array
if ($null -eq $blogData.posts -or -not ($blogData.posts -is [array])) {
    $blogData.posts = @()
}

Write-Host "Processing $($markdownFiles.Count) blog post(s)..."

foreach ($mdFile in $markdownFiles) {
    Write-Host "--- Processing $($mdFile.Name) ---"
    $baseName = $mdFile.BaseName
    $mdFilePath = $mdFile.FullName

    # Find the corresponding featured image (any extension)
    $featuredImage = Get-ChildItem -Path $DraftsPath -Filter "$($baseName)-featured.*" | Select-Object -First 1

    if (-not $featuredImage) {
        Write-Warning "Featured image for '$($mdFile.Name)' not found in '$DraftsPath'. Skipping this post."
        continue
    }
    $imageFilePath = $featuredImage.FullName
    $imageFileName = $featuredImage.Name

    # Read Markdown content
    $mdContent = Get-Content -Path $mdFilePath -Raw

    # Extract YAML front matter (between --- and ---)
    $yamlContent = $null
    if ($mdContent -match '(?s)^---\s*$(.*?)^---\s*$(.*)') {
        $yamlContent = $Matches[1].Trim()
    } else {
        Write-Warning "YAML front matter not found or improperly formatted in '$($mdFile.Name)'. Skipping this post."
        continue
    }

    # Parse YAML
    try {
        $metadata = ConvertFrom-Yaml -Yaml $yamlContent -ErrorAction Stop
    } catch {
        Write-Warning "Error parsing YAML front matter in '$($mdFile.Name)': $($_.Exception.Message). Skipping this post."
        continue
    }

    # Validate required metadata fields
    $requiredFields = @('title', 'date', 'author', 'tags', 'description')
    $missingFields = @()
    foreach ($field in $requiredFields) {
        if (-not $metadata.PSObject.Properties.Name.Contains($field) -or [string]::IsNullOrWhiteSpace($metadata.$field)) {
            $missingFields += $field
        }
    }

    if ($missingFields.Count -gt 0) {
        Write-Warning "Missing or empty required metadata fields in '$($mdFile.Name)': $($missingFields -join ', '). Skipping this post."
        continue
    }

    # Construct new blog post object
    $newPost = [PSCustomObject]@{
        id          = $baseName # Use filename as ID
        title       = $metadata.title
        date        = $metadata.date
        author      = $metadata.author
        tags        = $metadata.tags # Assuming tags are already an array or string in YAML
        description = $metadata.description
        featuredImage = "$($BlogImagesPath -replace '\\','/')/$imageFileName" # Use relative path for JSON
        contentFile = "$($PostedDraftsPath -replace '\\','/')/$($mdFile.Name)" # Use relative path for JSON
        # Add other fields if needed, e.g., isBlockFormat = $false
    }

    # Add the new post to the beginning of the array
    $blogData.posts = @($newPost) + $blogData.posts

    # Move files
    try {
        Move-Item -Path $mdFilePath -Destination $PostedDraftsPath -Force -ErrorAction Stop
        Write-Host "Moved '$($mdFile.Name)' to '$PostedDraftsPath'."

        $destImagePath = Join-Path -Path $BlogImagesPath -ChildPath $imageFileName
        Move-Item -Path $imageFilePath -Destination $destImagePath -Force -ErrorAction Stop
        Write-Host "Moved '$imageFileName' to '$BlogImagesPath'."

        # Run image optimization script for the new image
        if (Test-Path $ImageOptimizeScript) {
            Write-Host "Running image optimization for '$imageFileName'..."
            # Pass the specific image directory to the optimization script
            powershell -ExecutionPolicy Bypass -File $ImageOptimizeScript -SourceDir $BlogImagesPath -Recurse:$false
        } else {
            Write-Warning "Image optimization script not found at '$ImageOptimizeScript'."
        }

    } catch {
        Write-Error "Error moving files for '$($mdFile.Name)': $($_.Exception.Message)"
        # Attempt to rollback or notify user? For now, just error out.
        # Consider adding logic to move files back if one move fails.
        continue # Skip saving JSON if file move failed
    }
}

# Save updated blog data back to JSON file
try {
    $updatedJson = ConvertTo-Json -InputObject $blogData -Depth 5 -Indent # Use -Indent for readability
    Set-Content -Path $BlogDataPath -Value $updatedJson -Encoding UTF8 -ErrorAction Stop
    Write-Host "Successfully updated '$BlogDataPath'."
} catch {
    Write-Error "Error writing updated blog data to '$BlogDataPath': $($_.Exception.Message)"
}

Write-Host "--- Blog post processing complete. ---"