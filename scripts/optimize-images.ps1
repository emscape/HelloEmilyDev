# optimize-images.ps1
# Converts images in specified directories to JPG, PNG, and WebP formats using ImageMagick

# --- Configuration ---
$targetDirectories = @(
    ".\images",
    ".\blog"
)
$imageExtensions = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp") # Added .gif and .webp as input
$JpegQuality = "85"    # Quality setting for JPG (0-100)
$PngQuality = "90"     # Quality setting for PNG (0-100, affects compression)
$WebpQuality = "80"    # Quality setting for WebP (0-100)
# --- End Configuration ---

# Attempt to find magick.exe
$magickCmd = Get-Command magick.exe -ErrorAction SilentlyContinue
if ($null -eq $magickCmd) {
    Write-Error "ImageMagick command 'magick.exe' not found in PATH for the current terminal session."
    Write-Error "Please ensure ImageMagick is installed and its directory is in your system PATH."
    Write-Error "You might need to restart VS Code for its integrated terminal to pick up PATH changes."
    Write-Error "Alternatively, you can modify this script to include the full path to magick.exe."
    exit 1
} else {
    $magickCmd = $magickCmd.Source # Get the full path
    Write-Host "Using ImageMagick at: $magickCmd"
}

Write-Host "Starting image conversion with ImageMagick..."
Write-Host "Target Directories: $($targetDirectories -join ', ')"
Write-Host "Input Image Types: $($imageExtensions -join ', ')"
Write-Host "JPG Quality: $JpegQuality"
Write-Host "PNG Quality: $PngQuality"
Write-Host "WebP Quality: $WebpQuality"

$processedCount = 0
$generatedFileCount = 0
$errorCount = 0

foreach ($dir in $targetDirectories) {
    if (-not (Test-Path $dir -PathType Container)) {
        Write-Warning "Directory not found: $dir. Skipping."
        continue
    }

    Write-Host "`nProcessing directory: $dir"
    $allImageFilesInDir = Get-ChildItem -Path $dir -Include $imageExtensions -Recurse
    $groupedByBaseName = $allImageFilesInDir | Group-Object -Property BaseName

    foreach ($imageGroup in $groupedByBaseName) {
        $groupBaseName = $imageGroup.Name # This is the base name of the files in the group
        $selectedInputFile = $null
        # Define preferred source extensions. PNG often best, then JPG. GIF is lossy.
        $preferredSourceExtensions = @(".png", ".jpg", ".jpeg", ".gif")

        foreach ($prefExt in $preferredSourceExtensions) {
            $foundFile = $imageGroup.Group | Where-Object { $_.Extension -eq $prefExt } | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
            if ($foundFile) {
                $selectedInputFile = $foundFile
                break
            }
        }

        if (-not $selectedInputFile) {
            # If no preferred source found (e.g., only a .webp exists, or an unlisted type),
            # take the newest file from the group as a fallback source.
            $selectedInputFile = $imageGroup.Group | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
        }

        if (-not $selectedInputFile) {
            Write-Warning "  Could not select a source file for base name '$groupBaseName'. Skipping."
            continue
        }

        $inputFile = $selectedInputFile.FullName
        $inputFileName = $selectedInputFile.Name
        # Use the group's name for baseName to ensure consistency if selected file had an odd extension
        $baseName = $groupBaseName
        $fileDir = $selectedInputFile.DirectoryName

        Write-Host "  Processing base name: '$baseName' (using source: '$inputFileName')"

        # Define output filenames
        $outputFileJpg = Join-Path -Path $fileDir -ChildPath "$baseName.jpg"
        $outputFilePng = Join-Path -Path $fileDir -ChildPath "$baseName.png"
        $outputFileWebp = Join-Path -Path $fileDir -ChildPath "$baseName.webp"

        $conversionErrorInGroup = $false # Tracks if any conversion for this group fails

        # Convert to JPG
        if ($selectedInputFile.Extension -ne ".jpg" -and -not (Test-Path $outputFileJpg)) {
            Write-Host "    Generating JPG: '$($outputFileJpg | Split-Path -Leaf)' from source '$inputFileName'"
            try {
                & $magickCmd "$inputFile" -quality $JpegQuality "$outputFileJpg"
                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "    Error converting '$inputFileName' to JPG. magick exited with code $LASTEXITCODE."
                    $errorCount++; $conversionErrorInGroup = $true
                } else { $generatedFileCount++ }
            } catch {
                Write-Warning "    Failed to execute magick for JPG conversion of '$inputFileName'. Error: $($_.Exception.Message)"
                $errorCount++; $conversionErrorInGroup = $true
            }
        } elseif ($selectedInputFile.Extension -ne ".jpg" -and (Test-Path $outputFileJpg)) {
             Write-Host "    Skipping JPG, already exists: '$($outputFileJpg | Split-Path -Leaf)'"
        }

        # Convert to PNG
        if ($selectedInputFile.Extension -ne ".png" -and -not (Test-Path $outputFilePng)) {
            Write-Host "    Generating PNG: '$($outputFilePng | Split-Path -Leaf)' from source '$inputFileName'"
            try {
                & $magickCmd "$inputFile" -quality $PngQuality "$outputFilePng"
                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "    Error converting '$inputFileName' to PNG. magick exited with code $LASTEXITCODE."
                    $errorCount++; $conversionErrorInGroup = $true
                } else { $generatedFileCount++ }
            } catch {
                Write-Warning "    Failed to execute magick for PNG conversion of '$inputFileName'. Error: $($_.Exception.Message)"
                $errorCount++; $conversionErrorInGroup = $true
            }
        } elseif ($selectedInputFile.Extension -ne ".png" -and (Test-Path $outputFilePng)) {
            Write-Host "    Skipping PNG, already exists: '$($outputFilePng | Split-Path -Leaf)'"
        }

        # Convert to WebP
        if ($selectedInputFile.Extension -ne ".webp" -and -not (Test-Path $outputFileWebp)) {
            Write-Host "    Generating WebP: '$($outputFileWebp | Split-Path -Leaf)' from source '$inputFileName'"
            try {
                & $magickCmd "$inputFile" -quality $WebpQuality "$outputFileWebp"
                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "    Error converting '$inputFileName' to WebP. magick exited with code $LASTEXITCODE."
                    $errorCount++; $conversionErrorInGroup = $true
                } else { $generatedFileCount++ }
            } catch {
                Write-Warning "    Failed to execute magick for WebP conversion of '$inputFileName'. Error: $($_.Exception.Message)"
                $errorCount++; $conversionErrorInGroup = $true
            }
        } elseif ($selectedInputFile.Extension -ne ".webp" -and (Test-Path $outputFileWebp)) {
            Write-Host "    Skipping WebP, already exists: '$($outputFileWebp | Split-Path -Leaf)'"
        }

        if (-not $conversionErrorInGroup) {
            $processedCount++ # Count a base name as processed if all its attempted conversions were fine or skipped due to existence
        }
    }
}

Write-Host "`n--------------------"
Write-Host "Image Conversion Summary:"
Write-Host "  Input Images Processed (at least one format successfully generated): $processedCount"
Write-Host "  Output Files Generated: $generatedFileCount"
Write-Host "  Errors during individual conversions: $errorCount" # This counts each failed magick command
Write-Host "--------------------"

if ($errorCount -gt 0) {
    Write-Warning "Some errors occurred during conversion. Please review the output above."
} else {
    Write-Host "Conversion completed successfully."
}