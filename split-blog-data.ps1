# Script to split blog-data.json into individual post files

# Define paths
$sourceJsonPath = "blog/blog-data.json"
$outputDir = "blog-data"

# Check if source file exists
if (-not (Test-Path $sourceJsonPath)) {
    Write-Error "Source JSON file not found: $sourceJsonPath"
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created directory: $outputDir"
} else {
     Write-Host "Output directory already exists: $outputDir"
}

# Read and parse the source JSON
Write-Host "Reading source JSON: $sourceJsonPath"
# Read as UTF8 without BOM
$blogDataJson = Get-Content $sourceJsonPath -Encoding UTF8 -Raw
# Remove potential BOM if present at the start
if ($blogDataJson.StartsWith([char]0xFEFF)) {
    $blogDataJson = $blogDataJson.Substring(1)
}
$blogData = $blogDataJson | ConvertFrom-Json

# Check if posts array exists
if (-not $blogData.PSObject.Properties.Name -contains 'posts') {
    Write-Error "The JSON file does not contain a 'posts' array."
    exit 1
}

# Process each post
Write-Host "Processing posts..."
foreach ($post in $blogData.posts) {
    # Check if post has an id
    if (-not $post.PSObject.Properties.Name -contains 'id' -or [string]::IsNullOrWhiteSpace($post.id)) {
        Write-Warning "Skipping post without a valid 'id'."
        continue
    }

    $postId = $post.id
    $outputFilePath = Join-Path -Path $outputDir -ChildPath "$postId.json"

    # Convert the post object to pretty-printed JSON, escaping non-ASCII
    $postJson = $post | ConvertTo-Json -Depth 10 -EscapeHandling EscapeNonAscii # Ensure non-ASCII chars are escaped

    # Write the JSON to the individual file as UTF8 without BOM
    try {
        # Write as UTF8 without BOM, overwrite if exists
        New-Item -Path $outputFilePath -ItemType File -Value $postJson -Encoding UTF8 -Force | Out-Null
        Write-Host "Created/Overwrote file: $outputFilePath"
    } catch {
        Write-Error "Failed to write file: $outputFilePath. Error: $_"
    }
}

Write-Host "Script finished."